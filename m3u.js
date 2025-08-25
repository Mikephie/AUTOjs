/**
 * m3u.js — 生成可播放 M3U，按“频道显示名”匹配图标并上传到 GitHub
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

// 手动别名（频道显示名 -> 图标名，无扩展名）
const NAME_ALIAS = {
  "明珠台": "ch2",
};

/* ===== 上传配置 ===== */
const UPLOAD_NOW    = true;
const REPO          = "Mikephie/AUTOjs";
const BRANCH        = "main";
const PATH_IN_REPO  = "LiveTV/AKTV.m3u";

/* ===== 限额 / 策略 ===== */
const FILTER_MODE              = "strict";  // strict / loose / off
const TEST_TOTAL_LIMIT         = 100;       // 输出上限
const HARD_TARGET              = 100;       // 早停门槛
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

/* ===== icons.json 载入 ===== */
function normName(s){
  return (s||"")
    .normalize("NFKC")
    .replace(/（.*?）|\(.*?\)/g, "")
    .toLowerCase()
    .replace(/\.(png|jpg|jpeg|webp|gif|svg)$/i,"")
    .replace(/[\s\/\-\_]+/g,"")
    .replace(/[^\w\u4e00-\u9fa5]/g,"")
    .replace(/(fhd|uhd|hd|sd|4k)$/,"");
}
async function loadIcons(){
  try{
    const { d } = await httpGet(ICONS_JSON_URL, {}, 8000);
    if (!d) { console.log("# icons loaded = 0"); return new Map(); }
    let parsed = JSON.parse(d);
    const arr = Array.isArray(parsed?.icons) ? parsed.icons : (Array.isArray(parsed) ? parsed : []);
    const map = new Map();
    for (const it of arr){
      const name=(it?.name||"").trim();
      const url =(it?.url ||"").trim();
      if (!name || !url) continue;
      map.set(normName(name), url);
    }
    console.log(`# icons loaded = ${map.size}`);
    return map;
  }catch(e){
    console.log("⚠️ icons.json 加载失败：", String(e));
    return new Map();
  }
}

/* ===== 图标匹配 ===== */
async function probeIcon(url, timeoutMs = 1500){
  try{
    const { r } = await httpGet(url, {}, timeoutMs);
    return !!(r && [200,301,302].includes(r.status));
  }catch{return false;}
}
function makeNameCandidates(raw){
  const s0 = (raw||"").trim();
  if (!s0) return [];
  const noParen = s0.replace(/（.*?）|\(.*?\)/g, "");
  const noSpace = noParen.replace(/\s+/g, "");
  const cuts = new Set([
    noParen,
    noSpace,
    noSpace.replace(/(台|频道|頻道)$/,""),
    noSpace.replace(/(HD|FHD|UHD|SD|4K)$/i,""),
  ]);
  const ascii = noParen.toLowerCase().replace(/[\s\/\-\_]+/g,"").replace(/(hd|fhd|uhd|sd|4k)$/,"");
  cuts.add(ascii);
  return Array.from(cuts).filter(Boolean);
}
async function pickIconByDisplayName(iconMap, dispName){
  const raw = (dispName||"").trim();
  if (!raw) return NOT_FOUND_ICON;

  if (NAME_ALIAS[raw]) {
    const alias = NAME_ALIAS[raw];
    const aliasKey = normName(alias);
    if (iconMap.has(aliasKey)) return iconMap.get(aliasKey);
    const url = `${ICON_BASE}/${alias}.png`;
    if (await probeIcon(url)) return url;
    return NOT_FOUND_ICON;
  }

  const k0 = normName(raw);
  const iconsJsonCandidates = new Set([
    k0,
    k0.replace(/channel(\d+)$/,"channel$1"),
    k0.replace(/lovenature.*$/,"lovenature"),
    k0.replace(/tvn.*$/,"tvn"),
    k0.replace(/plus$/,"plus"),
    k0.replace(/action$/,"action"),
  ]);
  for (const k of iconsJsonCandidates){
    if (k && iconMap.has(k)) return iconMap.get(k);
  }

  for (const base of makeNameCandidates(raw)){
    const url = `${ICON_BASE}/${base}.png`;
    if (await probeIcon(url)) return url;
  }

  return NOT_FOUND_ICON;
}

/* ===== 工具函数（略去注释，和之前相同） ===== */
function findNextUrl(lines, i){ let j=i+1; while(j<lines.length&& !lines[j].trim()) j++; if(j<lines.length&& !lines[j].startsWith("#")) return lines[j].trim(); j=i+1; while(j<lines.length&&(lines[j].startsWith("#")||!lines[j].trim())) j++; return (j<lines.length&& !lines[j].startsWith("#"))?lines[j].trim():""; }
function getAttr(header, key){ return (header.match(new RegExp(`${key}="([^"]*)"`, "i")) || [])[1] || ""; }
function setOrReplaceAttr(header, key, value){ if(!value) return header; return header.match(new RegExp(`${key}="`, "i")) ? header.replace(new RegExp(`${key}="[^"]*"`, "i"), `${key}="${value}"`) : `${header} ${key}="${value}"`; }
function stripM3UHeaderOnce(text){ const lines=text.split(/\r?\n/); const kept=lines.filter(ln=>!ln.trim().toUpperCase().startsWith("#EXTM3U")); return ["#EXTM3U",...kept].join("\n"); }
function dedupeM3U(m3u){ const lines=m3u.split(/\r?\n/); const out=[], seen=new Set(); for(let i=0;i<lines.length;i++){ const line=lines[i]; if(!line.startsWith("#EXTINF")){ if(line.startsWith("#")) out.push(line); continue;} const meta=[]; let j=i+1; while(j<lines.length&&(lines[j].startsWith("#")||!lines[j].trim())){ meta.push(lines[j]); j++; } const url=(j<lines.length&&!lines[j].startsWith("#"))?lines[j].trim():""; const dispName=line.split(",").slice(1).join(",").trim(); const key=`${dispName.toLowerCase()}||${(url||"").toLowerCase()}`; if(seen.has(key)){ if(url) i=j; continue;} seen.add(key); out.push(line); for(const m of meta) out.push(m); if(url){ out.push(url); i=j;} } return out.join("\n"); }
function clipByPairCount(text,maxPairs){ if(!maxPairs||maxPairs<=0) return text; const lines=text.split(/\r?\n/); const out=[]; let pairs=0; for(let i=0;i<lines.length;i++){ const ln=lines[i]; if(!ln.startsWith("#EXTINF")){ if(ln.startsWith("#")) out.push(ln); continue;} if(pairs>=maxPairs) break; const meta=[]; let j=i+1; while(j<lines.length&&(lines[j].startsWith("#")||!lines[j].trim())){ meta.push(lines[j]); j++; } const url=(j<lines.length&&!lines[j].startsWith("#"))?lines[j].trim():""; out.push(ln); for(const m of meta) out.push(m); if(url){ out.push(url); i=j;} pairs++; } return out.join("\n"); }

/* ===== 探测 ===== */
async function quickProbe(url, mode="strict"){ if(!url) return false; if(mode==="off") return true; const t1=(mode==="strict")?PROBE_TIMEOUT_MS_STRICT:PROBE_TIMEOUT_MS_LOOSE; try{ let { r }=await httpGet(url,{ Range:"bytes=0-0"},t1); if(r&&[200,206,301,302].includes(r.status)) return true; if(mode==="loose"){ ({ r }=await httpGet(url,{},PROBE_TIMEOUT_MS_LOOSE)); if(r&&[200,301,302].includes(r.status)) return true;} return false;}catch{return false;} }

/* ===== 注入 ===== */
async function injectForM3U(m3uText, iconMap, idx=0){
  if (globalStop) return "";
  const lines = m3uText.split(/\r?\n/);
  const out = [];
  const extCount = lines.filter(l=>l.startsWith("#EXTINF")).length;
  console.log(`源#${idx+1}: EXTINF = ${extCount}`);

  let scanned=0;
  for (let i=0;i<lines.length;i++){
    if(globalStop) break;
    const raw=lines[i];
    if(!raw.startsWith("#EXTINF")){
      if(raw.trim().toUpperCase().startsWith("#EXTM3U") && out.length===0) out.push("#EXTM3U");
      continue;
    }
    scanned++; if(scanned>PER_SOURCE_SCAN_LIMIT) break; if(keptChannels>=HARD_TARGET){ globalStop=true; break;}
    totalChannels++;

    const commaIdx=raw.indexOf(",");
    let header=commaIdx>=0 ? raw.slice(0,commaIdx) : raw;
    const dispName=commaIdx>=0 ? raw.slice(commaIdx+1).trim() : "";
    const grpTitle=getAttr(header,"group-title");
    const grpTvg=getAttr(header,"tvg-group");
    const groupVal=grpTitle||grpTvg||"mix";

    const curLogo=getAttr(header,"tvg-logo");
    const needFill=!curLogo||/^https?:\/\/$/.test(curLogo)||(curLogo&&curLogo.trim()==="");
    const isPlaceholder=/^(?:-|n\/a|none|null|empty)$/i.test(curLogo||"");
    if(!/tvg-logo="/i.test(header)||needFill||isPlaceholder){
      const iconUrl = await pickIconByDisplayName(iconMap, dispName);
      header=setOrReplaceAttr(header,"tvg-logo",iconUrl);
    }

    const url=findNextUrl(lines,i);
    const ok=await quickProbe(url,FILTER_MODE);

    if(ok){
      keptChannels++;
      out.push(commaIdx>=0 ? (header+","+dispName) : header);
      out.push(`#EXTGRP:${groupVal}`);
      out.push(url);
      if(i+1<lines.length && !lines[i+1].startsWith("#")) i++;
      if(keptChannels>=HARD_TARGET){ globalStop=true; break;}
    } else { filteredChannels++; }
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
    const validM3Us=srcs.filter(r=>r?.r?.status>=200&&r.d).map(r=>r.d);
    if(!validM3Us.length){
      const empty="#EXTM3U\n# Stats: total=0, kept=0, filtered=0\n# 失败：没有可用源\n";
      console.log(empty);
      if(IS_NODE){ fs.mkdirSync(OUT_DIR,{ recursive:true }); fs.writeFileSync(OUT_FILE,empty); }
      return;
    }

    const injectedList=[];
    for(let si=0; si<validM3Us.length; si++){
      if(globalStop) break;
      const injected=await injectForM3U(validM3Us[si], iconMap, si);
      injectedList.push(injected);
    }

    let merged=injectedList.join("\n");
    merged=stripM3UHeaderOnce(merged);
    merged=dedupeM3U(merged);
    merged=clipByPairCount(merged, TEST_TOTAL_LIMIT);

    const header=
      "#EXTM3U\n"+
      `# Generated-At: ${new Date().toISOString()} (limit=${TEST_TOTAL_LIMIT})\n`+
      `# Stats: total=${totalChannels}, kept=${keptChannels}, filtered=${filteredChannels}\n`;

    const finalText=header+merged.replace(/^#EXTM3U\s*/,'')+"\n";

    console.log(finalText);
    if(IS_NODE){
      fs.mkdirSync(OUT_DIR,{ recursive:true });
      fs.writeFileSync(OUT_FILE,finalText);

      if(UPLOAD_NOW){
        try{
          console.log(`# Uploading to GitHub: ${REPO}@${BRANCH} -> ${PATH_IN_REPO}`);
          const resp=await putFile(REPO, BRANCH, PATH_IN_REPO, finalText);
          console.log(`# Uploaded commit: ${resp.commit?.sha || "(no sha)"}`);
        }catch(e){ console.log(`⚠️ 上传失败：${String(e)}`); }
      }
    }
  }catch(e){
    const msg="#EXTM3U\n# 异常："+String(e)+"\n";
    console.log(msg);
    if(IS_NODE){ fs.mkdirSync(OUT_DIR,{ recursive:true }); fs.writeFileSync(OUT_FILE,msg); }
  }
})();
