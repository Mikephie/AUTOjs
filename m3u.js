/**
 * m3u.js — 生成可播放 M3U（并发探测、CCTV 去重、卫视归类）
 * 图标：别名 → icons.json → TV_logo → not-found（中文路径原样保留）
 * 探测：并发首包(Range 0-0)，只留可播；同键（尤其 CCTVxx）保留首包更快的一条
 * 性能：候选仅收 HARD_TARGET*3；每源最多扫描 200；并发 35；严格首包超时 700ms
 * 输出：dist/playlist.m3u，并上传至 Mikephie/AUTOjs@main: LiveTV/AKTV.m3u
 */

const IS_NODE = typeof process !== "undefined" && process.release?.name === "node";
let nodeFetch = null;
if (IS_NODE && typeof fetch === "undefined") {
  nodeFetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
}
const fs   = IS_NODE ? require("fs")   : null;
const path = IS_NODE ? require("path") : null;

/* ===== 数据源 ===== */
const M3U_URLS = [
  { url: "https://aktv.space/live.m3u" },
  { url: "https://raw.githubusercontent.com/Guovin/iptv-api/gd/output/result.m3u" },
];

/* ===== 图标配置 ===== */
const ICONS_JSON_URL = "https://img.mikephie.site/icons.json";
const ICON_BASE      = "https://img.mikephie.site/TV_logo";
const NOT_FOUND_ICON = "https://img.mikephie.site/not-found.png";
const ICON_HOST_WHITELIST = ["img.mikephie.site"]; // 仅这些域加 ?v= 构建号

/* ===== 构建信息 ===== */
const BUILD_EPOCH = Date.now();
const BUILD_ISO   = new Date(BUILD_EPOCH).toISOString();
const BUILD_VER   = String(BUILD_EPOCH);

/* ===== 上传配置 ===== */
const UPLOAD_NOW   = true;
const REPO         = "Mikephie/AUTOjs";
const BRANCH       = "main";
const PATH_IN_REPO = "LiveTV/AKTV.m3u";

/* ===== 策略 / 限额 / 超时 ===== */
const FILTER_MODE              = "strict"; // strict / loose / off
const TEST_TOTAL_LIMIT         = Number(process.env.TEST_TOTAL_LIMIT || 80); // 输出上限（workflow 可覆盖）
const HARD_TARGET              = TEST_TOTAL_LIMIT;  // 早停门槛
const PER_SOURCE_SCAN_LIMIT    = 200;   // 每源最多扫描
const FETCH_TIMEOUT_MS         = 5000;
const PROBE_TIMEOUT_MS_STRICT  = 700;
const PROBE_TIMEOUT_MS_LOOSE   = 600;

/* ===== 并发优化 ===== */
const PROBE_CONCURRENCY = 35;   // 并发探测数量
const ICON_HTTP_CHECK   = false;// 图标不做 HTTP 校验以提速

/* ===== 输出目录 ===== */
const OUT_DIR  = "dist";
const OUT_FILE = path ? path.join(OUT_DIR, "playlist.m3u") : "playlist.m3u";

/* ===== 状态 ===== */
let totalChannels = 0, keptChannels = 0, filteredChannels = 0;
let globalStop = false;

/* ===== 别名（显示名 → 图标文件名，不带扩展名） ===== */
const NAME_ALIAS = {
  "明珠台": "ch2",
  // "翡翠台": "jade",
  // "无线新闻台": "tvbnews",
};

/* ===== HTTP ===== */
async function httpGet(url, headers = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  if (!IS_NODE) return { r: { status: 0 }, d: "" };
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const f = typeof fetch === "function" ? fetch : nodeFetch;
    const res = await f(url, { headers, signal: controller.signal });
    const text = await res.text().catch(() => "");
    return { r: res, d: text };
  } catch { return { r: { status: 0 }, d: "" }; }
  finally { clearTimeout(id); }
}

/* ===== GitHub 上传 ===== */
async function ghApi(path, opts = {}) {
  const GH_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!GH_TOKEN) throw new Error("缺少 GH_TOKEN/GITHUB_TOKEN 环境变量");
  const headers = Object.assign({
    "Authorization": `Bearer ${GH_TOKEN}`,
    "Accept": "application/vnd.github+json",
    "User-Agent": "m3u-uploader",
  }, opts.headers || {});
  const res = await (typeof fetch === "function" ? fetch : nodeFetch)(`https://api.github.com${path}`, { ...opts, headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}
async function getFileSha(repo, branch, filePath) {
  try {
    const r = await ghApi(`/repos/${repo}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(branch)}`);
    return r.sha || "";
  } catch { return ""; }
}
async function putFile(repo, branch, filePath, contentStr, message = "chore: update AKTV.m3u") {
  const sha = await getFileSha(repo, branch, filePath);
  const body = {
    message,
    content: Buffer.from(contentStr, "utf8").toString("base64"),
    branch,
    sha: sha || undefined,
    committer: { name: "github-actions[bot]", email: "41898282+github-actions[bot]@users.noreply.github.com" },
    author:    { name: "github-actions[bot]", email: "41898282+github-actions[bot]@users.noreply.github.com" },
  };
  return ghApi(`/repos/${repo}/contents/${encodeURIComponent(filePath)}`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}

/* ===== 工具：名字规范化 & 键构建 ===== */
const isZh = s => /[\u4e00-\u9fa5]/.test(s||"");
function englishKey(s){
  s = (s||"").trim(); if (!s || isZh(s)) return "";
  s = s.replace(/\([^)]*\)/g, " ").replace(/\b(HD|FHD|UHD|4K)\b/ig, " ").replace(/[\s\-_\.]+/g, "");
  return s.toUpperCase();
}
function chineseKey(s){
  s = (s||"").trim(); if (!isZh(s)) return ""; return s.replace(/[（(].*?[)）]/g, "").trim();
}
const ZH_MAP = [
  ["鳳凰","凤凰"],["衛視","卫视"],["資訊","资讯"],["無線","无线"],["綜合","综合"],["娛樂","娱乐"],
  ["頻道","频道"],["電影","电影"],["臺","台"],["東森","东森"],["華視","华视"],["公視","公视"],["龍華","龙华"]
];
function addZhVariants(set, base){
  set.add(base); set.add(base.replace(/[（(].*?[)）]/g,""));
  for (let n=0;n<2;n++) for (const [trad,simp] of ZH_MAP)
    for (const v of Array.from(set)) { set.add(v.replace(new RegExp(trad,"g"),simp)); set.add(v.replace(new RegExp(simp,"g"),trad)); }
  return set;
}
function normName(s){
  return (s||"").normalize("NFKC")
    .replace(/（.*?）|\(.*?\)/g,"").toLowerCase()
    .replace(/\.(png|jpg|jpeg|webp|gif|svg)$/i,"").replace(/[\s\/\-\_]+/g,"")
    .replace(/[^\w\u4e00-\u9fa5]/g,"").replace(/(fhd|uhd|hd|sd|4k)$/,"");
}
function makeNameCandidates(raw){
  const s0 = (raw||"").trim(); if (!s0) return [];
  const noParen = s0.replace(/（.*?）|\(.*?\)/g,"");
  const noSpace = noParen.replace(/\s+/g,"");
  const baseAscii = noParen.toLowerCase().replace(/[\s\/\-\_]+/g,"");
  const set = new Set([
    noParen, noSpace, baseAscii,
    baseAscii.replace(/(hd|fhd|uhd|sd|4k)$/,""),
    noSpace.replace(/(台|频道|頻道)$/,""),
    baseAscii.replace(/^channel(\d+)(hd|fhd|uhd|sd|4k)?$/,"channel$1"),
    baseAscii.replace(/^channelu(hd|fhd|uhd|sd|4k)?$/,"channelu"),
    baseAscii.replace(/^tntsports(\d)(hd|fhd|uhd|sd|4k)?$/,"tntsports$1"),
  ]);
  return Array.from(set).filter(Boolean);
}

/* ===== URL 帮助 ===== */
function getHost(u){ try { return new URL(u).host.toLowerCase(); } catch { return ""; } }
function addCacheBuster(u, ver = BUILD_VER){
  try{
    const host = getHost(u);
    if (!ICON_HOST_WHITELIST.includes(host)) return u;
    if (/[?&]v=[^&]+/.test(u)) return u.replace(/([?&]v=)[^&]+/, `$1${ver}`);
    const sep = u.includes("?") ? "&" : "?"; return `${u}${sep}v=${ver}`;
  }catch{ return u; }
}
function encodeVariants(u){
  const arr = [u]; try { const dec = decodeURIComponent(u); if (dec !== u) arr.push(dec); } catch {}
  return [...new Set(arr)];
}

/* ===== 图标映射加载 ===== */
function buildIconMap(json){
  const list = Array.isArray(json?.icons) ? json.icons : (Array.isArray(json) ? json : []);
  const map = new Map();
  for (const it of list){
    const name = (it?.name||"").trim(), url = (it?.url||"").trim();
    if (!name || !url) continue;
    const base = name.replace(/\.(png|jpg|jpeg|webp|gif|svg)$/i,"").trim();
    const keys = new Set();
    keys.add(base);
    if (isZh(base)) addZhVariants(keys, base);
    const up = base.toUpperCase(); if (up) keys.add(up);
    const en = englishKey(base);   if (en) keys.add(en);
    const nn = normName(base);     if (nn) keys.add(nn);
    for (const k of keys) map.set(k, url);
  }
  return map;
}
async function loadIcons(){
  try{
    const { d } = await httpGet(ICONS_JSON_URL, {}, 8000);
    if (!d) { console.log("# icons loaded = 0"); return new Map(); }
    const map = buildIconMap(JSON.parse(d));
    console.log(`# icons loaded = ${map.size}`);
    return map;
  }catch(e){ console.log("⚠️ icons.json 加载失败：", String(e)); return new Map(); }
}

/* ===== 图标选择：别名 → icons.json → TV_logo → not-found ===== */
async function probe200(url){
  if (!ICON_HTTP_CHECK) return true; // 为提速，默认不做 HTTP 校验
  try{
    const host = getHost(url);
    if (!ICON_HOST_WHITELIST.includes(host)) return true;
    const { r } = await httpGet(url, { "Range": "bytes=0-0" }, 1200);
    return r && (r.status===200 || r.status===206);
  }catch{ return false; }
}
async function pickIconByDisplayName(iconMap, dispName){
  const raw = (dispName||"").trim(); if (!raw) return addCacheBuster(NOT_FOUND_ICON);

  // 别名（规范化键）
  const aliasNormMap = new Map(Object.entries(NAME_ALIAS).map(([k,v])=>[normName(k), v]));
  const alias = aliasNormMap.get(normName(raw));
  if (alias){
    const aliasKey = normName(alias);
    if (iconMap.has(aliasKey)) {
      const u0 = iconMap.get(aliasKey); for (const v0 of encodeVariants(u0)) { const v = addCacheBuster(v0); if (await probe200(v)) return v; }
    }
    const lower = `${ICON_BASE}/${alias.toLowerCase()}.png`, camel = `${ICON_BASE}/${alias}.png`;
    if (await probe200(lower)) return addCacheBuster(lower);
    if (await probe200(camel)) return addCacheBuster(camel);
    return addCacheBuster(NOT_FOUND_ICON);
  }

  // icons.json 多键
  const k0 = normName(raw);
  const jsonKeys = new Set([k0, englishKey(raw), chineseKey(raw), k0.replace(/channel(\d+)$/,"channel$1"),
    k0.replace(/lovenature.*$/,"lovenature"), k0.replace(/tvn.*$/,"tvn"), k0.replace(/plus$/,"plus"), k0.replace(/action$/,"action")]);
  for (const kk of jsonKeys){
    if (kk && iconMap.has(kk)) {
      const u0 = iconMap.get(kk); for (const v0 of encodeVariants(u0)) { const v = addCacheBuster(v0); if (await probe200(v)) return v; }
    }
  }

  // TV_logo 小写 / 原样
  for (const base of makeNameCandidates(raw)){
    const lower = `${ICON_BASE}/${base.toLowerCase()}.png`, camel = `${ICON_BASE}/${base}.png`;
    if (await probe200(lower)) return addCacheBuster(lower);
    if (await probe200(camel)) return addCacheBuster(camel);
  }
  return addCacheBuster(NOT_FOUND_ICON);
}

/* ===== M3U 文本工具 ===== */
function findNextUrl(lines, i){
  let j = i+1; while (j < lines.length && !lines[j].trim()) j++;
  if (j < lines.length && !lines[j].startsWith("#")) return lines[j].trim();
  j = i+1; while (j < lines.length && (lines[j].startsWith("#") || !lines[j].trim())) j++;
  return (j < lines.length && !lines[j].startsWith("#")) ? lines[j].trim() : "";
}
function getAttr(header, key){ return (header.match(new RegExp(`${key}="([^"]*)"`, "i")) || [])[1] || ""; }
function setOrReplaceAttr(header, key, value){
  if (!value) return header;
  return header.match(new RegExp(`${key}="`, "i"))
    ? header.replace(new RegExp(`${key}="[^"]*"`, "i"), `${key}="${value}"`)
    : `${header} ${key}="${value}"`;
}
function stripM3UHeaderOnce(text){
  const lines = text.split(/\r?\n/); const kept = lines.filter(ln => !ln.trim().toUpperCase().startsWith("#EXTM3U"));
  return ["#EXTM3U", ...kept].join("\n");
}
function dedupeM3U(m3u){
  const lines = m3u.split(/\r?\\n/); const out=[], seen=new Set();
  for (let i=0;i<lines.length;i++){
    const line = lines[i]; if (!line.startsWith("#EXTINF")) { if (line.startsWith("#")) out.push(line); continue; }
    const meta=[]; let j=i+1; while (j<lines.length && (lines[j].startsWith("#")||!lines[j].trim())) { meta.push(lines[j]); j++; }
    const url=(j<lines.length && !lines[j].startsWith("#"))?lines[j].trim():"";
    const disp=line.split(",").slice(1).join(",").trim();
    const key=`${disp.toLowerCase()}||${(url||"").toLowerCase()}`;
    if (seen.has(key)) { if (url) i=j; continue; }
    seen.add(key); out.push(line); for (const m of meta) out.push(m); if (url){ out.push(url); i=j; }
  }
  return out.join("\n");
}
function clipByPairCount(text, maxPairs){
  if (!maxPairs || maxPairs<=0) return text;
  const lines=text.split(/\r?\n/), out=[]; let pairs=0;
  for (let i=0;i<lines.length;i++){
    const ln=lines[i]; if (!ln.startsWith("#EXTINF")) { if (ln.startsWith("#")) out.push(ln); continue; }
    if (pairs>=maxPairs) break;
    const meta=[]; let j=i+1; while (j<lines.length && (lines[j].startsWith("#")||!lines[j].trim())) { meta.push(lines[j]); j++; }
    const url=(j<lines.length && !lines[j].startsWith("#"))?lines[j].trim():"";
    out.push(ln); for (const m of meta) out.push(m); if (url){ out.push(url); i=j; } pairs++;
  }
  return out.join("\n");
}

/* ===== CCTV 去重键 ===== */
function canonicalKeyForDedup(dispName, header){
  const name=(dispName||"").trim(); const tvgId=getAttr(header,"tvg-id")||"";
  const m = name.match(/^CCTV[\s\-]?(\d{1,2})/i) || tvgId.match(/^cctv[\s\-]?(\d{1,2})/i);
  if (m) return `cctv${String(m[1]).padStart(2,"0")}`;
  return (tvgId && tvgId.trim()) ? tvgId.trim().toLowerCase() : normName(name);
}

/* ===== 直链探测：返回 { ok, ttfb } ===== */
async function quickProbe(url, mode="strict"){
  const res = { ok:false, ttfb: Number.POSITIVE_INFINITY };
  if (!url) return res;
  if (mode === "off") return { ok:true, ttfb:0 };
  const t1 = (mode === "strict") ? PROBE_TIMEOUT_MS_STRICT : PROBE_TIMEOUT_MS_LOOSE;
  try {
    const t0 = Date.now();
    let { r } = await httpGet(url, { Range: "bytes=0-0" }, t1);
    if (r && [200,206,301,302].includes(r.status)) { res.ok=true; res.ttfb=Date.now()-t0; return res; }
    if (mode === "loose") {
      const t2 = Date.now(); ({ r } = await httpGet(url, {}, PROBE_TIMEOUT_MS_LOOSE));
      if (r && [200,301,302].includes(r.status)) { res.ok=true; res.ttfb=Date.now()-t2; return res; }
    }
    return res;
  } catch { return res; }
}

/* ===== 并发池 ===== */
async function withConcurrency(items, limit, worker){
  const ret = new Array(items.length); let idx=0, running=0;
  return new Promise(resolve=>{
    const runNext=()=>{
      while (running<limit && idx<items.length){
        const cur=idx++; running++;
        Promise.resolve(worker(items[cur], cur))
          .then(v=>ret[cur]=v).catch(()=>ret[cur]=undefined)
          .finally(()=>{ running--; (idx>=items.length && running===0) ? resolve(ret) : runNext(); });
      }
    };
    runNext();
  });
}

/* ===== 注入：收集→并发探测→CCTV去重→卫视分组→输出 ===== */
async function injectForM3U(m3uText, iconMap, idx=0){
  if (globalStop) return "";
  const lines = m3uText.split(/\r?\n/);
  const extCount = lines.filter(l=>l.startsWith("#EXTINF")).length;
  console.log(`源#${idx+1}: EXTINF = ${extCount}`);

  // 先抽取候选（不探测）
  const cands = [];
  let scanned = 0;
  for (let i=0;i<lines.length;i++){
    if (globalStop) break;
    const raw = lines[i];
    if (!raw.startsWith("#EXTINF")) continue;
    scanned++; if (scanned > PER_SOURCE_SCAN_LIMIT) break;

    totalChannels++;

    const commaIdx = raw.indexOf(",");
    let header     = commaIdx>=0 ? raw.slice(0,commaIdx) : raw;
    const dispName = commaIdx>=0 ? raw.slice(commaIdx+1).trim() : "";
    const url      = findNextUrl(lines, i);
    if (!url) continue;

    // 分组（卫视统一）
    const grpTitle = getAttr(header, "group-title");
    const grpTvg   = getAttr(header, "tvg-group");
    let groupVal   = grpTitle || grpTvg || "mix";
    if (/卫视|衛視/.test(dispName)) groupVal = "卫视";

    // 补 logo（不做图标 HTTP 校验，极大提速）
    const curLogo = getAttr(header, "tvg-logo");
    const needFill = !curLogo || /^https?:\/\/$/.test(curLogo) || (curLogo && curLogo.trim() === "") || /^(?:-|n\/a|none|null|empty)$/i.test(curLogo||"");
    if (!/tvg-logo="/i.test(header) || needFill){
      const iconUrl = await pickIconByDisplayName(iconMap, dispName);
      header = setOrReplaceAttr(header, "tvg-logo", iconUrl);
    }

    cands.push({ header, dispName, groupVal, url });
    if (cands.length >= HARD_TARGET * 3) break; // 收够 3 倍候选就停
  }

  // 并发探测
  const probed = await withConcurrency(cands, PROBE_CONCURRENCY, async (it)=>{
    const pr = await quickProbe(it.url, FILTER_MODE);
    if (!pr.ok) { filteredChannels++; return null; }
    return { ...it, ttfb: pr.ttfb, key: canonicalKeyForDedup(it.dispName, it.header) };
  });

  // CCTV 去重：同 key 保留首包更快
  const bestByKey = new Map();
  for (const it of probed){
    if (!it) continue;
    const prev = bestByKey.get(it.key);
    if (!prev || it.ttfb < prev.ttfb) bestByKey.set(it.key, it);
    keptChannels = bestByKey.size;
    if (keptChannels >= HARD_TARGET) break;
  }

  // 排序输出：CCTV 在前按数字，其余按中文名
  const entries = Array.from(bestByKey.values());
  entries.sort((a,b)=>{
    const ma = a.key.match(/^cctv(\d+)/), mb = b.key.match(/^cctv(\d+)/);
    if (ma && mb) return Number(ma[1]) - Number(mb[1]);
    if (ma) return -1; if (mb) return 1;
    return a.dispName.localeCompare(b.dispName, "zh");
  });

  const out = ["#EXTM3U"];
  for (const it of entries){
    let hdr = setOrReplaceAttr(it.header, "group-title", it.groupVal);
    hdr = setOrReplaceAttr(hdr, "tvg-group", it.groupVal);
    out.push(`${hdr},${it.dispName}`);
    out.push(`#EXTGRP:${it.groupVal}`);
    out.push(it.url);
  }
  return out.join("\n");
}

/* ===== 主流程 ===== */
(async function main(){
  try{
    const [iconMap, ...srcs] = await Promise.all([
      loadIcons(),
      ...M3U_URLS.map(o=>httpGet(o.url))
    ]);
    const validM3Us = srcs.filter(r=>r?.r?.status>=200 && r.d).map(r=>r.d);
    if (!validM3Us.length) {
      const empty = "#EXTM3U\n# Stats: total=0, kept=0, filtered=0\n# 失败：没有可用源\n";
      console.log(empty);
      if (IS_NODE) { fs.mkdirSync(OUT_DIR,{recursive:true}); fs.writeFileSync(OUT_FILE, empty); }
      return;
    }

    const injectedList = [];
    for (let si=0; si<validM3Us.length; si++){
      if (globalStop) break;
      const injected = await injectForM3U(validM3Us[si], iconMap, si);
      injectedList.push(injected);
    }

    let merged = injectedList.join("\n");
    merged = stripM3UHeaderOnce(merged);
    merged = dedupeM3U(merged);
    merged = clipByPairCount(merged, TEST_TOTAL_LIMIT);

    const header =
      "#EXTM3U\n" +
      `# Generated-At: ${BUILD_ISO} (limit=${TEST_TOTAL_LIMIT})\n` +
      `# Stats: total=${totalChannels}, kept=${keptChannels}, filtered=${filteredChannels}\n`;
    const finalText = header + merged.replace(/^#EXTM3U\s*/,'') + "\n";

    console.log(finalText);
    if (IS_NODE) {
      fs.mkdirSync(OUT_DIR,{recursive:true});
      fs.writeFileSync(OUT_FILE, finalText);
      if (UPLOAD_NOW) {
        try{
          console.log(`# Uploading to GitHub: ${REPO}@${BRANCH} -> ${PATH_IN_REPO}`);
          const resp = await putFile(REPO, BRANCH, PATH_IN_REPO, finalText);
          console.log(`# Uploaded commit: ${resp.commit?.sha || "(no sha)"}`);
        }catch(e){ console.log(`⚠️ 上传失败：${String(e)}`); }
      }
    }
  }catch(e){
    const msg = "#EXTM3U\n# 异常：" + String(e) + "\n";
    console.log(msg);
    if (IS_NODE) { fs.mkdirSync(OUT_DIR,{recursive:true}); fs.writeFileSync(OUT_FILE, msg); }
  }
})();