// ==UserScript==
// @name         GitHub+ (Alex版) 玻璃风格 + ScriptHub（嵌入式, 强制玻璃 v1.6.1）
// @namespace    https://mikephie.site/
// @version      1.6.1
// @description  不改 Alex 逻辑：玻璃拟态（含内联样式覆写，确保命中面板/弹窗），ScriptHub 仅嵌入按钮区；iOS Userscripts 兼容（无 @require / 无 GM_*）。
// @author       Mikephie
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  /* ========== 1) 基础 CSS（全站覆盖 + !important） ========== */
  const BASE_CSS = `
  :root{
    --glass-bg: rgba(255,255,255,.10);
    --glass-stroke: rgba(255,255,255,.26);
    --glass-shadow: 0 18px 50px rgba(0,0,0,.35);
    --glass-fg: #111;
    --btn-bg: rgba(255,255,255,.12);
    --chip-bg: rgba(255,255,255,.16);
    --divider: rgba(255,255,255,.18);
  }
  [data-color-mode="dark"] :root, [data-dark-theme] :root{
    --glass-bg: rgba(13,16,23,.40);
    --glass-stroke: rgba(255,255,255,.16);
    --glass-shadow: 0 20px 60px rgba(0,0,0,.6);
    --glass-fg: #e6edf3;
    --btn-bg: rgba(255,255,255,.08);
    --chip-bg: rgba(255,255,255,.10);
    --divider: rgba(255,255,255,.10);
  }

  /* 覆盖 Alex 常用容器（class 以 gh- 开头）与 GitHub Box */
  .gh-panel, .gh-gists-header, .gh-release-item, .gh-release-header, .gh-release-body,
  .gh-release-assets, .gh-asset-item, .gh-dialog, .gh-popup, .gh-modal,
  .Box, .Box-header, .Box-body,
  [class^="gh-"], [class*=" gh-"] {
    border-radius: 16px !important;
    border: 1px solid var(--glass-stroke) !important;
    background: linear-gradient(135deg, var(--glass-bg), rgba(255,255,255,0.02)) !important;
    backdrop-filter: blur(16px) saturate(1.15) !important;
    -webkit-backdrop-filter: blur(16px) saturate(1.15) !important;
    box-shadow: var(--glass-shadow) !important;
  }

  /* 列表卡片化 */
  .gh-release-item, .gh-asset-item, .Box-row, .file-info, .commit {
    border-radius: 12px !important;
    border: 1px solid var(--divider) !important;
    margin: 8px 0 !important;
    padding: 10px 12px !important;
    background: linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.00)) !important;
  }

  /* 通用按钮（含 Alex 的 gh-header-btn） */
  .gh-header-btn, .gh-download-btn, .gh-copy-btn,
  .btn, .Button, .Button--secondary, .btn-primary {
    background: var(--btn-bg) !important;
    color: var(--glass-fg) !important;
    border: 1px solid var(--glass-stroke) !important;
    border-radius: 12px !important;
    height: 34px !important;
    padding: 0 12px !important;
    line-height: 34px !important;
    display: inline-flex !important;
    align-items: center; gap: 8px;
    backdrop-filter: blur(8px) !important;
    -webkit-backdrop-filter: blur(8px) !important;
    transition: transform .08s ease, box-shadow .2s ease !important;
    box-shadow: inset 0 1px 2px rgba(255,255,255,.25),
                0 4px 12px rgba(0,0,0,.25) !important;
  }
  .gh-header-btn:hover, .gh-download-btn:hover, .gh-copy-btn:hover,
  .btn:hover, .Button:hover {
    transform: translateY(-1px) !important;
    box-shadow: inset 0 1px 2px rgba(255,255,255,.3),
                0 6px 18px rgba(0,0,0,.28) !important;
  }
  .btn:active, .Button:active, .gh-header-btn:active {
    transform: translateY(1px) !important;
    box-shadow: inset 0 1px 3px rgba(0,0,0,.4) !important;
  }
  `;
  function injectStyle(css, id='__alex_glass_v161__'){
    let s = document.getElementById(id);
    if (!s) { s = document.createElement('style'); s.id = id; document.head.appendChild(s); }
    s.textContent = css;
  }
  injectStyle(BASE_CSS);

  /* ========== 2) "强制玻璃"内联覆写（兜底，防被 Alex 内联/高优先级样式盖掉） ========== */
  const FORCE_SELECTORS = [
    '.gh-panel','.gh-dialog','.gh-popup','.gh-modal',
    '.gh-gists-header','.gh-release-item','.gh-release-header',
    '.gh-release-body','.gh-release-assets','.gh-asset-item'
  ];
  function forceGlass(node){
    if (!node) return;
    const style = node.style;
    // 只在未处理过时打标
    if (node.__glassified) return;
    node.__glassified = true;
    style.backdropFilter = 'blur(16px) saturate(1.15)';
    style.webkitBackdropFilter = 'blur(16px) saturate(1.15)';
    style.background = 'linear-gradient(135deg, var(--glass-bg), rgba(255,255,255,0.02))';
    style.border = '1px solid var(--glass-stroke)';
    style.borderRadius = '16px';
    style.boxShadow = 'var(--glass-shadow)';
  }
  function sweepForceGlass(){
    FORCE_SELECTORS.forEach(sel => {
      document.querySelectorAll(sel).forEach(forceGlass);
    });
    // 兼容：凡是 class 含 gh- 且具备弹窗定位特征的也强制
    document.querySelectorAll('[class*="gh-"]').forEach(el=>{
      const cs = getComputedStyle(el);
      if (['fixed','absolute','sticky'].includes(cs.position) || cs.zIndex >= 100) {
        forceGlass(el);
      }
    });
  }

  /* ========== 3) ScriptHub 仅嵌入 Alex 按钮区 ========== */
  const HOST_SELECTORS = [
    '.gh-gists-header-buttons',
    '.gh-header-actions',
    '.gh-dialog .gh-actions',
    '.gh-panel .gh-actions'
  ];
  // 额外：若没有标准按钮区，则"跟随 Raw/下载/编辑按钮"
  const RAW_BTN_TEXTS = ['打开Raw文件','打开 Raw','Open Raw','Raw'];
  const DL_BTN_TEXTS  = ['下载文件','下载','Download'];
  const EDIT_BTN_TEXTS= ['编辑文件','编辑','Edit'];

  function findHost() {
    for (const sel of HOST_SELECTORS) {
      const n = document.querySelector(sel);
      if (n) return n;
    }
    // 退化：找已有按钮所在行
    const btns = Array.from(document.querySelectorAll('button,a')).filter(el=>{
      const t = (el.textContent||'').trim();
      return RAW_BTN_TEXTS.includes(t) || DL_BTN_TEXTS.includes(t) || EDIT_BTN_TEXTS.includes(t);
    });
    if (btns.length) return btns[0].parentElement; // 按钮的父容器
    return null;
  }

  function getRawUrl(href) {
    href = (href || location.href).split('#')[0].split('?')[0];
    if (/^https?:\/\/raw\.githubusercontent\.com\//.test(href)) return href;
    let m = href.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
    if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
    m = href.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
    if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
    const a = document.querySelector('a.Link--primary[href*="/blob/"]');
    if (a) return getRawUrl(a.href);
    return null;
  }

  function openScriptHub() {
    const raw = getRawUrl();
    if (!raw) return;
    const url = `http://script.hub/convert/_start_/${encodeURIComponent(raw)}/_end_/plain.txt?type=plain-text&target=plain-text`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function injectSHButton() {
    const host = findHost();
    if (!host || host.querySelector('[data-alex-sh-btn]')) return;

    const btn = document.createElement('button');
    btn.setAttribute('data-alex-sh-btn','1');
    btn.className = 'gh-header-btn';
    btn.textContent = 'ScriptHub 转换';
    btn.style.marginLeft = '8px';
    btn.addEventListener('click', openScriptHub);
    host.appendChild(btn);
  }

  /* ========== 4) 渲染 & 监听：适配 SPA + 等待 Alex 挂载 ========== */
  function render(){
    injectSHButton();
    sweepForceGlass();
  }

  const mo = new MutationObserver(render);
  mo.observe(document.documentElement, { childList: true, subtree: true });

  const _p = history.pushState, _r = history.replaceState;
  history.pushState = function(){ const ret=_p.apply(this, arguments); queueMicrotask(render); return ret; };
  history.replaceState = function(){ const ret=_r.apply(this, arguments); queueMicrotask(render); return ret; };
  window.addEventListener('popstate', render, false);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render, { once:true });
  } else {
    render();
  }
})();