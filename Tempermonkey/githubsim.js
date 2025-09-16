// ==UserScript==
// @name         GitHub+ ScriptHub Glass Bar (v3.9.0)
// @namespace    https://mikephie.site/
// @version      4.0.0
// @description  底部超薄玻璃条（文件页启用/目录禁用）；Raw(单击复制/双击Raw/长按下载) · DL · Path · Edit/Cancel · Name · Action · Hub 分流；Octocat 圆形徽标：渐变光环、可拖拽、单击显隐、双击换主题、长按切换大小(56/76/90，持久化)；六种主题；SPA 兼容、去抖、初次居中。
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
(() => {
  'use strict';

  /* ================== 主题（持久化） ================== */
  const THEMES = ['neon','blue','pink','white','green','orange'];
  const getTheme = () => localStorage.getItem('gplus_theme') || 'neon';
  function applyTheme(name){
    if(!THEMES.includes(name)) name='neon';
    document.body.classList.remove(...THEMES.map(t=>'gplus-theme-'+t));
    document.body.classList.add('gplus-theme-'+name);
    localStorage.setItem('gplus_theme', name);
  }

  /* ================== 样式 ================== */
  const STYLE = `
  :root{
    --fg:#fff;
    --glass-bg:rgba(20,22,30,.07);
    --glass-stroke:rgba(255,255,255,.16);
    --bar-h:56px;
    --edge1:#ff00ff; --edge2:#00ffff;  /* 默认 Neon */
    --badge-cat:#0b0f17;               /* Octocat 本体颜色（深色） */
  }
  @media (prefers-color-scheme:light){
    :root{ --fg:#111; --glass-bg:rgba(255,255,255,.65); --glass-stroke:rgba(0,0,0,.12) }
  }
  /* 主题色（6 套） */
  .gplus-theme-neon  { --edge1:#ff00ff; --edge2:#00ffff; }
  .gplus-theme-blue  { --edge1:#60a5fa; --edge2:#22d3ee; }
  .gplus-theme-pink  { --edge1:#f472b6; --edge2:#c084fc; }
  .gplus-theme-white { --edge1:#ffffff; --edge2:#ffffff; }
  .gplus-theme-green { --edge1:#10b981; --edge2:#06b6d4; }
  .gplus-theme-orange{ --edge1:#f97316; --edge2:#facc15; }

  /* 底部超薄玻璃条 */
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

  /* 按钮 */
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

  /* Octocat 圆形徽标（渐变光环；尺寸由 JS 动态设置，初始用持久化值） */
  .gplus-badge{
    position:fixed; right:14px; bottom:calc(88px + env(safe-area-inset-bottom,0));
    z-index:2147483700;
    border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    background:rgba(20,22,30,.22);
    -webkit-backdrop-filter:blur(16px) saturate(180%); backdrop-filter:blur(16px) saturate(180%);
    border:2px solid var(--glass-stroke);
    box-shadow:0 14px 32px rgba(0,0,0,.35);
    color:var(--edge1);                  /* 背景圆使用 currentColor */
    cursor:pointer; user-select:none;
    transition:transform .15s;
  }
  .gplus-badge:hover{ transform:scale(1.05); }
  .gplus-badge svg{ display:block; }
  /* 渐变光环（与按钮一致） */
  .gplus-badge::after{
    content:""; position:absolute; inset:-3px; border-radius:50%;
    background:conic-gradient(from 0deg, var(--edge1), var(--edge2), var(--edge1));
    filter:blur(10px); opacity:.9; z-index:-1; pointer-events:none;
  }
  `;
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: STYLE }));

  /* ================== 小工具 ================== */
  const $ = (s, r=document) => r.querySelector(s);
  function toast(msg){const d=document.createElement('div');d.textContent=msg;
    Object.assign(d.style,{position:'fixed',left:'50%',top:'18px',transform:'translateX(-50%)',background:'rgba(0,0,0,.65)',color:'#fff',padding:'6px 10px',borderRadius:'8px',zIndex:2147483800,fontSize:'12px'});document.body.appendChild(d);setTimeout(()=>d.remove(),1200);}
  function debounce(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}

  function isFileView(){
    const u = location.href.split('#')[0].split('?')[0];
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
  function copyText(t){ if(!t) return; navigator.clipboard.writeText(t).then(()=>toast('Copied')).catch(()=>prompt('Copy manually:',t)); }

  /* ================== Hub 分流 ================== */
  function pickBases(e){
    if (e && e.altKey)   return ['http://127.0.0.1:9101','https://scripthub.vercel.app','https://script.hub'];
    if (e && e.shiftKey) return ['https://script.hub','https://scripthub.vercel.app','http://127.0.0.1:9101'];
    return ['https://scripthub.vercel.app','https://script.hub','http://127.0.0.1:9101'];
  }
  function buildHubUrl(base, raw){
    if (base.includes('scripthub.vercel.app')) {
      return `${base}/?src=${encodeURIComponent(raw)}`; // vercel: 用 ?src
    }
    return `${base}/convert/_start_/${encodeURIComponent(raw)}/_end_/plain.txt?type=plain-text&target=plain-text`;
  }
  function openScriptHub(e){
    const raw=getRawUrl(); if(!raw){toast("Not a file view");return;}
    const bases=pickBases(e);
    (function tryOpen(i){
      if(i>=bases.length){copyText(raw);toast("已复制 Raw，手动粘贴到 ScriptHub");return;}
      const url=buildHubUrl(bases[i], raw);
      try{
        const w=window.open(url,'_blank','noopener');
        if(!w) location.assign(url);
      }catch{ tryOpen(i+1); }
    })(0);
  }

  /* ================== 按钮事件 ================== */
  function onBtnClick(e){
    const btn=e.target.closest('.gplus-btn'); if(!btn || btn.hasAttribute('disabled')) return;
    const act=btn.dataset.act;
    if(act==='raw'){ const r=getRawUrl(); r?copyText(r):toast('Not a file view'); }
    if(act==='dl'){ downloadRaw(); }
    if(act==='path'){ const p=getRepoPath(); p?copyText(p):toast('Not a file view'); }
    if(act==='edit'){ toggleEdit(); }
    if(act==='name'){ const n=getFileName(); n?copyText(n):toast('Not a file view'); }
    if(act==='action'){ openActions(); }
    if(act==='hub'){ openScriptHub(e); }
  }
  function onBtnDbl(e){
    const btn=e.target.closest('.gplus-btn'); if(!btn || btn.hasAttribute('disabled')) return;
    if(btn.dataset.act==='raw'){ const r=getRawUrl(); r?window.open(r,'_blank'):toast('Raw URL not available'); }
  }
  function onBtnCtx(e){
    const btn=e.target.closest('.gplus-btn'); if(!btn || btn.hasAttribute('disabled')) return;
    if(btn.dataset.act==='raw'){ e.preventDefault(); downloadRaw(); }
  }

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
  function openActions(){
    const slug=getRepoSlug(); slug?window.open(`https://github.com/${slug}/actions`,'_blank'):toast('Not in repo');
  }

  /* ================== 工具条 ================== */
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

    // 初次居中
    requestAnimationFrame(()=>{
      const delta=(bar.scrollWidth - bar.clientWidth)/2;
      if(delta>0) bar.scrollLeft = delta;
    });
  }

  /* ================== 徽标（拖拽 / 单击显隐 / 双击切主题 / 长按切换尺寸） ================== */
  function ensureBadge(){
    if(document.querySelector('.gplus-badge')) return;

    const badge=document.createElement('div');
    badge.className='gplus-badge';
    badge.innerHTML = `
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
      </svg>
    `;
    document.body.appendChild(badge);

    // ---- 尺寸持久化 & 应用 ---- //
    const SIZE_KEY = 'gplus_badge_size';
    const SIZES = [56, 76, 90]; // px
    let size = parseInt(localStorage.getItem(SIZE_KEY) || SIZES[1], 10);
    if(!SIZES.includes(size)) size = SIZES[1];
    function applyBadgeSize(px){
      badge.style.width  = px + 'px';
      badge.style.height = px + 'px';
      // 图标大小相对：宽高的 ~63%
      const svg = badge.querySelector('svg');
      const inner = Math.round(px * 0.63);
      svg.style.width  = inner + 'px';
      svg.style.height = inner + 'px';
    }
    applyBadgeSize(size);

    const bar = () => document.querySelector('.gplus-shbar');

    // ---- 手势：拖拽 + 单击显隐(延时) + 双击切主题 + 长按切换尺寸（600ms）----
    let dragging=false, moved=false;
    let sx=0, sy=0, startRight=0, startBottom=0, downAt=0, lastTap=0;
    let longTimer=null, longTriggered=false, singleTimer=null;
    const TAP_MS=250, DBL_MS=300, MOVE_PX=6, LONG_MS=600;

    function longPressFire(){
      longTriggered = true;
      const idx = SIZES.indexOf(size);
      size = SIZES[(idx + 1) % SIZES.length];
      localStorage.setItem(SIZE_KEY, String(size));
      applyBadgeSize(size);
      toast('Badge size: ' + size + 'px');
    }
    function clearLong(){ if(longTimer){ clearTimeout(longTimer); longTimer=null; } }
    function clearSingle(){ if(singleTimer){ clearTimeout(singleTimer); singleTimer=null; } }

    function onDown(ev){
      const e=(ev.touches&&ev.touches[0])||ev;
      dragging=true; moved=false; longTriggered=false; downAt=performance.now();
      sx=e.clientX; sy=e.clientY;
      const rect=badge.getBoundingClientRect();
      startRight = window.innerWidth  - rect.right;
      startBottom= window.innerHeight - rect.bottom;
      clearLong(); clearSingle();
      longTimer = setTimeout(longPressFire, LONG_MS);
      if(badge.setPointerCapture && ev.pointerId!=null) badge.setPointerCapture(ev.pointerId);
      ev.preventDefault();
    }
    function onMove(ev){
      if(!dragging) return;
      const e=(ev.touches&&ev.touches[0])||ev;
      const dx=e.clientX-sx, dy=e.clientY-sy;
      if(Math.abs(dx)+Math.abs(dy)>MOVE_PX) moved=true;
      if(moved) clearLong(); // 移动后不触发长按
      badge.style.right  = Math.max(6, startRight - dx) + 'px';
      badge.style.bottom = Math.max(6, startBottom - dy) + 'px';
    }
    function onUp(){
      if(!dragging) return; dragging=false;
      clearLong();

      // 长按已触发：吞掉单/双击
      if(longTriggered){ clearSingle(); return; }

      const isTap = !moved && (performance.now() - downAt < TAP_MS);
      if(!isTap){ clearSingle(); return; }

      const now = performance.now();
      // 双击：取消单击定时，直接换主题
      if(now - lastTap < DBL_MS){
        clearSingle();
        const cur = getTheme();
        const next = THEMES[(THEMES.indexOf(cur)+1)%THEMES.length];
        applyTheme(next);
        toast('Theme: ' + next);
        lastTap = 0;
      }else{
        // 单击：延迟到 DBL_MS 后执行（如果期间再点一次会被取消）
        clearSingle();
        singleTimer = setTimeout(()=>{
          const el = bar(); if(el) el.classList.toggle('gplus-hidden');
        }, DBL_MS + 10);
        lastTap = now;
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

  /* ================== 启用/禁用（文件/目录） ================== */
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

  /* ================== SPA & 观察去抖 ================== */
  function hookHistory(){
    const _ps=history.pushState,_rs=history.replaceState;
    const fire=debounce(()=>{ refreshAvailability(); },120);
    history.pushState=function(){ const r=_ps.apply(this,arguments); fire(); return r; };
    history.replaceState=function(){ const r=_rs.apply(this,arguments); fire(); return r; };
    window.addEventListener('popstate', fire, false);
  }

  /* ================== 启动 ================== */
  function boot(){
    applyTheme(getTheme());     // 读取并应用主题
    buildBar(); ensureBadge();  // UI
    refreshAvailability();      // 状态
    hookHistory();              // SPA
    const mo=new MutationObserver(debounce(()=>refreshAvailability(),120));
    mo.observe(document.body,{childList:true,subtree:true});
    // 初次让 bar 内容居中到可视中点
    requestAnimationFrame(()=>{
      const bar = document.querySelector('.gplus-shbar');
      if(bar){ const delta=(bar.scrollWidth - bar.clientWidth)/2; if(delta>0) bar.scrollLeft = delta; }
    });
  }
  boot();
})();