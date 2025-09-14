// ==UserScript==
// @name         GitHub+ (Alex版) 玻璃风格 + ScriptHub（嵌入式, 无@require）
// @namespace    https://mikephie.site/
// @version      1.6.0
// @description  不改 Alex 逻辑：应用玻璃拟态样式，并把 ScriptHub 转换按钮"只嵌进 Alex 面板按钮区"。无悬浮窗/无顶部Tab；iOS Userscripts 兼容（无 @require / 无 GM_*）。
// @author       Mikephie
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  /* ---------------- 样式（玻璃 + 按钮内发光/按压反馈） ---------------- */
  const CSS = `
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

  /* Alex 渲染容器/弹窗/Box 等 */
  .gh-panel,
  .gh-gists-header,
  .gh-release-item,
  .gh-release-header,
  .gh-release-body,
  .gh-release-assets,
  .gh-asset-item,
  .gh-dialog,
  .gh-popup,
  .gh-modal,
  .Box, .Box-header, .Box-body {
    border-radius: 16px !important;
    border: 1px solid var(--glass-stroke) !important;
    background: linear-gradient(135deg, var(--glass-bg), rgba(255,255,255,0.02)) !important;
    backdrop-filter: blur(16px) saturate(1.15);
    -webkit-backdrop-filter: blur(16px) saturate(1.15);
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

  /* 标题/副标题 */
  .gh-gists-title, .gh-release-title, .markdown-title, .h1, .h2, h1, h2 {
    color: var(--glass-fg) !important;
    letter-spacing: .2px;
  }
  .gh-section-title, .Box-header .h3, .h3, h3 {
    color: var(--glass-fg) !important;
    opacity: .9;
  }

  /* 分割线 */
  hr, .Box-row--drag-hide::after { border-color: var(--divider) !important; opacity: .6 !important; }

  /* Alex 原按钮统一玻璃化 + 内发光 + 反馈 */
  .gh-header-btn,
  .gh-download-btn,
  .gh-copy-btn,
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
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition: transform .08s ease, box-shadow .2s ease;
    box-shadow: inset 0 1px 2px rgba(255,255,255,.25),
                0 4px 12px rgba(0,0,0,.25);
  }
  .gh-header-btn:hover,
  .gh-download-btn:hover,
  .gh-copy-btn:hover,
  .btn:hover, .Button:hover {
    transform: translateY(-1px);
    box-shadow: inset 0 1px 2px rgba(255,255,255,.3),
                0 6px 18px rgba(0,0,0,.28);
  }
  .btn:active, .Button:active, .gh-header-btn:active {
    transform: translateY(1px);
    box-shadow: inset 0 1px 3px rgba(0,0,0,.4);
  }

  /* Tag/Chip */
  .Label, .IssueLabel, .Counter, .topic-tag {
    border-radius: 10px !important;
    background: var(--chip-bg) !important;
    border: 1px solid var(--glass-stroke) !important;
    color: var(--glass-fg) !important;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  /* 输入框 */
  input[type="text"], input[type="search"], input[type="password"], textarea, select {
    background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02)) !important;
    color: var(--glass-fg) !important;
    border: 1px solid var(--glass-stroke) !important;
    border-radius: 12px !important;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  input::placeholder, textarea::placeholder { color: rgba(127,127,127,.8) !important; }
  `;

  function injectStyle(css, id='__alex_glass_v16__'){
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id; s.textContent = css;
    document.head.appendChild(s);
  }

  /* ---------------- ScriptHub 仅嵌入 Alex 按钮区 ---------------- */
  const HOST_SELECTORS = [
    '.gh-gists-header-buttons',
    '.gh-header-actions',
    '.gh-dialog .gh-actions',
    '.gh-panel .gh-actions',
  ];

  function findHost() {
    for (const sel of HOST_SELECTORS) {
      const node = document.querySelector(sel);
      if (node) return node;
    }
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

  function injectButton(host) {
    if (!host || host.querySelector('[data-alex-sh-btn]')) return;
    const btn = document.createElement('button');
    btn.setAttribute('data-alex-sh-btn', '1');
    btn.className = 'gh-header-btn';
    btn.textContent = 'ScriptHub 转换';
    btn.style.marginLeft = '8px';
    btn.addEventListener('click', openScriptHub);
    host.appendChild(btn);
  }

  /* ---------------- 渲染 & 监听（适配 SPA） ---------------- */
  function tryRender() {
    injectStyle(CSS);
    const host = findHost();
    if (host) injectButton(host);
  }

  // 初次 & DOM 变化（等待 Alex 面板挂载）
  const mo = new MutationObserver(() => tryRender());
  mo.observe(document.documentElement, { childList: true, subtree: true });

  // 路由变化
  const _p = history.pushState, _r = history.replaceState;
  history.pushState = function(){ const ret=_p.apply(this, arguments); queueMicrotask(tryRender); return ret; };
  history.replaceState = function(){ const ret=_r.apply(this, arguments); queueMicrotask(tryRender); return ret; };
  window.addEventListener('popstate', tryRender, false);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryRender, { once:true });
  } else {
    tryRender();
  }
})();