// ==UserScript==
// @name         GitHubPlus（原版追加整合 v3.1）-- 常驻守护 + ScriptHub 强制注入 + 徽标非破坏装饰
// @namespace    https://github.com/
// @version      3.1.0
// @description  不改 Alex 源码，只"追加"：修复面板自动关闭（点开常驻；再点关闭）、强制注入 ScriptHub 按钮、青蓝霓虹徽标非破坏装饰，保留原点击逻辑；兼容 iOS Userscripts。
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  /* ---------------- 样式（青蓝霓虹徽标装饰，不破坏原DOM/事件） ---------------- */
  const STYLE_ID = '__ghplus_append_v31__';
  if (!document.getElementById(STYLE_ID)) {
    const s = document.createElement('style'); s.id = STYLE_ID;
    s.textContent = `
      .ghplus-badge{
        display:inline-flex; align-items:center; gap:.5em;
        border-radius:12px; padding:.46em .84em;
        backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
        position:relative; overflow:visible;
      }
      .ghplus-badge .ghplus-icon-dec{
        width:18px; height:18px; flex:0 0 18px; background: currentColor;
        -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M20 10c2 0 6 4 8 6h8c2-2 6-6 8-6 1 0 2 1 2 2v10c6 6 8 13 8 18 0 13-12 22-28 22S8 53 8 40c0-5 2-12 8-18V12c0-1 1-2 2-2zM24 40a4 4 0 1 0 0 8h16a4 4 0 1 0 0-8H24z' fill='currentColor'/%3E%3C/svg%3E") no-repeat center/contain;
                mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M20 10c2 0 6 4 8 6h8c2-2 6-6 8-6 1 0 2 1 2 2v10c6 6 8 13 8 18 0 13-12 22-28 22S8 53 8 40c0-5 2-12 8-18V12c0-1 1-2 2-2zM24 40a4 4 0 1 0 0 8h16a4 4 0 1 0 0-8H24z' fill='currentColor'/%3E%3C/svg%3E") no-repeat center/contain;
        position:relative; pointer-events:none;
      }
      .ghplus-badge .ghplus-icon-dec::before{
        content:""; position:absolute; inset:-4px; border-radius:999px; pointer-events:none;
        background: radial-gradient(closest-side, rgba(0,247,255,.70), rgba(0,247,255,0) 70%);
        opacity:.6; filter: blur(6px);
        animation: ghplus-pulse 2.2s ease-in-out infinite;
      }
      @media (prefers-color-scheme: light){
        .ghplus-badge .ghplus-icon-dec::before{
          background: radial-gradient(closest-side, rgba(0,160,200,.55), rgba(0,160,200,0) 70%);
          opacity:.5;
        }
      }
      @keyframes ghplus-pulse{
        0%{ transform: scale(.85); opacity:.3; }
        40%{ transform: scale(1.15); opacity:.75; }
        100%{ transform: scale(.85); opacity:.3; }
      }

      /* ScriptHub 注入按钮的统一外观（与面板玻璃匹配） */
      .ghplus-sh-btn{
        background:rgba(255,255,255,.10); color:inherit;
        border:1px solid rgba(255,255,255,.26); border-radius:12px;
        height:34px; padding:0 12px; line-height:34px;
        display:inline-flex; align-items:center; gap:8px;
        backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
        cursor:pointer;
      }
    `;
    document.head.appendChild(s);
  }

  /* ---------------- 徽标非破坏装饰（保留原 click 事件） ---------------- */
  const TEXT_RE = /fix\s*github/i;
  function nearBR(el){
    const r = el.getBoundingClientRect();
    const right = innerWidth - r.right;
    const bottom = innerHeight - r.bottom;
    return right >= -4 && right <= 220 && bottom >= -4 && bottom <= 220 && r.width >= 70 && r.height >= 24;
  }
  function isOldBadge(el){
    if (!el || el.nodeType !== 1) return false;
    const cs = getComputedStyle(el);
    if (!['fixed','absolute','sticky'].includes(cs.position)) return false;
    const txt = (el.textContent || '').replace(/\s+/g,' ').trim();
    return nearBR(el) && (TEXT_RE.test(txt) || /fix-github/i.test(el.className||''));
  }
  function decorateBadge(){
    const nodes = document.querySelectorAll('a,button,div,span');
    for (const el of nodes) {
      if (isOldBadge(el) && !el.__ghplusDecorated){
        el.__ghplusDecorated = true;
        el.classList.add('ghplus-badge');            // 仅加类
        const icon = document.createElement('span'); // 加装饰图标，不抢点击
        icon.className = 'ghplus-icon-dec';
        el.insertBefore(icon, el.firstChild || null);
        break;
      }
    }
  }

  /* ---------------- ScriptHub 强制注入（面板内或 Raw/下载/编辑旁） ---------------- */
  const BTN_TEXTS = ['打开Raw文件','打开 Raw','Raw','Open Raw','下载文件','下载','Download','编辑文件','编辑','Edit'];
  function getRawUrl(href, scope){
    href=(href||location.href).split('#')[0].split('?')[0];
    if (/^https?:\/\/raw\.githubusercontent\.com\//.test(href)) return href;
    let m = href.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
    if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
    m = href.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
    if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
    const a = scope?.querySelector?.('a.Link--primary[href*="/blob/"]');
    if (a) return getRawUrl(a.href, scope);
    return null;
  }
  function injectScriptHub(scope){
    const panel = scope || document;
    let host = panel.querySelector?.('.gh-actions, .gh-header-actions, .gh-gists-header-buttons');
    if (!host) {
      const hit = Array.from(panel.querySelectorAll?.('button,a')||[])
        .find(el=>BTN_TEXTS.includes((el.textContent||'').trim()));
      if (hit) host = hit.parentElement || hit.closest('div,span,section');
    }
    if (!host || host.querySelector?.('[data-ghplus-sh]')) return;

    const btn = (panel.ownerDocument || document).createElement('button');
    btn.className = 'ghplus-sh-btn'; btn.setAttribute('data-ghplus-sh','1');
    btn.textContent = 'ScriptHub 转换';
    btn.addEventListener('click', ()=>{
      const raw = getRawUrl(undefined, panel);
      if (!raw) return;
      const url = `http://script.hub/convert/_start_/${encodeURIComponent(raw)}/_end_/plain.txt?type=plain-text&target=plain-text`;
      window.open(url,'_blank','noopener,noreferrer');
    });
    host.appendChild(btn);
  }

  /* ---------------- 常驻守护（点开常驻；再点关闭） ---------------- */
  function looksLikePanel(el){
    if (!el || el.nodeType !== 1) return false;
    const cs = getComputedStyle(el);
    if (!['fixed','absolute'].includes(cs.position)) return false;
    if ((+cs.zIndex || 0) < 10) return false;
    const r = Math.max(
      parseFloat(cs.borderTopLeftRadius||'0'),
      parseFloat(cs.borderTopRightRadius||'0'),
      parseFloat(cs.borderBottomLeftRadius||'0'),
      parseFloat(cs.borderBottomRightRadius||'0')
    );
    const {width:w,height:h} = el.getBoundingClientRect();
    return r >= 8 && w >= 200 && h >= 120;
  }
  function findPanel(){
    const nodes = Array.from(document.querySelectorAll('div,section,dialog')).reverse();
    return nodes.find(looksLikePanel) || null;
  }
  function findBadge(){
    return document.querySelector('.ghplus-badge');
  }

  const STATE = { pinned:false, loop:null, reopenTs:0 };

  function startGuard(){
    if (STATE.loop) return;
    STATE.loop = setInterval(()=>{
      if (!STATE.pinned) return;
      let p = findPanel();
      if (!p){
        // 未找到 → 触发一次原徽标点击重开（不破坏原逻辑）
        const b = findBadge();
        if (b){
          const now = Date.now(); if (now - STATE.reopenTs > 150) {
            STATE.reopenTs = now;
            b.dispatchEvent(new MouseEvent('click', { bubbles:true, cancelable:true }));
          }
        }
        return;
      }
      // 反隐藏 + 保持最上层
      p.removeAttribute('hidden');
      if (p.getAttribute('aria-hidden')==='true') p.setAttribute('aria-hidden','false');
      p.style.display='block'; p.style.visibility='visible'; p.style.opacity='1';
      p.style.pointerEvents='auto'; p.style.zIndex='2147483647';
      p.setAttribute('data-ghplus-sticky','1');

      // 面板出现后补一次 ScriptHub
      injectScriptHub(p);
    }, 250);
  }

  function pinOn(){ STATE.pinned = true; startGuard(); }
  function pinOff(){
    STATE.pinned = false;
    if (STATE.loop){ clearInterval(STATE.loop); STATE.loop=null; }
    const p = findPanel();
    if (p){ p.style.display='none'; p.style.visibility=''; p.style.opacity=''; p.removeAttribute('data-ghplus-sticky'); }
  }

  function wireToggle(){
    const b = findBadge(); if (!b || b.__ghplus_v31_wired) return;
    b.__ghplus_v31_wired = true;

    b.addEventListener('click', (e)=>{
      // 若当前已常驻：这次点击改为"关闭并阻止原脚本再次打开"
      if (STATE.pinned){
        e.preventDefault(); e.stopPropagation();
        pinOff();
      } else {
        // 允许本次点击走原脚本打开；随后我们接管常驻
        setTimeout(()=>{ pinOn(); }, 0);
      }
    }, { passive:false });
  }

  /* ---------------- 初始化 + 持续保证 ---------------- */
  function sweep(){
    decorateBadge();   // 徽标非破坏装饰（不影响事件）
    wireToggle();      // 绑定开/关
    // 面板出现前也放一个 ScriptHub（用于仓库文件页等）
    injectScriptHub(document);
  }

  // 初次与 DOM 变化时处理
  sweep();
  const mo = new MutationObserver(sweep);
  mo.observe(document.documentElement, { childList:true, subtree:true });

  // 暴露手动开关（可调试用）
  window.GitHubPlusPinOn = pinOn;
  window.GitHubPlusPinOff = pinOff;
})();