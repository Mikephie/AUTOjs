// ==UserScript==
// @name         GitHub+ Glass iOS26 + ScriptHub (Full)
// @namespace    https://mikephie.site/
// @version      4.0.1
// @description  iOS26 玻璃条 + 渐变描边；徽标(单击显隐/双击换主题/长按切尺寸/可拖拽/持久化)；Raw(单击复制/双击打开/长按下载)；DL 真下载；Path|Edit/Cancel 自动切换；Name|Action|Hub 分流；SPA 兼容；移动横滑；初次居中。
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
(() => {
  'use strict';

  /* ================= 主题持久化 ================= */
  const THEMES = ['neon','blue','pink','white','green','orange'];
  const THEME_KEY = 'gplus_theme';
  const getTheme = () => localStorage.getItem(THEME_KEY) || 'neon';
  function applyTheme(name){
    if(!THEMES.includes(name)) name='neon';
    document.documentElement.classList.remove(...THEMES.map(t=>'gplus-theme-'+t));
    document.documentElement.classList.add('gplus-theme-'+name);
    localStorage.setItem(THEME_KEY,name);
  }

  /* ================= 样式：iOS26 毛玻璃 ================= */
  const STYLE = `
  :root{
    --fg:#fff; --bar-h:56px;
    /* 默认主题：Neon 渐变描边 */
    --edge1:#ff00ff; --edge2:#00ffff;

    /* 暗色玻璃基底 */
    --glass-tint: 222 18% 10%;
    --glass-alpha:.10;
    --glass-stroke:0 0% 100% / .12;
    --card-alpha:.12;
    --badge-cat:#0b0f17;
  }
  @media (prefers-color-scheme:light){
    :root{
      --fg:#171717;
      --glass-tint:0 0% 100%;
      --glass-alpha:.66;
      --glass-stroke:0 0% 0% / .12;
      --card-alpha:.18;
      --badge-cat:#eef2ff;
    }
  }

  /* 主题色（6 套） */
  .gplus-theme-neon  { --edge1:#ff00ff; --edge2:#00ffff; }
  .gplus-theme-blue  { --edge1:#60a5fa; --edge2:#22d3ee; }
  .gplus-theme-pink  { --edge1:#f472b6; --edge2:#c084fc; }
  .gplus-theme-white { --edge1:#ffffff; --edge2:#ffffff; }
  .gplus-theme-green { --edge1:#10b981; --edge2:#06b6d4; }
  .gplus-theme-orange{ --edge1:#f97316; --edge2:#facc15; }

  /* 底部玻璃条 */
  .gplus-shbar{
    position:fixed; left:0; right:0;
    bottom:calc(0px + env(safe-area-inset-bottom,0));
    z-index:2147483600;
    height:var(--bar-h);
    display:flex; align-items:center; justify-content:center;
    gap:10px; padding:0 12px;

    background:linear-gradient(180deg,
      hsl(var(--glass-tint)/calc(var(--glass-alpha)+.04)) 0%,
      hsl(var(--glass-tint)/var(--glass-alpha)) 100%);
    -webkit-backdrop-filter:blur(24px) saturate(180%) contrast(1.05);
    backdrop-filter:blur(24px) saturate(180%) contrast(1.05);

    border-top:1px solid hsl(var(--glass-stroke));
    box-shadow:
      inset 0 1px 0 hsl(0 0% 100%/.18),
      inset 0 -1px 0 hsl(0 0% 0%/.12),
      0 -12px 28px rgba(0,0,0,.20);

    overflow-x:auto; white-space:nowrap; -webkit-overflow-scrolling:touch;
    scrollbar-width:none; scroll-snap-type:x proximity;
  }
  .gplus-shbar::-webkit-scrollbar{display:none}
  .gplus-hidden{display:none!important}

  /* 按钮：玻璃+渐变描边 */
  .gplus-btn{
    position:relative; display:flex; align-items:center; justify-content:center;
    height:40px; min-width:86px; padding:0 14px;
    color:var(--fg); font:700 13px/1 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial;
    border-radius:14px; border:1px solid hsl(var(--glass-stroke));
    background:hsl(var(--glass-tint)/var(--card-alpha));
    -webkit-backdrop-filter:blur(16px) saturate(170%); backdrop-filter:blur(16px) saturate(170%);
    box-shadow:inset 0 1px 0 hsl(0 0% 100%/.20), 0 6px 18px rgba(0,0,0,.22);
    cursor:pointer; user-select:none;
    transition:transform .08s,box-shadow .2s,opacity .2s,background .2s;
    scroll-snap-align:center;
  }
  .gplus-btn::after{
    content:""; position:absolute; inset:-2px; border-radius:16px; pointer-events:none;
    background:linear-gradient(135deg,var(--edge1),var(--edge2));
    -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
    -webkit-mask-composite:xor; mask-composite:exclude;
    filter:blur(1.4px); opacity:.85;
  }
  .gplus-btn:hover{transform:translateY(-1px)}
  .gplus-btn:active{transform:scale(.965)}
  .gplus-btn[disabled]{opacity:.45; cursor:not-allowed; filter:grayscale(.25)}
  .gplus-btn[disabled]::after{opacity:.25}

  /* 徽标：圆形玻璃 + 渐变光环 */
  .gplus-badge{
    position:fixed; right:14px; bottom:calc(88px + env(safe-area-inset-bottom,0));
    z-index:2147483700;
    border-radius:50%; display:flex; align-items:center; justify-content:center;
    background:hsl(var(--glass-tint)/calc(var(--glass-alpha)+.05));
    -webkit-backdrop-filter:blur(18px) saturate(180%) contrast(1.05);
    backdrop-filter:blur(18px) saturate(180%) contrast(1.05);
    border:1px solid hsl(var(--glass-stroke));
    box-shadow:inset 0 1px 0 hsl(0 0% 100%/.20), 0 14px 32px rgba(0,0,0,.35);
    color:var(--edge1); cursor:pointer; user-select:none; transition:transform .15s;
  }
  .gplus-badge:hover{ transform:scale(1.05); }
  .gplus-badge svg{ display:block; }
  .gplus-badge::after{
    content:""; position:absolute; inset:-3px; border-radius:50%;
    background:conic-gradient(from 0deg,var(--edge1),var(--edge2),var(--edge1));
    filter:blur(10px); opacity:.9; z-index:-1; pointer-events:none;
  }
  `;
  document.head.appendChild(Object.assign(document.createElement('style'),{textContent:STYLE}));

  /* ================= 小工具 ================= */
  const $ = (s,r=document)=>r.querySelector(s);
  const on = (el,ev,fn,opt)=>el&&el.addEventListener(ev,fn,opt);
  function toast(msg){const d=document.createElement('div');d.textContent=msg;
    Object.assign(d.style,{position:'fixed',left:'50%',top:'18px',transform:'translateX(-50%)',background:'rgba(0,0,0,.65)',color:'#fff',padding:'6px 10px',borderRadius:'8px',zIndex:2147483800,fontSize:'12px'});document.body.appendChild(d);setTimeout(()=>d.remove(),1200);}
  function debounce(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}

  function isFileView(){
    const u=location.href.split('#')[0].split('?')[0];
    return /^https?:\/\/raw\.githubusercontent\.com\//.test(u) ||
           /^https?:\/\/github\.com\/[^\/]+\/[^\/]+\/(blob|raw|edit)\//.test(u);
  }
  function isEditView(){ return /\/edit\//.test(location.href.split('#')[0].split('?')[0]); }
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
  function getRepoPath(){const p=location.pathname.split('/').filter(Boolean);return p.length>=5?p.slice(4).join('/'):"";}
  function getFileName(){const p=getRepoPath();return p?p.split('/').pop():"";}
  function getRepoSlug(){const p=location.pathname.split('/').filter(Boolean);return p.length>=2?`${p[0]}/${p[1]}`:"";}
  async function copyText(t){ if(!t)return; try{ await navigator.clipboard.writeText(t); toast('Copied'); }catch{ prompt('Copy manually:',t); } }

  /* ================= Hub 分流 ================= */
  function pickBases(e){
    if (e && e.altKey)   return ['http://127.0.0.1:9101','https://scripthub.vercel.app','https://script.hub'];
    if (e && e.shiftKey) return ['https://script.hub','https://scripthub.vercel.app','http://127.0.0.1:9101'];
    return ['https://scripthub.vercel.app','https://script.hub','http://127.0.0.1:9101'];
  }
  function buildHubUrl(base, raw){
    if (base.includes('scripthub.vercel.app')) return `${base}/?src=${encodeURIComponent(raw)}`;
    return `${base}/convert/_start_/${encodeURIComponent(raw)}/_end_/plain.txt?type=plain-text&target=plain-text`;
  }
  function openScriptHub(e){
    const raw=getRawUrl(); if(!raw){toast("Not a file view");return;}
    const bases=pickBases(e);
    (function tryOpen(i){
      if(i>=bases.length){copyText(raw);toast("已复制 Raw，手动粘贴到 ScriptHub");return;}
      const url=buildHubUrl(bases[i], raw);
      try{ const w=window.open(url,'_blank','noopener'); if(!w) location.assign(url); }
      catch{ tryOpen(i+1); }
    })(0);
  }

  /* ================= 动作 ================= */
  function openRaw(){ const r=getRawUrl(); r?window.open(r,'_blank'):toast('Raw URL not available'); }
  function copyRaw(){ const r=getRawUrl(); r?copyText(r):toast('Not a file view'); }
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

  /* ================= 工具条 UI ================= */
  function buildBar(){
    if($('.gplus-shbar')) return;
    const bar=document.createElement('div'); bar.className='gplus-shbar';
    bar.innerHTML=`
      <button class="gplus-btn" data-act="raw"    title="Raw: 单击复制 / 双击打开 / 长按下载">Raw</button>
      <button class="gplus-btn" data-act="dl"     title="下载 Raw">DL</button>
      <button class="gplus-btn" data-act="path"   title="复制路径 / 编辑页变 Cancel">Path</button>
      <button class="gplus-btn" data-act="edit"   title="编辑/取消编辑">Edit</button>
      <button class="gplus-btn" data-act="name"   title="复制文件名">Name</button>
      <button class="gplus-btn" data-act="action" title="仓库 Actions">Action</button>
      <button class="gplus-btn" data-act="hub"    title="ScriptHub">Hub</button>
    `;
    // 事件
    on(bar,'click',e=>{
      const btn=e.target.closest('.gplus-btn'); if(!btn) return;
      const act=btn.dataset.act;
      if(act==='raw')  copyRaw();
      if(act==='dl')   downloadRaw();
      if(act==='path'){ if(isEditView()){ toggleEdit(); } else { const p=getRepoPath(); p?copyText(p):toast('Not a file view'); } }
      if(act==='edit') toggleEdit();
      if(act==='name'){ const fn=getFileName(); fn?copyText(fn):toast('Not a file view'); }
      if(act==='action') openActions();
      if(act==='hub')  openScriptHub(e);
    });
    // Raw: 双击=打开
    on(bar.querySelector('[data-act="raw"]'), 'dblclick', openRaw);
    // Raw: 长按/右键=下载
    on(bar.querySelector('[data-act="raw"]'), 'contextmenu', e=>{e.preventDefault();downloadRaw();});

    document.body.appendChild(bar);
    // 初次居中
    requestAnimationFrame(()=>{ const delta=(bar.scrollWidth-bar.clientWidth)/2; if(delta>0) bar.scrollLeft=delta; });
  }

  /* ================= 徽标（拖拽/单击显隐/双击换主题/长按尺寸） ================= */
  function ensureBadge(){
    if($('.gplus-badge')) return;
    const badge=document.createElement('div'); badge.className='gplus-badge';
    badge.innerHTML=`
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="60" cy="60" r="58" fill="currentColor" opacity="0.92"/>
        <path fill="var(--badge-cat)" d="M60 8C30.6 8 6 32.6 6 62c0 23.9 15.5 44.2 37 51.4
          2.7.5 3.6-1.2 3.6-2.6 0-1.3-.1-5.5-.1-10.1-15 3.3-18.2-6.4-18.2-6.4-2.5-6.4-6.2-8.1-6.2-8.1
          -5.1-3.5.4-3.5.4-3.5 5.6.4 8.5 5.8 8.5 5.8 5 8.5 13.1 6.1 16.3 4.6.5-3.6 2-6.1 3.6-7.5
          -12-1.4-24.6-6-24.6-26.9 0-5.9 2.1-10.7 5.7-14.4-.6-1.4-2.5-7.2.5-15
          0 0 4.7-1.5 15.5 5.5 4.5-1.2 9.3-1.8 14.1-1.8s9.6.6 14.1 1.8
          c10.8-7 15.5-5.5 15.5-5.5 3 7.8 1.1 13.6.5 15 3.5 3.7 5.7 8.5 5.7 14.4
          0 21-12.6 25.5-24.7 26.9 2.1 1.8 4 5.4 4 11 0 7.9-.1 14.2-.1 16.1
          0 1.4.9 3.1 3.6 2.6C98.5 106.2 114 85.9 114 62c0-29.4-24.6-54-54-54z"/>
      </svg>`;
    document.body.appendChild(badge);

    // 尺寸持久化
    const SIZE_KEY='gplus_badge_size'; const SIZES=[56,76,90];
    let size=parseInt(localStorage.getItem(SIZE_KEY)||SIZES[1],10); if(!SIZES.includes(size)) size=SIZES[1];
    function applyBadgeSize(px){
      badge.style.width=px+'px'; badge.style.height=px+'px';
      const svg=badge.querySelector('svg'); const inner=Math.round(px*0.63);
      svg.style.width=inner+'px'; svg.style.height=inner+'px';
    }
    applyBadgeSize(size);

    // 手势
    const bar = ()=>$('.gplus-shbar');
    let dragging=false,moved=false,sx=0,sy=0,startR=0,startB=0,downAt=0,lastTap=0;
    let longTimer=null,longTriggered=false,singleTimer=null;
    const TAP_MS=250, DBL_MS=300, MOVE_PX=6, LONG_MS=600;
    const clearLong=()=>{ if(longTimer){clearTimeout(longTimer); longTimer=null;} };
    const clearSingle=()=>{ if(singleTimer){clearTimeout(singleTimer); singleTimer=null;} };
    function longFire(){ longTriggered=true; size=SIZES[(SIZES.indexOf(size)+1)%SIZES.length]; localStorage.setItem(SIZE_KEY,String(size)); applyBadgeSize(size); toast('Badge size: '+size+'px'); }

    function onDown(ev){
      const e=(ev.touches&&ev.touches[0])||ev;
      dragging=true; moved=false; longTriggered=false; downAt=performance.now();
      sx=e.clientX; sy=e.clientY;
      const rect=badge.getBoundingClientRect();
      startR=window.innerWidth-rect.right; startB=window.innerHeight-rect.bottom;
      clearLong(); clearSingle(); longTimer=setTimeout(longFire,LONG_MS);
      if(badge.setPointerCapture && ev.pointerId!=null) badge.setPointerCapture(ev.pointerId);
      ev.preventDefault();
    }
    function onMove(ev){
      if(!dragging) return;
      const e=(ev.touches&&ev.touches[0])||ev;
      const dx=e.clientX-sx, dy=e.clientY-sy;
      if(Math.abs(dx)+Math.abs(dy)>MOVE_PX) moved=true;
      if(moved) clearLong();
      badge.style.right=Math.max(6,startR-dx)+'px';
      badge.style.bottom=Math.max(6,startB-dy)+'px';
    }
    function onUp(){
      if(!dragging) return; dragging=false; clearLong();
      if(longTriggered){ clearSingle(); return; }
      const isTap=!moved && (performance.now()-downAt < TAP_MS);
      if(!isTap){ clearSingle(); return; }
      const now=performance.now();
      if(now-lastTap < DBL_MS){
        clearSingle();
        const cur=getTheme(); const next=THEMES[(THEMES.indexOf(cur)+1)%THEMES.length];
        applyTheme(next); toast('Theme: '+next); lastTap=0;
      }else{
        clearSingle();
        singleTimer=setTimeout(()=>{ const el=bar(); if(el) el.classList.toggle('gplus-hidden'); }, DBL_MS+10);
        lastTap=now;
      }
    }
    if('onpointerdown' in window){
      on(badge,'pointerdown',onDown,{passive:false});
      on(window,'pointermove',onMove,{passive:false});
      on(window,'pointerup',onUp,{passive:false});
      on(window,'pointercancel',onUp,{passive:false});
    }else{
      on(badge,'touchstart',onDown,{passive:false});
      on(window,'touchmove',onMove,{passive:false});
      on(window,'touchend',onUp,{passive:false});
      on(badge,'mousedown',onDown);
      on(window,'mousemove',onMove);
      on(window,'mouseup',onUp);
    }
    on(badge,'contextmenu',e=>e.preventDefault(),{capture:true});
  }

  /* ================= 状态刷新（按钮禁用/文案） ================= */
  function refreshAvailability(){
    const fileMode=isFileView();
    const editMode=isEditView();
    const q=k=>$(`.gplus-btn[data-act="${k}"]`);
    const dis=(el,flag)=>el && (flag? el.setAttribute('disabled','') : el.removeAttribute('disabled'));
    dis(q('raw'),!fileMode);
    dis(q('dl'),!fileMode);
    dis(q('name'),!fileMode);
    dis(q('edit'),!fileMode);
    if(q('edit')) q('edit').textContent = editMode ? 'Cancel' : 'Edit';
    if(q('path')) q('path').textContent = editMode ? 'Cancel' : 'Path';
  }

  /* ================= SPA Hook ================= */
  function hookHistory(){
    const _ps=history.pushState,_rs=history.replaceState;
    const fire=debounce(()=>{ refreshAvailability(); },120);
    history.pushState=function(){ const r=_ps.apply(this,arguments); fire(); return r; };
    history.replaceState=function(){ const r=_rs.apply(this,arguments); fire(); return r; };
    window.addEventListener('popstate', fire, false);
  }

  /* ================= 启动 ================= */
  function boot(){
    applyTheme(getTheme());
    buildBar(); ensureBadge();
    refreshAvailability();
    hookHistory();
    const mo=new MutationObserver(debounce(refreshAvailability,120));
    mo.observe(document.body,{childList:true,subtree:true});
    // 初次让 bar 内容居中
    requestAnimationFrame(()=>{ const bar=$('.gplus-shbar'); if(bar){ const d=(bar.scrollWidth-bar.clientWidth)/2; if(d>0) bar.scrollLeft=d; }});
  }
  boot();
})();