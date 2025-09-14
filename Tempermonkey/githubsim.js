// ==UserScript==
// @name         GitHub+ (MIKE版) 玻璃风格 + ScriptHub（常驻稳定版 · 移动增强）
// @namespace    https://mikephie.site/
// @version      2.3.0
// @description  玻璃风格常驻 ScriptHub 工具条（Raw/Download/Copy Path/Copy Raw URL/Copy Filename/Copy Repo/Open ScriptHub）；快捷键 r/d/p/u/f/s/h；可切换仅文件页显示；移动端自适配（底部工具条、横向滚动、触控优化、安全区）；兼容 PJAX 与 raw 页面。
// @author       Mikephie
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  /** ================= 样式（桌面 + 移动） ================= */
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

  /* ===== ScriptHub 顶部/底部工具条（桌面：顶部 sticky；移动：底部 fixed 横向滚动） ===== */
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
    flex: 0 0 auto;
  }
  .gplus-shbar .sub{
    color: var(--fg-dim);
    font-size: 12px;
    margin-right: auto;
    flex: 1 1 auto;
    min-width: 80px;
  }
  .gplus-btn{
    position: relative;
    border: 1px solid var(--glass-stroke);
    padding: 10px 14px;
    background: rgba(255,255,255,.06);
    border-radius: 12px;
    cursor: pointer;
    color: var(--fg);
    font-weight: 600;
    transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
    outline: none;
    min-height: 44px;          /* 触控足迹 */
    line-height: 1;
    flex: 0 0 auto;            /* 避免被压缩 */
  }
  .gplus-btn:hover{
    transform: translateY(-1px);
    box-shadow: 0 0 0 3px rgba(46,139,255,.20), 0 10px 30px rgba(0,0,0,.20);
  }
  .gplus-btn::after{
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 14px;
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
    right: max(18px, env(safe-area-inset-right, 0px));
    bottom: calc(20px + env(safe-area-inset-bottom, 0px));
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
    -webkit-backdrop-filter: blur(12px) saturate(150%);
    backdrop-filter: blur(12px) saturate(150%);
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
    top: max(8px, env(safe-area-inset-top, 0px));
    right: max(8px, env(safe-area-inset-right, 0px));
    left: max(8px, env(safe-area-inset-left, 0px));
    z-index: 2147483646;
    display: flex; gap: 8px; justify-content: flex-end;
    padding: 8px;
    pointer-events: none;
  }
  .gplus-rawbar .gplus-btn{ pointer-events: all; }

  /* ===== 移动端（<= 768px）：工具条固定在底部，横向滚动 ===== */
  @media (max-width: 768px) {
    .gplus-shbar{
      position: fixed;
      bottom: calc(0px + env(safe-area-inset-bottom, 0px));
      top: auto;
      left: 0; right: 0;
      border-top: 1px solid var(--glass-stroke);
      border-bottom: none;
      padding: 10px 10px calc(10px + env(safe-area-inset-bottom, 0px));
      gap: 8px;
      overflow-x: auto;            /* 横向滚动 */
      overscroll-behavior-x: contain;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;       /* 隐藏滚动条（Firefox）*/
    }
    .gplus-shbar::-webkit-scrollbar{ display:none; } /* 隐藏滚动条（WebKit）*/
    .gplus-shbar .title{ display:none; }
    .gplus-shbar .sub{ display:none; }
    .gplus-btn{ min-width: 120px; } /* 便于触控 */
    .gplus-badge{
      bottom: calc(68px + env(safe-area-inset-bottom, 0px)); /* 避开底部工具条 */
    }
  }
  `;

  /** ================= 工具 & 状态 ================= */
  const STORE_ENABLED = 'gplus.enabled';
  const STORE_ONLYBLOB = 'gplus.onlyBlob'; // "1" 表示仅文件页显示工具条
  const qs = (sel, root=document) => root.querySelector(sel);
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);

  const isGitHub = () => location.hostname === 'github.com';
  const isRawHost = () => location.hostname === 'raw.githubusercontent.com';

  const enabled = () => (localStorage.getItem(STORE_ENABLED) ?? '1') === '1';
  const setEnabled = (f) => localStorage.setItem(STORE_ENABLED, f ? '1' : '0');
  const onlyBlob = () => (localStorage.getItem(STORE_ONLYBLOB) ?? '0') === '1';
  const setOnlyBlob = (f) => localStorage.setItem(STORE_ONLYBLOB, f ? '1' : '0');

  function isBlobView() {
    if (!isGitHub()) return false;
    const parts = location.pathname.split('/').filter(Boolean);
    // /owner/repo/blob/branch/path...
    return parts.length >= 5 && parts[2] === 'blob';
  }

  function getRepoSlug() {
    if (!isGitHub()) return '';
    const p = location.pathname.split('/').filter(Boolean);
    return p.length >= 2 ? `${p[0]}/${p[1]}` : '';
  }

  function getRepoPath() {
    if (!isBlobView()) return '';
    const parts = location.pathname.split('/').filter(Boolean);
    return parts.slice(4).join('/');
  }

  function getFileName() {
    const path = getRepoPath();
    if (!path) return '';
    const seg = path.split('/');
    return seg[seg.length - 1] || '';
  }

  function getRawURL() {
    if (isRawHost()) return location.href;
    if (!isGitHub()) return null;
    // 支持 /blob/ 与 /raw/ 两种路径
    const href = location.href.split('#')[0].split('?')[0];
    if (isBlobView()) return href.replace('/blob/', '/raw/');
    const m = href.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
    if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
    return null;
  }

  async function downloadCurrent() {
    const raw = getRawURL();
    if (!raw) return;
    try {
      const res = await fetch(raw, { credentials: 'omit' });
      const buf = await res.blob();
      const url = URL.createObjectURL(buf);
      const a = document.createElement('a');
      const name = getFileName() || 'download';
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch {
      open(raw, '_blank');
    }
  }

  async function copyText(t) {
    if (!t) return toast('Empty');
    try { await navigator.clipboard.writeText(t); toast('Copied'); }
    catch { prompt('Copy manually:', t); }
  }

  function toast(msg) {
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

  /** ================= 右下徽标（开关 + Alt 切换显示范围） ================= */
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

    on(badge, 'click', (e) => {
      if (e.altKey) {
        const next = !onlyBlob();
        setOnlyBlob(next);
        toast(next ? '仅文件页显示工具条' : '所有页面显示工具条');
        if (isGitHub()) updateSHBar(true);
        return;
      }
      const next = !enabled();
      setEnabled(next);
      badge.classList.toggle('off', !next);
      badge.querySelector('.text').textContent = `Tap to ${next ? 'Off' : 'On'}`;
      if (isGitHub()) updateSHBar(true);
      else if (isRawHost()) updateRawBar(true);
      toast(next ? 'GitHubPlus Enabled' : 'GitHubPlus Disabled');
    });

    document.body.appendChild(badge);
  }

  /** ================= 顶部/底部 ScriptHub 工具条 ================= */
  function buildSHBar() {
    const bar = document.createElement('div');
    bar.className = 'gplus-shbar';
    bar.innerHTML = `
      <span class="title">ScriptHub</span>
      <span class="sub">Raw • Download • Copy</span>
      <button class="gplus-btn" data-act="raw" title="r">Raw</button>
      <button class="gplus-btn" data-act="dl"  title="d">Download</button>
      <button class="gplus-btn" data-act="copy-path" title="p">Copy Path</button>
      <button class="gplus-btn" data-act="copy-raw"  title="u">Copy Raw URL</button>
      <button class="gplus-btn" data-act="copy-fn"   title="f">Copy Filename</button>
      <button class="gplus-btn" data-act="copy-repo" title="s">Copy Repo</button>
      <button class="gplus-btn" data-act="hub"       title="h">Open ScriptHub</button>
    `;
    on(bar, 'click', (e) => {
      const btn = e.target.closest('.gplus-btn');
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === 'raw')        { const raw = getRawURL(); raw ? open(raw, '_blank') : toast('Not a file view'); }
      if (act === 'dl')         { downloadCurrent(); }
      if (act === 'copy-path')  { const p = getRepoPath();  p ? copyText(p) : toast('Not a file view'); }
      if (act === 'copy-raw')   { const raw = getRawURL();  raw ? copyText(raw) : toast('Not a file view'); }
      if (act === 'copy-fn')    { const fn = getFileName(); fn ? copyText(fn) : toast('Not a file view'); }
      if (act === 'copy-repo')  { const rp = getRepoSlug(); rp ? copyText(rp) : toast('Not in repo'); }
      if (act === 'hub')        {
        const raw = getRawURL();
        if (!raw) return toast('Not a file view');
        const enc = encodeURIComponent(raw);
        const url = "http://script.hub/convert/_start_/" + enc + "/_end_/plain.txt?type=plain-text&target=plain-text";
        open(url, '_blank');
      }
    });
    return bar;
  }

  function placeSHBar() {
    if (!isGitHub()) return;
    if (qs('.gplus-shbar')) return;
    const only = onlyBlob();
    if (only && !isBlobView()) return; // 仅文件页显示

    const container = document.createElement('div');
    container.appendChild(buildSHBar());
    const anchor = qs('#repo-content-pjax-container') || qs('main') || document.body;
    anchor.parentElement.insertBefore(container, anchor);
  }

  function updateSHBar(recreate=false) {
    const bar = qs('.gplus-shbar');
    const onUI = enabled();
    const only = onlyBlob();

    if (!isGitHub()) return;
    if (!onUI || (only && !isBlobView())) {
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
      <button class="gplus-btn" data-act="back" title="b">Back to GitHub</button>
      <button class="gplus-btn" data-act="dl"   title="d">Download</button>
      <button class="gplus-btn" data-act="copy" title="u">Copy URL</button>
    `;
    on(wrap, 'click', (e)=>{
      const b = e.target.closest('.gplus-btn'); if(!b) return;
      const act = b.dataset.act;
      if (act==='back') {
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

  /** ================= 快捷键（桌面优先；移动端无碍） ================= */
  function handleHotkeys(e){
    const tag = (e.target.tagName || '').toLowerCase();
    if (/(input|textarea|select)/.test(tag) || e.target.isContentEditable) return;

    const key = (e.key||'').toLowerCase();
    if (key==='r'){ const raw=getRawURL(); if(raw) open(raw,'_blank'); }
    if (key==='d'){ downloadCurrent(); }
    if (key==='p'){ const p=getRepoPath(); if(p) copyText(p); }
    if (key==='u'){ const raw=getRawURL(); if(raw) copyText(raw); }
    if (key==='f'){ const fn=getFileName(); if(fn) copyText(fn); }
    if (key==='s'){ const rp=getRepoSlug(); if(rp) copyText(rp); }
    if (key==='h'){
      const raw=getRawURL();
      if(raw){
        const enc=encodeURIComponent(raw);
        const url="http://script.hub/convert/_start_/"+enc+"/_end_/plain.txt?type=plain-text&target=plain-text";
        open(url,'_blank');
      }
    }
  }

  /** ================= 启动 / 监听 ================= */
  function boot() {
    ensureBadge();
    if (isGitHub()) {
      updateSHBar(true);
      window.addEventListener('keydown', handleHotkeys, {passive:true});
    } else if (isRawHost()) {
      updateRawBar(true);
      window.addEventListener('keydown', handleHotkeys, {passive:true});
    }
  }

  // 初次
  boot();

  // GitHub 局部刷新
  const mo = new MutationObserver(() => {
    if (isGitHub()) updateSHBar();
  });
  mo.observe(document.documentElement, { subtree:true, childList:true });

  // URL 变化（PJAX & 前进后退）
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      boot();
    }
  }, 400);

})();