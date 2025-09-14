// ==UserScript==
// @name         GitHub+ (Alex版) 玻璃风格 + ScriptHub（嵌入式, 自适配 v1.8）
// @namespace    https://mikephie.site/
// @version      1.8.0
// @description  不改 Alex 逻辑；自动识别弹窗/面板并强制玻璃；ScriptHub 仅嵌入"Raw/下载/编辑"按钮旁；适配 document + shadowRoot + 同域 iframe；iOS Userscripts OK。
// @author       Mikephie
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  /* ---------------- 基础样式（类名 x-glassified 专用，带 !important） ---------------- */
  const BASE_CSS = `
  :root{
    --glass-bg: rgba(255,255,255,.10);
    --glass-stroke: rgba(255,255,255,.26);
    --glass-shadow: 0 18px 50px rgba(0,0,0,.35);
    --glass-fg: #e6edf3;
    --btn-bg: rgba(255,255,255,.10);
    --divider: rgba(255,255,255,.14);
  }
  @media (prefers-color-scheme: light){
    :root{ --glass-fg:#111; --btn-bg: rgba(255,255,255,.12); }
  }

  .x-glassified{
    border-radius: 16px !important;
    border: 1px solid var(--glass-stroke) !important;
    background: linear-gradient(135deg, var(--glass-bg), rgba(255,255,255,0.02)) !important;
    backdrop-filter: blur(16px) saturate(1.15) !important;
    -webkit-backdrop-filter: blur(16px) saturate(1.15) !important;
    box-shadow: var(--glass-shadow) !important;
  }
  .x-glassified .btn,
  .x-glassified .Button,
  .x-glassified .gh-header-btn,
  .x-glassified .gh-download-btn,
  .x-glassified .gh-copy-btn{
    background: var(--btn-bg) !important;
    color: var(--glass-fg) !important;
    border: 1px solid var(--glass-stroke) !important;
    border-radius: 12px !important;
    height: 34px !important;
    padding: 0 12px !important;
    line-height: 34px !important;
    display: inline-flex !important; align-items:center; gap:8px;
    backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important;
    transition: transform .08s ease, box-shadow .2s ease !important;
    box-shadow: inset 0 1px 2px rgba(255,255,255,.25), 0 4px 12px rgba(0,0,0,.25) !important;
  }
  .x-glassified .btn:hover, .x-glassified .Button:hover, .x-glassified .gh-header-btn:hover{
    transform: translateY(-1px) !important;
    box-shadow: inset 0 1px 2px rgba(255,255,255,.3), 0 6px 18px rgba(0,0,0,.28) !important;
  }
  .x-glassified .btn:active, .x-glassified .Button:active, .x-glassified .gh-header-btn:active{
    transform: translateY(1px) !important;
    box-shadow: inset 0 1px 3px rgba(0,0,0,.4) !important;
  }
  `;
  function injectStyle(root, id='__alex_glass_v18__'){
    const doc = root instanceof ShadowRoot ? root : document;
    if (doc.getElementById && doc.getElementById(id)) return;
    const s = document.createElement('style'); s.id = id; s.textContent = BASE_CSS;
    (root.head || root).appendChild(s);
  }

  /* ---------------- 判定"像弹窗/面板"的盒子 ---------------- */
  function looksLikePanel(el){
    const cs = getComputedStyle(el);
    const pos = cs.position;
    if (!(pos === 'fixed' || pos === 'absolute')) return false;
    const z  = parseInt(cs.zIndex || '0', 10);
    if (z < 10) return false;
    const r  = Math.max(
      parseFloat(cs.borderTopLeftRadius || '0'),
      parseFloat(cs.borderTopRightRadius || '0'),
      parseFloat(cs.borderBottomLeftRadius || '0'),
      parseFloat(cs.borderBottomRightRadius || '0')
    );
    const rect = el.getBoundingClientRect();
    return r >= 8 && rect.width >= 200 && rect.height >= 120;
  }

  function forceGlassInline(el){
    if (el.__glassified) return;
    el.__glassified = true;
    el.classList.add('x-glassified'); // 让 CSS 带 !important 的覆盖兜底
    const st = el.style;
    st.background = 'linear-gradient(135deg, var(--glass-bg), rgba(255,255,255,0.02))';
    st.backgroundColor = 'transparent';
    st.backgroundImage = 'none';
    st.backdropFilter = 'blur(16px) saturate(1.15)';
    st.webkitBackdropFilter = 'blur(16px) saturate(1.15)';
    st.border = '1px solid var(--glass-stroke)';
    if (!st.borderRadius) st.borderRadius = '16px';
    st.boxShadow = 'var(--glass-shadow)';
  }

  function sweepPanels(scope){
    scope.querySelectorAll?.('*').forEach(el=>{
      try { if (looksLikePanel(el)) forceGlassInline(el); } catch(e){}
    });
  }

  /* ---------------- ScriptHub 仅嵌入：找 Raw/下载/编辑 按钮行 ---------------- */
  const BTN_TEXTS = ['打开Raw文件','打开 Raw','Raw','Open Raw','下载文件','下载','Download','编辑文件','编辑','Edit'];

  function getRawUrl(href, scope){
    href=(href||location.href).split('#')[0].split('?')[0];
    if (/^https?:\/\/raw\.githubusercontent\.com\//.test(href)) return href;
    let m = href.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
    if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
    m = href.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
    if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
    const a = scope.querySelector?.('a.Link--primary[href*="/blob/"]');
    if (a) return getRawUrl(a.href, scope);
    return null;
  }

  function injectSH(scope){
    if (!scope.querySelector) return;
    if (scope.querySelector('[data-alex-sh-btn]')) return;

    // 找到 Raw/下载/编辑其中任意一个按钮
    const buttons = Array.from(scope.querySelectorAll('button,a')).filter(el=>{
      const t=(el.textContent||'').trim();
      return BTN_TEXTS.includes(t);
    });
    if (!buttons.length) return;

    const host = buttons[0].parentElement || buttons[0].closest('div,span,section') || scope;
    const btn = (scope.ownerDocument || document).createElement('button');
    btn.setAttribute('data-alex-sh-btn','1');
    btn.className='gh-header-btn';
    btn.textContent='ScriptHub 转换';
    btn.style.marginLeft='8px';
    btn.addEventListener('click', ()=>{
      const raw = getRawUrl(undefined, scope);
      if (!raw) return;
      const url = `http://script.hub/convert/_start_/${encodeURIComponent(raw)}/_end_/plain.txt?type=plain-text&target=plain-text`;
      window.open(url,'_blank','noopener,noreferrer');
    });

    // 紧挨第一个候选按钮后面插入
    buttons[0].insertAdjacentElement('afterend', btn);
    // 让按钮所在容器也有玻璃（更和谐）
    const panel = host.closest?.('.x-glassified') || host.closest?.('div,section,dialog');
    panel && forceGlassInline(panel);
  }

  /* ---------------- 在 document / shadowRoot / 同域 iframe 内执行一遍 ---------------- */
  function processRoot(root){
    injectStyle(root);
    sweepPanels(root);
    injectSH(root);
  }

  function scanAll(){
    // 主文档
    processRoot(document);
    // Shadow DOM
    const walker = document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.shadowRoot) processRoot(node.shadowRoot);
    }
    // 同域 iframe
    document.querySelectorAll('iframe').forEach(iframe=>{
      try {
        const doc = iframe.contentDocument;
        if (doc && doc.location && doc.location.origin === location.origin) processRoot(doc);
      } catch(e){} // 跨域忽略
    });
  }

  /* ---------------- 监听 DOM & 路由变化 ---------------- */
  const mo = new MutationObserver(() => scanAll());
  mo.observe(document.documentElement, { childList:true, subtree:true });

  const _p = history.pushState, _r = history.replaceState;
  history.pushState = function(){ const ret=_p.apply(this, arguments); queueMicrotask(scanAll); return ret; };
  history.replaceState = function(){ const ret=_r.apply(this, arguments); queueMicrotask(scanAll); return ret; };
  window.addEventListener('popstate', scanAll, false);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanAll, { once:true });
  } else {
    scanAll();
  }
})();