// ==UserScript==
// @name         GitHub+ (Alex版) 玻璃风格 + ScriptHub（常驻稳定版）
// @namespace    https://mikephie.site/
// @version      2.0.0
// @description  保留 Alex 功能；弹窗玻璃；按钮彩色外圈高亮；ScriptHub 嵌入 Raw/Download；GitHubPlus 徽标（青蓝霓虹）；点击徽标开关，不再自动关闭。
// @author       Mikephie
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  /* ========== 基础 CSS ========== */
  const BASE_CSS = `
  :root{
    --glass-bg: rgba(255,255,255,.10);
    --glass-stroke: rgba(255,255,255,.26);
    --glass-shadow: 0 18px 50px rgba(0,0,0,.35);
    --glass-fg: #e6edf3;
    --btn-bg: rgba(255,255,255,.10);
    --tone-primary: 80,160,255; /* 青蓝 */
  }
  @media (prefers-color-scheme: light){
    :root{ --glass-fg:#111; --btn-bg: rgba(255,255,255,.12); }
  }
  .x-glassified{
    border-radius:16px !important;
    border:1px solid var(--glass-stroke) !important;
    background:linear-gradient(135deg,var(--glass-bg),rgba(255,255,255,0.02)) !important;
    backdrop-filter:blur(16px) saturate(1.15) !important;
    -webkit-backdrop-filter:blur(16px) saturate(1.15) !important;
    box-shadow:var(--glass-shadow) !important;
  }
  /* 按钮样式 */
  .xg-btn{
    background:var(--btn-bg) !important;
    color:var(--glass-fg) !important;
    border:1.5px solid var(--glass-stroke) !important;
    border-radius:12px !important;
    padding:0 12px !important; height:34px !important;
    display:inline-flex !important; align-items:center; gap:8px;
    position:relative; overflow:visible;
    transition:transform .08s ease, box-shadow .18s ease, border-color .18s ease;
    box-shadow:inset 0 1px 2px rgba(255,255,255,.22), 0 4px 12px rgba(0,0,0,.22) !important;
  }
  .xg-btn::after{
    content:""; position:absolute; inset:-3px; border-radius:inherit; pointer-events:none;
    box-shadow:0 0 0 0 rgba(var(--tone-primary),0);
    transition:box-shadow .18s ease;
  }
  .xg-btn:hover,
  .xg-btn[data-armed="1"]{
    border-color:rgba(var(--tone-primary),.75) !important;
    box-shadow:inset 0 1px 2px rgba(255,255,255,.24),0 6px 18px rgba(0,0,0,.26) !important;
  }
  .xg-btn:hover::after,
  .xg-btn[data-armed="1"]::after{
    box-shadow:0 0 0 2px rgba(var(--tone-primary),.45),0 0 18px 2px rgba(var(--tone-primary),.28);
  }
  .xg-btn:active,
  .xg-btn[data-pressed="1"]{
    transform:translateY(1px) scale(.985) !important;
    border-color:rgba(var(--tone-primary),.95) !important;
    box-shadow:inset 0 1px 3px rgba(0,0,0,.42),0 0 0 3px rgba(var(--tone-primary),.6),0 2px 8px rgba(0,0,0,.22);
  }
  .xg-btn:active::after,
  .xg-btn[data-pressed="1"]::after{
    box-shadow:0 0 0 3px rgba(var(--tone-primary),.6),0 0 22px 3px rgba(var(--tone-primary),.35);
  }

  /* GitHubPlus 徽标 */
  .ghplus-badge{
    display:inline-flex; align-items:center; gap:.5em;
    font-weight:600; border-radius:12px; padding:.46em .84em;
    cursor:pointer; user-select:none;
    color:#e6f9ff; background:rgba(120,245,255,.12);
    border:1px solid rgba(120,245,255,.45);
    box-shadow:0 0 12px rgba(120,245,255,.35),0 8px 22px rgba(0,0,0,.35);
    transition:all .2s ease;
  }
  .ghplus-badge:hover{ box-shadow:0 0 20px rgba(120,245,255,.6),0 10px 28px rgba(0,0,0,.4); }
  .ghplus-badge:active{ transform:translateY(1px) scale(.985); }
  .ghplus-icon{
    width:18px; height:18px; background:currentColor;
    -webkit-mask:url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='currentColor' d='M12 .5C5.65.5.5 5.65.5 12S5.65 23.5 12 23.5 23.5 18.35 23.5 12 18.35.5 12 .5Z'/></svg>") no-repeat center/contain;
            mask:url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='currentColor' d='M12 .5C5.65.5.5 5.65.5 12S5.65 23.5 12 23.5 23.5 18.35 23.5 12 18.35.5 12 .5Z'/></svg>") no-repeat center/contain;
  }
  `;
  const s = document.createElement('style'); s.textContent = BASE_CSS; document.head.appendChild(s);

  /* ========== ScriptHub 按钮嵌入 ========== */
  const BTN_TEXTS = ['Raw','Open Raw','下载','Download','编辑','Edit'];
  function getRawUrl(href){
    href=(href||location.href).split('#')[0].split('?')[0];
    if (/^https?:\/\/raw\.githubusercontent\.com\//.test(href)) return href;
    const m = href.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
    if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
    return null;
  }
  function injectSH(scope){
    if (scope.querySelector('[data-alex-sh-btn]')) return;
    const buttons = Array.from(scope.querySelectorAll('button,a')).filter(el=>BTN_TEXTS.includes(el.textContent.trim()));
    if (!buttons.length) return;
    const host = buttons[0].parentElement;
    const btn = document.createElement('button');
    btn.setAttribute('data-alex-sh-btn','1');
    btn.textContent='ScriptHub 转换';
    btn.className='xg-btn'; host.appendChild(btn);
    btn.addEventListener('click',()=>{
      const raw=getRawUrl(); if(!raw)return;
      window.open(`http://script.hub/convert/_start_/${encodeURIComponent(raw)}/_end_/plain.txt`,'_blank');
    });
  }

  /* ========== 徽标 + 面板守护 ========== */
  function buildBadge(){
    if(document.querySelector('.ghplus-badge'))return;
    const b=document.createElement('div');
    b.className='ghplus-badge';
    b.innerHTML=`<span class="ghplus-icon"></span><span>GitHubPlus</span>`;
    b.style.position='fixed'; b.style.bottom='12px'; b.style.right='12px'; b.style.zIndex='99999';
    document.body.appendChild(b);
    let pinned=false;
    b.addEventListener('click',()=>{
      pinned=!pinned;
      const panel=document.querySelector('.x-glassified');
      if(panel){ panel.style.display=pinned?'block':'none'; }
    });
  }

  /* ========== 自动扫描并应用玻璃 + ScriptHub ========== */
  function scan(){
    document.querySelectorAll('div,section,dialog').forEach(el=>{
      if(!el.classList.contains('x-glassified')){
        const cs=getComputedStyle(el);
        if(['fixed','absolute'].includes(cs.position)&&(el.offsetWidth>200&&el.offsetHeight>120)){
          el.classList.add('x-glassified');
          injectSH(el);
        }
      }
    });
  }
  new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',()=>{scan();buildBadge();});
  buildBadge(); scan();
})();