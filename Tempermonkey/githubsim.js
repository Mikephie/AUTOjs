// ==UserScript==
// @name         GitHub+ Glass Toolbar · Pure Border (iOS26 style)
// @namespace    https://mikephie.site/
// @version      3.9.8-gplus-glass-border-full
// @description  Bottom fixed glass toolbar (70% transparent, no fill, only white glass border + neon). Raw(Click=Copy,Dbl=View,Long=Download) / DL(All copy) / Path(Cancel in edit) / Edit / Name / Action / Hub(copy+open). Badge click toggle, double-click theme cycle (neon/blue/pink/white/green/orange). iPhone/iPad/desktop bottom unified.
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  /* ==================== 样式（完全去色 · 70% 透明玻璃 + 霓虹描边） ==================== */
  const STYLE = `
:root{
  --fg:#EAF2FF; --fg-dim:#B7C2D9;
  --bar-h:64px;

  /* 默认主题（会被主题类覆盖），用于霓虹描边 */
  --edge1:#ff00ff; --edge2:#00ffff;
}
@media(prefers-color-scheme:light){
  :root{ --fg:#0B1220; --fg-dim:#475369; }
}

/* 主题：按钮与徽标霓虹颜色共用 */
.gplus-theme-neon   { --edge1:#ff00ff; --edge2:#00ffff; }
.gplus-theme-blue   { --edge1:#60a5fa; --edge2:#22d3ee; }
.gplus-theme-pink   { --edge1:#f472b6; --edge2:#c084fc; }
.gplus-theme-white  { --edge1:#ffffff; --edge2:#ffffff; }
.gplus-theme-green  { --edge1:#10b981; --edge2:#06b6d4; }
.gplus-theme-orange { --edge1:#f97316; --edge2:#facc15; }

/* ================= 底部玻璃条（几乎透明，仅模糊） ================= */
.gplus-shbar{
  position:fixed; left:0; right:0;
  bottom:calc(0px + env(safe-area-inset-bottom,0));
  z-index:2147483600; height:var(--bar-h);

  display:flex; align-items:center; justify-content:center;
  gap:10px; padding:0 12px;

  background:rgba(255,255,255,0.02); /* 近似 70% 透视感，靠 blur 呈现玻璃 */
  -webkit-backdrop-filter:blur(28px) saturate(180%);
  backdrop-filter:blur(28px) saturate(180%);

  border-top:1px solid rgba(255,255,255,0.12);
  overflow-x:auto; white-space:nowrap; -webkit-overflow-scrolling:touch;
  scrollbar-width:none;
}
.gplus-shbar::-webkit-scrollbar{display:none}
.gplus-hidden{display:none!important}

/* ================= 按钮：无填充，仅白边 + 霓虹 ================= */
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

  /* 白色玻璃边（≈70% 不透明） + 霓虹描边 */
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

/* ================= 徽标（Octocat）：同样无填充，仅白边 + 霓虹 ================= */
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

/* 手机超小宽度：更紧凑 */
@media (max-width:380px){
  .gplus-btn{ min-width:86px; padding:0 14px; font-size:13px; height:40px; }
}
  `;

  addStyle(STYLE);

  /* ==================== 工具函数 & 常量 ==================== */
  const THEMES = ['gplus-theme-neon','gplus-theme-blue','gplus-theme-pink','gplus-theme-white','gplus-theme-green','gplus-theme-orange'];
  const LS_KEY_THEME = '__gplus_theme__';

  function addStyle(css){
    const s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
  }
  function $(sel, root=document){ return root.querySelector(sel); }
  function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  function getRawUrl(){
    const href=location.href.split('#')[0].split('?')[0];
    const clean=location.origin+location.pathname;

    if(/^https?:\/\/raw\.githubusercontent\.com\//.test(href)) return href;

    // /owner/repo/blob/branch/path...
    let m=clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
    if(m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;

    // /owner/repo/raw/branch/path...
    m=clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
    if(m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;

    return '';
  }
  function getRepoPath(){ const p=location.pathname.split('/').filter(Boolean); return p.length>=5?p.slice(4).join('/'):""; }
  function getFileName(){ const p=getRepoPath(); return p?p.split('/').pop():""; }
  function getRepoSlug(){ const p=location.pathname.split('/').filter(Boolean); return p.length>=2?`${p[0]}/${p[1]}`:""; }
  function inEdit(){ return /\/edit\//.test(location.pathname); }

  async function copyText(t){
    if(!t) return;
    try { await navigator.clipboard.writeText(t); toast('Copied'); }
    catch { prompt('Copy manually:', t); }
  }
  function toast(msg, ms=1200){
    const d=document.createElement('div');
    d.textContent=msg;
    Object.assign(d.style,{
      position:'fixed', left:'50%', top:'18px', transform:'translateX(-50%)',
      background:'rgba(0,0,0,.65)', color:'#fff', padding:'8px 12px',
      borderRadius:'10px', zIndex:2147483800, font:'12px -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial'
    });
    document.body.appendChild(d); setTimeout(()=>d.remove(), ms);
  }

  /* 真下载（保存原文件名） */
  async function downloadRaw(){
    const raw=getRawUrl(); if(!raw){ toast('Not a file'); return; }
    const name=getFileName()||'download.txt';
    try{
      const res=await fetch(raw, {credentials:'omit', cache:'no-store'});
      const blob=await res.blob();
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a'); a.href=url; a.download=name;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    }catch(e){ console.error(e); toast('Download failed'); }
  }

  /* 代码区尽量全选复制；失败回退到 raw 内容复制 */
  async function copyAll(){
    const candidates=[
      '.highlight .blob-code-inner',
      '.blob-code',
      'table.js-file-line-container td.blob-code',
      '.react-blob-print-hide .blob-code-inner'
    ];
    let text='';
    for(const sel of candidates){
      const nodes=$all(sel);
      if(nodes.length>5){ text = nodes.map(n=>n.innerText??n.textContent??'').join('\n'); break; }
    }
    if(!text){
      const raw=getRawUrl(); if(!raw){ toast('Not a file'); return; }
      try{ text=await (await fetch(raw,{credentials:'omit',cache:'no-store'})).text(); }
      catch{ /* ignore */ }
    }
    if(text){ copyText(text); } else { toast('Copy failed'); }
  }

  /* ScriptHub：复制 raw，再尝试带参打开 vercel */
  function openHub(){
    const raw=getRawUrl(); if(!raw){ toast('Not a file'); return; }
    copyText(raw);
    const url=`https://scripthub.vercel.app/?src=${encodeURIComponent(raw)}`;
    try{
      const w=window.open(url,'_blank','noopener');
      if(!w) location.assign(url);
    }catch{ location.assign(url); }
  }

  /* 主题持久化与切换 */
  function applyTheme(cls){
    const html=document.documentElement;
    THEMES.forEach(t=>html.classList.remove(t));
    html.classList.add(cls);
    localStorage.setItem(LS_KEY_THEME, cls);
  }
  function cycleTheme(){
    const curr=localStorage.getItem(LS_KEY_THEME) || THEMES[0];
    const idx=(THEMES.indexOf(curr)+1) % THEMES.length;
    applyTheme(THEMES[idx]); toast(THEMES[idx].replace('gplus-theme-','Theme: '));
  }

  /* ==================== 按钮动作 ==================== */
  function actRawClick(){ const r=getRawUrl(); if(r) copyText(r); else toast('Not a file view'); }
  function actRawDbl(){ const r=getRawUrl(); if(r) window.open(r,'_blank'); else toast('Not a file view'); }
  function actRawLong(){ downloadRaw(); }

  function actAll(){ copyAll(); }

  function actPathOrCancel(){
    if(inEdit()){
      const url=location.href.replace('/edit/','/blob/');
      location.assign(url);
    }else{
      const p=getRepoPath(); if(p) copyText(p); else toast('Not a file view');
    }
  }
  function actEdit(){
    let url=location.href;
    url=url.replace('/blob/','/edit/').replace('/raw/','/edit/');
    if(!/\/edit\//.test(url) && getRawUrl()){
      const slug=getRepoSlug();
      const branch=$('.branch-name')?.textContent?.trim() || 'main';
      const path=getRepoPath();
      if(slug && path) url=`https://github.com/${slug}/edit/${branch}/${path}`;
    }
    location.assign(url);
  }
  function actName(){ const n=getFileName(); if(n) copyText(n); else toast('Not a file view'); }
  function actAction(){
    const slug=getRepoSlug(); if(!slug){ toast('Not in repo'); return; }
    window.open(`https://github.com/${slug}/actions`,'_blank');
  }

  /* ==================== UI：工具条与徽标 ==================== */
  function buildBar(){
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

      // 手势：click / dblclick / longpress
      let longTimer=null, longDone=false;
      b.addEventListener('mousedown',()=>{ longDone=false; longTimer=setTimeout(()=>{ longDone=true; def.long && def.long(); }, 550); });
      b.addEventListener('touchstart',()=>{ longDone=false; longTimer=setTimeout(()=>{ longDone=true; def.long && def.long(); }, 600); }, {passive:true});
      const clear=()=>{ if(longTimer){ clearTimeout(longTimer); longTimer=null; } };
      b.addEventListener('mouseup',clear); b.addEventListener('mouseleave',clear);
      b.addEventListener('touchend',clear,{passive:true});
      b.addEventListener('click',(e)=>{ if(!longDone) def.click && def.click(e); });
      if(def.dbl) b.addEventListener('dblclick',(e)=>{ def.dbl && def.dbl(e); });

      bar.appendChild(b);
    });

    // 监听 DOM 变更，动态切换 Path ↔ Cancel
    const obs=new MutationObserver(()=>{
      const pathBtn=bar.querySelector('[data-key="path"]');
      if(pathBtn) pathBtn.textContent = inEdit() ? 'Cancel' : 'Path';
    });
    obs.observe(document.body,{subtree:true,childList:true,attributes:true});

    document.body.appendChild(bar);
  }

  function buildBadge(){
    const badge=document.createElement('div'); badge.className='gplus-badge';
    badge.innerHTML = `
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"></path></svg>
    `;

    // 单击：显隐工具条；双击：主题循环
    let lastTap=0;
    badge.addEventListener('click', () => {
      const now=Date.now();
      if (now - lastTap < 300) {
        cycleTheme();
      } else {
        $('.gplus-shbar')?.classList.toggle('gplus-hidden');
      }
      lastTap=now;
    });

    document.body.appendChild(badge);
  }

  /* ==================== 启动 ==================== */
  (function boot(){
    // 恢复主题
    const saved=localStorage.getItem(LS_KEY_THEME);
    applyTheme(saved ? saved : THEMES[0]);

    buildBar(); buildBadge();
  })();
})();