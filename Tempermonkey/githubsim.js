// ==UserScript==
// @name         GitHub+ ScriptHub Glass Bar (bottom, file-aware)
// @namespace    https://mikephie.site/
// @version      3.8.1
// @description  iPhone/iPad 底部玻璃工具条；文件页启用 Raw/DL/Name/Edit，目录页禁用；Raw 单击复制、双击 Raw 内容、长按下载；Edit/Cancel；Action；Hub；SPA 兼容。
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  /* ================= CSS ================= */
  const STYLE = `
  :root {
    --fg:#fff;
    --glass-bg:rgba(25,25,35,0.08);
    --glass-stroke:rgba(255,255,255,0.18);
  }
  .gplus-shbar{
    position:fixed; left:0; right:0; bottom:calc(0px + env(safe-area-inset-bottom,0));
    z-index:2147483600; display:flex; justify-content:center; gap:10px;
    padding:10px 12px calc(10px + env(safe-area-inset-bottom,0));
    background:var(--glass-bg);
    -webkit-backdrop-filter:blur(20px) saturate(180%); backdrop-filter:blur(20px) saturate(180%);
    border-top:1px solid var(--glass-stroke);
    overflow-x:auto; white-space:nowrap; -webkit-overflow-scrolling:touch; scrollbar-width:none;
  }
  .gplus-shbar::-webkit-scrollbar{display:none}
  .gplus-btn{
    position:relative; display:inline-block; min-height:44px; min-width:82px;
    padding:10px 14px; border-radius:14px; color:var(--fg);
    background:rgba(0,0,0,0.12); border:2px solid transparent; background-clip:padding-box;
    font-size:13px; font-weight:700; letter-spacing:.3px; cursor:pointer; user-select:none;
    transition:transform .08s, box-shadow .2s, opacity .2s;
    scroll-snap-align:center;
  }
  .gplus-btn::after{
    content:""; position:absolute; inset:-2px; border-radius:16px; padding:2px;
    background:linear-gradient(135deg,#ff00ff,#00ffff);
    -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
    -webkit-mask-composite:xor; mask-composite:exclude; filter:blur(1.5px); opacity:.9;
    pointer-events:none;
  }
  .gplus-btn:hover{ transform:translateY(-1px); box-shadow:0 8px 18px rgba(0,0,0,.4) }
  .gplus-btn:active{ transform:scale(.96) }

  /* 禁用态样式 */
  .gplus-btn[disabled]{
    opacity:.45; cursor:not-allowed; filter:grayscale(.25);
  }
  .gplus-btn[disabled]::after{ opacity:.25 }

  .gplus-badge{
    position:fixed; right:16px; bottom:calc(70px + env(safe-area-inset-bottom,0));
    z-index:2147482000; display:inline-flex; align-items:center; gap:6px;
    padding:8px 14px; border-radius:14px; font-weight:800; font-size:13px; color:var(--fg);
    background:rgba(20,20,30,.28); border:1px solid var(--glass-stroke);
    -webkit-backdrop-filter:blur(12px) saturate(160%); backdrop-filter:blur(12px) saturate(160%);
    box-shadow:0 12px 28px rgba(0,0,0,.4); cursor:pointer;
  }`;
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: STYLE }));

  /* ================= 工具 ================= */
  const $ = (s, r=document) => r.querySelector(s);
  function toast(msg){ const d=document.createElement('div'); d.textContent=msg;
    Object.assign(d.style,{position:'fixed',left:'50%',top:'18px',transform:'translateX(-50%)',
      background:'rgba(0,0,0,.65)',color:'#fff',padding:'6px 10px',borderRadius:'8px',zIndex:2147483800,fontSize:'12px'});
    document.body.appendChild(d); setTimeout(()=>d.remove(),1200); }

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

  function openRawTab(){ const r=getRawUrl(); r?window.open(r,'_blank'):toast('Raw URL not available'); }
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

  /* ================= 事件处理 ================= */
  function handleClick(e){
    const btn=e.target.closest('.gplus-btn'); if(!btn) return;
    const act=btn.dataset.act;
    if(btn.hasAttribute('disabled')) return; // 禁用态忽略
    if(act==='raw'){ copyText(getRawUrl()); }
    if(act==='dl'){ // 目录页不会走到这（已禁用）
      // 编辑页的"全选+复制"功能可按需加回，这里保持 DL=下载
      downloadRaw();
    }
    if(act==='path'){ const p=getRepoPath(); p?copyText(p):toast('Not a file view'); }
    if(act==='edit'){ toggleEdit(); }
    if(act==='name'){ const n=getFileName(); n?copyText(n):toast('Not a file view'); }
    if(act==='action'){ openActions(); }
    if(act==='hub'){ window.open('https://scripthub.vercel.app','_blank'); }
  }
  function handleDblClick(e){
    const btn=e.target.closest('.gplus-btn'); if(!btn) return;
    if(btn.hasAttribute('disabled')) return;
    if(btn.dataset.act==='raw') openRawTab();
  }
  function handleContext(e){
    const btn=e.target.closest('.gplus-btn'); if(!btn) return;
    if(btn.hasAttribute('disabled')) return;
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

    // 初次居中
    requestAnimationFrame(()=>{
      const delta=(bar.scrollWidth - bar.clientWidth)/2;
      if(delta>0) bar.scrollLeft = delta;
    });
  }

  function ensureBadge(){
    if($('.gplus-badge')) return;
    const b=document.createElement('div'); b.className='gplus-badge'; b.textContent='GitHubPlus';
    b.addEventListener('click',()=>$('.gplus-shbar')?.classList.toggle('gplus-hidden'));
    document.body.appendChild(b);
  }

  // 根据是否文件页，启用/禁用按钮
  function refreshAvailability(){
    const fileMode = isFileView();
    const editMode = isEditView();
    const q = (sel) => document.querySelector(`.gplus-btn[data-act="${sel}"]`);

    const setDis = (btn, on) => btn && (on ? btn.setAttribute('disabled','') : btn.removeAttribute('disabled'));

    setDis(q('raw'),   !fileMode);
    setDis(q('dl'),    !fileMode);
    setDis(q('name'),  !fileMode);
    setDis(q('edit'),  !fileMode);     // 非文件页禁用 Edit
    // Path / Action / Hub 始终可用

    // Edit 文案：编辑页显示 Cancel
    if (q('edit')) q('edit').textContent = editMode ? 'Cancel' : 'Edit';
  }

  /* ================= SPA 兼容 ================= */
  function hookHistory(){
    const _ps=history.pushState, _rs=history.replaceState;
    const fire = () => setTimeout(()=>{ refreshAvailability(); },0);
    history.pushState=function(){ const r=_ps.apply(this,arguments); fire(); return r; };
    history.replaceState=function(){ const r=_rs.apply(this,arguments); fire(); return r; };
    window.addEventListener('popstate', fire, false);
  }

  /* ================= 启动 ================= */
  function boot(){
    buildBar(); ensureBadge(); refreshAvailability();
    hookHistory();
    // 页面动态变化（例如 GitHub 局部刷新）
    const mo=new MutationObserver(()=>refreshAvailability());
    mo.observe(document.body,{childList:true,subtree:true});
  }
  boot();
})();