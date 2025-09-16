// ==UserScript==
// @name         GitHub+ Glass Toolbar · Pure Border (failsafe)
// @namespace    https://mikephie.site/
// @version      3.9.9-gplus-failsafe
// @description  Bottom glass toolbar (70% transparent, no fill, white border + neon). Raw(Click=Copy,Dbl=View,Long=Download)/DL/Path↔Cancel/Edit/Name/Action/Hub. Badge: click toggle, double-click theme. Robust boot with try/catch & rAF wait.
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // ---- failsafe logger ----
  function log(){ try{ console.log.apply(console, ['%c[G+]', 'color:#6cf', ...arguments]); }catch{} }
  function err(){ try{ console.error.apply(console, ['%c[G+ ERROR]', 'color:#f66', ...arguments]); }catch{} }

  // ---- add style safely ----
  function addStyle(css){
    try{
      const s=document.createElement('style');
      s.setAttribute('data-gplus','');
      s.textContent=css;
      (document.head||document.documentElement).appendChild(s);
      return true;
    }catch(e){ err('style inject failed', e); return false; }
  }

  // ---- rAF wait body ----
  function waitBody(cb){
    function tick(){
      if(document && document.body){ try{ cb(); } catch(e){ err('boot callback', e); } }
      else { requestAnimationFrame(tick); }
    }
    if(document.readyState==='complete' || document.readyState==='interactive'){
      requestAnimationFrame(tick);
    }else{
      document.addEventListener('DOMContentLoaded', tick, {once:true});
      requestAnimationFrame(tick);
    }
  }

  // ==================== CSS ====================
  const CSS = `
:root{
  --fg:#EAF2FF; --fg-dim:#B7C2D9;
  --bar-h:64px;
  --edge1:#ff00ff; --edge2:#00ffff;
}
@media(prefers-color-scheme:light){
  :root{ --fg:#0B1220; --fg-dim:#475369; }
}
.gplus-theme-neon   { --edge1:#ff00ff; --edge2:#00ffff; }
.gplus-theme-blue   { --edge1:#60a5fa; --edge2:#22d3ee; }
.gplus-theme-pink   { --edge1:#f472b6; --edge2:#c084fc; }
.gplus-theme-white  { --edge1:#ffffff; --edge2:#ffffff; }
.gplus-theme-green  { --edge1:#10b981; --edge2:#06b6d4; }
.gplus-theme-orange { --edge1:#f97316; --edge2:#facc15; }

/* bar */
.gplus-shbar{
  position:fixed; left:0; right:0;
  bottom:calc(0px + env(safe-area-inset-bottom,0));
  z-index:2147483600; height:var(--bar-h);
  display:flex; align-items:center; justify-content:center;
  gap:10px; padding:0 12px;
  background:rgba(255,255,255,0.02);
  -webkit-backdrop-filter:blur(28px) saturate(180%);
  backdrop-filter:blur(28px) saturate(180%);
  border-top:1px solid rgba(255,255,255,0.12);
  overflow-x:auto; white-space:nowrap; -webkit-overflow-scrolling:touch;
  scrollbar-width:none;
}
.gplus-shbar::-webkit-scrollbar{display:none}
.gplus-hidden{display:none!important}

/* button */
.gplus-btn{
  position:relative;
  display:inline-flex; align-items:center; justify-content:center;
  height:42px; min-width:94px; padding:0 16px;
  color:var(--fg);
  font:700 14px/1 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial;
  border-radius:16px; border:0;
  background:transparent !important;
  -webkit-backdrop-filter:blur(24px) saturate(180%);
  backdrop-filter:blur(24px) saturate(180%);
  box-shadow:
    inset 0 0 0 1.8px rgba(255,255,255,0.70),
    0 0 12px var(--edge1),
    0 0 20px var(--edge2);
  cursor:pointer; user-select:none;
  transition:transform .08s, box-shadow .18s;
  scroll-snap-align:center;
}
.gplus-btn:hover{ transform:translateY(-1px); }
.gplus-btn:active{ transform:scale(.965); }
.gplus-btn[disabled]{ opacity:.45; cursor:not-allowed; filter:grayscale(.25); }

/* badge */
.gplus-badge{
  position:fixed; right:16px;
  bottom:calc(var(--bar-h) + 22px + env(safe-area-inset-bottom,0));
  z-index:2147483700;
  width:62px; height:62px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  background:transparent !important;
  -webkit-backdrop-filter:blur(24px) saturate(185%);
  backdrop-filter:blur(24px) saturate(185%);
  box-shadow:
    inset 0 0 0 2px rgba(255,255,255,0.70),
    0 0 16px var(--edge1),
    0 0 28px var(--edge2);
  cursor:pointer; user-select:none; transition:transform .15s;
}
.gplus-badge:hover{ transform:scale(1.06); }
.gplus-badge svg{ width:30px; height:30px; fill:var(--fg); }

@media (max-width:380px){
  .gplus-btn{ min-width:86px; padding:0 14px; font-size:13px; height:40px; }
}
  `;

  // inject style first
  addStyle(CSS);

  // ==================== helpers ====================
  const THEMES = ['gplus-theme-neon','gplus-theme-blue','gplus-theme-pink','gplus-theme-white','gplus-theme-green','gplus-theme-orange'];
  const LS_KEY_THEME='__gplus_theme__';

  function $(sel, root){ try{ return (root||document).querySelector(sel); }catch(e){ err('query', e); return null; } }
  function $all(sel, root){ try{ return Array.from((root||document).querySelectorAll(sel)); }catch(e){ err('queryAll', e); return []; } }

  function getRawUrl(){
    try{
      const href=location.href.split('#')[0].split('?')[0];
      const clean=location.origin+location.pathname;
      if(/^https?:\/\/raw\.githubusercontent\.com\//.test(href)) return href;
      let m=clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
      if(m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
      m=clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
      if(m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
      return '';
    }catch(e){ err('getRawUrl', e); return ''; }
  }
  function getRepoPath(){ try{ const p=location.pathname.split('/').filter(Boolean); return p.length>=5?p.slice(4).join('/'):""; }catch{ return ""; } }
  function getFileName(){ try{ const p=getRepoPath(); return p?p.split('/').pop():""; }catch{ return ""; } }
  function getRepoSlug(){ try{ const p=location.pathname.split('/').filter(Boolean); return p.length>=2?`${p[0]}/${p[1]}`:""; }catch{ return ""; } }
  function inEdit(){ try{ return /\/edit\//.test(location.pathname); }catch{ return false; } }

  async function copyText(t){
    if(!t) return;
    try{ await navigator.clipboard.writeText(t); toast('Copied'); }
    catch(e){ try{ window.prompt('Copy manually:', t); }catch{} }
  }
  function toast(msg, ms=1200){
    try{
      const d=document.createElement('div');
      d.textContent=msg;
      Object.assign(d.style,{
        position:'fixed', left:'50%', top:'18px', transform:'translateX(-50%)',
        background:'rgba(0,0,0,.65)', color:'#fff', padding:'8px 12px',
        borderRadius:'10px', zIndex:2147483800, font:'12px -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial'
      });
      document.body.appendChild(d); setTimeout(()=>{ try{ d.remove(); }catch{} }, ms);
    }catch(e){ /* ignore */ }
  }

  async function downloadRaw(){
    try{
      const raw=getRawUrl(); if(!raw){ toast('Not a file'); return; }
      const name=getFileName()||'download.txt';
      const res=await fetch(raw, {credentials:'omit', cache:'no-store'});
      const blob=await res.blob();
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a'); a.href=url; a.download=name;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    }catch(e){ err('download', e); toast('Download failed'); }
  }

  async function copyAll(){
    try{
      const sels=[
        '.highlight .blob-code-inner',
        '.blob-code',
        'table.js-file-line-container td.blob-code',
        '.react-blob-print-hide .blob-code-inner'
      ];
      let text='';
      for(const sel of sels){
        const nodes=$all(sel);
        if(nodes.length>5){ text=nodes.map(n=>n.innerText??n.textContent??'').join('\n'); break; }
      }
      if(!text){
        const raw=getRawUrl(); if(!raw){ toast('Not a file'); return; }
        try{ text=await (await fetch(raw,{credentials:'omit',cache:'no-store'})).text(); }catch{}
      }
      if(text) copyText(text); else toast('Copy failed');
    }catch(e){ err('copyAll', e); toast('Copy failed'); }
  }

  function openHub(){
    try{
      const raw=getRawUrl(); if(!raw){ toast('Not a file'); return; }
      copyText(raw);
      const url=`https://scripthub.vercel.app/?src=${encodeURIComponent(raw)}`;
      let ok=false;
      try{ ok=!!window.open(url,'_blank','noopener'); }catch{}
      if(!ok) location.assign(url);
    }catch(e){ err('openHub', e); }
  }

  function applyTheme(cls){
    try{
      const html=document.documentElement;
      THEMES.forEach(t=>html.classList.remove(t));
      html.classList.add(cls);
      localStorage.setItem(LS_KEY_THEME, cls);
    }catch(e){ err('applyTheme', e); }
  }
  function cycleTheme(){
    try{
      const curr=localStorage.getItem(LS_KEY_THEME) || THEMES[0];
      const idx=(THEMES.indexOf(curr)+1) % THEMES.length;
      applyTheme(THEMES[idx]); toast(THEMES[idx].replace('gplus-theme-','Theme: '));
    }catch(e){ err('cycleTheme', e); }
  }

  // ==================== actions ====================
  function actRawClick(){ const r=getRawUrl(); if(r) copyText(r); else toast('Not a file view'); }
  function actRawDbl(){ const r=getRawUrl(); if(r) window.open(r,'_blank'); else toast('Not a file view'); }
  function actRawLong(){ downloadRaw(); }
  function actAll(){ copyAll(); }
  function actPathOrCancel(){
    try{
      if(inEdit()){
        const url=location.href.replace('/edit/','/blob/');
        location.assign(url);
      }else{
        const p=getRepoPath(); if(p) copyText(p); else toast('Not a file view');
      }
    }catch(e){ err('path/cancel', e); }
  }
  function actEdit(){
    try{
      let url=location.href;
      url=url.replace('/blob/','/edit/').replace('/raw/','/edit/');
      if(!/\/edit\//.test(url) && getRawUrl()){
        const slug=getRepoSlug();
        const branch=(document.querySelector('.branch-name')?.textContent||'').trim() || 'main';
        const path=getRepoPath();
        if(slug && path) url=`https://github.com/${slug}/edit/${branch}/${path}`;
      }
      location.assign(url);
    }catch(e){ err('edit', e); }
  }
  function actName(){ const n=getFileName(); if(n) copyText(n); else toast('Not a file view'); }
  function actAction(){ const slug=getRepoSlug(); if(!slug){ toast('Not in repo'); return; } window.open(`https://github.com/${slug}/actions`,'_blank'); }

  // ==================== UI ====================
  function buildBar(){
    try{
      if($('.gplus-shbar')) return;
      const bar=document.createElement('div'); bar.className='gplus-shbar';

      const btns = [
        {key:'raw',  label:'Raw',   click:actRawClick, dbl:actRawDbl, long:actRawLong},
        {key:'all',  label:'DL',    click:actAll},
        {key:'path', label: inEdit() ? 'Cancel' : 'Path', click:actPathOrCancel},
        {key:'edit', label:'Edit',  click:actEdit},
        {key:'name', label:'Name',  click:actName},
        {key:'act',  label:'Action',click:actAction},
        {key:'hub',  label:'Hub',   click:openHub},
      ];

      btns.forEach(def=>{
        const b=document.createElement('button');
        b.className='gplus-btn'; b.textContent=def.label; b.dataset.key=def.key;

        // long-press
        let longTimer=null, longDone=false;
        const start=()=>{ longDone=false; longTimer=setTimeout(()=>{ longDone=true; def.long && def.long(); }, 600); };
        const clear=()=>{ if(longTimer){ clearTimeout(longTimer); longTimer=null; } };
        b.addEventListener('mousedown',start);
        b.addEventListener('touchstart',start,{passive:true});
        b.addEventListener('mouseup',clear); b.addEventListener('mouseleave',clear);
        b.addEventListener('touchend',clear,{passive:true});

        b.addEventListener('click',(e)=>{ if(!longDone) def.click && def.click(e); });
        if(def.dbl) b.addEventListener('dblclick',(e)=>{ def.dbl && def.dbl(e); });

        bar.appendChild(b);
      });

      const mo=new MutationObserver(()=>{
        const pathBtn=bar.querySelector('[data-key="path"]');
        if(pathBtn) pathBtn.textContent = inEdit() ? 'Cancel' : 'Path';
      });
      mo.observe(document.body,{subtree:true,childList:true,attributes:true});

      document.body.appendChild(bar);
    }catch(e){ err('buildBar', e); }
  }

  function buildBadge(){
    try{
      if($('.gplus-badge')) return;
      const badge=document.createElement('div'); badge.className='gplus-badge';
      badge.innerHTML = `
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"></path></svg>
      `;
      let last=0;
      badge.addEventListener('click',()=>{
        const now=Date.now();
        if(now-last<300){ cycleTheme(); }
        else { const bar=$('.gplus-shbar'); if(bar) bar.classList.toggle('gplus-hidden'); }
        last=now;
      });
      document.body.appendChild(badge);
    }catch(e){ err('buildBadge', e); }
  }

  // ==================== boot ====================
  waitBody(function boot(){
    try{
      const saved=localStorage.getItem(LS_KEY_THEME);
      applyTheme(saved ? saved : THEMES[0]);
    }catch(e){ err('theme restore', e); }

    try{ buildBar(); }catch(e){ err('boot buildBar', e); }
    try{ buildBadge(); }catch(e){ err('boot buildBadge', e); }

    log('initialized ✔');
  });

})();