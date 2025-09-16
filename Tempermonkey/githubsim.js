// ==UserScript==
// @name         GitHub+ ScriptHub Glass Bar (icon badge, theme color)
// @namespace    https://mikephie.site/
// @version      3.8.5
// @description  底部超薄玻璃工具条；文件页启用/目录禁用；Raw(单击复制/双击Raw/长按下载)·DL(下载)·Path·Edit/Cancel·Name·Action·Hub；小圆形徽标(随主题变色)可拖拽/单击显隐/双击换主题；SPA兼容、去抖。
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
(() => {
  'use strict';

  /* ================= 主题 ================= */
  const THEMES = ['neon','blue','pink','white'];
  const getTheme = () => localStorage.getItem('gplus_theme') || 'neon';
  function applyTheme(name){
    if(!THEMES.includes(name)) name='neon';
    document.body.classList.remove(...THEMES.map(t=>'gplus-theme-'+t));
    document.body.classList.add('gplus-theme-'+name);
    localStorage.setItem('gplus_theme', name);
  }

  /* ================= 样式 ================= */
  const STYLE = `
  :root{
    --fg:#fff;
    --glass-bg:rgba(20,22,30,.07);
    --glass-stroke:rgba(255,255,255,.16);
    --bar-h:56px;
    --edge1:#ff00ff; --edge2:#00ffff;  /* 默认 Neon */
  }
  @media (prefers-color-scheme:light){
    :root{ --fg:#111; --glass-bg:rgba(255,255,255,.65); --glass-stroke:rgba(0,0,0,.12) }
  }
  .gplus-theme-neon  { --edge1:#ff00ff; --edge2:#00ffff; }
  .gplus-theme-blue  { --edge1:#60a5fa; --edge2:#22d3ee; }
  .gplus-theme-pink  { --edge1:#f472b6; --edge2:#c084fc; }
  .gplus-theme-white { --edge1:#ffffff; --edge2:#ffffff; }

  .gplus-shbar{
    position:fixed; left:0; right:0;
    bottom:calc(0px + env(safe-area-inset-bottom,0));
    z-index:2147483600;
    height:var(--bar-h);
    display:flex; align-items:center; justify-content:center;
    gap:10px; padding:0 12px;
    background:var(--glass-bg);
    -webkit-backdrop-filter:blur(20px) saturate(180%);
    backdrop-filter:blur(20px) saturate(180%);
    border-top:1px solid var(--glass-stroke);
    box-shadow:0 -10px 28px rgba(0,0,0,.18);
    overflow-x:auto; white-space:nowrap; -webkit-overflow-scrolling:touch; scrollbar-width:none;
    scroll-snap-type:x proximity; will-change:transform;
  }
  .gplus-shbar::-webkit-scrollbar{ display:none }
  .gplus-hidden{ display:none !important }

  .gplus-btn{
    position:relative;
    display:flex; align-items:center; justify-content:center;
    height:40px; min-width:86px; padding:0 14px;
    color:var(--fg); font:700 13px/1 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial;
    border-radius:14px; border:2px solid transparent; background-clip:padding-box;
    background:rgba(0,0,0,.10);
    -webkit-backdrop-filter:blur(12px) saturate(170%); backdrop-filter:blur(12px) saturate(170%);
    cursor:pointer; user-select:none;
    transition:transform .08s, box-shadow .2s, opacity .2s;
    scroll-snap-align:center;
  }
  .gplus-btn::after{
    content:""; position:absolute; inset:-2px; border-radius:16px; padding:2px;
    background:linear-gradient(135deg,var(--edge1),var(--edge2));
    -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
    -webkit-mask-composite:xor; mask-composite:exclude;
    filter:blur(1.5px); opacity:.9; pointer-events:none;
  }
  .gplus-btn:hover{ transform:translateY(-1px); box-shadow:0 8px 18px rgba(0,0,0,.28) }
  .gplus-btn:active{ transform:scale(.96) }
  .gplus-btn[disabled]{ opacity:.45; cursor:not-allowed; filter:grayscale(.25) }
  .gplus-btn[disabled]::after{ opacity:.25 }

  /* 小圆徽标（随主题变色） */
  .gplus-badge{
    position:fixed; right:14px; bottom:calc(88px + env(safe-area-inset-bottom,0));
    z-index:2147483700;
    width:38px; height:38px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    background:rgba(20,22,30,.22);
    -webkit-backdrop-filter:blur(12px) saturate(160%); backdrop-filter:blur(12px) saturate(160%);
    border:1px solid var(--glass-stroke); box-shadow:0 10px 24px rgba(0,0,0,.32);
    color:var(--edge1); /* 图标颜色=主题主色 */
    cursor:pointer; user-select:none;
  }
  .gplus-badge svg{ width:22px; height:22px; fill:currentColor; filter:drop-shadow(0 0 6px color-mix(in srgb, var(--edge1), transparent 60%)); }
  .gplus-badge:hover{ box-shadow:0 12px 28px rgba(0,0,0,.38) }
  `;
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: STYLE }));

  /* ================= 工具 ================= */
  const $ = (s, r=document) => r.querySelector(s);
  const toast = (m)=>{const d=document.createElement('div');d.textContent=m;
    Object.assign(d.style,{position:'fixed',left:'50%',top:'18px',transform:'translateX(-50%)',background:'rgba(0,0,0,.65)',color:'#fff',padding:'6px 10px',borderRadius:'8px',zIndex:2147483800,fontSize:'12px'});document.body.appendChild(d);setTimeout(()=>d.remove(),1200);}
  const debounce=(fn,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}};

  const isFileView=()=> {
    const u = location.href.split('#')[0].split('?')[0];
    return /^https?:\/\/raw\.githubusercontent\.com\//.test(u) ||
           /^https?:\/\/github\.com\/[^\/]+\/[^\/]+\/(blob|raw|edit)\//.test(u);
  };
  const isEditView=()=> /\/edit\//.test(location.href.split('#')[0].split('?')[0]);

  function getRawUrl(){
    const href=location.href.split('#')[0].split('?')[0];
    const clean=location.origin+location.pathname;
    if(/^https?:\/\/raw\.githubusercontent\.com\//.test(href)) return href;
    const m1=clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
    if(m1) return `https://raw.githubusercontent.com/${m1[1]}/${m1[2]}/${m1[3]}/${m1[4]}`;
    const m2=clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
    if(m2) return `https://raw.githubusercontent.com/${m2[1]}/${m2[2]}/${m2[3]}/${m2[4]}`;
    return '';
  }
  const getRepoPath=()=>{const p=location.pathname.split('/').filter(Boolean);return p.length>=5?p.slice(4).join('/'):"";}
  const getFileName=()=>{const p=getRepoPath();return p?p.split('/').pop():"";}
  const getRepoSlug=()=>{const p=location.pathname.split('/').filter(Boolean);return p.length>=2?`${p[0]}/${p[1]}`:"";}
  const copyText=(t)=>{ if(!t) return; navigator.clipboard.writeText(t).then(()=>toast('Copied')).catch(()=>prompt('Copy manually:',t)); }

  async function downloadRaw(){
    const url=getRawUrl(); if(!url){ toast('Not a file view'); return; }
    const name=getFileName()||url.split('/').pop()||'download.txt';
    try{
      const res=await fetch(url,{cache:'no-store'}); if(!res.ok) throw new Error(res.status);
      const blob=await res.blob(); const a=document.createElement('a'); const obj=URL.createObjectURL(blob);
      a.href=obj; a.download=name; a.style.display='none'; document.body.appendChild(a); a.click();
      setTimeout(()=>{ URL.revokeObjectURL(obj); a.remove(); }, 800);
      toast('Saved: '+name);
    }catch(e){ window.open(url,'_blank'); toast('Fallback: opened Raw'); }
  }
  function toggleEdit(){
    const u=location.href.split('#')[0].split('?')[0];
    if(/\/edit\//.test(u)) location.href=u.replace('/edit/','/blob/');
    else if(/\/blob\//.test(u)) location.href=u.replace('/blob/','/edit/');
    else toast('Not a blob view');
  }
  function openActions(){ const slug=getRepoSlug(); slug?window.open(`https://github.com/${slug}/actions`,'_blank'):toast('Not in repo'); }

  /* ================= 按钮事件 ================= */
  function onBtnClick(e){
    const btn=e.target.closest('.gplus-btn'); if(!btn || btn.hasAttribute('disabled')) return;
    const act=btn.dataset.act;
    if(act==='raw'){ const r=getRawUrl(); r?copyText(r):toast('Not a file view'); }
    if(act==='dl'){ downloadRaw(); }
    if(act==='path'){ const p=getRepoPath(); p?copyText(p):toast('Not a file view'); }
    if(act==='edit'){ toggleEdit(); }
    if(act==='name'){ const n=getFileName(); n?copyText(n):toast('Not a file view'); }
    if(act==='action'){ openActions(); }
    if(act==='hub'){ window.open('https://scripthub.vercel.app','_blank'); }
  }
  function onBtnDbl(e){
    const btn=e.target.closest('.gplus-btn'); if(!btn || btn.hasAttribute('disabled')) return;
    if(btn.dataset.act==='raw'){ const r=getRawUrl(); r?window.open(r,'_blank'):toast('Raw URL not available'); }
  }
  function onBtnCtx(e){
    const btn=e.target.closest('.gplus-btn'); if(!btn || btn.hasAttribute('disabled')) return;
    if(btn.dataset.act==='raw'){ e.preventDefault(); downloadRaw(); }
  }

  /* ================= 工具条 ================= */
  function buildBar(){
    if(document.querySelector('.gplus-shbar')) return;
    const bar=document.createElement('div'); bar.className='gplus-shbar';
    bar.innerHTML=`
      <button class="gplus-btn" data-act="raw"    title="Raw: 单击复制 / 双击打开 / 长按下载">Raw</button>
      <button class="gplus-btn" data-act="dl"     title="下载 Raw">DL</button>
      <button class="gplus-btn" data-act="path"   title="复制仓库内路径">Path</button>
      <button class="gplus-btn" data-act="edit"   title="编辑/取消编辑">Edit</button>
      <button class="gplus-btn" data-act="name"   title="复制文件名">Name</button>
      <button class="gplus-btn" data-act="action" title="GitHub Actions">Action</button>
      <button class="gplus-btn" data-act="hub"    title="ScriptHub">Hub</button>
    `;
    bar.addEventListener('click', onBtnClick);
    bar.addEventListener('dblclick', onBtnDbl);
    bar.addEventListener('contextmenu', onBtnCtx);
    document.body.appendChild(bar);

    requestAnimationFrame(()=>{
      const delta=(bar.scrollWidth - bar.clientWidth)/2;
      if(delta>0) bar.scrollLeft = delta;
    });
  }

  /* ================= 小圆徽标（SVG 图标） ================= */
  function ensureBadge(){
    if(document.querySelector('.gplus-badge')) return;
    const badge=document.createElement('div');
    badge.className='gplus-badge';
    // 简洁的"闪电+星"SVG，使用 currentColor，随主题变色
    badge.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13 2L6 14h5l-1 8 7-12h-5l1-8z"></path>
      </svg>
    `;
    document.body.appendChild(badge);

    const bar = () => document.querySelector('.gplus-shbar');

    // 拖拽 + 单击/双击自实现（不依赖原生 click，避免 preventDefault 影响）
    let dragging=false, moved=false;
    let sx=0, sy=0, startRight=0, startBottom=0, downAt=0;
    let lastTap=0;
    const TAP_MS=250, DBL_MS=300, MOVE_PX=6;

    function onDown(ev){
      const e=(ev.touches&&ev.touches[0])||ev;
      dragging=true; moved=false; downAt=performance.now();
      sx=e.clientX; sy=e.clientY;
      const rect=badge.getBoundingClientRect();
      startRight = window.innerWidth  - rect.right;
      startBottom= window.innerHeight - rect.bottom;
      if (badge.setPointerCapture && ev.pointerId!=null) badge.setPointerCapture(ev.pointerId);
      ev.preventDefault();
    }
    function onMove(ev){
      if(!dragging) return;
      const e=(ev.touches&&ev.touches[0])||ev;
      const dx=e.clientX-sx, dy=e.clientY-sy;
      if(Math.abs(dx)+Math.abs(dy)>MOVE_PX) moved=true;
      badge.style.right  = Math.max(6, startRight - dx) + 'px';
      badge.style.bottom = Math.max(6, startBottom - dy) + 'px';
    }
    function onUp(){
      if(!dragging) return; dragging=false;
      const isTap = !moved && (performance.now()-downAt < TAP_MS);
      if(isTap){
        const now = performance.now();
        if(now - lastTap < DBL_MS){
          const cur = getTheme();
          const next = THEMES[(THEMES.indexOf(cur)+1)%THEMES.length];
          applyTheme(next);
          toast('Theme: '+next);
          lastTap = 0;
        }else{
          const el = bar(); if(el) el.classList.toggle('gplus-hidden');
          lastTap = now;
        }
      }
    }

    if('onpointerdown' in window){
      badge.addEventListener('pointerdown', onDown, {passive:false});
      window.addEventListener('pointermove', onMove, {passive:false});
      window.addEventListener('pointerup', onUp, {passive:false});
      window.addEventListener('pointercancel', onUp, {passive:false});
    }else{
      badge.addEventListener('touchstart', onDown, {passive:false});
      window.addEventListener('touchmove', onMove, {passive:false});
      window.addEventListener('touchend', onUp, {passive:false});
      badge.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    badge.addEventListener('contextmenu', e=>e.preventDefault(), {capture:true});
  }

  /* ================= 启用/禁用（文件/目录） ================= */
  function refreshAvailability(){
    const fileMode = isFileView();
    const editMode = isEditView();
    const q = k => document.querySelector(`.gplus-btn[data-act="${k}"]`);
    const dis = (el,flag)=> el && (flag? el.setAttribute('disabled','') : el.removeAttribute('disabled'));
    dis(q('raw'),   !fileMode);
    dis(q('dl'),    !fileMode);
    dis(q('name'),  !fileMode);
    dis(q('edit'),  !fileMode);
    if (q('edit')) q('edit').textContent = editMode ? 'Cancel' : 'Edit';
  }

  /* ================= SPA & 观察去抖 ================= */
  function hookHistory(){
    const _ps=history.pushState,_rs=history.replaceState;
    const fire=debounce(()=>refreshAvailability(),120);
    history.pushState=function(){ const r=_ps.apply(this,arguments); fire(); return r; };
    history.replaceState=function(){ const r=_rs.apply(this,arguments); fire(); return r; };
    window.addEventListener('popstate', fire, false);
  }

  /* ================= 启动 ================= */
  function boot(){
    applyTheme(getTheme());
    buildBar(); ensureBadge(); refreshAvailability();
    hookHistory();
    const mo=new MutationObserver(debounce(()=>refreshAvailability(),120));
    mo.observe(document.body,{childList:true,subtree:true});
  }
  boot();
})();