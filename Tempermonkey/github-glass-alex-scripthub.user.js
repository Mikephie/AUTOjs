// ==UserScript==
// @name         GitHub+ (Alex版) 玻璃风格 + ScriptHub（嵌入式）
// @namespace    https://mikephie.site/
// @version      1.5.1
// @description  基于 Alex 源脚本：应用玻璃拟态风格，并在面板按钮区嵌入 ScriptHub 转换按钮。无额外悬浮窗/顶部Tab，整体 UI 一致。
// @author       Mikephie
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// @license      MIT
// @require      https://gist.githubusercontent.com/Alex0510/a7fe6be108d1b303d25301413dd125cb/raw/github.user.js
// ==/UserScript==

(function () {
  'use strict';

  /* ============ 玻璃风格 + 按钮发光/反馈 ============ */
  const STYLE_ID = '__alex_glass_style_all__';
  function injectStyle(id, css) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = css;
  }

  injectStyle(STYLE_ID, `
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

  /* 容器玻璃化 */
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

  /* 标题 */
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

  /* 按钮玻璃化 + 内发光 + 点击反馈 */
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

  /* Chip/Tag */
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

  /* 弹窗动作区间距 */
  .gh-dialog .gh-actions, .gh-popup .gh-actions, .gh-modal .gh-actions { gap: 8px !important; }
  `);

  /* ============ ScriptHub 按钮注入（仅面板内） ============ */
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

  const TARGET_SELECTORS = [
    '.gh-gists-header-buttons',
    '.gh-header-actions',
    '.gh-dialog .gh-actions',
    '.gh-panel .gh-actions',
  ];

  function injectSHButton() {
    let host = null;
    for (const sel of TARGET_SELECTORS) {
      host = document.querySelector(sel);
      if (host) break;
    }
    if (!host || host.querySelector('[data-alex-sh-btn]')) return;

    const btn = document.createElement('button');
    btn.setAttribute('data-alex-sh-btn', '1');
    btn.className = 'gh-header-btn';
    btn.textContent = 'ScriptHub 转换';
    btn.style.marginLeft = '8px';
    btn.addEventListener('click', openScriptHub);
    host.appendChild(btn);
  }

  function render(){ injectSHButton(); }
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