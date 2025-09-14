// ==UserScript==
// @name         GitHub+ (Alex版) 玻璃风格 + ScriptHub（全集稳定版）
// @namespace    https://mikephie.site/
// @version      2.2.0
// @description  保留 Alex 逻辑；弹窗玻璃；青蓝外圈高亮与按压反馈；ScriptHub 嵌入；GitHubPlus 徽标（拖动/避让/记忆）；点击徽标=开↔关；rAF 轻守护；iOS 友好；杜绝"小方块"。
// @author       Mikephie
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  /* -------------------- 主题 & 基础样式 -------------------- */
  const CSS_ID='__ghplus_full_css__';
  if (!document.getElementById(CSS_ID)) {
    const s=document.createElement('style'); s.id=CSS_ID;
    s.textContent = `
    :root{
      --glass-bg: rgba(255,255,255,.10);
      --glass-stroke: rgba(255,255,255,.26);
      --glass-shadow: 0 18px 50px rgba(0,0,0,.35);
      --glass-fg: #e6edf3;
      --btn-bg: rgba(255,255,255,.10);
      --tone: 80,160,255;    /* 青蓝主色 */
    }
    @media (prefers-color-scheme: light){
      :root{ --glass-fg:#111; --btn-bg: rgba(255,255,255,.12); }
    }
    /* 玻璃容器 */
    .x-glassified{
      border-radius:16px !important;
      border:1px solid var(--glass-stroke) !important;
      background:linear-gradient(135deg,var(--glass-bg),rgba(255,255,255,0.02)) !important;
      backdrop-filter:blur(16px) saturate(1.15) !important;
      -webkit-backdrop-filter:blur(16px) saturate(1.15) !important;
      box-shadow:var(--glass-shadow) !important;
    }
    /* 统一按钮 */
    .xg-btn{
      background:var(--btn-bg) !important; color:var(--glass-fg) !important;
      border:1.5px solid var(--glass-stroke) !important; border-radius:12px !important;
      padding:0 12px !important; height:34px !important;
      display:inline-flex !important; align-items:center; gap:8px;
      position:relative; overflow:visible;
      transition:transform .08s ease, box-shadow .18s ease, border-color .18s ease, filter .16s ease !important;
      box-shadow:inset 0 1px 2px rgba(255,255,255,.22), 0 4px 12px rgba(0,0,0,.22) !important;
      -webkit-tap-highlight-color: transparent;
    }
    .xg-btn::after{
      content:""; position:absolute; inset:-3px; border-radius:inherit; pointer-events:none;
      box-shadow:0 0 0 0 rgba(var(--tone),0); transition:box-shadow .18s ease;
    }
    .xg-btn:hover,
    .xg-btn[data-armed="1"]{
      border-color:rgba(var(--tone),.75) !important;
      box-shadow:inset 0 1px 2px rgba(255,255,255,.24), 0 6px 18px rgba(0,0,0,.26) !important;
      filter:saturate(1.06);
    }
    .xg-btn:hover::after,
    .xg-btn[data-armed="1"]::after{
      box-shadow:0 0 0 2px rgba(var(--tone),.45), 0 0 18px 2px rgba(var(--tone),.28);
    }
    .xg-btn:active,
    .xg-btn[data-pressed="1"]{
      transform:translateY(1px) scale(.985) !important;
      border-color:rgba(var(--tone),.95) !important;
      box-shadow:inset 0 1px 3px rgba(0,0,0,.42), 0 0 0 3px rgba(var(--tone),.60), 0 2px 8px rgba(0,0,0,.22) !important;
      filter:saturate(1.12);
    }
    .xg-btn:active::after,
    .xg-btn[data-pressed="1"]::after{
      box-shadow:0 0 0 3px rgba(var(--tone),.60), 0 0 22px 3px rgba(var(--tone),.35);
    }

    /* GitHubPlus 徽标（非破坏装饰，无伪元素霓虹） */
    .ghplus-badge{
      display:inline-flex; align-items:center; gap:.5em;
      font-weight:600; border-radius:12px; padding:.46em .84em;
      color:#e6f9ff; background:rgba(120,245,255,.12);
      border:1px solid rgba(120,245,255,.45);
      box-shadow:0 0 12px rgba(120,245,255,.35), 0 8px 22px rgba(0,0,0,.35);
      transition:transform .1s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease;
      position:fixed; right:12px; bottom:calc(12px + env(safe-area-inset-bottom,0px));
      z-index:2147483000;
      cursor:pointer; user-select:none;
    }
    .ghplus-badge:hover{ box-shadow:0 0 20px rgba(120,245,255,.60), 0 10px 28px rgba(0,0,0,.4); }
    .ghplus-badge:active{ transform:translateY(1px) scale(.985); }
    .ghplus-icon{
      width:18px; height:18px; background:currentColor;
      -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M20 10c2 0 6 4 8 6h8c2-2 6-6 8-6 1 0 2 1 2 2v10c6 6 8 13 8 18 0 13-12 22-28 22S8 53 8 40c0-5 2-12 8-18V12c0-1 1-2 2-2zM24 40a4 4 0 1 0 0 8h16a4 4 0 1 0 0-8H24z' fill='currentColor'/%3E%3C/svg%3E") no-repeat center/contain;
              mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M20 10c2 0 6 4 8 6h8c2-2 6-6 8-6 1 0 2 1 2 2v10c6 6 8 13 8 18 0 13-12 22-28 22S8 53 8 40c0-5 2-12 8-18V12c0-1 1-2 2-2zM24 40a4 4 0 1 0 0 8h16a4 4 0 1 0 0-8H24z' fill='currentColor'/%3E%3C/svg%3E") no-repeat center/contain;
      pointer-events:none;
    }

    /* 面板内按钮"仅在常驻面板里"强化（不影响站内其它按钮） */
    [data-ghplus-sticky="1"] button,
    [data-ghplus-sticky="1"] .btn,
    [data-ghplus-sticky="1"] .Button{ composes:xg-btn; }
    `;
    document.head.appendChild(s);
  }

  /* -------------------- 工具函数 -------------------- */
  const BTN_TEXTS = ['Raw','Open Raw','打开 Raw','打开Raw文件','下载','Download','编辑','Edit'];
  const BADGE_SEL = '.ghplus-badge';
  const STORE_POS = 'GHP_BADGE_POS_V1';
  const SAFE = 12; // 徽标边距
  const RAF_INTERVAL = 60; // rAF 节流

  function looksLikePanel(el){
    if (!el || el.nodeType!==1) return false;
    const cs=getComputedStyle(el);
    if (!['fixed','absolute'].includes(cs.position)) return false;
    if ((+cs.zIndex||0) < 10) return false;
    const r=Math.max(
      parseFloat(cs.borderTopLeftRadius||'0'),
      parseFloat(cs.borderTopRightRadius||'0'),
      parseFloat(cs.borderBottomLeftRadius||'0'),
      parseFloat(cs.borderBottomRightRadius||'0')
    );
    const {width:w,height:h} = el.getBoundingClientRect();
    return r>=8 && w>=200 && h>=120;
  }

  function forceGlassInline(panel){
    if (!panel) return;
    panel.setAttribute('data-ghplus-sticky','1');
    panel.style.setProperty('backdrop-filter','blur(16px) saturate(1.15)','important');
    panel.style.setProperty('-webkit-backdrop-filter','blur(16px) saturate(1.15)','important');
    panel.style.setProperty('background','linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,.02))','important');
    panel.style.setProperty('border','1px solid rgba(255,255,255,.26)','important');
    panel.style.setProperty('border-radius','16px','important');
    panel.style.setProperty('box-shadow','0 18px 50px rgba(0,0,0,.35)','important');
    panel.style.setProperty('display','block','important');
    panel.style.setProperty('visibility','visible','important');
    panel.style.setProperty('opacity','1','important');
    panel.style.setProperty('pointer-events','auto','important');
    panel.style.setProperty('z-index','2147483647','important');
  }

  function beautifyButtons(scope){
    (scope.querySelectorAll?.('button, a.btn, a.Button, .gh-header-btn, .gh-download-btn, .gh-copy-btn')||[])
      .forEach(el=>{
        if (el.__xg) return; el.__xg = true;
        el.classList.add('xg-btn');
        el.addEventListener('mouseenter', ()=>el.setAttribute('data-armed','1'));
        el.addEventListener('mouseleave', ()=>{el.removeAttribute('data-armed');el.removeAttribute('data-pressed');});
        el.addEventListener('focus', ()=>el.setAttribute('data-armed','1'));
        el.addEventListener('blur',  ()=>{el.removeAttribute('data-armed');el.removeAttribute('data-pressed');});
        el.addEventListener('mousedown', ()=>el.setAttribute('data-pressed','1'));
        el.addEventListener('mouseup',   ()=>el.removeAttribute('data-pressed'));
        el.addEventListener('touchstart',()=>el.setAttribute('data-pressed','1'),{passive:true});
        el.addEventListener('touchend',  ()=>el.removeAttribute('data-pressed'),{passive:true});
      });
  }

  function rawUrlFrom(href){
    href=(href||location.href).split('#')[0].split('?')[0];
    if (/^https?:\/\/raw\.githubusercontent\.com\//.test(href)) return href;
    const m=href.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
    if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
    return null;
  }

  function injectScriptHub(scope){
    if (!scope.querySelector || scope.querySelector('[data-ghplus-sh]')) return;
    const hit = Array.from(scope.querySelectorAll('button,a')).find(el=>BTN_TEXTS.includes((el.textContent||'').trim()));
    const host = hit ? (hit.parentElement||hit.closest('div,span,section')||scope) : null;
    if (!host) return;
    const b=(scope.ownerDocument||document).createElement('button');
    b.className='xg-btn'; b.textContent='ScriptHub 转换'; b.setAttribute('data-ghplus-sh','1');
    b.addEventListener('click',()=>{
      const raw=rawUrlFrom(); if(!raw) return;
      const url=`http://script.hub/convert/_start_/${encodeURIComponent(raw)}/_end_/plain.txt?type=plain-text&target=plain-text`;
      window.open(url,'_blank','noopener,noreferrer');
    });
    host.appendChild(b);
  }

  /* -------------------- 徽标（非破坏装饰 + 拖动 + 避让 + 记忆） -------------------- */
  function ensureBadge(){
    let el=document.querySelector(BADGE_SEL);
    if (!el){
      el=document.createElement('div'); el.className='ghplus-badge';
      el.innerHTML=`<span class="ghplus-icon"></span><span>GitHubPlus</span>`;
      document.body.appendChild(el);
    }
    return el;
  }
  function savePos(p){ try{ localStorage.setItem(STORE_POS, JSON.stringify(p)); }catch{} }
  function loadPos(){ try{ return JSON.parse(localStorage.getItem(STORE_POS)||''); }catch{ return null; } }
  function place(pos){
    const b=document.querySelector(BADGE_SEL); if(!b) return;
    const right=Math.max(SAFE, Math.min(innerWidth-80, pos.right));
    const bottom=Math.max(SAFE, Math.min(innerHeight-40, pos.bottom));
    b.style.right=right+'px';
    b.style.bottom=`calc(${bottom}px + env(safe-area-inset-bottom,0px))`;
    savePos({right,bottom});
  }
  function getPanel(){
    const list=[...document.querySelectorAll('*')].reverse();
    for (const el of list){ if (looksLikePanel(el)) return el; }
    return null;
  }
  function avoidOverlap(){
    const b=document.querySelector(BADGE_SEL), p=getPanel(); if(!b||!p) return;
    const br=b.getBoundingClientRect(), pr=p.getBoundingClientRect();
    const overlap=!(br.right<pr.left || br.left>pr.right || br.bottom<pr.top || br.top>pr.bottom);
    if (!overlap) return;
    // 往上或往左挪到不重叠
    place({ right: innerWidth - pr.right + SAFE, bottom: innerHeight - br.bottom });
  }
  function enableDrag(){
    const b=ensureBadge(); if (b.__drag) return; b.__drag=true;
    let drag=false, sx=0, sy=0, sr=0, sb=0;
    function start(e){
      const t=e.touches?e.touches[0]:e; drag=true;
      const r=b.getBoundingClientRect();
      sx=t.clientX; sy=t.clientY;
      sr=parseFloat(getComputedStyle(b).right)||(innerWidth-r.right);
      sb=parseFloat(getComputedStyle(b).bottom)||(innerHeight-r.bottom);
      b.classList.add('__dragging'); e.preventDefault();
    }
    function move(e){
      if(!drag) return; const t=e.touches?e.touches[0]:e;
      place({ right: sr-(t.clientX-sx), bottom: sb-(t.clientY-sy) });
    }
    function end(){ drag=false; b.classList.remove('__dragging'); setTimeout(avoidOverlap,0); }
    b.addEventListener('mousedown', start, {passive:false});
    b.addEventListener('touchstart', start, {passive:false});
    window.addEventListener('mousemove', move, {passive:false});
    window.addEventListener('touchmove', move, {passive:false});
    window.addEventListener('mouseup', end, {passive:true});
    window.addEventListener('touchend', end, {passive:true});
  }
  function initBadge(){
    ensureBadge(); enableDrag();
    const pos=loadPos()||{right:SAFE, bottom:SAFE}; place(pos);
    setTimeout(avoidOverlap, 60);
  }

  /* -------------------- 常驻：点击徽标=开↔关 + rAF 守护 -------------------- */
  const STATE={ pinned:false, last:0, raf:0, reopenTs:0 };
  function showPanel(p){ if(!p) return; forceGlassInline(p); beautifyButtons(p); injectScriptHub(p); }
  function reopen(){
    const now=Date.now(); if (now-STATE.reopenTs<140) return; STATE.reopenTs=now;
    const badge=document.querySelector(BADGE_SEL); if (badge) badge.click();
    setTimeout(()=>{ const p=getPanel(); if(p) showPanel(p); },0);
  }
  function loop(ts){
    if (!STATE.pinned){ STATE.raf=requestAnimationFrame(loop); return; }
    if (ts-STATE.last<RAF_INTERVAL){ STATE.raf=requestAnimationFrame(loop); return; }
    STATE.last=ts;
    const p=getPanel();
    if (!p){ reopen(); STATE.raf=requestAnimationFrame(loop); return; }
    showPanel(p);
    STATE.raf=requestAnimationFrame(loop);
  }
  function wireBadgeToggle(){
    const b=ensureBadge(); if (b.__wire) return; b.__wire=true;
    b.addEventListener('click',(e)=>{
      if (STATE.pinned){ e.preventDefault(); e.stopPropagation(); STATE.pinned=false; const p=getPanel(); if(p){ p.style.display='none'; p.style.visibility=''; p.style.opacity=''; } }
      else { setTimeout(()=>{ STATE.pinned=true; const p=getPanel(); if(p) showPanel(p); else reopen(); },0); }
    }, {passive:false});
  }

  /* -------------------- 扫描：把 Alex 面板玻璃化 & 嵌入 ScriptHub -------------------- */
  function scanOnce(){
    document.querySelectorAll('div,section,dialog').forEach(el=>{
      if (looksLikePanel(el)) { forceGlassInline(el); beautifyButtons(el); injectScriptHub(el); }
    });
  }

  /* -------------------- 初始化 -------------------- */
  function boot(){
    initBadge();
    wireBadgeToggle();
    scanOnce();
    new MutationObserver(()=>{ scanOnce(); initBadge(); }).observe(document.documentElement,{childList:true,subtree:true});
    STATE.raf=requestAnimationFrame(loop);
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();