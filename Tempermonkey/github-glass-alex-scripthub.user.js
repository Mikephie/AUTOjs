// ==UserScript==
// @name         GitHub+ (Alex版) 玻璃风格 + ScriptHub（嵌入式, 自适配 v1.8.1）
// @namespace    https://mikephie.site/
// @version      1.8.1
// @description  不改 Alex 逻辑；面板/弹窗强制玻璃 + 面板内按钮内联美化；ScriptHub 仅嵌入按钮区或 Raw/下载/编辑旁；适配 document + shadowRoot + 同域 iframe；iOS Userscripts OK。
// @author       Mikephie
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  /* ===== 基础 CSS（给 .x-glassified 提供全局变量与兜底） ===== */
  const BASE_CSS = `
  :root{
    --glass-bg: rgba(255,255,255,.10);
    --glass-stroke: rgba(255,255,255,.26);
    --glass-shadow: 0 18px 50px rgba(0,0,0,.35);
    --glass-fg: #e6edf3;
    --btn-bg: rgba(255,255,255,.10);
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
  `;
  function injectStyle(root, id='__alex_glass_v181__'){
    const doc = root instanceof ShadowRoot ? root : document;
    if (doc.getElementById && doc.getElementById(id)) return;
    const s = document.createElement('style'); s.id = id; s.textContent = BASE_CSS;
    (root.head || root).appendChild(s);
  }

  /* ===== 识别"像弹窗/面板"的盒子并强制玻璃（内联） ===== */
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
    const {width:w,height:h} = el.getBoundingClientRect();
    return r >= 8 && w >= 200 && h >= 120;
  }
  function forceGlassInline(el){
    if (el.__glassified) return;
    el.__glassified = true;
    el.classList.add('x-glassified');
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

  /* ===== 面板内"按钮内联美化"：清掉绿色底，套玻璃按钮 ===== */
  function beautifyButtons(scope){
    const btns = scope.querySelectorAll?.('button, a.btn, a.Button, .gh-header-btn, .gh-download-btn, .gh-copy-btn') || [];
    btns.forEach(el=>{
      // 避免重复处理
      if (el.__btnGlassified) return;
      el.__btnGlassified = true;

      const st = el.style;
      // 清除原背景与阴影（GitHub 的 success/primary）
      st.background = 'var(--btn-bg)';
      st.backgroundColor = 'transparent';
      st.backgroundImage = 'none';
      st.color = 'var(--glass-fg)';
      st.border = '1px solid var(--glass-stroke)';
      st.borderRadius = '12px';
      st.height = '34px'; st.lineHeight = '34px';
      st.padding = '0 12px';
      st.display = 'inline-flex'; st.alignItems = 'center'; st.gap = '8px';
      st.backdropFilter = 'blur(8px)'; st.webkitBackdropFilter = 'blur(8px)';
      st.boxShadow = 'inset 0 1px 2px rgba(255,255,255,.25), 0 4px 12px rgba(0,0,0,.25)';
      st.transition = 'transform .08s ease, box-shadow .2s ease';

      // hover/active 反馈（事件方式实现，兼容 iOS）
      el.addEventListener('touchstart', ()=>{ el.style.transform='translateY(1px)'; el.style.boxShadow='inset 0 1px 3px rgba(0,0,0,.4)'; }, {passive:true});
      el.addEventListener('touchend', ()=>{ el.style.transform=''; el.style.boxShadow='inset 0 1px 2px rgba(255,255,255,.25), 0 4px 12px rgba(0,0,0,.25)'; }, {passive:true});
      el.addEventListener('mouseenter', ()=>{ el.style.transform='translateY(-1px)'; el.style.boxShadow='inset 0 1px 2px rgba(255,255,255,.3), 0 6px 18px rgba(0,0,0,.28)'; });
      el.addEventListener('mouseleave', ()=>{ el.style.transform=''; el.style.boxShadow='inset 0 1px 2px rgba(255,255,255,.25), 0 4px 12px rgba(0,0,0,.25)'; });
    });
  }

  /* ===== ScriptHub：只嵌入按钮区/Raw 相关按钮旁 ===== */
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

    const buttons = Array.from(scope.querySelectorAll('button,a')).filter(el=>{
      const t=(el.textContent||'').trim();
      return BTN_TEXTS.includes(t);
    });
    if (!buttons.length) return;

    const host = buttons[0].parentElement || buttons[0].closest('div,span,section') || scope;
    const btn = (scope.ownerDocument || document).createElement('button');
    btn.setAttribute('data-alex-sh-btn','1');
    btn.textContent='ScriptHub 转换';
    // 让它看起来就像同一套玻璃按钮
    btn.className='gh-header-btn';
    host && host.appendChild(btn);

    // 立即玻璃化并挂事件（与 beautifyButtons 一致）
    beautifyButtons(host);

    btn.addEventListener('click', ()=>{
      const raw = getRawUrl(undefined, scope);
      if (!raw) return;
      const url = `http://script.hub/convert/_start_/${encodeURIComponent(raw)}/_end_/plain.txt?type=plain-text&target=plain-text`;
      window.open(url,'_blank','noopener,noreferrer');
    });
  }

  /* ===== 处理一个根：注入 CSS、识别面板、按钮美化、SH 注入 ===== */
  function processRoot(root){
    injectStyle(root);
    // 识别并强制玻璃
    root.querySelectorAll?.('*').forEach(el=>{ try{ if (looksLikePanel(el)) { forceGlassInline(el); beautifyButtons(el); injectSH(el); } }catch(e){} });
    // 再兜底：若弹窗内部异步渲染按钮，单独跑一次按钮美化与 SH 注入
    setTimeout(()=>{ 
      root.querySelectorAll?.('.x-glassified').forEach(el=>{ beautifyButtons(el); injectSH(el); });
    }, 60);
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
      } catch(e){}
    });
  }

  /* ===== 监听 DOM & 路由 ===== */
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