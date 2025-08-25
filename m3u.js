// ===== 环境检测 =====
const IS_NODE   = (typeof process !== "undefined") && (process.release?.name === "node");
const IS_SURGE  = (typeof $httpClient !== "undefined");
const IS_QUANX  = (typeof $task !== "undefined");
const IS_LOON   = (typeof $loon !== "undefined");

// ===== Node.js 依赖 =====
let fetch, fs;
if (IS_NODE) {
  fetch = (...args) => import("node-fetch").then(({default: f}) => f(...args));
  fs = require("fs");
}

// ===== HTTP GET 封装 =====
function httpGet(url, headers = {}) {
  if (IS_NODE) {
    return fetch(url, { headers })
      .then(r => r.text().then(d => ({ r, d })))
      .catch(() => ({ r: { status: 0 }, d: "" }));
  }
  if (IS_SURGE || IS_LOON) {
    return new Promise(resolve => {
      $httpClient.get({ url, headers }, (e, r, d) => {
        if (e) resolve({ r: { status: 0 }, d: "" });
        else resolve({ r, d });
      });
    });
  }
  return Promise.resolve({ r: { status: 0 }, d: "" });
}

// ===== HTTP PUT 封装 =====
function httpPut(url, body, headers = {}) {
  if (IS_NODE) {
    return fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(body)
    }).then(r => r.text().then(d => ({ r, d })));
  }
  if (IS_SURGE || IS_LOON) {
    return new Promise(resolve => {
      $httpClient.put({ url, headers, body: JSON.stringify(body) }, (e, r, d) => {
        if (e) resolve({ r: { status: 0 }, d: "" });
        else resolve({ r, d });
      });
    });
  }
  return Promise.resolve({ r: { status: 0 }, d: "" });
}

// ===== 存储封装 =====
const store = {
  read(key) {
    if (IS_NODE) {
      try { return fs.readFileSync(`./${key}.txt`, "utf8"); }
      catch { return ""; }
    }
    return $persistentStore.read(key);
  },
  write(val, key) {
    if (IS_NODE) {
      fs.writeFileSync(`./${key}.txt`, val, "utf8");
      return true;
    }
    return $persistentStore.write(val, key);
  }
};

// ===== Base64 封装 =====
function b64encode(text) {
  if (IS_NODE) return Buffer.from(text, "utf8").toString("base64");
  if (typeof $base64 !== "undefined" && $base64.encode) return $base64.encode(text);
  return "";
}

// ===== GitHub Token =====
const INLINE_TOKEN = "";
const TOKEN = (IS_NODE ? process.env.GH_TOKEN : $persistentStore.read("GH_TOKEN")) || INLINE_TOKEN;

// ===== 构建信息 =====
const BUILD_EPOCH = Date.now();
const BUILD_ISO   = new Date(BUILD_EPOCH).toISOString();
const BUILD_VER   = String(BUILD_EPOCH);

const USE_WORKER_GATEWAY = true;
const GW_BASE = "https://m3u-converter.mikephiemy.workers.dev/?u=";

// ===== 数据源 =====
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

// ===== 分组白名单 =====
const GROUP_WHITELIST    = ["sport", "movie", "cctv", "mediacorp", "hongkong", "taiwan"];
const DEFAULT_GROUP      = "mix";
const FORCE_RENAME_GROUP = true;
const EMIT_TVG_GROUP     = true;
const EMIT_EXTGRP        = true;

// ===== 图标策略 =====
const ICON_HOST_WHITELIST = ["img.mikephie.site"];
const FORCE_REPLACE_ALL   = true;
const FALLBACK_LOGO       = "https://img.mikephie.site/not-found.png";

// ===== 统计变量 =====
let totalChannels = 0;
let filteredChannels = 0;
let keptChannels = 0;

// ===== 工具函数（省略未变动部分，如 buildIconMap, classifyChannel 等） =====
// …… 这里保持和之前版本一致，包括 pickLogoUrl, classifyChannel, dedupeM3U ……

// ===== Stream 有效性探测 =====
async function probeStream(url){
  if (!url) return false;
  if (!IS_NODE) return true; // 本地环境直接跳过探测
  try{
    const { r } = await httpGet(url, { "Range": "bytes=0-0" });
    if (!r) return false;
    return [200, 206, 301, 302].includes(r.status);
  }catch{ return false; }
}

// ===== pickPlayableUrl =====
async function pickPlayableUrl(url){
  if (!url) return "";
  if (!IS_NODE) return url; // 本地直接返回
  return (await probeStream(url)) ? url : "";
}

// ===== injectLogoForM3U （内置统计）=====
async function injectLogoForM3U(m3uText, iconMap){
  const lines = m3uText.split(/\r?\n/);
  const out = [];

  for (let i=0;i<lines.length;i++){
    const rawLine = lines[i];
    if (!rawLine.startsWith("#EXTINF")) { out.push(rawLine); continue; }

    totalChannels++;

    const commaIdx = rawLine.indexOf(",");
    let header     = commaIdx>=0 ? rawLine.slice(0,commaIdx) : rawLine;
    const dispName = commaIdx>=0 ? rawLine.slice(commaIdx+1).trim() : "";

    const getAttr  = k => (header.match(new RegExp(`${k}="([^"]*)"`, "i")) || [])[1] || "";
    const tvgId    = getAttr("tvg-id");
    const tvgName  = getAttr("tvg-name");

    // 读取 URL
    let urlForThis = lines[i+1] && !lines[i+1].startsWith("#") ? lines[i+1].trim() : "";

    // 网关处理
    if (USE_WORKER_GATEWAY && /\.php/i.test(urlForThis)) {
      urlForThis = GW_BASE + encodeURIComponent(urlForThis);
    }

    // 验证流
    let playable = "";
    if (urlForThis) playable = await pickPlayableUrl(urlForThis);

    if (playable) {
      keptChannels++;
      out.push(header + "," + dispName);
      if (EMIT_EXTGRP) out.push(`#EXTGRP:${DEFAULT_GROUP}`);
      out.push(playable);
      if (i+1<lines.length && !lines[i+1].startsWith("#")) i++;
    } else {
      filteredChannels++;
      if (i+1<lines.length && !lines[i+1].startsWith("#")) i++;
    }
  }
  return out.join("\n");
}

// ===== stampM3U（加统计行）=====
function stampM3U(m3uText){
  const lines = m3uText.split(/\r?\n/);
  const statsLine = `# Stats: total=${totalChannels}, kept=${keptChannels}, filtered=${filteredChannels}`;
  if (lines.length === 0) return m3uText;

  if (lines[0].startsWith("#EXTM3U")) {
    const stamp = `# Generated-At: ${BUILD_ISO} (epoch=${BUILD_VER})`;
    if (lines[1] && lines[1].startsWith("# Generated-At:")) lines[1] = stamp;
    else lines.splice(1, 0, stamp);

    const tag = `# Build-Tag: v${BUILD_VER}`;
    if (!lines[2] || !lines[2].startsWith("# Build-Tag:")) lines.splice(2, 0, tag);
    else lines[2] = tag;

    if (!lines[3] || !lines[3].startsWith("# Stats:")) lines.splice(3, 0, statsLine);
    else lines[3] = statsLine;

    return lines.join("\n");
  }
  return `# Generated-At: ${BUILD_ISO} (epoch=${BUILD_VER})\n# Build-Tag: v${BUILD_VER}\n${statsLine}\n${m3uText}`;
}

// ===== GitHub 上传 =====
function ghHeaders(token){
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "M3U-AutoUploader/1.3",
    "Content-Type": "application/json"
  };
}
async function uploadToGitHub(text){
  if (!TOKEN){ console.log("⚠️ Token 缺失"); return {ok:false,msg:"NO TOKEN"}; }
  const rawBase=`https://raw.githubusercontent.com/${REPO.split('/')[0]}/${REPO.split('/')[1]}/${BRANCH}/${PATH}`;
  const rawUrl =`${rawBase}?v=${BUILD_VER}`;
  const api    =`https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(PATH)}`;

  const body={ message:`Auto update M3U @ ${BUILD_ISO} (v${BUILD_VER})`, content:b64encode(text), branch:BRANCH };

  const { r, d } = await httpPut(api, body, ghHeaders(TOKEN));
  if (r.status>=200 && r.status<300){
    console.log("✅ GitHub 更新完成 ->", rawUrl);
    return { ok:true, msg:`OK Uploaded -> ${rawUrl}` };
  }else{
    console.log("❌ GitHub 上传失败：", r.status, d);
    return { ok:false, msg:`FAIL ${r.status}` };
  }
}

// ===== 主流程 =====
(async function main(){
  try{
    const tasks = [
      httpGet(ICONS_JSON_URL),
      ...M3U_URLS.map(({url, ua}) => httpGet(url, ua ? {"User-Agent": ua} : {}))
    ];
    const [iconsRes, ...m3uResArr] = await Promise.all(tasks);

    const validM3Us = m3uResArr.filter(res => res?.r?.status>=200 && res?.r?.status<300 && res.d).map(res => res.d);
    if (!validM3Us.length) return finish("ALL M3U FAIL");

    const injectedList = [];
    for (const m3uText of validM3Us){
      const injected = await injectLogoForM3U(m3uText, {});
      injectedList.push(injected);
    }
    let mergedCore = injectedList.join("\n");
    mergedCore = mergedCore.replace(/#EXTM3U/g, ""); // 去多余头
    const merged = stampM3U(mergedCore);

    store.write(merged, PERSIST_KEY);

    console.log(`📊 Stats: total=${totalChannels}, kept=${keptChannels}, filtered=${filteredChannels}`);

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
  else { $done({ body: msg }); }
}
