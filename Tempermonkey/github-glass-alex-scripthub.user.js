// ==UserScript==
// @name         GitHub+ (Alex版) 玻璃风格 + ScriptHub（嵌入式, Shadow DOM 适配 v1.7）
// @namespace    https://mikephie.site/
// @version      1.7.0
// @description  仅美化 Alex 面板并嵌入 ScriptHub；兼容 Shadow DOM：遍历所有 shadowRoot 注入样式与按钮。无悬浮窗/无顶部Tab；iOS Userscripts OK。
// @author       Mikephie
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  /* ---------------- 基础样式（用于 document 和每个 shadowRoot 内部） ---------------- */
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

  /* 只影响 Alex 的面板/对话框/卡片（尽量限制到 gh-* 前缀；GitHub 本身不强制改） */
  .gh-panel, .gh-dialog, .gh-popup, .gh-modal,
  .gh-release-item, .gh-release-header, .gh-release-body, .gh-release-assets, .gh-asset-item,
  .gh-gists-header, .gh-actions {
    border-radius: 16px !important;
    border: 1px solid var(--glass-stroke) !important;
    background: linear-gradient(135deg, var(--glass-bg), rgba(255,255,255,0.02)) !important;
    backdrop-filter: blur(16px) saturate(1.15) !important;
    -webkit-backdrop-filter: blur(16px) saturate(1.15) !important;
    box-shadow: var(--glass-shadow) !important;
  }

  /* 列表卡片化（Alex 的条目） */
  .gh-release-item, .gh-asset-item {
    border-radius: 12px !important;
    border: 1px solid var(--divider) !important;
    margin: 8px 0 !important;
    padding: 10px 12px !important;
    background: linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.00)) !important;
  }

  /* Alex 的按钮统一玻璃 + 反馈 */
  .gh-header-btn, .gh-download-btn, .gh-copy-btn,
  .gh-actions .btn, .gh-actions .Button {
    background: var(--btn-bg) !important;
    color: var(--glass-fg) !important;
    border: 1px solid var(--glass-stroke) !important;
    border-radius: 12px !important;
    height: 34px !important;
    padding: 0 12px !important;
    line-height: 34px !important;
    display: inline-flex !important; align-items: center; gap: 8px;
    backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important;
    transition: transform .08s ease, box-shadow .2s ease !important;
    box-shadow: inset 0 1px 2px rgba(255,255,255,.25), 0 4px 12px rgba(0,0,0,.25) !important;
  }
  .gh-header-btn:hover, .gh-download-btn:hover, .gh-copy-btn:hover,
  .gh-actions .btn:hover, .gh-actions .Button:hover {
    transform: translateY(-1px) !important;
    box-shadow: inset 0 1px 2px rgba(255,255,255,.3), 0 6px 18px rgba(0,0,0,.28) !important;
  }
  .gh-header-btn:active, .gh-actions .btn:active, .gh-actions .Button:active {
    transform: translateY(1px) !important;
    box-shadow: inset 0 1px 3px rgba(0,0,0,.4) !important;
  }
  `;

  function injectStyleInto(root, id='__alex_glass_v17__'){
    if (!root) return;
    const doc = root instanceof ShadowRoot ? root : document;
    if (doc.getElementById && doc.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id; s.textContent = BASE_CSS;
    (root.head || root).appendChild(s);
  }

  /* ---------------- ScriptHub：只嵌入 Alex 的按钮区（含 Shadow DOM） ---------------- */
  const HOST_SELECTORS = [
    '.gh-gists-header-buttons',
    '.gh-header-actions',
    '.gh-dialog .gh-actions',
    '.gh-panel .gh-actions'
  ];
  const RAW_TEXTS = ['打开Raw文件','打开 Raw','Raw','Open Raw'];

  function getRawUrl(href, root) {
    href = (href || location.href).split('#')[0].split('?')[0];
    if (/^https?:\/\/raw\.githubusercontent\.com\//.test(href)) return href;

    let m = href.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
    if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
    m = href.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
    if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;

    const scope = root || document;
    const a = scope.querySelector?.('a.Link--primary[href*="/blob/"]');
    if (a) return getRawUrl(a.href, root);
    return null;
  }
  function openScriptHub(root) {
    const raw = getRawUrl(undefined, root);
    if (!raw) return;
    const url = `http://script.hub/convert/_start_/${encodeURIComponent(raw)}/_end_/plain.txt?type=plain-text&target=plain-text`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function injectSHButtonInto(scope){
    if (!scope || !scope.querySelector) return;
    let host = null;
    for (const sel of HOST_SELECTORS){
      host = scope.querySelector(sel);
      if (host) break;
    }
    // 如果没有标准 actions 区，尝试找到"打开 Raw"按钮并插到它后面
    if (!host) {
      const rawBtn = Array.from(scope.querySelectorAll('button,a')).find(el => RAW_TEXTS.includes((el.textContent||'').trim()));
      if (rawBtn) host = rawBtn.parentElement || rawBtn.closest('div,span,section');
    }
    if (!host || host.querySelector?.('[data-alex-sh-btn]')) return;

    const btn = (scope.ownerDocument || document).createElement('button');
    btn.setAttribute('data-alex-sh-btn','1');
    btn.className = 'gh-header-btn';
    btn.textContent = 'ScriptHub 转换';
    btn.style.marginLeft = '8px';
    btn.addEventListener('click', () => openScriptHub(scope));

    const rawBtn = host.querySelector?.('button, a');
    if (rawBtn) rawBtn.insertAdjacentElement('afterend', btn);
    else host.appendChild(btn);
  }

  /* ---------------- Shadow DOM 扫描：把样式与按钮放进每个 shadowRoot ---------------- */
  function processRoot(root){
    try {
      injectStyleInto(root);
      // 优先针对 Alex 面板类名
      injectSHButtonInto(root);
      // 再做一次"强制玻璃"内联兜底：找看起来像弹窗的盒子
      const nodes = root.querySelectorAll?.('.gh-panel, .gh-dialog, .gh-popup, .gh-modal');
      nodes && nodes.forEach(el=>{
        const st = el.style;
        st.background = 'linear-gradient(135deg, var(--glass-bg), rgba(255,255,255,0.02))';
        st.backdropFilter = 'blur(16px) saturate(1.15)';
        st.webkitBackdropFilter = 'blur(16px) saturate(1.15)';
        st.border = '1px solid var(--glass-stroke)';
        st.borderRadius = st.borderRadius || '16px';
        st.boxShadow = 'var(--glass-shadow)';
      });
    } catch(e){}
  }

  function scanAllShadowRoots(){
    processRoot(document); // 先处理主文档
    const walker = document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.shadowRoot) processRoot(node.shadowRoot);
    }
  }

  /* ---------------- 监听变更 & 路由 ---------------- */
  const mo = new MutationObserver(() => scanAllShadowRoots());
  mo.observe(document.documentElement, { childList: true, subtree: true });

  const _p = history.pushState, _r = history.replaceState;
  history.pushState = function(){ const ret=_p.apply(this, arguments); queueMicrotask(scanAllShadowRoots); return ret; };
  history.replaceState = function(){ const ret=_r.apply(this, arguments); queueMicrotask(scanAllShadowRoots); return ret; };
  window.addEventListener('popstate', scanAllShadowRoots, false);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanAllShadowRoots, { once:true });
  } else {
    scanAllShadowRoots();
  }
})();