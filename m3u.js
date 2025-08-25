/**
 * m3u.js (TEST TOTAL = 50)
 * - 全局仅输出 50 条频道（TEST_TOTAL_LIMIT）
 * - 过滤关闭（FILTER_MODE = off）确保必出 URL
 * - findNextUrl 更稳：先跳空行，再跳注释
 * - 保底写回原始 URL
 * - 去掉供应商冗余属性
 * - 合并后单一 #EXTM3U 头、去重、裁剪到 50（已修复：携带 #EXTGRP 时不会丢 URL）
 */

const IS_NODE  = typeof process !== "undefined" && process.release?.name === "node";
let nodeFetch = null;
if (IS_NODE && typeof fetch === "undefined") {
  nodeFetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
}

/* ===== 开关 ===== */
const TEST_LIMIT        = 0;     // 不做“每源限制”
const TEST_TOTAL_LIMIT  = 50;    // ✅ 全局限制为 50
const FILTER_MODE       = "off"; // 测试时强制关闭过滤

/* ===== 数据源 ===== */
const M3U_URLS = [
  { url: "https://aktv.space/live.m3u" },
  { url: "https://raw.githubusercontent.com/Guovin/iptv-api/gd/output/result.m3u" },
];
const USE_WORKER_GATEWAY = true;
const GW_BASE = "https://m3u-converter.mikephiemy.workers.dev/?u=";

/* ===== 统计 ===== */
let totalChannels = 0, keptChannels = 0, filteredChannels = 0;

/* ===== HTTP ===== */
async function httpGet(url, headers = {}, timeoutMs = 5000) {
  if (!IS_NODE) return { r: { status: 0 }, d: "" };
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const f = typeof fetch === "function" ? fetch : nodeFetch;
    const res = await f(url, { headers, signal: controller.signal });
    const text = await res.text();
    return { r: res, d: text };
  } catch { return { r: { status: 0 }, d: "" }; }
  finally { clearTimeout(id); }
}

/* ===== 工具函数 ===== */
function stripVendorAttrs(header){
  return header.replace(/\s+(aktv-group|provider|provider-logo|provider-type|provider-name)="[^"]*"/ig, "");
}
function guessGroupByName(name){
  const s = name || "";
  if (/CCTV|央视频道|央视|央視/i.test(s)) return "cctv";
  if (/TVB|翡翠|明珠|凤凰|鳳凰|香港/i.test(s)) return "hongkong";
  if (/Channel\s*(5|8|U)|CNA|Mediacorp/i.test(s)) return "mediacorp";
  if (/体育|體育|Sports?|ESPN|beIN|Sky\s*Sports|Super\s*Sport/i.test(s)) return "sport";
  if (/电影|電影|AXN|HBO|Cinemax|Movies?/i.test(s)) return "movie";
  return "mix";
}
function findNextUrl(lines, i){
  // 1) 先只跳过空行
  let j = i+1;
  while (j < lines.length && !lines[j].trim()) j++;
  if (j < lines.length && !lines[j].startsWith("#")) return lines[j].trim();

  // 2) 回退到“跳过注释”的策略
  j = i+1;
  while (j < lines.length && (lines[j].startsWith("#") || !lines[j].trim())) j++;
  return (j < lines.length && !lines[j].startsWith("#")) ? lines[j].trim() : "";
}
function stripM3UHeaderOnce(text){
  const lines = text.split(/\r?\n/);
  const kept = lines.filter(ln => !ln.trim().toUpperCase().startsWith("#EXTM3U"));
  return ["#EXTM3U", ...kept].join("\n");
}

/* ✅ 修复：在存在 #EXTGRP 等元数据时，去重不会丢 URL */
function dedupeM3U(m3u){
  const lines = m3u.split(/\r?\n/);
  const out=[], seen=new Set();

  for (let i=0;i<lines.length;i++){
    const line = lines[i];
    if (!line.startsWith("#EXTINF")) {
      if (line.startsWith("#")) out.push(line);   // 保留头/注释
      continue;
    }

    // 收集元数据行（#EXTGRP 等），并找到真实 URL
    const meta = [];
    let j = i + 1;
    while (j < lines.length && (lines[j].startsWith("#") || !lines[j].trim())) {
      meta.push(lines[j]);
      j++;
    }
    const url = (j < lines.length && !lines[j].startsWith("#")) ? lines[j].trim() : "";

    const dispName = line.split(",").slice(1).join(",").trim();
    const key = `${dispName.toLowerCase()}||${(url||"").toLowerCase()}`;
    if (seen.has(key)) {
      if (url) i = j; // 跳过到 URL 之后
      continue;
    }
    seen.add(key);

    out.push(line);
    for (const m of meta) out.push(m);
    if (url) { out.push(url); i = j; }
  }
  return out.join("\n");
}

/* ✅ 修复：裁剪前 50 组时，携带元数据并正确定位 URL */
function clipByPairCount(text, maxPairs){
  if (!maxPairs || maxPairs <= 0) return text;

  const lines = text.split(/\r?\n/);
  const out = [];
  let pairs = 0;

  for (let i=0;i<lines.length;i++){
    const ln = lines[i];

    if (!ln.startsWith("#EXTINF")) {
      if (ln.startsWith("#")) out.push(ln);  // 保留头/注释
      continue;
    }

    if (pairs >= maxPairs) break;

    const meta = [];
    let j = i + 1;
    while (j < lines.length && (lines[j].startsWith("#") || !lines[j].trim())) {
      meta.push(lines[j]);
      j++;
    }
    const url = (j < lines.length && !lines[j].startsWith("#")) ? lines[j].trim() : "";

    out.push(ln);
    for (const m of meta) out.push(m);
    if (url) { out.push(url); i = j; }

    pairs++;
  }

  return out.join("\n");
}

/* ===== 注入逻辑 ===== */
async function injectLogoForM3U(m3uText, idx=0){
  const lines = m3uText.split(/\r?\n/);
  const out = [];
  let keptThisSource = 0;

  console.log(`源#${idx+1}: EXTINF 行 =`, lines.filter(l=>l.startsWith("#EXTINF")).length);

  for (let i=0;i<lines.length;i++){
    if (TEST_LIMIT > 0 && keptThisSource >= TEST_LIMIT) break;

    const rawLine = lines[i];
    if (!rawLine.startsWith("#EXTINF")) {
      if (rawLine.trim().toUpperCase().startsWith("#EXTM3U") && out.length===0) out.push("#EXTM3U");
      continue;
    }

    totalChannels++;
    keptThisSource++;

    const commaIdx = rawLine.indexOf(",");
    let header     = commaIdx>=0 ? rawLine.slice(0,commaIdx) : rawLine;
    const dispName = commaIdx>=0 ? rawLine.slice(commaIdx+1).trim() : "";

    header = stripVendorAttrs(header);

    let urlForThis = findNextUrl(lines, i);

    // Worker 接线（所有 http(s) 直链接到网关）
    if (USE_WORKER_GATEWAY && urlForThis && /^https?:\/\//i.test(urlForThis)) {
      urlForThis = GW_BASE + encodeURIComponent(urlForThis);
    }

    const grp = guessGroupByName(dispName);
    out.push(commaIdx>=0 ? (header + "," + dispName) : header);
    out.push(`#EXTGRP:${grp}`);

    if (urlForThis) {
      keptChannels++;
      out.push(urlForThis);
      if (i+1<lines.length && !lines[i+1].startsWith("#")) i++; // 跳过源里的 URL 行
    } else {
      // ⚠️ 保底：直接回填原始 URL
      const orig = (i+1<lines.length && !lines[i+1].startsWith("#")) ? lines[i+1].trim() : "";
      if (orig) {
        keptChannels++;
        out.push(orig);
        i++;
      } else {
        filteredChannels++;
      }
    }
  }
  return out.join("\n");
}

/* ===== 主流程 ===== */
(async function main(){
  try{
    const m3uResArr = await Promise.all(M3U_URLS.map(o=>httpGet(o.url)));
    const validM3Us = m3uResArr.filter(r=>r?.r?.status>=200 && r.d).map(r=>r.d);
    if (!validM3Us.length) {
      console.log("#EXTM3U\n# Stats: total=0, kept=0, filtered=0\n# 失败：没有可用源");
      return;
    }

    const injectedList = [];
    for (let si=0; si<validM3Us.length; si++){
      const injected = await injectLogoForM3U(validM3Us[si], si);
      injectedList.push(injected);
    }

    let merged = injectedList.join("\n");
    merged = stripM3UHeaderOnce(merged);                 // 单一 #EXTM3U 头
    merged = dedupeM3U(merged);                          // 去重（带 #EXTGRP 不丢 URL）
    merged = clipByPairCount(merged, TEST_TOTAL_LIMIT);  // ✅ 全局裁到 50 组

    // 打印头部统计（供 Actions 日志观察）
    console.log(`#EXTM3U`);
    console.log(`# Stats: total=${totalChannels}, kept=${keptChannels}, filtered=${filteredChannels}`);
    console.log(merged.replace(/^#EXTM3U\s*/,''));
  }catch(e){
    console.log("#EXTM3U\n# 异常：", String(e));
  }
})();
