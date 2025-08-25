/**
 * 最终版 m3u.js
 * - 双环境：Node.js/GitHub Actions & Surge/Loon/QuanX
 * - 过滤无效流（Node 环境启用；Surge/Loon 跳过以避免超时）
 * - 图标注入：仅对自家域做 200 校验（Range: bytes=0-0）
 * - UA 网关：按需为 live.php / 指定域注入 UA
 * - 并发/超时/上限：防止卡死；统计总数/保留/过滤
 * - GitHub 上传：PUT contents API（自动获取 sha，避免 409）
 */

// =============== 环境检测 & 依赖 =================
const IS_NODE  = typeof process !== "undefined" && process.release?.name === "node";
const IS_SURGE = typeof $httpClient !== "undefined";
const IS_LOON  = typeof $loon !== "undefined";
const IS_QX    = typeof $task !== "undefined";

// Node 20 全局自带 fetch/AbortController；如无则动态导入 node-fetch
let nodeFetch = null;
if (IS_NODE && typeof fetch === "undefined") {
  nodeFetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
}

// =============== 可调参数（性能/超时/并发/上限） ===============
const FETCH_TIMEOUT_MS        = 5000;  // 普通拉取（icons/m3u）超时
const STREAM_PROBE_TIMEOUT_MS = 2000;  // 流探测超时
const ICON_PROBE_TIMEOUT_MS   = 1200;  // 图标探测超时（仅自家域）
const MAX_CHANNELS_PER_SOURCE = 350;   // 单源最多处理频道
const MAX_CHANNELS_TOTAL      = 900;   // 合并后最多频道（#EXTINF 对数）
const ACCEPT_206_PARTIAL      = true;  // 206 视为可用
const ACCEPT_REDIRECT_AS_OK   = true;  // 301/302 视为可用
const SKIP_PROBE_FOR_GATEWAY  = true;  // workers.dev 网关跳过探测直过

// =============== 构建/网关/数据源/上传配置 =================
const BUILD_EPOCH = Date.now();
const BUILD_ISO   = new Date(BUILD_EPOCH).toISOString();
const BUILD_VER   = String(BUILD_EPOCH);

const USE_WORKER_GATEWAY = true;
const GW_BASE = "https://m3u-converter.mikephiemy.workers.dev/?u=";

// 需要强制带 UA 的域名
const UA_MAP = {
  "mursor.ottiptv.cc": "okHttp/Mod-1.1.0",
  "sub.ottiptv.cc":    "okHttp/Mod-1.1.0",
};

const M3U_URLS = [
  { url: "https://aktv.space/live.m3u" },
  { url: "https://raw.githubusercontent.com/Guovin/iptv-api/gd/output/result.m3u" },
];
const ICONS_JSON_URL = "https://img.mikephie.site/icons.json";

const PERSIST_KEY = "M3U_CONTENT";
const UPLOAD_NOW  = true;
const REPO        = "Mikephie/AUTOjs";
const BRANCH      = "main";
const PATH        = "LiveTV/AKTV.m3u";
const INLINE_TOKEN = "";
const TOKEN = IS_NODE ? (process.env.GH_TOKEN || INLINE_TOKEN) : (($persistentStore?.read("GH_TOKEN")) || INLINE_TOKEN);

// 组策略
const GROUP_WHITELIST    = ["sport", "movie", "cctv", "mediacorp", "hongkong", "taiwan"];
const DEFAULT_GROUP      = "mix";
const FORCE_RENAME_GROUP = true;
const EMIT_TVG_GROUP     = true;
const EMIT_EXTGRP        = true;

// 图标策略
const ICON_HOST_WHITELIST = ["img.mikephie.site"];                // 仅自家域做 200 校验
const FORCE_REPLACE_ALL   = true;
const FALLBACK_LOGO       = "https://img.mikephie.site/not-found.png";

// =============== 统计 ===============
let totalChannels = 0;
let keptChannels = 0;
let filteredChannels = 0;

// =============== HTTP 封装（带超时） ===============
async function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  // Surge/Loon → 用 $httpClient，忽略 AbortController
  if (!IS_NODE) {
    return new Promise((resolve) => {
      $httpClient.get({ url, headers: options.headers || {} }, (e, r, d) => {
        if (e) resolve({ r: { status: 0 }, d: "" });
        else resolve({ r, d });
      });
    });
  }
  // Node：用全局 fetch 或 node-fetch
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const f = typeof fetch === "function" ? fetch : nodeFetch;
    const res = await f(url, { ...options, signal: controller.signal });
    const text = await res.text().catch(() => "");
    return { r: res, d: text };
  } catch {
    return { r: { status: 0 }, d: "" };
  } finally { clearTimeout(id); }
}

function httpGet(url, headers = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  return fetchWithTimeout(url, { headers }, timeoutMs);
}
function httpPut(url, body, headers = {}) {
  if (!IS_NODE) {
    return new Promise((resolve) => {
      $httpClient.put({ url, headers, body: JSON.stringify(body) }, (e, r, d) => {
        if (e) resolve({ r: { status: 0 }, d: "" });
        else resolve({ r, d });
      });
    });
  }
  const f = typeof fetch === "function" ? fetch : nodeFetch;
  return f(url, { method: "PUT", headers, body: JSON.stringify(body) })
    .then(async (res) => ({ r: res, d: await res.text().catch(()=> "") }))
    .catch(() => ({ r: { status: 0 }, d: "" }));
}

// =============== 存储/Base64 ===============
const store = {
  read(k){ if (IS_NODE) { try { return require("fs").readFileSync(`./${k}.txt`, "utf8"); } catch { return ""; } }
           return $persistentStore?.read(k) || ""; },
  write(v,k){ if (IS_NODE) { require("fs").writeFileSync(`./${k}.txt`, v, "utf8"); return true; }
              return $persistentStore?.write(v,k); }
};
function b64encode(text){
  if (IS_NODE) return Buffer.from(text, "utf8").toString("base64");
  if (typeof $base64 !== "undefined" && $base64.encode) return $base64.encode(text);
  return "";
}

// =============== 字符串/匹配工具 ===============
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
function getHost(u){ try { return new URL(u).host.toLowerCase(); } catch { return ""; } }
function getHostPath(u){ try { const x=new URL(u); return {host:x.host||"", path:x.pathname||""}; } catch { return {host:"", path:""}; } }
function addCacheBuster(u, ver = BUILD_VER){
  try{ const url = new URL(u); if (!ICON_HOST_WHITELIST.includes(url.host.toLowerCase())) return u;
       const has=[...url.searchParams.keys()].some(k=>k.toLowerCase()==="v"); has?url.searchParams.set("v",ver):url.searchParams.append("v",ver); return url.toString(); }
  catch{ return u; }
}

// =============== 图标表构建/选择 ===============
function buildIconMap(json){
  const list = Array.isArray(json?.icons) ? json.icons : (Array.isArray(json) ? json : []);
  const map = new Map();
  for (const it of list){
    const name=(it?.name||"").trim(); const url=(it?.url||"").trim();
    if (!name || !url) continue;
    const baseFull = name.replace(/\.(png|jpg|jpeg|webp|gif|svg)$/i, "");
    const base = baseFull.split("/").pop();
    const keys = new Set();
    if (base) {
      keys.add(base); keys.add(base.toUpperCase());
      const en=englishKey(base); if (en) keys.add(en);
      if (isZh(base)) addZhVariants(keys, base);
    }
    if (baseFull) keys.add(baseFull);
    for (const k of keys) map.set(k, url);
  }
  return map;
}
function pickLogoUrl(iconMap, candidates){
  for (const raw of candidates){
    const s=(raw||"").trim(); if (!s) continue;
    if (iconMap.has(s)) return iconMap.get(s);
    const up=s.toUpperCase(); if (iconMap.has(up)) return iconMap.get(up);
    const en=englishKey(s); if (en && iconMap.has(en)) return iconMap.get(en);
    const zh=chineseKey(s); if (zh && iconMap.has(zh)) return iconMap.get(zh);
  }
  return null;
}
function fileLower(u){ try { return decodeURIComponent(u).toLowerCase(); } catch { return (u||"").toLowerCase(); } }
function shouldOverrideLogo(cur, nxt){
  if (!cur) return true;
  if (FORCE_REPLACE_ALL) return true;
  const curf=fileLower(cur);
  if (!curf || /not[-_]?found\.png$/.test(curf)) return true;
  const curMine=ICON_HOST_WHITELIST.includes(getHost(cur));
  const nxtMine=ICON_HOST_WHITELIST.includes(getHost(nxt));
  if (nxtMine && !curMine) return true;
  return false;
}

// =============== 200/探测 ===============
async function probe200Icon(url){
  try{
    const host=getHost(url);
    if (!ICON_HOST_WHITELIST.includes(host)) return true; // 外域图标直接放过
    const { r } = await httpGet(url, { "Range":"bytes=0-0" }, ICON_PROBE_TIMEOUT_MS);
    if (!r) return false;
    return r.status === 200 || (ACCEPT_206_PARTIAL && r.status === 206);
  }catch{ return false; }
}
function encodePathKeepSlash(p){ return p.split("/").map(s => encodeURIComponent(s)).join("/"); }
function toEncodedOnce(chineseUrl){ try{ const u=new URL(chineseUrl); u.pathname=encodePathKeepSlash(u.pathname); return u.toString(); } catch{ return chineseUrl; } }
async function probeStream(url){
  if (!url) return false;
  if (!IS_NODE) return true; // 移动端本地跳过探测
  const host = getHost(url);
  if (SKIP_PROBE_FOR_GATEWAY && /workers\.dev$/i.test(host)) return true;
  const { r } = await httpGet(url, { "Range":"bytes=0-0" }, STREAM_PROBE_TIMEOUT_MS);
  if (!r) return false;
  if (r.status === 200) return true;
  if (ACCEPT_206_PARTIAL && r.status === 206) return true;
  if (ACCEPT_REDIRECT_AS_OK && (r.status === 301 || r.status === 302)) return true;
  return false;
}
async function pickPlayableUrl(rawUrl){
  if (!rawUrl) return "";
  if (!IS_NODE) return rawUrl;                           // 本地直接返回，避免超时
  if (await probeStream(rawUrl)) return rawUrl;
  const encoded = toEncodedOnce(rawUrl);
  if (encoded !== rawUrl && await probeStream(encoded)) return encoded;
  return "";                                             // 过滤
}

// =============== 分组规则/分类 ===============
const RULES_HOST = [
  { test: /(espn|bein|skysports|foxsports|eleven|nba|bundesliga|laliga|premierleague)\./i, group: "sport" },
  { test: /(hbo|cinemax|celestial|starmovies|foxmovies|paramount|amc|mubi)\./i,           group: "movie" },
  { test: /(cctv|cntv|yangshipin)\./i,                                                    group: "cctv" },
  { test: /(mediacorp|mewatch|cna)\./i,                                                   group: "mediacorp" },
  { test: /(tvb|mytvsuper|viu|icable|nowtv|ifeng|phoenixtv)/i,                            group: "hongkong" },
  { test: /(ebc|ettv|ctitv|cts|ttv|setn|ftv|litv|hinet)/i,                                group: "taiwan" },
];
const RULES_PATH = [
  { test: /\/(sports?|nba|epl|laliga|seriea|bundesliga|f1|motogp|supersport)\b/i, group: "sport" },
  { test: /\/(movie|cinema|hbo|cinemax|celestial|starmovies|foxmovies|paramount|amc)\b/i, group: "movie" },
  { test: /\/(cctv|yangshipin|cntv)\b/i, group: "cctv" },
  { test: /\/axn\b/i, group: "movie" },
  { test: /\/animaxhk\b/i, group: "hongkong" },
  { test: /\/zhongtian\//i, group: "taiwan" },
  { test: /\/aktv\/CH-\d+\b/i, group: "hongkong" }
];
const KW = {
  sport: [/体育|體育|Sports?|ESPN|ELEVEN|beIN|Sky\s*Sports|Super\s*Sport|CCTV[-\s]*5|五星体育|NBA|英超|欧冠|中超/i],
  movie: [/电影|電影|Movies?|Cinema|HBO|Cinemax|Celestial|Star\s*Movies|FOX\s*Movies|Paramount|AMC|美亚|天映|\bAXN\b/i],
  cctv:  [/^CCTV[-\s]*\d{1,2}\+?$/i, /央视|央視|CCTV/i],
  mediacorp: [/^(cna|channel\s*5(\s*hd)?|channel\s*8(\s*hd)?|channel\s*u(\s*hd)?|suria|vasantham)\b/i],
  hongkong:  [/翡翠|明珠|無線|无线|TVB|星河|鳳凰|凤凰|\(HK\)/i],
  taiwan:    [/中天|東森|东森|三立|民視|民视|華視|华视|公視|公视|寰宇|龙华|龍華|緯來|纬来/i],
};
const hitKW = (s, arr) => arr.some(re => re.test(s||""));
const GROUP_REMAP = {
  "CNA":"mediacorp","Channel 5":"mediacorp","Channel 5 HD":"mediacorp",
  "Channel 8":"mediacorp","Channel 8 HD":"mediacorp","Channel U":"mediacorp","Channel U HD":"mediacorp",
  "翡翠台":"hongkong","明珠台":"hongkong","無線新聞台":"hongkong","无线新闻台":"hongkong",
  "鳳凰衛視中文台":"hongkong","鳳凰衛視資訊台":"hongkong","鳳凰衛視香港台":"hongkong",
  "中天新闻台":"taiwan","東森新聞":"taiwan","寰宇新聞台":"taiwan","三立LIVE":"taiwan","民視":"taiwan","民视":"taiwan"
};
function classifyChannel({tvgId, tvgName, dispName, url}){
  const blob = [tvgId,tvgName,dispName].filter(Boolean).join(" | ");
  const {host,path} = getHostPath(url||"");
  const direct = GROUP_REMAP[(dispName||"").trim()] || GROUP_REMAP[(tvgName||"").trim()] || GROUP_REMAP[(tvgId||"").trim()];
  if (direct) return direct;
  for (const r of RULES_HOST) if (r.test.test(host)) return r.group;
  for (const r of RULES_PATH) if (r.test.test(path)) return r.group;
  if (hitKW(blob, KW.sport)) return "sport";
  if (hitKW(blob, KW.movie)) return "movie";
  if (hitKW(blob, KW.cctv))  return "cctv";
  if (hitKW(blob, KW.mediacorp)) return "mediacorp";
  if (hitKW(blob, KW.hongkong))  return "hongkong";
  if (hitKW(blob, KW.taiwan))    return "taiwan";
  return DEFAULT_GROUP;
}
function stripVendorGroups(header){
  return header.replace(/\s+(aktv-group|provider|provider-logo|provider-type)="[^"]*"/ig, "");
}

// =============== M3U 注入（核心，含过滤无效流） ===============
function findNextUrl(lines, i){
  let j=i+1; while (j<lines.length && (lines[j].startsWith("#") || !lines[j].trim())) j++;
  return (j<lines.length && !lines[j].startsWith("#")) ? lines[j].trim() : "";
}

async function injectLogoForM3U(m3uText, iconMap){
  const lines = m3uText.split(/\r?\n/);
  const out = [];
  let processed = 0;

  for (let i=0;i<lines.length;i++){
    if (processed >= MAX_CHANNELS_PER_SOURCE) { console.log("⏩ reach MAX_CHANNELS_PER_SOURCE"); break; }
    const rawLine = lines[i];
    if (!rawLine.startsWith("#EXTINF")) { out.push(rawLine); continue; }

    processed++; totalChannels++;

    const commaIdx = rawLine.indexOf(",");
    let header     = commaIdx>=0 ? rawLine.slice(0,commaIdx) : rawLine;
    const dispName = commaIdx>=0 ? rawLine.slice(commaIdx+1).trim() : "";
    const getAttr  = k => (header.match(new RegExp(`${k}="([^"]*)"`, "i")) || [])[1] || "";
    const tvgId    = getAttr("tvg-id");
    const tvgName  = getAttr("tvg-name");
    let   tvgLogo  = getAttr("tvg-logo");

    // 读取原始 URL（下一行）
    let urlForThis = findNextUrl(lines, i);

    // A) live.php/id=xxx → 网关 + 透传 UA
    if (USE_WORKER_GATEWAY && (/\blive\.php\b/i.test(urlForThis) || /\.php\?id=/i.test(urlForThis))) {
      let newUrl = GW_BASE + encodeURIComponent(urlForThis);
      const uaMatch = header.match(/http-user-agent="([^"]+)"/i);
      if (uaMatch) newUrl += "&ua=" + encodeURIComponent(uaMatch[1]);
      urlForThis = newUrl;
    }

    // B) 普通 m3u8 按需注入 UA（条目内或按域名）
    try {
      const u = new URL(urlForThis);
      const needUAByHost = UA_MAP[u.host.toLowerCase()];
      const uaAttr = (header.match(/http-user-agent="([^"]+)"/i) || [])[1];
      const uaFinal = uaAttr || needUAByHost;
      if (USE_WORKER_GATEWAY && uaFinal) {
        urlForThis = GW_BASE + encodeURIComponent(urlForThis) + "&ua=" + encodeURIComponent(uaFinal);
      }
    } catch {}

    // 1) 选 logo（自家域优先） + 200 校验（仅自家域）
    const logoCandidates = [tvgName, dispName, tvgId];
    let logoUrl = pickLogoUrl(iconMap, logoCandidates);
    if (logoUrl && (!tvgLogo || shouldOverrideLogo(tvgLogo, logoUrl))) {
      const v = addCacheBuster(logoUrl);
      const ok = await probe200Icon(v);
      if (!ok) {
        logoUrl = FALLBACK_LOGO ? addCacheBuster(FALLBACK_LOGO) : "";
      } else {
        logoUrl = v;
      }
      if (logoUrl){
        header = header.match(/tvg-logo="/i)
          ? header.replace(/tvg-logo="[^"]*"/i, `tvg-logo="${logoUrl}"`)
          : header + ` tvg-logo="${logoUrl}"`;
      }
    }

    // 2) 分组（三保险）
    let targetGroup = classifyChannel({ tvgId, tvgName, dispName, url: urlForThis });
    if (!GROUP_WHITELIST.includes(targetGroup)) targetGroup = DEFAULT_GROUP;
    header = stripVendorGroups(header);
    if (FORCE_RENAME_GROUP) {
      header = header.match(/group-title="/i)
        ? header.replace(/group-title="[^"]*"/i, `group-title="${targetGroup}"`)
        : header + ` group-title="${targetGroup}"`;
    } else {
      if (!header.match(/group-title="/i)) header += ` group-title="${targetGroup}"`;
    }
    if (EMIT_TVG_GROUP) {
      header = header.match(/tvg-group="/i)
        ? header.replace(/tvg-group="[^"]*"/i, `tvg-group="${targetGroup}"`)
        : header + ` tvg-group="${targetGroup}"`;
    }

    // 3) 流可用性：验证通过才写入；失败整段丢弃
    let playable = "";
    if (urlForThis) playable = await pickPlayableUrl(urlForThis);

    if (playable) {
      keptChannels++;
      out.push(commaIdx>=0 ? (header + "," + dispName) : header);
      if (EMIT_EXTGRP) out.push(`#EXTGRP:${targetGroup}`);
      out.push(playable);
      if (i+1<lines.length && !lines[i+1].startsWith("#")) i++; // 跳过原 URL
    } else {
      filteredChannels++;
      if (i+1<lines.length && !lines[i+1].startsWith("#")) i++; // 跳过原 URL
      // 整段丢弃（不 push）
    }
  }
  return out.join("\n");
}

// =============== 合并/去重/裁剪/标记 ===============
function stripM3UHeaderOnce(text){
  const lines = text.split(/\r?\n/);
  const kept = lines.filter(ln => !ln.trim().toUpperCase().startsWith("#EXTM3U"));
  return ["#EXTM3U", ...kept].join("\n");
}
function dedupeM3U(mergedText){
  const lines = mergedText.split(/\r?\n/);
  const out = []; const seen = new Set();
  for (let i=0;i<lines.length;i++){
    const line = lines[i];
    if (!line.startsWith("#EXTINF")) { out.push(line); continue; }
    const url = (i+1<lines.length && !lines[i+1].startsWith("#")) ? lines[i+1].trim() : "";
    const dispName = line.split(",").slice(1).join(",").trim();
    const key = `${(dispName||"").toLowerCase()}||${(url||"").toLowerCase()}`;
    if (seen.has(key)) { if (url) i++; continue; }
    seen.add(key); out.push(line); if (url) { out.push(url); i++; }
  }
  return out.join("\n");
}
function clipByTotalLimit(text, maxPairs){
  const lines = text.split(/\r?\n/);
  const out = []; let pairs = 0;
  for (let i=0;i<lines.length;i++){
    const ln = lines[i];
    if (ln.startsWith("#EXTINF")){
      if (pairs >= maxPairs) break;
      out.push(ln);
      if (i+1<lines.length && !lines[i+1].startsWith("#")) { out.push(lines[i+1]); i++; }
      pairs++;
    } else if (ln.startsWith("#")) { out.push(ln); }
  }
  return out.join("\n");
}
function stampM3U(m3uText){
  const lines = m3uText.split(/\r?\n/);
  const statsLine = `# Stats: total=${totalChannels}, kept=${keptChannels}, filtered=${filteredChannels}`;
  if (lines.length === 0) return m3uText;
  if (lines[0].startsWith("#EXTM3U")) {
    const stamp = `# Generated-At: ${BUILD_ISO} (epoch=${BUILD_VER})`;
    if (lines[1]?.startsWith("# Generated-At:")) lines[1] = stamp; else lines.splice(1,0,stamp);
    const tag = `# Build-Tag: v${BUILD_VER}`;
    if (lines[2]?.startsWith("# Build-Tag:")) lines[2] = tag; else lines.splice(2,0,tag);
    if (lines[3]?.startsWith("# Stats:")) lines[3] = statsLine; else lines.splice(3,0,statsLine);
    return lines.join("\n");
  }
  return `#EXTM3U\n# Generated-At: ${BUILD_ISO} (epoch=${BUILD_VER})\n# Build-Tag: v${BUILD_VER}\n${statsLine}\n${m3uText}`;
}

// =============== GitHub 上传 ===============
function ghHeaders(token){
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "M3U-AutoUploader/1.4",
    "Content-Type": "application/json"
  };
}
async function getRemoteFile(repo, path, branch, token){
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
  const { r, d } = await httpGet(url, ghHeaders(token));
  if (!r || r.status === 404) return { exists:false };
  if (r.status >= 400) throw new Error(`GET remote ${r.status}: ${d}`);
  let j={}; try{ j=JSON.parse(d||"{}"); }catch{}
  const b64=(j.content||"").replace(/\n/g,"");
  let decoded=""; try{ decoded = b64 ? Buffer.from(b64,"base64").toString("utf8") : ""; } catch {}
  return { exists:true, sha:(j.sha||null), text:decoded, size:j.size||0, path:j.path||path };
}
async function uploadToGitHub(text){
  if (!TOKEN){ console.log("⚠️ Token 缺失"); return {ok:false,msg:"NO TOKEN"}; }
  const viewUrl=`https://github.com/${REPO}/blob/${BRANCH}/${PATH}`;
  const rawUrl =`https://raw.githubusercontent.com/${REPO.split('/')[0]}/${REPO.split('/')[1]}/${BRANCH}/${PATH}?v=${BUILD_VER}`;
  const api    =`https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(PATH)}`;

  let remote={exists:false}; try{ remote=await getRemoteFile(REPO,PATH,BRANCH,TOKEN);}catch(e){ console.log("⚠️ 读远端失败：",String(e)); }
  if (remote.exists && remote.text === text){
    console.log("🟡 NO CHANGE"); console.log("  view:", viewUrl); console.log("  raw :", rawUrl);
    return { ok:true, msg:`NO CHANGE -> ${viewUrl}\nRAW -> ${rawUrl}` };
  }

  const body={ message:`Auto update M3U @ ${BUILD_ISO} (v${BUILD_VER}) - probe&filter`, content:b64encode(text), branch:BRANCH };
  if (remote.exists && remote.sha) body.sha = remote.sha;

  const { r, d } = await httpPut(api, body, ghHeaders(TOKEN));
  if (r && r.status>=200 && r.status<300){
    let p={}; try{ p=JSON.parse(d||"{}"); }catch{}
    const sha=p?.commit?.sha||""; const curl= sha? `https://github.com/${REPO}/commit/${sha}` : "";
    console.log("✅ GitHub 更新完成"); if (curl) console.log("  commit:", curl);
    console.log("  view  :", viewUrl); console.log("  raw   :", rawUrl);
    return { ok:true, msg:`OK Uploaded -> ${viewUrl}\nRAW -> ${rawUrl}` };
  }else{
    console.log("❌ GitHub 上传失败：", r?.status, d);
    return { ok:false, msg:`FAIL ${r?.status||0}` };
  }
}

// =============== 主流程 ===============
(async function main(){
  try{
    // 1) 拉取 icons 与各源（带超时）
    const tasks = [
      httpGet(ICONS_JSON_URL, {}, FETCH_TIMEOUT_MS),
      ...M3U_URLS.map(({url, ua}) => httpGet(url, ua ? {"User-Agent": ua} : {}, FETCH_TIMEOUT_MS))
    ];
    const [iconsRes, ...m3uResArr] = await Promise.all(tasks);

    if (!(iconsRes?.r?.status>=200 && iconsRes?.r?.status<300 && iconsRes.d)){
      return finish("ICON FAIL");
    }
    const validM3Us = m3uResArr.filter(res => res?.r?.status>=200 && res?.r?.status<300 && res.d).map(res => res.d);
    if (!validM3Us.length) return finish("ALL M3U FAIL");

    // 2) 图标表
    let iconsJson={}; try { iconsJson = JSON.parse(iconsRes.d); } catch { return finish("ICON PARSE FAIL"); }
    const iconMap = buildIconMap(iconsJson);

    // 3) 注入 + 过滤
    const injectedList = [];
    for (const m3uText of validM3Us){
      const injected = await injectLogoForM3U(m3uText, iconMap);
      injectedList.push(injected);
    }
    let mergedCore = injectedList.join("\n");

    // 4) 只保留一个 #EXTM3U 头；总量裁剪；去重
    mergedCore = stripM3UHeaderOnce(mergedCore);
    mergedCore = clipByTotalLimit(mergedCore, MAX_CHANNELS_TOTAL);
    mergedCore = dedupeM3U(mergedCore);

    // 5) 标记 + 统计
    const merged = stampM3U(mergedCore);
    store.write(merged, PERSIST_KEY);
    console.log(`📊 Stats: total=${totalChannels}, kept=${keptChannels}, filtered=${filteredChannels}`);

    // 6) 上传
    if (UPLOAD_NOW){
      const up = await uploadToGitHub(merged);
      return finish(up.msg);
    } else {
      return finish(`OK MERGED ONLY (v${BUILD_VER})`);
    }
  }catch(e){
    console.log("❌ 异常：", e && e.stack || String(e));
    return finish("ERR " + (e?.message || e));
  }
})();

function finish(msg){
  if (IS_NODE) { console.log(msg); process.exit(0); }
  else { $done?.({ body: msg }); }
}
