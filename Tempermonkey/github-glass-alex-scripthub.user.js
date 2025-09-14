// ==UserScript==
// @name         GitHub+ (Alex版) 玻璃风格 + ScriptHub（嵌入式, 强制玻璃 v1.6.2）
// @namespace    https://mikephie.site/
// @version      1.6.2
// @description  iOS/Userscripts 适配：用内联样式强制毛玻璃；ScriptHub 只嵌入 Alex 面板按钮区或 Raw/下载/编辑按钮旁。无悬浮窗/无顶部Tab。
// @author       Mikephie
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  /* ========== 全局 CSS（按钮、输入等玻璃化） ========== */
  const CSS = `
  :root{
    --glass-bg: rgba(255,255,255,.10);
    --glass-stroke: rgba(255,255,255,.26);
    --glass-shadow: 0 18px 50px rgba(0,0,0,.35);
    --glass-fg: #e6edf3;
    --btn-bg: rgba(255,255,255,.10);
    --divider: rgba(255,255,255,.14);
  }
  @media (prefers-color-scheme: light){
    :root{
      --glass-fg:#111;
      --btn-bg: rgba(255,255,255,.12);
    }
  }

  .gh-header-btn, .gh-download-btn, .gh-copy-btn,
  .btn, .Button, .Button--secondary, .btn-primary {
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
  .btn:hover, .Button:hover, .gh-header-btn:hover {
    transform: translateY(-1px) !important;
    box-shadow: inset 0 1px 2px rgba(255,255,255,.3), 0 6px 18px rgba(0,0,0,.28) !important;
  }
  .btn:active, .Button:active, .gh-header-btn:active {
    transform: translateY(1px) !important;
    box-shadow: inset 0 1px 3px rgba(0,0,0,.4) !important;
  }

  input[type="text"], input[type="search"], input[type="password"], textarea, select {
    background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02)) !important;
    color: var(--glass-fg) !important;
    border: 1px solid var(--glass-stroke) !important;
    border-radius: 12px !important;
    backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important;
  }
  `;
  (function injectStyle(){
    const id='__alex_glass_v162__';
    if (document.getElementById(id)) return;
    const s=document.createElement('style'); s.id=id; s.textContent=CSS; document.head.appendChild(s);
  })();

  /* ========== 强制玻璃：对实际弹窗/面板做内联覆写 ========== */
  const FORCE_SELECTORS = [
    // Alex 脚本常见容器（猜测前缀 gh-）
    '[class*="gh-"]',
    // GitHub 自身的弹窗/容器
    '.Box', '.Box-header', '.Box-body', '.Popover', '.Overlay'
  ];
  function looksLikePanel(el){
    const cs = getComputedStyle(el);
    const pos = cs.position;
    const z = parseInt(cs.zIndex || '0', 10);
    const radius = parseFloat(cs.borderTopLeftRadius||'0');
    const w = el.getBoundingClientRect().width;
    const h = el.getBoundingClientRect().height;
    // 具备弹窗特征：固定/绝对 + 较高 zIndex + 有圆角 + 宽高>200
    return ((pos==='fixed' || pos==='absolute') && (z>=10) && (radius>=8) && (w>=200 && h>=120));
  }
  function forceGlass(el){
    if (el.__glassified) return;
    el.__glassified = true;
    const st = el.style;
    // 清除不透明背景
    st.backgroundColor = 'transparent';
    st.backgroundImage = 'none';
    // 设置半透明渐变 + 毛玻璃
    st.background = 'linear-gradient(135deg, var(--glass-bg), rgba(255,255,255,0.02))';
    st.backdropFilter = 'blur(16px) saturate(1.15)';
    st.webkitBackdropFilter = 'blur(16px) saturate(1.15)';
    st.border = '1px solid var(--glass-stroke)';
    st.borderRadius = st.borderRadius || '16px';
    st.boxShadow = 'var(--glass-shadow)';
  }
  function sweepPanels(){
    FORCE_SELECTORS.forEach(sel=>{
      document.querySelectorAll(sel).forEach(el=>{
        if (looksLikePanel(el)) forceGlass(el);
      });
    });
  }

  /* ========== ScriptHub：仅嵌入 Alex 面板按钮区/或 Raw 相关按钮旁 ========== */
  const HOST_SELECTORS = [
    '.gh-gists-header-buttons',
    '.gh-header-actions',
    '.gh-dialog .gh-actions',
    '.gh-panel .gh-actions'
  ];
  const BTN_TEXTS = ['打开Raw文件','打开 Raw','Raw','下载文件','下载','编辑文件','编辑','Open Raw','Download','Edit'];

  function findHost(){
    for (const sel of HOST_SELECTORS){
      const n = document.querySelector(sel);
      if (n) return n;
    }
    // 退化：跟随 Raw/下载/编辑类按钮
    const candidates = Array.from(document.querySelectorAll('button,a')).filter(el=>{
      const t=(el.textContent||'').trim();
      return BTN_TEXTS.includes(t);
    });
    if (candidates.length){
      // 放到第一个按钮的父容器里
      return candidates[0].parentElement || candidates[0].closest('div,span,section');
    }
    return null;
  }

  function getRawUrl(href){
    href=(href||location.href).split('#')[0].split('?')[0];
    if (/^https?:\/\/raw\.githubusercontent\.com\//.test(href)) return href;
    let m = href.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
    if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
    m = href.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
    if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
    const a=document.querySelector('a.Link--primary[href*="/blob/"]');
    if (a) return getRawUrl(a.href);
    return null;
  }
  function openScriptHub(){
    const raw=getRawUrl(); if (!raw) return;
    const url=`http://script.hub/convert/_start_/${encodeURIComponent(raw)}/_end_/plain.txt?type=plain-text&target=plain-text`;
    window.open(url,'_blank','noopener,noreferrer');
  }
  function injectSHButton(){
    const host = findHost();
    if (!host || host.querySelector('[data-alex-sh-btn]')) return;
    const btn=document.createElement('button');
    btn.setAttribute('data-alex-sh-btn','1');
    btn.className='gh-header-btn';
    btn.textContent='ScriptHub 转换';
    btn.style.marginLeft='8px';
    btn.addEventListener('click', openScriptHub);
    // 如果 host 是 flex/按钮行，直接 append；否则紧挨 Raw 按钮后插入
    const rawBtn = Array.from(host.querySelectorAll('button,a')).find(el=>['打开Raw文件','打开 Raw','Raw','Open Raw'].includes((el.textContent||'').trim()));
    if (rawBtn && rawBtn.parentElement===host) rawBtn.insertAdjacentElement('afterend', btn);
    else host.appendChild(btn);
  }

  /* ========== 渲染管线：初次 + DOM 变化 + 路由变化 ========== */
  function render(){ injectSHButton(); sweepPanels(); }

  const mo=new MutationObserver(render);
  mo.observe(document.documentElement,{childList:true,subtree:true});

  const _p = history.pushState, _r = history.replaceState;
  history.pushState = function(){ const ret=_p.apply(this, arguments); queueMicrotask(render); return ret; };
  history.replaceState = function(){ const ret=_r.apply(this, arguments); queueMicrotask(render); return ret; };
  window.addEventListener('popstate', render, false);

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', render, {once:true});
  else render();
})();