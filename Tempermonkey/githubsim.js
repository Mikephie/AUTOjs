// ==UserScript==
// @name         GitHub+ (Alex版) 玻璃风格 + ScriptHub（常驻稳定版）
// @namespace    https://mikephie.site/
// @version      2.0.0
// @description  玻璃弹窗与霓虹徽标；常驻 ScriptHub 工具条（Raw/Download/Copy）；开关可持久化；支持 GitHub PJAX 与 raw 页面。
// @author       Mikephie
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  /** ================= 基础样式（玻璃 + 霓虹 + 工具条） ================= */
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

  /* ===== ScriptHub 顶部工具条 ===== */
  .gplus-shbar{
    position: sticky;
    top: 0;
    z-index: 1002;
    backdrop-filter: saturate(140%) blur(16px);
    -webkit-backdrop-filter: saturate(140%) blur(16px);
    background: linear-gradient(135deg, var(--glass-bg), rgba(0,0,0,.05));
    border-bottom: 1px solid var(--glass-stroke);
    box-shadow: var(--glass-shadow);
    padding: 10px 12px;
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .gplus-shbar .title{
    font-weight: 700;
    letter-spacing: .3px;
    color: var(--fg);
    margin-right: 6px;
  }
  .gplus-shbar .sub{
    color: var(--fg-dim);
    font-size: 12px;
    margin-right: auto;
  }
  .gplus-btn{
    position: relative;
    border: 1px solid var(--glass-stroke);
    padding: 8px 12px;
    background: rgba(255,255,255,.06);
    border-radius: 10px;
    cursor: pointer;
    color: var(--fg);
    font-weight: 600;
    transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
    outline: none;
  }
  .gplus-btn:hover{
    transform: translateY(-1px);
    box-shadow: 0 0 0 3px rgba(46,139,255,.20), 0 10px 30px rgba(0,0,0,.20);
  }
  .gplus-btn::after{
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 12px;
    pointer-events: none;
    background: conic-gradient(from 0deg, var(--accent1), var(--accent2), var(--accent1));
    filter: blur(8px);
    opacity: .35;
    z-index: -1;
  }
  .gplus-btn[disabled]{ opacity: .6; cursor: not-allowed; }

  /* ===== 右下角霓虹徽标（总开关） ===== */
  .gplus-badge{
    position: fixed;
    right: 18px;
    bottom: 20px;
    z-index: 1003;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, rgba(46,139,255,.20), rgba(34,193,195,.10));
    border: 1px solid var(--glass-stroke);
    box-shadow: 0 14px 40px rgba(0,0,0,.35), 0 0 18px rgba(46,139,255,.35), inset 0 0 18px rgba(34,193,195,.18);
    color: var(--fg);
    padding: 10px 14px;
    border-radius: 14px;
    font-weight: 800;
    letter-spacing: .4px;
    cursor: pointer;
    user-select: none;
    backdrop-filter: blur(12px) saturate(150%);
    -webkit-backdrop-filter: blur(12px) saturate(150%);
  }
  .gplus-badge .dot{
    width: 8px; height: 8px; border-radius: 50%;
    background: #22c55e; box-shadow: 0 0 10px #22c55e;
  }
  .gplus-badge.off .dot{ background:#ef4444; box-shadow:0 0 10px #ef4444; }
  .gplus-badge .text{ font-size: 12px; opacity:.9; }
  .gplus-badge .brand{ font-size: 13px; text-shadow: 0 0 8px rgba(46,139,255,.6); }

  /* ===== 原始(raw)页顶部浮条 ===== */
  .gplus-rawbar{
    position: fixed;
    top: 8px; right: 8px; left: 8px;
    z-index: 2147483646;
    display: flex; gap: 8px; justify-content: flex-end;
    padding: 8px;
    pointer-events: none;
  }
  .gplus-rawbar .gplus-btn{ pointer-events: all; }

  /* 细节 */
  .gplus-hidden{ display:none !important; }
  `;

  /** ================= 常量 & 工具 ================= */
  const STORE_KEY = 'gplus.enabled';
  const qs = (sel, root=document) => root.querySelector(sel);
  const qsa = (sel, root=document) => [...root.querySelectorAll(sel)];
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);

  function enabled() {
    const v = localStorage.getItem(STORE_KEY);
    return v == null ? true : v === '1';
  }
  function setEnabled(flag) { localStorage.setItem(STORE_KEY, flag ? '1' : '0'); }

  function isGitHub() { return location.hostname === 'github.com'; }
  function isRawHost() { return location.hostname === 'raw.githubusercontent.com'; }

  // 简单判断是否是"文件查看（blob）页面"
  function isBlobView() {
    if (!isGitHub()) return false;
    // URL 形如：/owner/repo/blob/branch/path/to/file.ext
    const parts = location.pathname.split('/').filter(Boolean);
    return parts.length >= 5 && parts[2] === 'blob';
  }
  
    // 获取 Raw URL（支持 blob 页）
  function getRawURL() {
    if (isRawHost()) return location.href;
    if (!isBlobView()) return null;
    return location.href.replace('/blob/', '/raw/');
  }

  // 推断 repo 相对路径（供 Copy Path）
  function getRepoPath() {
    if (!isBlobView()) return '';
    const parts = location.pathname.split('/').filter(Boolean);
    // owner / repo / blob / branch / ...path
    return parts.slice(4).join('/');
  }

  // 下载（优先 blob->raw）
  async function downloadCurrent() {
    const raw = getRawURL();
    if (!raw) return;
    try {
      const res = await fetch(raw, { credentials: 'omit' });
      const buf = await res.blob();
      const url = URL.createObjectURL(buf);
      const a = document.createElement('a');
      const name = getRepoPath().split('/').pop() || 'download';
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch(e) {
      // 失败时回退到直接打开 raw
      open(raw, '_blank');
    }
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); toast('Copied'); }
    catch { prompt('Copy manually:', text); }
  }

  function toast(msg) {
    // 轻量提示（不侵入）
    const tip = document.createElement('div');
    tip.textContent = msg;
    Object.assign(tip.style, {
      position:'fixed', left:'50%', top:'18px', transform:'translateX(-50%)',
      background:'rgba(0,0,0,.6)', color:'#fff', padding:'6px 10px', borderRadius:'8px',
      zIndex:2147483647, fontSize:'12px', backdropFilter:'blur(6px)'
    });
    document.body.appendChild(tip);
    setTimeout(()=> tip.remove(), 1200);
  }

  /** ================= 注入样式 ================= */
  const style = document.createElement('style');
  style.textContent = STYLE;
  document.documentElement.appendChild(style);

  /** ================= 右下角徽标（开关） ================= */
  function ensureBadge() {
    if (qs('.gplus-badge')) return;
    const badge = document.createElement('div');
    badge.className = 'gplus-badge';
    badge.innerHTML = `
      <div class="dot"></div>
      <div class="brand">GitHubPlus</div>
      <div class="text">Tap to ${enabled() ? 'Off' : 'On'}</div>
    `;
    if (!enabled()) badge.classList.add('off');
    on(badge, 'click', () => {
      const next = !enabled();
      setEnabled(next);
      badge.classList.toggle('off', !next);
      badge.querySelector('.text').textContent = `Tap to ${next ? 'Off' : 'On'}`;
      if (isGitHub()) {
        // 切换立即更新工具条显隐
        updateSHBar(true);
      } else if (isRawHost()) {
        updateRawBar(true);
      }
      toast(next ? 'GitHubPlus Enabled' : 'GitHubPlus Disabled');
    });
    document.body.appendChild(badge);
  }

  /** ================= 顶部 ScriptHub 工具条（GitHub 站内） ================= */
  function buildSHBar() {
    const bar = document.createElement('div');
    bar.className = 'gplus-shbar';
    bar.innerHTML = `
      <span class="title">ScriptHub</span>
      <span class="sub">Raw • Download • Copy</span>
      <button class="gplus-btn" data-act="raw">Raw</button>
      <button class="gplus-btn" data-act="dl">Download</button>
      <button class="gplus-btn" data-act="copy-path">Copy Path</button>
      <button class="gplus-btn" data-act="copy-raw">Copy Raw URL</button>
    `;
    on(bar, 'click', (e) => {
      const btn = e.target.closest('.gplus-btn');
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === 'raw') {
        const raw = getRawURL();
        raw ? open(raw, '_blank') : toast('Not a file view');
      }
      if (act === 'dl') downloadCurrent();
      if (act === 'copy-path') {
        const p = getRepoPath();
        p ? copyText(p) : toast('Not a file view');
      }
      if (act === 'copy-raw') {
        const raw = getRawURL();
        raw ? copyText(raw) : toast('Not a file view');
      }
    });
    return bar;
  }
  
    function placeSHBar() {
    if (!isGitHub()) return;
    if (qs('.gplus-shbar')) return;
    // 放在页面最顶（与 GitHub Header 不冲突，使用 sticky）
    const container = document.createElement('div');
    container.appendChild(buildSHBar());
    // 放在 #repo-content-pjax-container 前面，或 body 最前
    const anchor = qs('#repo-content-pjax-container') || qs('main') || document.body;
    anchor.parentElement.insertBefore(container, anchor);
  }

  function updateSHBar(recreate=false) {
    const bar = qs('.gplus-shbar');
    const on = enabled();
    // 仅在 GitHub 且开启时显示；非文件视图也可显示（按钮会提示）
    if (!on) {
      if (bar) bar.classList.add('gplus-hidden');
      return;
    }
    if (!bar || recreate) {
      if (bar) bar.remove();
      placeSHBar();
    } else {
      bar.classList.remove('gplus-hidden');
    }
  }

  /** ================= RAW 页面浮动工具条 ================= */
  function ensureRawBar() {
    if (!isRawHost()) return;
    if (qs('.gplus-rawbar')) return;
    const wrap = document.createElement('div');
    wrap.className = 'gplus-rawbar';
    wrap.innerHTML = `
      <button class="gplus-btn" data-act="back">Back to GitHub</button>
      <button class="gplus-btn" data-act="dl">Download</button>
      <button class="gplus-btn" data-act="copy">Copy URL</button>
    `;
    on(wrap, 'click', (e)=>{
      const b = e.target.closest('.gplus-btn'); if(!b) return;
      const act = b.dataset.act;
      if (act==='back') {
        // 尝试从 raw URL 还原 blob URL
        // raw: https://raw.githubusercontent.com/owner/repo/branch/path
        // blob: https://github.com/owner/repo/blob/branch/path
        try{
          const u = new URL(location.href);
          const [owner, repo, branch, ...p] = u.pathname.split('/').filter(Boolean);
          const blob = `https://github.com/${owner}/${repo}/blob/${branch}/${p.join('/')}`;
          open(blob, '_self');
        }catch{ history.back(); }
      }
      if (act==='dl') downloadCurrent();
      if (act==='copy') copyText(location.href);
    });
    document.body.appendChild(wrap);
  }

  function updateRawBar(recreate=false) {
    const onFlag = enabled();
    const bar = qs('.gplus-rawbar');
    if (!isRawHost()) return;
    if (!onFlag) { if (bar) bar.classList.add('gplus-hidden'); return; }
    if (!bar || recreate) { if (bar) bar.remove(); ensureRawBar(); }
    else { bar.classList.remove('gplus-hidden'); }
  }

  /** ================= PJAX / 动态路由适配 ================= */
  function boot() {
    ensureBadge();
    if (isGitHub()) {
      updateSHBar(true);
    } else if (isRawHost()) {
      updateRawBar(true);
    }
  }

  // 初次
  boot();

  // 监听 GitHub 的局部刷新
  const mo = new MutationObserver(() => {
    if (isGitHub()) updateSHBar();
  });
  mo.observe(document.documentElement, { subtree:true, childList:true });

  // 监听 URL 变化（应对 PJAX & 前进后退）
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      boot();
    }
  }, 400);
  })();