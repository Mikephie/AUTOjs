/**
 * m3u.js (TEST LIMIT = 10)
 * - Node.js/GitHub Actions & Surge/Loon/QuanX 双环境
 * - 过滤模式由 env M3U_FILTER 控制：strict/loose/off（测试用 off）
 * - 热修复：
 *   A) 探测失败也写回原始 URL（必出链接）
 *   B) 只保留 #EXTM3U 头，丢弃源里其他杂项行（避免干扰）
 * - 超时保护、分组、图标注入（仅自家域 200 校验）、统计
 * - GitHub PUT 上传（含 sha）
 */

/* ========== 环境/依赖 ========== */
const IS_NODE  = typeof process !== "undefined" && process.release?.name === "node";
const IS_SURGE = typeof $httpClient !== "undefined";
let nodeFetch = null;
if (IS_NODE && typeof fetch === "undefined") {
  nodeFetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
}

/* ========== 测试与过滤开关 ========== */
const TEST_LIMIT   = 10;                                      // ★ 只输出 10 条
const FILTER_MODE  = (IS_NODE ? (process.env.M3U_FILTER || "loose") : "off").toLowerCase();

/* ========== 超时/上限/策略 ========== */
const FETCH_TIMEOUT_MS        = 5000;
const STREAM_PROBE_TIMEOUT_MS = 2000;
const ICON_PROBE_TIMEOUT_MS   = 1200;
const MAX_CHANNELS_PER_SOURCE = 1000;
const MAX_CHANNELS_TOTAL      = 2000;
const ACCEPT_206_PARTIAL      = true;
const ACCEPT_REDIRECT_AS_OK   = true;
const SKIP_PROBE_FOR_GATEWAY  = true;

/* ========== 构建/数据源/上传配置 ========== */
const BUILD_EPOCH = Date.now();
const BUILD_ISO   = new Date(BUILD_EPOCH).toISOString();
const BUILD_VER   = String(BUILD_EPOCH);

const USE_WORKER_GATEWAY = true;
const GW_BASE = "https://m3u-converter.mikephiemy.workers.dev/?u=";

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

/* ========== 分组/图标策略 ========== */
const GROUP_WHITELIST = ["sport", "movie", "cctv", "mediacorp", "hongkong", "taiwan"];
const DEFAULT_GROUP   = "mix";
const FORCE_RENAME_GROUP = true;
const EMIT_TVG_GROUP  = true;
const EMIT_EXTGRP     = true;

const ICON_HOST_WHITELIST = ["img.mikephie.site"];
const FORCE_REPLACE_ALL   = true;
const FALLBACK_LOGO       = "https://img.mikephie.site/not-found.png";

/* ========== 统计 ========== */
let totalChannels = 0, keptChannels = 0, filteredChannels = 0;

/* ========== HTTP (带超时) ========== */
async function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  if (!IS_NODE) {
    return new Promise((resolve) => {
      $httpClient.get({ url, headers: options.headers || {} }, (e, r, d) => {
        if (e) resolve({ r: { status: 0 }, d: "" });
        else resolve({ r, d });
      });
    });
  }
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
function httpGet(url, headers = {}, timeoutMs = FETCH_TIMEOUT_MS) { return fetchWithTimeout(url, { headers }, timeoutMs); }
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

/* ========== 工具/图标辅助 ========== */
const isZh = s => /[\u4e00-\u9fa5]/.test(s||"");
function englishKey(s){ s=(s||"").trim(); if(!s||isZh(s))return""; s=s.replace(/\([^)]*\)/g," ").replace(/\b(HD|FHD|UHD|4K)\b/ig," ").replace(/[\s\-_\.]+/g,""); return s.toUpperCase(); }
function chineseKey(s){ s=(s||"").trim(); if(!isZh(s))return""; return s.replace(/[（(].*?[)）]/g,"").trim(); }
const ZH_MAP=[["鳳凰","凤凰"],["衛視","卫视"],["資訊","资讯"],["無線","无线"],["綜合","综合"],["娛樂","娱乐"],["頻道","频道"],["電影","电影"],["臺","台"],["東森","东森"],["華視","华视"],["公視","公视"],["龍華","龙华"]];
function addZhVariants(set, base){ set.add(base); set.add(base.replace(/[（(].*?[)）]/g,"")); for(let n=0;n<2;n++) for(const [trad,simp] of ZH_MAP) for(const v of Array.from(set)){ set.add(v.replace(new RegExp(trad,"g"),simp)); set.add(v.replace(new RegExp(simp,"g"),trad)); } return set; }
function getHost(u){ try { return new URL(u).host.toLowerCase(); } catch { return ""; } }
function getHostPath(u){ try { const x=new URL(u); return {host:x.host||"", path:x.pathname||""}; } catch { return {host:"", path:""}; } }
function addCacheBuster(u, ver=BUILD_VER){ try{ const url=new URL(u); if(!ICON_HOST_WHITELIST.includes(url.host.toLowerCase())) return u; const has=[...url.searchParams.keys()].some(k=>k.toLowerCase()==="v"); has?url.searchParams.set("v",ver):url.searchParams.append("v",ver); return url.toString(); }catch{ return u; } }
function buildIconMap(json){
  const list = Array.isArray(json?.icons) ? json.icons : (Array.isArray(json) ? json : []);
  const map = new Map();
  for (const it of list){
    const name=(it?.name||"").trim(); const url=(it?.url||"").trim();
    if (!name || !url) continue;
    const baseFull = name.replace(/\.(png|jpg|jpeg|webp|gif|svg)$/i, "");
    const base = baseFull.split("/").pop();
    const keys = new Set();
    if (base){ keys.add(base); keys.add(base.toUpperCase()); const en=englishKey(base); if(en)keys.add(en); if(isZh(base)) addZhVariants(keys, base); }
    if (baseFull) keys.add(baseFull);
    for (const k of keys) map.set(k, url);
  }
  return map;
}
function pickLogoUrl(iconMap, candidates){
  for (const raw of candidates){
    const s=(raw||"").trim(); if(!s) continue;
    if (iconMap.has(s)) return iconMap.get(s);
    const up=s.toUpperCase(); if (iconMap.has(up)) return iconMap.get(up);
    const en=englishKey(s); if (en&&iconMap.has(en)) return iconMap.get(en);
    const zh=chineseKey(s); if (zh&&iconMap.has(zh)) return iconMap.get(zh);
  }
  return null;
}
function fileLower(u){ try { return decodeURIComponent(u).toLowerCase(); } catch { return (u||"").toLowerCase(); } }
function shouldOverrideLogo(cur, nxt){
  if (!cur) return true;
  if (FORCE_REPLACE_ALL) return true;
  const curf=fileLower(cur); if (!curf || /not[-_]?found\.png$/.test(curf)) return true;
  const curMine=ICON_HOST_WHITELIST.includes(getHost(cur));
  const nxtMine=ICON_HOST_WHITELIST.includes(getHost(nxt));
  if (nxtMine && !curMine) return true;
  return false;
}

/* ========== 探测（含过滤模式） ========== */
async function probe200Icon(url){
  try{
    const host=getHost(url);
    if (!ICON_HOST_WHITELIST.includes(host)) return true;
    const { r } = await httpGet(url, { "Range":"bytes=0-0" }, ICON_PROBE_TIMEOUT_MS);
    if (!r) return false;
    return r.status === 200 || (ACCEPT_206_PARTIAL && r.status === 206);
  }catch{ return false; }
}
function encodePathKeepSlash(p){ return p.split("/").map(s => encodeURIComponent(s)).join("/"); }
function toEncodedOnce(chineseUrl){ try{ const u=new URL(chineseUrl); u.pathname=encodePathKeepSlash(u.pathname); return u.toString(); } catch{ return chineseUrl; } }

async function probeStream(url){
  if (!url) return false;
  if (!IS_NODE || FILTER_MODE === "off") return true;
  let res = await httpGet(url, { "Range":"bytes=0-0" }, STREAM_PROBE_TIMEOUT_MS);
  if (res?.r && ([200,206,301,302].includes(res.r.status))) return true;
  if (FILTER_MODE === "loose") {
    res = await httpGet(url, {}, Math.min(STREAM_PROBE_TIMEOUT_MS, 1500));
    if (res?.r && ([200,301,302].includes(res.r.status))) return true;
  }
  return false;
}
async function pickPlayableUrl(rawUrl){
  if (!rawUrl) return "";
  if (!IS_NODE || FILTER_MODE === "off") return rawUrl;
  if (await probeStream(rawUrl)) return rawUrl;
  const encoded = toEncodedOnce(rawUrl);
  if (encoded !== rawUrl && await probeStream(encoded)) return encoded;
  return "";
}

/* ========== 分组规则 ========== */
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

/* ========== 注入（含两处热修复 & TEST_LIMIT） ========== */
function findNextUrl(lines, i){
  let j=i+1; while (j<lines.length && (lines[j].startsWith("#") || !lines[j].trim())) j++;
  return (j<lines.length && !lines[j].startsWith("#")) ? lines[j].trim() : "";
}

async function injectLogoForM3U(m3uText, iconMap){
  const lines = m3uText.split(/\r?\\n/);
  const out = [];
  let processed = 0, keptThisSource = 0;

  for (let i=0;i<lines.length;i++){
    if (processed >= MAX_CHANNELS_PER_SOURCE) { console.log("⏩ reach MAX_CHANNELS_PER_SOURCE"); break; }
    if (TEST_LIMIT > 0 && keptThisSource >= TEST_LIMIT) { console.log(`⏩ reach TEST_LIMIT=${TEST_LIMIT}`); break; }

    const rawLine = lines[i];

    // 热修复 B：非 #EXTINF 行一律丢弃，仅保留 #EXTM3U（避免把源里的 #EXTGRP/注释带进来）
    if (!rawLine.startsWith("#EXTINF")) {
      if (rawLine.trim().toUpperCase().startsWith("#EXTM3U") && out.length === 0) out.push("#EXTM3U");
      continue;
    }

    processed++; totalChannels++;

    const commaIdx = rawLine.indexOf(",");
    let header     = commaIdx>=0 ? rawLine.slice(0,commaIdx) : rawLine;
    const dispName = commaIdx>=0 ? rawLine.slice(commaIdx+1).trim() : "";
    const getAttr  = k => (header.match(new RegExp(`${k}="([^"]*)"`, "i")) || [])[1] || "";
    const tvgId    = getAttr("tvg-id");
    const tvgName  = getAttr("tvg-name");
    let   tvgLogo  = getAttr("tvg-logo");

    // 找原始 URL（下一行）
    let urlForThis = findNextUrl(lines, i);

    // live.php/id= → 网关 + 透传 UA
    if (USE_WORKER_GATEWAY && (/\blive\.php\b/i.test(urlForThis) || /\.php\?id=/i.test(urlForThis))) {
      let newUrl = GW_BASE + encodeURIComponent(urlForThis);
      const uaMatch = header.match(/http-user-agent="([^"]+)"/i);
      if (uaMatch) newUrl += "&ua=" + encodeURIComponent(uaMatch[1]);
      urlForThis = newUrl;
    }
    // 普通 m3u8 按域名/条目注入 UA（走网关）
    try {
      const u = new URL(urlForThis);
      const needUAByHost = UA_MAP[u.host.toLowerCase()];
      const uaAttr = (header.match(/http-user-agent="([^"]+)"/i) || [])[1];
      const uaFinal = uaAttr || needUAByHost;
      if (USE_WORKER_GATEWAY && uaFinal) {
        urlForThis = GW_BASE + encodeURIComponent(urlForThis) + "&ua=" + encodeURIComponent(uaFinal);
      }
    } catch {}

    // 选 logo（仅自家域做 200 校验）
    const logoCandidates = [tvgName, dispName, tvgId];
    let logoUrl = pickLogoUrl(iconMap, logoCandidates);
    if (logoUrl && (!tvgLogo || shouldOverrideLogo(tvgLogo, logoUrl))) {
      const v = addCacheBuster(logoUrl);
      const ok = await probe200Icon(v);
      logoUrl = ok ? v : (FALLBACK_LOGO ? addCacheBuster(FALLBACK_LOGO) : "");
      if (logoUrl){
        header = header.match(/tvg-logo="/i)
          ? header.replace(/tvg-logo="[^"]*"/i, `tvg-logo="${logoUrl}"`)
          : header + ` tvg-logo="${logoUrl}"`;
      }
    }

    // 分组与清洁
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

    // 可用性（测试模式关闭过滤时总为真）
    const playable = urlForThis ? await pickPlayableUrl(urlForThis) : "";

    if (playable) {
      keptChannels++; keptThisSource++;
      out.push(commaIdx>=0 ? (header + "," + dispName) : header);
      if (EMIT_EXTGRP) out.push(`#EXTGRP:${targetGroup}`);
      out.push(playable);
    } else {
      filteredChannels++;
      // 热修复 A：即便不可用也保留原始 URL（保证文件里有链接）
      out.push(commaIdx>=0 ? (header + "," + dispName) : header);
      if (EMIT_EXTGRP) out.push(`#EXTGRP:${targetGroup}`);
      if (urlForThis) out.push(urlForThis);
    }

    // 跳过原 URL 行（若存在）
    if (i+1<lines.length && !lines[i+1].startsWith("#")) i++;
  }
  return out.join("\n");
}

/* ========== 合并/去重/裁剪/标记 ========== */
function stripM3UHeaderOnce(text){
  const lines = text.split(/\r?\n/);
  const kept = lines.filter(ln => !ln.trim().toUpperCase().startsWith("#EXTM3U"));
  return ["#EXTM3U", ...kept].join("\n");
}
function dedupeM3U(mergedText){
  const lines = mergedText.split(/\r?\n/);
  const out=[], seen=new Set();
  for (let i=0;i<lines.length;i++){
    const line = lines[i];
    if (!line.startsWith("#EXTINF")) { if (line.startsWith("#")) out.push(line); continue; }
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
  const out=[]; let pairs=0;
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
  const stats = `# Stats: total=${totalChannels}, kept=${keptChannels}, filtered=${filteredChannels}`;
  const mode  = `# Mode: filter=${FILTER_MODE}, test_limit=${TEST_LIMIT}`;
  if (lines.length === 0) return m3uText;
  if (lines[0].startsWith("#EXTM3U")) {
    const stamp = `# Generated-At: ${BUILD_ISO} (epoch=${BUILD_VER})`;
    if (lines[1]?.startsWith("# Generated-At:")) lines[1] = stamp; else lines.splice(1,0,stamp);
    const tag = `# Build-Tag: v${BUILD_VER}`;
    if (lines[2]?.startsWith("# Build-Tag:")) lines[2] = tag; else lines.splice(2,0,tag);
    if (lines[3]?.startsWith("# Stats:")) lines[3] = stats; else lines.splice(3,0,stats);
    if (lines[4]?.startsWith("# Mode:"))  lines[4] = mode;  else lines.splice(4,0,mode);
    return lines.join("\n");
  }
  return `#EXTM3U\n# Generated-At: ${BUILD_ISO} (epoch=${BUILD_VER})\n# Build-Tag: v${BUILD_VER}\n${stats}\n${mode}\n${m3uText}`;
}

/* ========== GitHub 上传 ========== */
function ghHeaders(token){
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "M3U-AutoUploader/1.5",
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
function b64encode(text){ return Buffer.from(text, "utf8").toString("base64"); }
async function uploadToGitHub(text){
  if (!TOKEN){ console.log("⚠️ Token 缺失"); return {ok:false,msg:"NO TOKEN"}; }
  const viewUrl=`https://github.com/${REPO}/blob/${BRANCH}/${PATH}`;
  const rawUrl =`https://raw.githubusercontent.com/${REPO.split('/')[0]}/${REPO.split('/')[1]}/${BRANCH}/${PATH}?v=${BUILD_VER}`;
  const api    =`https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(PATH)}`;

  let remote={exists:false}; try{ remote=await getRemoteFile(REPO,PATH,BRANCH,TOKEN);}catch(e){ console.log("⚠️ 读远端失败：",String(e)); }
  if (remote.exists && remote.text === text){
    console.log("🟡 NO CHANGE"); console.log("view:", viewUrl); console.log("raw :", rawUrl);
    return { ok:true, msg:`NO CHANGE -> ${viewUrl}\nRAW -> ${rawUrl}` };
  }

  const body={ message:`Auto update M3U @ ${BUILD_ISO} (v${BUILD_VER}) - mode=${FILTER_MODE}, test=${TEST_LIMIT}`, content:b64encode(text), branch:BRANCH };
  if (remote.exists && remote.sha) body.sha = remote.sha;

  const { r, d } = await httpPut(api, body, ghHeaders(TOKEN));
  if (r && r.status>=200 && r.status<300){
    let p={}; try{ p=JSON.parse(d||"{}"); }catch{}
    const sha=p?.commit?.sha||""; const curl= sha? `https://github.com/${REPO}/commit/${sha}` : "";
    console.log("✅ GitHub 更新完成"); if (curl) console.log("commit:", curl);
    console.log("view:", viewUrl); console.log("raw :", rawUrl);
    return { ok:true, msg:`OK Uploaded -> ${viewUrl}\nRAW -> ${rawUrl}` };
  }else{
    console.log("❌ GitHub 上传失败：", r?.status, d);
    return { ok:false, msg:`FAIL ${r?.status||0}` };
  }
}

/* ========== 主流程 ========== */
(async function main(){
  try{
    const tasks = [
      httpGet(ICONS_JSON_URL, {}, FETCH_TIMEOUT_MS),
      ...M3U_URLS.map(({url, ua}) => httpGet(url, ua ? {"User-Agent": ua} : {}, FETCH_TIMEOUT_MS))
    ];
    const [iconsRes, ...m3uResArr] = await Promise.all(tasks);
    if (!(iconsRes?.r?.status>=200 && iconsRes?.r?.status<300 && iconsRes.d)) return finish("ICON FAIL");

    const validM3Us = m3uResArr.filter(res => res?.r?.status>=200 && res?.r?.status<300 && res.d).map(res => res.d);
    if (!validM3Us.length) return finish("ALL M3U FAIL");

    let iconsJson={}; try { iconsJson = JSON.parse(iconsRes.d); } catch { return finish("ICON PARSE FAIL"); }
    const iconMap = buildIconMap(iconsJson);

    const injectedList = [];
    for (const m3uText of validM3Us){
      const injected = await injectLogoForM3U(m3uText, iconMap);
      injectedList.push(injected);
    }

    let mergedCore = injectedList.join("\n");
    mergedCore = stripM3UHeaderOnce(mergedCore);
    mergedCore = clipByTotalLimit(mergedCore, MAX_CHANNELS_TOTAL);
    mergedCore = dedupeM3U(mergedCore);

    const merged = stampM3U(mergedCore);
    console.log(`📊 Stats: total=${totalChannels}, kept=${keptChannels}, filtered=${filteredChannels}`);
    console.log(`🔧 Mode: filter=${FILTER_MODE}, test_limit=${TEST_LIMIT}`);

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
function finish(msg){ if (IS_NODE) { console.log(msg); process.exit(0); } else { $done?.({ body: msg }); } }
