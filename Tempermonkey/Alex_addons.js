// ==UserScript==
// @name         GitHub+ Fusion：Alex 全功能 + 玻璃风格 ScriptHub & 徽标开关
// @namespace    https://mikephie.site/
// @version      2.0.0
// @description  基于 Alex 版完整功能（ZIP/Raw修复、分支下载、编辑/保存、Gist面板、Sync Fork、Actions工作流等），叠加玻璃风格 ScriptHub 工具条与霓虹徽标总开关，支持 GitHub PJAX 与 raw 页面。
// @author       Mikephie
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-start
// @icon         https://raw.githubusercontent.com/Alex0510/Eric/master/Icons/GitHub.PNG
// @license      MIT
//
// ====== 引入 Alex 原版（完整功能保持不变） ======
// (保持与原脚本一致的 Polyfill/Grant 能力)
 // Alex 原脚本（当前 header 显示 6.0.28）：
// 参考：gist.githubusercontent.com/Alex0510/a7fe6be108d1b303d25301413dd125cb/raw/github.user.js
// 直接作为 @require 引入，避免复制冗长源码且便于后续跟随上游更新。
//
// 注意：Tampermonkey 需允许外链 @require；若网络受限，也可改为你私仓 RAW 地址。
//
// @require      https://gist.githubusercontent.com/Alex0510/a7fe6be108d1b303d25301413dd125cb/raw/github.user.js
//
// ====== 保持与原脚本一致的授权（供 @require 体使用）======
/* eslint-disable */
 // Alex 源脚本中用到的 Grants（尽量完整保留，避免功能缺失）
 // 若你的管理器报未使用可忽略。
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_notification
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  // ===================== 你的叠加 UI（玻璃风格 + 总开关 + ScriptHub）=====================
  // 说明：
  // 1) 不改动 Alex 功能与结构；所有新增元素 class 前缀 gplus-，避免冲突
  // 2) "总开关"仅控制我们新增的 UI，不会关闭 Alex 的增强能力（需要时可扩展为同时隐藏 Alex 面板）

  const STORE_KEY = 'gplus.enabled';
  const enabled = () => (localStorage.getItem(STORE_KEY) ?? '1') === '1';
  const setEnabled = (f) => localStorage.setItem(STORE_KEY, f ? '1' : '0');

  const isGitHub = () => location.hostname === 'github.com';
  const isRawHost = () => location.hostname === 'raw.githubusercontent.com';

  // ========== 样式 ==========
  const STYLE = `
  :root{
    --glass-bg: rgba(255,255,255,.10);
    --glass-stroke: rgba(255,255,255,.22);
    --glass-shadow: 0 18px 50px rgba(0,0,0,.35);
    --fg: #eaf2ff;
    --fg-dim: #b7c2d9;
    --accent1: #22c1c3;
    --accent2: #2e8bff;
  }
  @media (prefers-color-scheme: light) {
    :root{
      --glass-bg: rgba(255,255,255,.55);
      --glass-stroke: rgba(0,0,0,.12);
      --glass-shadow: 0 12px 35px rgba(0,0,0,.15);
      --fg: #0b1220;
      --fg-dim: #475369;
      --accent1: #0ea5e9;
      --accent2: #6366f1;
    }
  }
  .gplus-hidden{ display:none !important; }

  /* 顶部 ScriptHub 工具条 */
  .gplus-shbar{
    position: sticky; top: 0; z-index: 1002;
    backdrop-filter: saturate(140%) blur(16px);
    -webkit-backdrop-filter: saturate(140%) blur(16px);
    background: linear-gradient(135deg, var(--glass-bg), rgba(0,0,0,.05));
    border-bottom: 1px solid var(--glass-stroke);
    box-shadow: var(--glass-shadow);
    padding: 10px 12px; display: flex; gap: 8px; align-items: center;
  }
  .gplus-shbar .title{ font-weight:700; letter-spacing:.3px; color:var(--fg); margin-right:6px; }
  .gplus-shbar .sub{ color:var(--fg-dim); font-size:12px; margin-right:auto; }
  .gplus-btn{
    position: relative; border:1px solid var(--glass-stroke);
    padding:8px 12px; background: rgba(255,255,255,.06);
    border-radius:10px; cursor:pointer; color:var(--fg); font-weight:600;
    transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
    outline:none;
  }
  .gplus-btn:hover{
    transform: translateY(-1px);
    box-shadow: 0 0 0 3px rgba(46,139,255,.20), 0 10px 30px rgba(0,0,0,.20);
  }
  .gplus-btn::after{
    content:""; position:absolute; inset:-2px; border-radius:12px; pointer-events:none;
    background: conic-gradient(from 0deg, var(--accent1), var(--accent2), var(--accent1));
    filter: blur(8px); opacity:.35; z-index:-1;
  }

  /* 右下角霓虹徽标（总开关） */
  .gplus-badge{
    position: fixed; right: 18px; bottom: 20px; z-index: 1003;
    display:inline-flex; align-items:center; gap:8px;
    background: linear-gradient(135deg, rgba(46,139,255,.20), rgba(34,193,195,.10));
    border:1px solid var(--glass-stroke);
    box-shadow: 0 14px 40px rgba(0,0,0,.35), 0 0 18px rgba(46,139,255,.35), inset 0 0 18px rgba(34,193,195,.18);
    color:var(--fg); padding:10px 14px; border-radius:14px; font-weight:800; letter-spacing:.4px;
    cursor:pointer; user-select:none; backdrop-filter: blur(12px) saturate(150%); -webkit-backdrop-filter: blur(12px) saturate(150%);
  }
  .gplus-badge .dot{ width:8px; height:8px; border-radius:50%; background:#22c55e; box-shadow:0 0 10px #22c55e; }
  .gplus-badge.off .dot{ background:#ef4444; box-shadow:0 0 10px #ef4444; }
  .gplus-badge .text{ font-size:12px; opacity:.9; }
  .gplus-badge .brand{ font-size:13px; text-shadow:0 0 8px rgba(46,139,255,.6); }

  /* RAW 页右上浮条 */
  .gplus-rawbar{
    position: fixed; top: 8px; right: 8px; left: 8px; z-index: 2147483646;
    display:flex; gap:8px; justify-content:flex-end; padding:8px; pointer-events:none;
  }
  .gplus-rawbar .gplus-btn{ pointer-events: all; }
  `;

  // ========== DOM 工具 ==========
  const qs = (s, r=document)=>r.querySelector(s);
  const on = (el, ev, fn, opt)=> el && el.addEventListener(ev, fn, opt);

  function isBlobView(){
    if(!isGitHub()) return false;
    const ps = location.pathname.split('/').filter(Boolean);
    return ps.length>=5 && ps[2]==='blob';
  }
  function getRawURL(){
    if(isRawHost()) return location.href;
    if(!isBlobView()) return null;
    return location.href.replace('/blob/','/raw/');
  }
  function getRepoPath(){
    if(!isBlobView()) return '';
    const ps = location.pathname.split('/').filter(Boolean);
    return ps.slice(4).join('/');
  }
  async function downloadCurrent(){
    const raw = getRawURL(); if(!raw) return;
    try{
      const res = await fetch(raw,{credentials:'omit'});
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = (getRepoPath().split('/').pop()||'download');
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    }catch{ open(raw,'_blank'); }
  }
  async function copyText(t){
    try{ await navigator.clipboard.writeText(t); toast('Copied'); }
    catch{ prompt('Copy manually:', t); }
  }
  function toast(msg){
    const tip=document.createElement('div');
    tip.textContent=msg;
    Object.assign(tip.style,{
      position:'fixed', left:'50%', top:'18px', transform:'translateX(-50%)',
      background:'rgba(0,0,0,.6)', color:'#fff', padding:'6px 10px', borderRadius:'8px',
      zIndex:2147483647, fontSize:'12px', backdropFilter:'blur(6px)'
    });
    document.body.appendChild(tip); setTimeout(()=>tip.remove(),1200);
  }

  // ========== 注入样式 ==========
  const styleEl = document.createElement('style'); styleEl.textContent = STYLE;
  // Alex 在 document-start 执行；我们同样在早期注入样式，不干扰其逻辑
  document.documentElement.appendChild(styleEl);

  // ========== 右下徽标（总开关） ==========
  function ensureBadge(){
    if(qs('.gplus-badge')) return;
    const b = document.createElement('div');
    b.className = 'gplus-badge';
    b.innerHTML = `
      <div class="dot"></div>
      <div class="brand">GitHubPlus</div>
      <div class="text">Tap to ${enabled() ? 'Off':'On'}</div>
    `;
    if(!enabled()) b.classList.add('off');
    on(b,'click',()=>{
      const nx = !enabled(); setEnabled(nx);
      b.classList.toggle('off', !nx);
      b.querySelector('.text').textContent = `Tap to ${nx?'Off':'On'}`;
      // 刷新我们自己的工具条显隐
      if(isGitHub()) updateSHBar(true); else if(isRawHost()) updateRawBar(true);
      toast(nx?'UI Enabled':'UI Disabled');
    });
    document.body.appendChild(b);
  }

  // ========== 顶部 ScriptHub 工具条 ==========
  function buildSHBar(){
    const bar = document.createElement('div');
    bar.className='gplus-shbar';
    bar.innerHTML = `
      <span class="title">ScriptHub</span>
      <span class="sub">Raw • Download • Copy</span>
      <button class="gplus-btn" data-act="raw">Raw</button>
      <button class="gplus-btn" data-act="dl">Download</button>
      <button class="gplus-btn" data-act="copy-path">Copy Path</button>
      <button class="gplus-btn" data-act="copy-raw">Copy Raw URL</button>
    `;
    on(bar,'click',(e)=>{
      const btn = e.target.closest('.gplus-btn'); if(!btn) return;
      const act = btn.dataset.act;
      if(act==='raw'){ const raw=getRawURL(); raw?open(raw,'_blank'):toast('Not a file view'); }
      if(act==='dl'){ downloadCurrent(); }
      if(act==='copy-path'){ const p=getRepoPath(); p?copyText(p):toast('Not a file view'); }
      if(act==='copy-raw'){ const raw=getRawURL(); raw?copyText(raw):toast('Not a file view'); }
    });
    return bar;
  }
  function placeSHBar(){
    if(!isGitHub()) return;
    if(qs('.gplus-shbar')) return;
    const c = document.createElement('div'); c.appendChild(buildSHBar());
    const anchor = qs('#repo-content-pjax-container') || qs('main') || document.body;
    anchor.parentElement.insertBefore(c, anchor);
  }
  function updateSHBar(recreate=false){
    const bar = qs('.gplus-shbar');
    const onUI = enabled();
    if(!onUI){ if(bar) bar.classList.add('gplus-hidden'); return; }
    if(!bar || recreate){ if(bar) bar.remove(); placeSHBar(); }
    else { bar.classList.remove('gplus-hidden'); }
  }

  // ========== RAW 页右上浮条 ==========
  function ensureRawBar(){
    if(!isRawHost()) return;
    if(qs('.gplus-rawbar')) return;
    const w = document.createElement('div'); w.className='gplus-rawbar';
    w.innerHTML = `
      <button class="gplus-btn" data-act="back">Back to GitHub</button>
      <button class="gplus-btn" data-act="dl">Download</button>
      <button class="gplus-btn" data-act="copy">Copy URL</button>
    `;
    on(w,'click',(e)=>{
      const b = e.target.closest('.gplus-btn'); if(!b) return;
      const act = b.dataset.act;
      if(act==='back'){
        try{
          const u = new URL(location.href);
          const [owner, repo, branch, ...p] = u.pathname.split('/').filter(Boolean);
          const blob = `https://github.com/${owner}/${repo}/blob/${branch}/${p.join('/')}`;
          open(blob,'_self');
        }catch{ history.back(); }
      }
      if(act==='dl') downloadCurrent();
      if(act==='copy') copyText(location.href);
    });
    document.body.appendChild(w);
  }
  function updateRawBar(recreate=false){
    const onUI = enabled(); const bar = qs('.gplus-rawbar');
    if(!isRawHost()) return;
    if(!onUI){ if(bar) bar.classList.add('gplus-hidden'); return; }
    if(!bar || recreate){ if(bar) bar.remove(); ensureRawBar(); }
    else { bar.classList.remove('gplus-hidden'); }
  }

  // ========== 启动 / 监听 ==========
  function boot(){
    ensureBadge();
    if(isGitHub()) updateSHBar(true);
    else if(isRawHost()) updateRawBar(true);
  }

  // Alex 在 document-start 已经挂载；我们等到 DOM 基本可用后再挂 UI
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  } else {
    boot();
  }

  // PJAX/URL 变化：保持我们工具条存在
  const mo = new MutationObserver(()=>{ if(isGitHub()) updateSHBar(); });
  mo.observe(document.documentElement,{subtree:true, childList:true});
  let lastHref = location.href;
  setInterval(()=>{ if(location.href!==lastHref){ lastHref=location.href; boot(); } }, 400);

})();