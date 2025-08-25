/**
 * m3u.js — 有效直链 + icons.json 图标 + 保留原分组
 * 性能优化：全局早停（凑够50条立刻停）、每源最多扫描300条、更短探测超时
 * - 不走 Worker，不加 UA/Referer
 * - 过滤模式 = strict（只留探测可用的直链）
 * - 自动补图标（来自 icons.json，只有当原条目未提供时）
 * - 全局限制输出 50 条（去重后不会超过 50）
 */

const IS_NODE  = typeof process !== "undefined" && process.release?.name === "node";
let nodeFetch = null;
if (IS_NODE && typeof fetch === "undefined") {
  nodeFetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
}

/* ===== 配置 ===== */
const M3U_URLS = [
  { url: "https://aktv.space/live.m3u" },
  { url: "https://raw.githubusercontent.com/Guovin/iptv-api/gd/output/result.m3u" },
];
const ICONS_JSON_URL = "https://img.mikephie.site/icons.json";

// 固定策略
const FILTER_MODE              = "strict";  // strict / loose / off
const TEST_TOTAL_LIMIT         = 50;        // ✅ 全局仅输出 50 条
const HARD_TARGET              = 50;        // ✅ 凑够 50 条全局早停
const PER_SOURCE_SCAN_LIMIT    = 300;       // ✅ 每个源最多尝试 300 条（够50就停）

// 超时收紧（为提速）
const FETCH_TIMEOUT_MS         = 6000;
const PROBE_TIMEOUT_MS_STRICT  = 1200;
const PROBE_TIMEOUT_MS_LOOSE   = 900;

/* ===== 统计/早停 ===== */
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

/* ===== icons.json 载入与匹配 ===== */
async function loadIcons(){
  try{
    const { d } = await httpGet(ICONS_JSON_URL, {}, 8000);
    if (!d) return new Map();
    let parsed = JSON.parse(d);
    const arr = Array.isArray(parsed?.icons) ? parsed.icons : (Array.isArray(parsed) ? parsed : []);
    const map = new Map();
    for (const it of arr){
      const name=(it?.name||"").trim();
      const url =(it?.url ||"").trim();
      if (!name || !url) continue;
      const base = name.replace(/\.(png|jpg|jpeg|webp|gif|svg)$/i,"").trim();
      const keys = new Set([
        name, name.toLowerCase(), name.toUpperCase(),
        base, base.toLowerCase(), base.toUpperCase(),
        base.replace(/\s+/g,"").toLowerCase()
      ]);
      for (const k of keys) map.set(k, url);
    }
    return map;
  }catch(e){
    console.log("⚠️ icons.json 加载失败：", String(e));
    return new Map();
  }
}
function pickIcon(iconMap, { tvgId, tvgName, dispName }){
  const cands = [];
  if (tvgId)   cands.push(tvgId, tvgId.split("/").pop());
  if (tvgName) cands.push(tvgName);
  if (dispName)cands.push(dispName);
  for (const raw of cands){
    const s = (raw||"").trim();
    if (!s) continue;
    const keys = [
      s, s.toLowerCase(), s.toUpperCase(),
      s.replace(/\.(png|jpg|jpeg|webp|gif|svg)$/i,""),
      s.replace(/\s+/g,"").toLowerCase()
    ];
    for (const k of keys){
      if (iconMap.has(k)) return iconMap.get(k);
    }
  }
  return "";
}

/* ===== 工具函数 ===== */
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
// 去重（携带元数据时不丢 URL）
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
// 裁剪到前 N 组（EXTINF+URL），带元数据
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

/* ===== 探测器（只保留可用直链） ===== */
async function quickProbe(url, mode="strict"){
  if (!url) return false;
  if (mode === "off") return true;
  const t1 = (mode === "strict") ? PROBE_TIMEOUT_MS_STRICT : PROBE_TIMEOUT_MS_LOOSE;
  try {
    let { r } = await httpGet(url, { Range: "bytes=0-0" }, t1);
    if (r && [200,206,301,302].includes(r.status)) return true;
    if (mode === "loose") {
      ({ r } = await httpGet(url, {}, PROBE_TIMEOUT_MS_LOOSE));
      if (r && [200,301,302].includes(r.status)) return true;
    }
    return false;
  } catch { return false; }
}

/* ===== 注入：icon + 分组保留 + 直链过滤（带早停与每源限量） ===== */
async function injectForM3U(m3uText, iconMap, idx=0){
  if (globalStop) return "";
  const lines = m3uText.split(/\r?\n/);
  const out = [];

  // 统计 EXTINF 行
  const extCount = lines.filter(l=>l.startsWith("#EXTINF")).length;
  console.log(`源#${idx+1}: EXTINF = ${extCount}`);

  let scanned = 0;
  for (let i=0;i<lines.length;i++){
    if (globalStop) break;

    const raw = lines[i];
    if (!raw.startsWith("#EXTINF")) {
      if (raw.trim().toUpperCase().startsWith("#EXTM3U") && out.length===0) out.push("#EXTM3U");
      continue;
    }

    scanned++;
    if (scanned > PER_SOURCE_SCAN_LIMIT) break;   // 每源上限
    if (keptChannels >= HARD_TARGET) { globalStop = true; break; } // 全局早停

    totalChannels++;

    const commaIdx = raw.indexOf(",");
    let header     = commaIdx>=0 ? raw.slice(0,commaIdx) : raw;
    const dispName = commaIdx>=0 ? raw.slice(commaIdx+1).trim() : "";

    // 分组：保留原有（不覆盖）
    const grpTitle = getAttr(header, "group-title");
    const grpTvg   = getAttr(header, "tvg-group");
    const groupVal = grpTitle || grpTvg || "mix";

    // 图标：原条目无 tvg-logo 时，从 icons.json 匹配补上
    const tvgId   = getAttr(header, "tvg-id");
    const tvgName = getAttr(header, "tvg-name");
    if (!/tvg-logo="/i.test(header)){
      const iconUrl = pickIcon(iconMap, { tvgId, tvgName, dispName });
      if (iconUrl) header = setOrReplaceAttr(header, "tvg-logo", iconUrl);
    }

    const url = findNextUrl(lines, i);
    const ok  = await quickProbe(url, FILTER_MODE);

    if (ok) {
      keptChannels++;
      out.push(commaIdx>=0 ? (header + "," + dispName) : header);
      out.push(`#EXTGRP:${groupVal}`);
      out.push(url);
      // 跳过源里的 URL 行
      if (i+1<lines.length && !lines[i+1].startsWith("#")) i++;

      // 达标后就全局停
      if (keptChannels >= HARD_TARGET) { globalStop = true; break; }
    } else {
      filteredChannels++;
    }
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
      console.log("#EXTM3U\n# Stats: total=0, kept=0, filtered=0\n# 失败：没有可用源");
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
    merged = clipByPairCount(merged, TEST_TOTAL_LIMIT);  // 最终再裁一次，确保不超过50

    console.log("#EXTM3U");
    console.log(`# Generated-At: ${new Date().toISOString()} (limit=${TEST_TOTAL_LIMIT})`);
    console.log(`# Stats: total=${totalChannels}, kept=${keptChannels}, filtered=${filteredChannels}`);
    console.log(merged.replace(/^#EXTM3U\s*/,''));
  }catch(e){
    console.log("#EXTM3U\n# 异常：", String(e));
  }
})();
