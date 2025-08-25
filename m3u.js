/**
 * m3u.js (Test版)
 * - TEST_LIMIT = 10
 * - FILTER_MODE = off
 * - 改造 findNextUrl & 保底写回 URL
 */

const IS_NODE  = typeof process !== "undefined" && process.release?.name === "node";
let nodeFetch = null;
if (IS_NODE && typeof fetch === "undefined") {
  nodeFetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
}

/* ===== 开关 ===== */
const TEST_LIMIT   = 10;
const FILTER_MODE  = "off";   // 测试时强制关闭过滤

/* ===== 数据源 ===== */
const M3U_URLS = [
  { url: "https://aktv.space/live.m3u" },
  { url: "https://raw.githubusercontent.com/Guovin/iptv-api/gd/output/result.m3u" },
];
const ICONS_JSON_URL = "https://img.mikephie.site/icons.json";

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

/* ===== 辅助函数 ===== */
function findNextUrl(lines, i){
  // 先跳过空行
  let j = i+1;
  while (j < lines.length && !lines[j].trim()) j++;
  if (j < lines.length && !lines[j].startsWith("#")) return lines[j].trim();

  // 再退回老逻辑：跳过注释
  j = i+1;
  while (j < lines.length && (lines[j].startsWith("#") || !lines[j].trim())) j++;
  return (j < lines.length && !lines[j].startsWith("#")) ? lines[j].trim() : "";
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

    let urlForThis = findNextUrl(lines, i);

    // Worker 接线
    if (USE_WORKER_GATEWAY && urlForThis.startsWith("http")) {
      urlForThis = GW_BASE + encodeURIComponent(urlForThis);
    }

    // 写出
    out.push(commaIdx>=0 ? (header + "," + dispName) : header);
    out.push(`#EXTGRP:mix`);
    if (urlForThis) {
      out.push(urlForThis);
      if (i+1<lines.length && !lines[i+1].startsWith("#")) i++;
    } else {
      // ⚠️ 保底：直接回填原始 URL
      const orig = (i+1<lines.length && !lines[i+1].startsWith("#")) ? lines[i+1].trim() : "";
      if (orig) { out.push(orig); i++; }
    }
  }
  return out.join("\n");
}

/* ===== 主流程 ===== */
(async function main(){
  try{
    const tasks = [httpGet(ICONS_JSON_URL), ...M3U_URLS.map(o=>httpGet(o.url))];
    const [iconsRes, ...m3uResArr] = await Promise.all(tasks);

    const validM3Us = m3uResArr.filter(r=>r?.r?.status>=200 && r.d).map(r=>r.d);
    if (!validM3Us.length) return console.log("❌ 没有可用 M3U 源");

    const injectedList = [];
    for (let si=0; si<validM3Us.length; si++){
      const injected = await injectLogoForM3U(validM3Us[si], si);
      injectedList.push(injected);
    }

    const merged = injectedList.join("\n");
    console.log(`#EXTM3U\n# Stats: total=${totalChannels}, kept=${keptChannels}, filtered=${filteredChannels}\n`);
    console.log(merged);
  }catch(e){ console.log("❌ 异常：", e); }
})();
