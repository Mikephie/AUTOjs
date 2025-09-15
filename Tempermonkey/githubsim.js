// ==UserScript==
// @name         GitHub+ ScriptHub Glass Bar (bottom thin, centered, draggable badge)
// @namespace    https://mikephie.site/
// @version      3.8.2
// @description  底部超薄玻璃工具条：按钮水平/垂直居中、初始居中吸附；Raw(单击复制/双击Raw/长按下载) · DL(下载) · Path · Edit/Cancel · Name · Action · Hub；徽标可拖拽并默认避让底栏；轻量去抖避免加载抖动；SPA兼容。
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
(() => {
  'use strict';

  /* ================= CSS（更薄、更透、垂直居中） ================= */
  const STYLE = `
  :root{
    --fg:#fff;
    --glass-bg:rgba(20,22,30,.07);         /* 更透明 */
    --glass-stroke:rgba(255,255,255,.16);
    --bar-h:56px;                          /* 固定高度，解决"背景条太大" */
  }
  @media (prefers-color-scheme:light){
    :root{ --fg:#111; --glass-bg:rgba(255,255,255,.65); --glass-stroke:rgba(0,0,0,.12) }
  }

  .gplus-shbar{
    position:fixed; left:0; right:0;
    bottom:calc(0px + env(safe-area-inset-bottom,0));
    z-index:2147483600;

    /* 尺寸 & 居中 */
    height:var(--bar-h);
    display:flex; align-items:center; justify-content:center;
    gap:10px; padding:0 12px;
    overflow-x:auto; white-space:nowrap; -webkit-overflow-scrolling:touch; scrollbar-width:none;

    /* 玻璃效果 */
    background:var(--glass-bg);
    -webkit-backdrop-filter:blur(20px) saturate(180%);
    backdrop-filter:blur(20px) saturate(180%);
    border-top:1px solid var(--glass-stroke);
    box-shadow:0 -10px 28px rgba(0,0,0,.18);

    /* 细节 */
    scroll-snap-type:x proximity;
    will-change:transform;
  }
  .gplus-shbar::-webkit-scrollbar{ display:none }

  .gplus-btn{
    position:relative;
    display:flex; align-items:center; justify-content:center; /* 垂直 + 水平居中 */
    height:40px; min-width:86px; padding:0 14px;
    color:var(--fg); font:700 13px/1 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial;
    border-radius:14px; border:2px solid transparent; background-clip:padding-box;
    background:rgba(0,0,0,.10);             /* 更薄更透 */
    -webkit-backdrop-filter:blur(12px) saturate(170%); backdrop-filter:blur(12px) saturate(170%);
    cursor:pointer; user-select:none; transition:transform .08s, box-shadow .2s, opacity .2s;
    scroll-snap-align:center;
  }
  .gplus-btn::after{
    content:""; position:absolute; inset:-2px; border-radius:16px; padding:2px;
    background:linear-gradient(135deg,#ff00ff,#00ffff);
    -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
    -webkit-mask-composite:xor; mask-composite:exclude;
    filter:blur(1.5px); opacity:.9; pointer-events:none;
  }
  .gplus-btn:hover{ transform:translateY(-1px); box-shadow:0 8px 18px rgba(0,0,0,.28) }
  .gplus-btn:active{ transform:scale(.96) }
  .gplus-btn[disabled]{ opacity:.45; cursor:not-allowed; filter:grayscale(.25) }
  .gplus-btn[disabled]::after{ opacity:.25 }

  /* 徽标：初始更靠上，避免遮挡底栏；可拖拽 */
  .gplus-badge{
    position:fixed; right:14px; bottom:calc(88px + env(safe-area-inset-bottom,0));
    z-index:2147483700;
    display:inline-flex; align-items:center; gap:8px;
    padding:8px 14px; border-radius:14px; color:var(--fg); font-weight:900; font-size:13px; letter-spacing:.2px;
    background:rgba(20,22,30,.22);
    -webkit-backdrop-filter:blur(12px) saturate(160%); backdrop-filter:blur(12px) saturate(160%);
    border:1px solid var(--glass-stroke); box-shadow:0 10px 24px rgba(0,0,0,.32);
    cursor:pointer; user-select:none;
  }`;
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: STYLE }));

  /* ================= 工具函数 ================= */
  const $ = (s, r=document) => r.querySelector(s);
  function toast(msg){const d=document.createElement('div');d.textContent=msg;
    Object.assign(d.style,{position:'fixed',left:'50%',top:'18px',transform:'translateX(-50%)',background:'rgba(0,0,0,.65)',color:'#fff',padding:'6px 10px',borderRadius:'8px',zIndex:2147483800,fontSize:'12px'});document.body.appendChild(d);setTimeout(()=>d.remove(),1200);}
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

  /* ================= 事件 ================= */
  function handleClick(e){
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
  function handleDblClick(e){
    const btn=e.target.closest('.gplus-btn'); if(!btn || btn.hasAttribute('disabled')) return;
    if(btn.dataset.act==='raw'){ const r=getRawUrl(); r?window.open(r,'_blank'):toast('Raw URL not available'); }
  }
  function handleContext(e){
    const btn=e.target.closest('.gplus-btn'); if(!btn || btn.hasAttribute('disabled')) return;
    if(btn.dataset.act==='raw'){ e.preventDefault(); downloadRaw(); }
  }

  /* ================= UI ================= */
  function buildBar(){
    if($('.gplus-shbar')) return;
    const bar=document.createElement('div'); bar.className='gplus-shbar';
    bar.innerHTML = `
      <button class="gplus-btn" data-act="raw"   title="Raw: 单击复制 / 双击打开 / 长按下载">Raw</button>
      <button class="gplus-btn" data-act="dl"    title="下载 Raw">DL</button>
      <button class="gplus-btn" data-act="path"  title="复制仓库内路径">Path</button>
      <button class="gplus-btn" data-act="edit"  title="编辑/取消编辑">Edit</button>
      <button class="gplus-btn" data-act="name"  title="复制文件名">Name</button>
      <button class="gplus-btn" data-act="action" title="GitHub Actions">Action</button>
      <button class="gplus-btn" data-act="hub"   title="ScriptHub">Hub</button>
    `;
    bar.addEventListener('click', handleClick);
    bar.addEventListener('dblclick', handleDblClick);
    bar.addEventListener('contextmenu', handleContext);
    document.body.appendChild(bar);

    // 初次让内容居中到可视中点
    requestAnimationFrame(()=>{
      const delta=(bar.scrollWidth - bar.clientWidth)/2;
      if(delta>0) bar.scrollLeft = delta;
    });
  }

  function ensureBadge(){
    if($('.gplus-badge')) return;
    const b=document.createElement('div'); b.className='gplus-badge'; b.textContent='GitHubPlus';
    document.body.appendChild(b);
    // 单击：显隐工具条
    b.addEventListener('click',()=>$('.gplus-shbar')?.classList.toggle('gplus-hidden'));

    // 拖拽（避免遮挡）
    let dragging=false,moved=false,sx=0,sy=0,startR=0,startB=0;
    const down=(ev)=>{const e=(ev.touches&&ev.touches[0])||ev; dragging=true;moved=false;sx=e.clientX;sy=e.clientY;
      const rect=b.getBoundingClientRect(); startR=window.innerWidth-rect.right; startB=window.innerHeight-rect.bottom;
      ev.preventDefault();};
    const move=(ev)=>{ if(!dragging) return; const e=(ev.touches&&ev.touches[0])||ev;
      const dx=e.clientX-sx, dy=e.clientY-sy; if(Math.abs(dx)+Math.abs(dy)>4) moved=true;
      b.style.right=Math.max(6,startR-dx)+'px'; b.style.bottom=Math.max(6,startB+dy)+'px'; };
    const up=()=>{ dragging=false; };
    b.addEventListener('pointerdown',down); window.addEventListener('pointermove',move,{passive:false});
    window.addEventListener('pointerup',up,{passive:false});
    b.addEventListener('touchstart',down,{passive:false}); window.addEventListener('touchmove',move,{passive:false});
    window.addEventListener('touchend',up,{passive:false});
  }

  function refreshAvailability(){
    const fileMode = isFileView();
    const editMode = isEditView();
    const q = k => $(`.gplus-btn[data-act="${k}"]`);
    const dis = (el,flag)=> el && (flag? el.setAttribute('disabled','') : el.removeAttribute('disabled'));
    dis(q('raw'),   !fileMode);
    dis(q('dl'),    !fileMode);
    dis(q('name'),  !fileMode);
    dis(q('edit'),  !fileMode);
    if (q('edit')) q('edit').textContent = editMode ? 'Cancel' : 'Edit';
  }

  /* ================= SPA & 去抖 ================= */
  function debounce(fn,ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }
  function hookHistory(){
    const _ps=history.pushState,_rs=history.replaceState;
    const fire=debounce(()=>{ refreshAvailability(); },120);
    history.pushState=function(){ const r=_ps.apply(this,arguments); fire(); return r; };
    history.replaceState=function(){ const r=_rs.apply(this,arguments); fire(); return r; };
    window.addEventListener('popstate', fire, false);
  }

  /* ================= 启动 ================= */
  function boot(){
    buildBar(); ensureBadge(); refreshAvailability();
    hookHistory();
    const mo = new MutationObserver(debounce(()=>refreshAvailability(),120));
    mo.observe(document.body,{childList:true,subtree:true});
  }
  boot();
})();