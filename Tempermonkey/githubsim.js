// ==UserScript==
// @name         GitHub+ Glass Toolbar · DL click=download / dblclick=copy raw content
// @namespace    https://mikephie.site/
// @version      3.9.12
// @description  Bottom glass toolbar (ultra transparent). DL: click=download, dblclick=copy raw content. Badge: click toggle, dblclick switch theme.
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
(() => {
  'use strict';

  /* ================= Theme ================= */
  const THEMES = ['neon','blue','pink','white','green','orange'];
  const LS_THEME = '__gplus_theme__';

  /* ================= CSS ================= */
  const CSS = `
:root{ --fg:#eaf2ff; --fg-dim:#b7c2d9; --bar-h:62px; --edge1:#ff00ff; --edge2:#00ffff; }
@media(prefers-color-scheme:light){ :root{ --fg:#0b1220; --fg-dim:#475369; } }
html.gp-neon   { --edge1:#ff00ff; --edge2:#00ffff; }
html.gp-blue   { --edge1:#60a5fa; --edge2:#22d3ee; }
html.gp-pink   { --edge1:#f472b6; --edge2:#c084fc; }
html.gp-white  { --edge1:#ffffff; --edge2:#ffffff; }
html.gp-green  { --edge1:#10b981; --edge2:#06b6d4; }
html.gp-orange { --edge1:#f97316; --edge2:#facc15; }

/* 外壳：完全透明 + 强模糊（更像 iOS 玻璃，能看见背后文字） */
.gp-shell{
  position:fixed; left:0; right:0;
  bottom:calc(env(safe-area-inset-bottom,0px));
  z-index:2147483600; height:var(--bar-h);
  pointer-events:none;
  background:transparent;           /* 无底色 */
  -webkit-backdrop-filter:blur(24px) saturate(160%);
  backdrop-filter:blur(24px) saturate(160%);
  border-top:1px solid rgba(255,255,255,0.06);  /* 很轻的描边防止"漂浮感" */
}

/* bar：滚动容器 */
.gp-bar{
  height:100%; display:flex; align-items:center; justify-content:center;
  gap:10px; padding:0 12px; overflow-x:auto; white-space:nowrap;
  -webkit-overflow-scrolling:touch; scrollbar-width:none;
  pointer-events:auto;
}
.gp-bar::-webkit-scrollbar{ display:none }

/* 纯边框按钮 + 霓虹光（去掉任何可能像底色的阴影填充） */
.gp-btn{
  position:relative; display:inline-flex; align-items:center; justify-content:center;
  height:40px; min-width:92px; padding:0 14px; border-radius:16px;
  color:var(--fg); font:700 14px/1 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial;
  background:transparent; border:2px solid rgba(255,255,255,0.85);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.16),
    0 0 10px var(--edge1),
    0 0 16px var(--edge2);
  transition:transform .08s;
  cursor:pointer; user-select:none;
}
.gp-btn:hover{ transform:translateY(-1px) }
.gp-btn:active{ transform:scale(.965) }
.gp-btn[disabled]{ opacity:.45; cursor:not-allowed; }

/* 徽标（GitHub 猫） */
.gp-badge{
  position:fixed; right:16px; bottom:calc(var(--bar-h) + 20px + env(safe-area-inset-bottom,0px));
  width:60px; height:60px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  background:transparent;
  -webkit-backdrop-filter:blur(24px) saturate(160%);
  backdrop-filter:blur(24px) saturate(160%);
  border:2px solid rgba(255,255,255,0.85);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.16),
    0 0 12px var(--edge1),
    0 0 18px var(--edge2);
  z-index:2147483650; cursor:pointer; user-select:none;
}
.gp-badge svg{ width:30px; height:30px; fill:var(--fg); }
.gp-hidden{ display:none !important }

@media (max-width:380px){ .gp-btn{ min-width:84px; font-size:13px; height:38px } }
  `;

  function addStyle(){
    const s=document.createElement('style');
    s.textContent=CSS;
    (document.head||document.documentElement).appendChild(s);
  }

  function applyTheme(name){
    const html=document.documentElement;
    THEMES.forEach(t=>html.classList.remove('gp-'+t));
    html.classList.add('gp-'+name);
    try{ localStorage.setItem(LS_THEME,name); }catch{}
  }
  function cycleTheme(){
    const curr = localStorage.getItem(LS_THEME) || THEMES[0];
    const i = (THEMES.indexOf(curr)+1) % THEMES.length;
    applyTheme(THEMES[i]);
    toast('Theme: '+THEMES[i]);
  }

  function toast(msg,ms=1200){
    const d=document.createElement('div');
    d.textContent=msg;
    Object.assign(d.style,{
      position:'fixed',left:'50%',top:'18px',transform:'translateX(-50%)',
      background:'rgba(0,0,0,.65)',color:'#fff',padding:'8px 12px',borderRadius:'10px',
      zIndex:2147483999,font:'12px -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial'
    });
    document.body.appendChild(d); setTimeout(()=>d.remove(),ms);
  }

  /* ============== URL helpers ============== */
  function getRawUrl(){
    const href=location.href.split('#')[0].split('?')[0];
    const clean=location.origin+location.pathname;
    if(/^https?:\/\/raw\.githubusercontent\.com\//.test(href)) return href;
    let m=clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
    if(m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
    m=clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
    if(m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
    return '';
  }
  const getRepoPath = () => {
    const p=location.pathname.split('/').filter(Boolean);
    return p.length>=5 ? p.slice(4).join('/') : '';
  };
  const getFileName = () => {
    const p=getRepoPath(); return p ? p.split('/').pop() : '';
  };
  const getRepoSlug = () => {
    const p=location.pathname.split('/').filter(Boolean);
    return p.length>=2 ? `${p[0]}/${p[1]}` : '';
  };
  const inEdit = () => /\/edit\//.test(location.pathname);

  /* ============== Actions ============== */
  async function copyText(t){
    if(!t) return;
    try{ await navigator.clipboard.writeText(t); toast('Copied'); }
    catch{ window.prompt('Copy manually:', t); }
  }
  async function downloadRaw(){
    try{
      const raw=getRawUrl(); if(!raw){ toast('Not a file'); return; }
      const name=getFileName()||'download.txt';
      const res=await fetch(raw,{credentials:'omit',cache:'no-store'});
      const blob=await res.blob(); const url=URL.createObjectURL(blob);
      const a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a);
      a.click(); a.remove(); URL.revokeObjectURL(url);
    }catch{ toast('Download failed'); }
  }
  async function copyRawContent(){
    const raw=getRawUrl(); if(!raw){ toast('Not a file'); return; }
    try{
      const txt=await (await fetch(raw,{credentials:'omit',cache:'no-store'})).text();
      await copyText(txt);
    }catch{ toast('Copy failed'); }
  }
  async function copyAll(){
    const sels=[
      '.highlight .blob-code-inner','.blob-code',
      'table.js-file-line-container td.blob-code',
      '.react-blob-print-hide .blob-code-inner'
    ];
    let text='';
    for(const sel of sels){
      const nodes=[...document.querySelectorAll(sel)];
      if(nodes.length>5){ text=nodes.map(n=>n.innerText||n.textContent||'').join('\n'); break; }
    }
    if(!text){
      const raw=getRawUrl(); if(!raw){ toast('Not a file'); return; }
      try{ text=await (await fetch(raw,{credentials:'omit',cache:'no-store'})).text(); }catch{}
    }
    if(text) copyText(text); else toast('Copy failed');
  }
  function openHub(){
    const raw=getRawUrl(); if(!raw){ toast('Not a file'); return; }
    copyText(raw); // 稳定：复制后打开 vercel
    const url=`https://scripthub.vercel.app/?src=${encodeURIComponent(raw)}`;
    try{ window.open(url,'_blank','noopener') || (location.href=url); }catch{ location.href=url; }
  }

  /* ============== UI ============== */
  function buildBar(){
    if(document.querySelector('.gp-shell')) return;

    const shell=document.createElement('div'); shell.className='gp-shell';
    const bar=document.createElement('div'); bar.className='gp-bar'; shell.appendChild(bar);

    const btn = (key, label, onClick, onDbl, onLong) => {
      const b=document.createElement('button'); b.className='gp-btn'; b.dataset.key=key; b.textContent=label;
      let t=null, done=false;
      const start=()=>{ done=false; if(onLong) t=setTimeout(()=>{ done=true; onLong(); },600); };
      const clear=()=>{ if(t){clearTimeout(t); t=null;} };
      b.addEventListener('mousedown',start); b.addEventListener('touchstart',start,{passive:true});
      b.addEventListener('mouseup',clear); b.addEventListener('mouseleave',clear); b.addEventListener('touchend',clear,{passive:true});
      b.addEventListener('click',e=>{ if(!done) onClick && onClick(e); });
      if(onDbl) b.addEventListener('dblclick',onDbl);
      return b;
    };

    // Raw：单击复制 Raw 链接；双击打开 Raw；长按真下载
    const actRawClick = ()=>{ const r=getRawUrl(); if(r) copyText(r); else toast('Not a file view'); };
    const actRawDbl   = ()=>{ const r=getRawUrl(); if(r) window.open(r,'_blank'); else toast('Not a file view'); };
    const actRawLong  = ()=>downloadRaw();

    // DL：单击真下载；双击复制 **Raw 内容文本**
    const actDlClick  = ()=>downloadRaw();
    const actDlDbl    = ()=>copyRawContent();

    const actPathOrCancel = ()=>{
      if(inEdit()) location.href = location.href.replace('/edit/','/blob/');
      else { const p=getRepoPath(); if(p) copyText(p); else toast('Not a file view'); }
    };
    const actEdit = ()=>{
      let url=location.href.replace('/blob/','/edit/').replace('/raw/','/edit/');
      if(!/\/edit\//.test(url) && getRawUrl()){
        const slug=getRepoSlug(), path=getRepoPath();
        const branch=(document.querySelector('.branch-name')?.textContent||'').trim()||'main';
        if(slug && path) url=`https://github.com/${slug}/edit/${branch}/${path}`;
      }
      location.href=url;
    };
    const actName = ()=>{ const n=getFileName(); if(n) copyText(n); else toast('Not a file view'); };
    const actAction = ()=>{ const slug=getRepoSlug(); if(!slug){ toast('Not in repo'); return; } window.open(`https://github.com/${slug}/actions`,'_blank'); };

    bar.append(
      btn('raw','Raw', actRawClick, actRawDbl, actRawLong),
      btn('dl','DL',   actDlClick,  actDlDbl),
      btn('path', inEdit() ? 'Cancel' : 'Path', actPathOrCancel),
      btn('edit','Edit', actEdit),
      btn('name','Name', actName),
      btn('act','Action', actAction),
      btn('hub','Hub', openHub)
    );

    document.body.appendChild(shell);

    // 路由变化时同步 Path/Cancel
    const syncLabel = ()=>{
      const b=document.querySelector('.gp-btn[data-key="path"]');
      if(b) b.textContent = inEdit() ? 'Cancel' : 'Path';
    };
    const wrap=(fn)=>function(){ try{ fn.apply(history, arguments); }finally{ setTimeout(syncLabel, 50); } };
    try{
      history.pushState = wrap(history.pushState);
      history.replaceState = wrap(history.replaceState);
    }catch{}
    window.addEventListener('hashchange', ()=>setTimeout(syncLabel,50), {passive:true});
  }

  function buildBadge(){
    if(document.querySelector('.gp-badge')) return;
    const div=document.createElement('div'); div.className='gp-badge';
    div.innerHTML=`<svg viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>`;

    // 单击/双击分流：双击优先，取消单击的toggle
    let clickTimer = null;
    div.addEventListener('click', ()=>{
      if(clickTimer) clearTimeout(clickTimer);
      clickTimer = setTimeout(()=>{
        const shell=document.querySelector('.gp-shell');
        if(shell) shell.classList.toggle('gp-hidden');
        clickTimer = null;
      }, 260);
    });
    div.addEventListener('dblclick', ()=>{
      if(clickTimer){ clearTimeout(clickTimer); clickTimer=null; }
      cycleTheme();
    });

    document.body.appendChild(div);
  }

  /* ============== Boot ============== */
  function boot(){
    addStyle();
    try{
      const saved = localStorage.getItem(LS_THEME);
      applyTheme(saved && THEMES.includes(saved) ? saved : THEMES[0]);
    }catch{}
    buildBar();
    buildBadge();
  }

  const tryBoot = ()=> (document.body ? boot() : requestAnimationFrame(tryBoot));
  tryBoot();
})();