/**
 * m3u.js — 生成可播放 M3U，按“频道显示名”匹配图标并上传到 GitHub
 * 图标优先：NAME_ALIAS(规范化) → icons.json(多键命中) → 真实存在的 TV_logo(小写/原样) → not-found
 * 直链：strict 探测（记录 TTFB），仅保留可播且挑首包更快的
 * CCTV：同号去重只留一条（更快的）
 * “卫视”：凡名称含“卫视/衛視”统一分组为 "卫视"
 * 性能：凑够 TEST_TOTAL_LIMIT/100 条即停；每源最多扫描 PER_SOURCE_SCAN_LIMIT/500 条
 * 输出：dist/playlist.m3u，并上传至 Mikephie/AUTOjs@main: LiveTV/AKTV.m3u
 */

const IS_NODE  = typeof process !== "undefined" && process.release?.name === "node";
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

// 仅对白名单域做 200/206 校验 & 加版本号防缓存（不会把中文路径编码）
const ICON_HOST_WHITELIST = ["img.mikephie.site"];
const BUILD_EPOCH = Date.now();
const BUILD_ISO   = new Date(BUILD_EPOCH).toISOString();
const BUILD_VER   = String(BUILD_EPOCH);

// 手动别名（“显示名” → 图标名，不带扩展名）；键与来名都会做规范化后比对
const NAME_ALIAS = {
  "明珠台": "ch2",
  // "翡翠台": "jade",
  // "无线新闻台": "tvbnews",
};

/* ===== 上传配置 ===== */
const UPLOAD_NOW    = true;
const REPO          = "Mikephie/AUTOjs";
const BRANCH        = "main";
const PATH_IN_REPO  = "LiveTV/AKTV.m3u";

/* ===== 限额 / 策略 ===== */
const FILTER_MODE              = "strict";  // strict / loose / off
const TEST_TOTAL_LIMIT         = 150;       // 输出上限（可由 CI 环境变量覆盖）
const HARD_TARGET              = 150;       // 早停门槛
const PER_SOURCE_SCAN_LIMIT    = 500;       // 每源最多尝试

/* ===== 超时（提速） ===== */
const FETCH_TIMEOUT_MS         = 6000;
const PROBE_TIMEOUT_MS_STRICT  = 1200;
const PROBE_TIMEOUT_MS_LOOSE   = 900;

/* ===== 输出目录 ===== */
const OUT_DIR  = "dist";
const OUT_FILE = path ? path.join(OUT_DIR, "playlist.m3u") : "playlist.m3u";

/* ===== 状态 ===== */
let totalChannels = 0, keptChannels = 0, filteredChannels = 0;
let globalStop = false;

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

/* ===== GitHub 上传工具 ===== */
async function ghApi(path, opts = {}) {
  const GH_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!GH_TOKEN) throw new Error("缺少 GH_TOKEN/GITHUB_TOKEN 环境变量");
  const headers = Object.assign({
    "Authorization": `Bearer ${GH_TOKEN}`,
    "Accept": "application/vnd.github+json",
    "User-Agent": "m3u-uploader",
  }, opts.headers || {});
  const res = await (typeof fetch === "function" ? fetch : nodeFetch)(`https://api.github.com${path}`, {
    ...opts, headers,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status}: ${body}`);
  }
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
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/* ===== 图标键构建/校验工具 ===== */
const isZh = s => /[\u4e00-\u9fa5]/.test(s||"");

// 英文键：去括号/空白/连字符，去清晰度后缀，转大写
function englishKey(s){
  s = (s||"").trim(); if (!s || isZh(s)) return "";
  s = s.replace(/\([^)]*\)/g, " ")
       .replace(/\b(HD|FHD|UHD|4K)\b/ig, " ")
       .replace(/[\s\-_\.]+/g, "");
  return s.toUpperCase();
}

// 中文键：去括号内容（保留简繁）
function chineseKey(s){
  s = (s||"").trim();
  if (!isZh(s)) return "";
  return s.replace(/[（(].*?[)）]/g, "").trim();
}

// 常用简繁对照
const ZH_MAP = [
  ["鳳凰","凤凰"],["衛視","卫视"],["資訊","资讯"],["無線","无线"],["綜合","综合"],["娛樂","娱乐"],
  ["頻道","频道"],["電影","电影"],["臺","台"],["東森","东森"],["華視","华视"],["公視","公视"],["龍華","龙华"]
];

// 为一个中文名生成简繁互通变体（并去括号）
function addZhVariants(set, base){
  set.add(base);
  set.add(base.replace(/[（(].*?[)）]/g,""));
  for (let n=0; n<2; n++) {
    for (const [trad,simp] of ZH_MAP) {
      for (const v of Array.from(set)) {
        set.add(v.replace(new RegExp(trad,"g"), simp));
        set.add(v.replace(new RegExp(simp,"g"), trad));
      }
    }
  }
  return set;
}

// 只对白名单域做 200/206 校验（其余域名直接放行）
function getHost(u){ try { return new URL(u).host.toLowerCase(); } catch { return ""; } }
async function probe200(url){
  try{
    const host = getHost(url);
    if (!ICON_HOST_WHITELIST.includes(host)) return true;
    const { r } = await httpGet(url, { "Range": "bytes=0-0" }, 1500);
    return r && (r.status === 200 || r.status === 206);
  }catch{ return false; }
}

// 自家域名加 ?v= 构建号（防缓存）— 不用 URL 对象，避免百分号编码
function addCacheBuster(u, ver = BUILD_VER){
  try{
    const host = getHost(u);
    if (!ICON_HOST_WHITELIST.includes(host)) return u;
    if (/[?&]v=[^&]+/.test(u)) {
      return u.replace(/([?&]v=)[^&]+/, `$1${ver}`);
    }
    const sep = u.includes("?") ? "&" : "?";
    return `${u}${sep}v=${ver}`;
  }catch{ return u; }
}

// 兼容不同编码形式（不主动 encode，优先保留原样中文路径）
function encodeVariants(u){
  const arr = [u];
  try { const dec = decodeURIComponent(u); if (dec !== u) arr.push(dec); } catch {}
  return [...new Set(arr)];
}

/* ===== icons.json 载入（多键映射） ===== */
function normName(s){
  return (s||"")
    .normalize("NFKC")
    .replace(/（.*?）|\(.*?\)/g, "")     // 去括号及内容
    .toLowerCase()
    .replace(/\.(png|jpg|jpeg|webp|gif|svg)$/i,"")
    .replace(/[\s\/\-\_]+/g,"")
    .replace(/[^\w\u4e00-\u9fa5]/g,"")
    .replace(/(fhd|uhd|hd|sd|4k)$/,"");
}
function buildIconMap(json){
  const list = Array.isArray(json?.icons) ? json.icons : (Array.isArray(json) ? json : []);
  const map = new Map();
  for (const it of list){
    const name = (it?.name || "").trim();
    const url  = (it?.url  || "").trim();
    if (!name || !url) continue;

    const base = name.replace(/\.(png|jpg|jpeg|webp|gif|svg)$/i, "").trim();

    const keys = new Set();
    keys.add(base);                                 // 原样
    if (isZh(base)) addZhVariants(keys, base);      // 中文变体
    const up = base.toUpperCase(); if (up) keys.add(up);     // 英文大写键
    const en = englishKey(base);   if (en) keys.add(en);     // 英文规整键
    const nn = normName(base);     if (nn) keys.add(nn);     // 规范化键

    for (const k of keys) map.set(k, url);
  }
  return map;
}
async function loadIcons(){
  try{
    const { d } = await httpGet(ICONS_JSON_URL, {}, 8000);
    if (!d) { console.log("# icons loaded = 0"); return new Map(); }
    let parsed = JSON.parse(d);
    const map = buildIconMap(parsed);
    console.log(`# icons loaded = ${map.size}`);
    return map;
  }catch(e){
    console.log("⚠️ icons.json 加载失败：", String(e));
    return new Map();
  }
}

/* ===== 频道名 → TV_logo 候选名（含常见英文规则） ===== */
function makeNameCandidates(raw){
  const s0 = (raw||"").trim();
  if (!s0) return [];

  const noParen = s0.replace(/（.*?）|\(.*?\)/g, "");
  const noSpace = noParen.replace(/\s+/g, "");
  const baseAscii = noParen.toLowerCase().replace(/[\s\/\-\_]+/g,"");

  const set = new Set([
    noParen,                                 // 原样（去括号）
    noSpace,                                 // 去空格
    baseAscii,                               // 全小写
    baseAscii.replace(/(hd|fhd|uhd|sd|4k)$/,""),
    noSpace.replace(/(台|频道|頻道)$/,""),
    // 英文规则归一
    baseAscii.replace(/^channel(\d+)(hd|fhd|uhd|sd|4k)?$/,"channel$1"),
    baseAscii.replace(/^channelu(hd|fhd|uhd|sd|4k)?$/,"channelu"),
    baseAscii.replace(/^tntsports(\d)(hd|fhd|uhd|sd|4k)?$/,"tntsports$1"),
  ]);

  return Array.from(set).filter(Boolean);
}

/* ===== 图标选择：别名(规范化) → icons.json(多键命中) → 存在的 TV_logo → not-found ===== */
async function pickIconByDisplayName(iconMap, dispName){
  const raw = (dispName||"").trim();
  if (!raw) return addCacheBuster(NOT_FOUND_ICON);

  // 1) 别名（对“键”和“来名”都做规范化）
  const aliasNormMap = new Map(
    Object.entries(NAME_ALIAS).map(([k,v]) => [normName(k), v])
  );
  const alias = aliasNormMap.get(normName(raw));
  if (alias){
    const aliasKey = normName(alias);
    // icons.json
    if (iconMap.has(aliasKey)) {
      const u0 = iconMap.get(aliasKey);
      for (const v0 of encodeVariants(u0)) {
        const v = addCacheBuster(v0);
        if (await probe200(v)) return v;
      }
    }
    // TV_logo（小写/原样）
    const lower = `${ICON_BASE}/${alias.toLowerCase()}.png`;
    const camel = `${ICON_BASE}/${alias}.png`;
    if (await probe200(lower)) return addCacheBuster(lower);
    if (await probe200(camel)) return addCacheBuster(camel);
    return addCacheBuster(NOT_FOUND_ICON);
  }

  // 2) icons.json：更“宽”的键空间命中（英文规整 & 中文键 & 规范化变体）
  const k0 = normName(raw);
  const jsonKeys = new Set([
    k0,
    englishKey(raw),
    chineseKey(raw),
    // 常见变体
    k0.replace(/channel(\d+)$/,"channel$1"),
    k0.replace(/lovenature.*$/,"lovenature"),
    k0.replace(/tvn.*$/,"tvn"),
    k0.replace(/plus$/,"plus"),
    k0.replace(/action$/,"action"),
  ]);
  for (const kk of jsonKeys){
    if (kk && iconMap.has(kk)) {
      const u0 = iconMap.get(kk);
      for (const v0 of encodeVariants(u0)) {
        const v = addCacheBuster(v0);
        if (await probe200(v)) return v;
      }
    }
  }

  // 3) 真实存在的 TV_logo：同一候选名尝试 lowercase 与原样大小写
  for (const base of makeNameCandidates(raw)){
    const lower = `${ICON_BASE}/${base.toLowerCase()}.png`;
    const camel = `${ICON_BASE}/${base}.png`;
    if (await probe200(lower)) return addCacheBuster(lower);
    if (await probe200(camel)) return addCacheBuster(camel);
  }

  // 4) 仍无 → not-found
  return addCacheBuster(NOT_FOUND_ICON);
}

/* ===== M3U 工具函数 ===== */
function findNextUrl(lines, i){
  let j = i+1;
  while (j < lines.length && !lines[j].trim()) j++;
  if (j < lines.length && !lines[j].startsWith("#")) return lines[j].trim();
  j = i+1;
  while (j < lines.length && (lines[j].startsWith("#") || !lines[j].trim())) j++;
  return (j < lines.length && !lines[j].startsWith("#")) ? lines[j].trim() : "";
}
function getAttr(header, key){
  return (header.match(new RegExp(`${key}="([^"]*)"`, "i")) || [])[1] || "";
}
function setOrReplaceAttr(header, key, value){
  if (!value) return header;
  return header.match(new RegExp(`${key}="`, "i"))
    ? header.replace(new RegExp(`${key}="[^"]*"`, "i"), `${key}="${value}"`)
    : `${header} ${key}="${value}"`;
}
function stripM3UHeaderOnce(text){
  const lines = text.split(/\r?\n/);
  const kept = lines.filter(ln => !ln.trim().toUpperCase().startsWith("#EXTM3U"));
  return ["#EXTM3U", ...kept].join("\n");
}
function dedupeM3U(m3u){
  const lines = m3u.split(/\r?\n/);
  const out=[], seen=new Set();
  for (let i=0;i<lines.length;i++){
    const line = lines[i];
    if (!line.startsWith("#EXTINF")) { if (line.startsWith("#")) out.push(line); continue; }
    const meta = [];
    let j = i + 1;
    while (j < lines.length && (lines[j].startsWith("#") || !lines[j].trim())) { meta.push(lines[j]); j++; }
    const url = (j < lines.length && !lines[j].startsWith("#")) ? lines[j].trim() : "";
    const dispName = line.split(",").slice(1).join(",").trim();
    const key = `${dispName.toLowerCase()}||${(url||"").toLowerCase()}`;
    if (seen.has(key)) { if (url) i = j; continue; }
    seen.add(key);
    out.push(line);
    for (const m of meta) out.push(m);
    if (url) { out.push(url); i = j; }
  }
  return out.join("\n");
}
function clipByPairCount(text, maxPairs){
  if (!maxPairs || maxPairs <= 0) return text;
  const lines = text.split(/\r?\n/);
  const out = []; let pairs = 0;
  for (let i=0;i<lines.length;i++){
    const ln = lines[i];
    if (!ln.startsWith("#EXTINF")) { if (ln.startsWith("#")) out.push(ln); continue; }
    if (pairs >= maxPairs) break;
    const meta = [];
    let j = i + 1;
    while (j < lines.length && (lines[j].startsWith("#") || !lines[j].trim())) { meta.push(lines[j]); j++; }
    const url = (j < lines.length && !lines[j].startsWith("#")) ? lines[j].trim() : "";
    out.push(ln);
    for (const m of meta) out.push(m);
    if (url) { out.push(url); i = j; }
    pairs++;
  }
  return out.join("\n");
}

/* ===== CCTV 去重键（合并同号） ===== */
function canonicalKeyForDedup(dispName, header){
  const name = (dispName || "").trim();
  const tvgId = getAttr(header, "tvg-id") || "";
  const m = name.match(/^CCTV[\s\-]?(\d{1,2})/i) || tvgId.match(/^cctv[\s\-]?(\d{1,2})/i);
  if (m) return `cctv${String(m[1]).padStart(2,"0")}`;
  return (tvgId && tvgId.trim()) ? tvgId.trim().toLowerCase() : normName(name);
}

/* ===== 直链探测：返回 { ok, ttfb }（首包时延） ===== */
async function quickProbe(url, mode="strict"){
  const res = { ok:false, ttfb: Number.POSITIVE_INFINITY };
  if (!url) return res;
  if (mode === "off") return { ok:true, ttfb:0 };

  const t1 = (mode === "strict") ? PROBE_TIMEOUT_MS_STRICT : PROBE_TIMEOUT_MS_LOOSE;
  try {
    const t0 = Date.now();
    let { r } = await httpGet(url, { Range: "bytes=0-0" }, t1);
    if (r && [200,206,301,302].includes(r.status)) {
      res.ok = true; res.ttfb = Date.now() - t0; return res;
    }
    if (mode === "loose") {
      const t2 = Date.now();
      ({ r } = await httpGet(url, {}, PROBE_TIMEOUT_MS_LOOSE));
      if (r && [200,301,302].includes(r.status)) {
        res.ok = true; res.ttfb = Date.now() - t2; return res;
      }
    }
    return res;
  } catch { return res; }
}

/* ===== 注入：收集→挑最快→统一分组→输出 ===== */
async function injectForM3U(m3uText, iconMap, idx=0){
  if (globalStop) return "";
  const lines = m3uText.split(/\r?\n/);
  const out = [];

  const extCount = lines.filter(l=>l.startsWith("#EXTINF")).length;
  console.log(`源#${idx+1}: EXTINF = ${extCount}`);

  // key -> { header, dispName, groupVal, url, ttfb }
  const bestByKey = new Map();

  let scanned = 0;
  for (let i=0;i<lines.length;i++){
    if (globalStop) break;

    const raw = lines[i];
    if (!raw.startsWith("#EXTINF")) continue;

    scanned++;
    if (scanned > PER_SOURCE_SCAN_LIMIT) break;

    totalChannels++;

    const commaIdx = raw.indexOf(",");
    let header     = commaIdx>=0 ? raw.slice(0,commaIdx) : raw;
    const dispName = commaIdx>=0 ? raw.slice(commaIdx+1).trim() : "";

    // 分组：优先已有分组，否则 "mix"；卫视统一归类为 "卫视"
    const grpTitle = getAttr(header, "group-title");
    const grpTvg   = getAttr(header, "tvg-group");
    let groupVal   = grpTitle || grpTvg || "mix";
    if (/卫视|衛視/.test(dispName)) groupVal = "卫视";

    // 补 logo（按显示名）
    const curLogo = getAttr(header, "tvg-logo");
    const needFill = !curLogo || /^https?:\/\/$/.test(curLogo) || (curLogo && curLogo.trim() === "") || /^(?:-|n\/a|none|null|empty)$/i.test(curLogo||"");
    if (!/tvg-logo="/i.test(header) || needFill){
      const iconUrl = await pickIconByDisplayName(iconMap, dispName);
      header = setOrReplaceAttr(header, "tvg-logo", iconUrl);
    }

    const url = findNextUrl(lines, i);
    const pr  = await quickProbe(url, FILTER_MODE);
    if (!pr.ok) { filteredChannels++; continue; }

    // CCTV 合并：同“去重键”只留 TTFB 更低的一条
    const key = canonicalKeyForDedup(dispName, header);
    const prev = bestByKey.get(key);
    if (!prev || pr.ttfb < prev.ttfb) {
      bestByKey.set(key, { header, dispName, groupVal, url, ttfb: pr.ttfb });
    }

    keptChannels = bestByKey.size;
    if (keptChannels >= HARD_TARGET) { globalStop = true; break; }
  }

  // 输出（CCTV 在前按数字；其余按中文名）
  const entries = Array.from(bestByKey.entries()).map(([k,v])=>({ key:k, ...v }));
  entries.sort((a,b)=>{
    const ma = a.key.match(/^cctv(\d+)/), mb = b.key.match(/^cctv(\d+)/);
    if (ma && mb) return Number(ma[1]) - Number(mb[1]);
    if (ma) return -1;
    if (mb) return 1;
    return a.dispName.localeCompare(b.dispName, "zh");
  });

  const result = ["#EXTM3U"];
  for (const it of entries){
    let hdr = setOrReplaceAttr(it.header, "group-title", it.groupVal);
    hdr = setOrReplaceAttr(hdr, "tvg-group", it.groupVal);
    result.push(`${hdr},${it.dispName}`);
    result.push(`#EXTGRP:${it.groupVal}`);
    result.push(it.url);
  }

  return result.join("\n");
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
      if (IS_NODE) {
        fs.mkdirSync(OUT_DIR, { recursive: true });
        fs.writeFileSync(OUT_FILE, empty);
      }
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
    merged = clipByPairCount(merged, Number(process.env.TEST_TOTAL_LIMIT || TEST_TOTAL_LIMIT));

    const header =
      "#EXTM3U\n" +
      `# Generated-At: ${BUILD_ISO} (limit=${Number(process.env.TEST_TOTAL_LIMIT || TEST_TOTAL_LIMIT)})\n` +
      `# Stats: total=${totalChannels}, kept=${keptChannels}, filtered=${filteredChannels}\n`;

    const finalText = header + merged.replace(/^#EXTM3U\s*/,'') + "\n";

    console.log(finalText);
    if (IS_NODE) {
      fs.mkdirSync(OUT_DIR, { recursive: true });
      fs.writeFileSync(OUT_FILE, finalText);

      if (UPLOAD_NOW) {
        try {
          console.log(`# Uploading to GitHub: ${REPO}@${BRANCH} -> ${PATH_IN_REPO}`);
          const resp = await putFile(REPO, BRANCH, PATH_IN_REPO, finalText);
          console.log(`# Uploaded commit: ${resp.commit?.sha || "(no sha)"}`);
        } catch (e) {
          console.log(`⚠️ 上传失败：${String(e)}`);
        }
      }
    }
  }catch(e){
    const msg = "#EXTM3U\n# 异常：" + String(e) + "\n";
    console.log(msg);
    if (IS_NODE) {
      fs.mkdirSync(OUT_DIR, { recursive: true });
      fs.writeFileSync(OUT_FILE, msg);
    }
  }
})();