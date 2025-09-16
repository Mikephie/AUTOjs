// ==UserScript==
// @name         GitHub+ Glass Toolbar · Gesture-Safe Copy (prefetch raw)
// @namespace    https://mikephie.site/
// @version      3.9.14
// @description  Bottom glass toolbar (ultra transparent). DL: click=download, dblclick=copy raw text (prefetch to keep user-gesture). Raw: click=copy URL, dblclick=open, longpress=download. Badge: click toggle, dblclick switch theme.
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

/* 外壳：完全无底色 + 强模糊（能看见背后文字） */
.gp-shell{
  position:fixed; left:0; right:0;
  bottom:calc(env(safe-area-inset-bottom,0px));
  z-index:2147483600; height:var(--bar-h);
  pointer-events:none;
  background:transparent;
  -webkit-backdrop-filter:blur(24px) saturate(160%);
  backdrop-filter:blur(24px) saturate(160%);
  border-top:1px solid rgba(255,255,255,0.06);
}

/* bar：滚动容器 */
.gp-bar{
  height:100%; display:flex; align-items:center; justify-content:center;
  gap:10px; padding:0 12px; overflow-x:auto; white-space:nowrap;
  -webkit-overflow-scrolling:touch; scrollbar-width:none;
  pointer-events:auto;
}
.gp-bar::-webkit-scrollbar{ display:none }

/* 纯边框按钮 + 霓虹边缘光；无填充 */
.gp-btn{
  position:relative; display:inline-flex; align-items:center; justify-content:center;
  height:40px; min-width:92px; padding:0 14px; border-radius:16px;
  color:var(--fg); font:700 14px/1 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial;
  background:transparent; border:2px solid rgba(255,255,255,0.9);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.16),
    0 0 10px var(--edge1),
    0 0 18px var(--edge2);
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
  border:2px solid rgba(255,255,255,0.9);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.16),
    0 0 12px var(--edge1),
    0 0 20px var(--edge2);
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

  /* ================= 单击/双击/长按 分流 ================= */
  function bindClickModes(el, handlers, {singleDelay=260, longDelay=600} = {}) {
    let singleTimer = null;
    let longTimer = null;
    let longFired = false;

    const clearLong = () => { if (longTimer) { clearTimeout(longTimer); longTimer = null; } };

    const onDown = () => {
      longFired = false;
      if (handlers.long) longTimer = setTimeout(() => { longFired = true; handlers.long(); }, longDelay);
      // 手势开始时，尽可能预热 Raw 内容（为双击复制做准备）
      warmRawCache();
    };
    const onUp = () => clearLong();
    const onClick = (e) => {
      if (longFired) return;
      if (singleTimer) clearTimeout(singleTimer);
      singleTimer = setTimeout(() => { handlers.single && handlers.single(e); }, singleDelay);
    };
    const onDbl = (e) => {
      if (singleTimer) { clearTimeout(singleTimer); singleTimer = null; }
      clearLong();
      e.preventDefault();
      handlers.double && handlers.double(e);
    };

    el.addEventListener('mousedown', onDown);
    el.addEventListener('touchstart', onDown, {passive:true});
    el.addEventListener('mouseup', onUp);
    el.addEventListener('mouseleave', onUp);
    el.addEventListener('touchend', onUp, {passive:true});
    el.addEventListener('click', onClick);
    el.addEventListener('dblclick', onDbl);
  }

  /* ================= URL helpers ================= */
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

  /* ================= Raw 文本缓存（为双击复制服务） ================= */
  let RAW_CACHE = { url:'', text:'', ts:0 };
  const CACHE_TTL = 30 * 1000; // 30s 内视为新鲜

  async function warmRawCache(){
    const raw = getRawUrl();
    if(!raw) return;
    const now = Date.now();
    if (RAW_CACHE.url === raw && (now - RAW_CACHE.ts) < CACHE_TTL && RAW_CACHE.text) return; // 已新鲜
    try{
      const res = await fetch(raw, { credentials:'omit', cache:'no-store' });
      const txt = await res.text();
      RAW_CACHE = { url: raw, text: txt, ts: now };
    }catch{ /* 忽略，稍后还有备用路径 */ }
  }

  function getVisibleCodeText(){
    const sels=[
      '.highlight .blob-code-inner','.blob-code',
      'table.js-file-line-container td.blob-code',
      '.react-blob-print-hide .blob-code-inner'
    ];
    for(const sel of sels){
      const nodes=[...document.querySelectorAll(sel)];
      if(nodes.length>5) return nodes.map(n=>n.innerText||n.textContent||'').join('\n');
    }
    return '';
  }

  /* ================= Copy helpers（手势安全） ================= */
  async function copyText(text) {
    if (!text) return;
    // 1) 现代 API
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast('Copied'); return;
      }
    } catch(_) {}
    // 2) execCommand 兜底
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly','');
      Object.assign(ta.style,{position:'fixed',left:'-9999px',top:'0',opacity:'0',pointerEvents:'none',zIndex:'-1'});
      document.body.appendChild(ta);
      ta.select(); ta.setSelectionRange(0, ta.value.length);
      const ok = document.execCommand('copy');
      ta.remove();
      if (ok) { toast('Copied'); return; }
    } catch(_) {}
    // 3) 最后提示
    try{ window.prompt('Copy manually:', text); }catch{}
  }

  async function copyRawContentGestureSafe(){
    const raw = getRawUrl();
    if (!raw) { toast('Not a file'); return; }

    // A. 优先用缓存（已在手势开始时预热）
    if (RAW_CACHE.url === raw && RAW_CACHE.text) {
      await copyText(RAW_CACHE.text);
      return;
    }

    // B. 退而求其次：用页面可见代码（同步，仍属于手势）
    const vis = getVisibleCodeText();
    if (vis) { await copyText(vis); return; }

    // C. 最后兜底：去抓取（已脱离手势，可能被 Safari 拒绝）→ 抱歉提示
    try {
      const res = await fetch(raw, { credentials:'omit', cache:'no-store' });
      const txt = await res.text();
      await copyText(txt); // 有些环境仍然允许
    } catch {
      toast('Copy failed');
    }
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

  function openHub(){
    const raw=getRawUrl(); if(!raw){ toast('Not a file'); return; }
    copyText(raw); // 稳定：复制后打开 vercel
    const url=`https://scripthub.vercel.app/?src=${encodeURIComponent(raw)}`;
    try{ window.open(url,'_blank','noopener') || (location.href=url); }catch{ location.href=url; }
  }

  /* ================= UI ================= */
  function buildBar(){
    if(document.querySelector('.gp-shell')) return;

    const shell=document.createElement('div'); shell.className='gp-shell';
    const bar=document.createElement('div'); bar.className='gp-bar'; shell.appendChild(bar);

    const btn = (key, label) => {
      const b=document.createElement('button'); b.className='gp-btn'; b.dataset.key=key; b.textContent=label;
      // 鼠标经过/触摸进入时也预热一次
      b.addEventListener('mouseenter', warmRawCache, {passive:true});
      b.addEventListener('touchstart', warmRawCache, {passive:true});
      return b;
    };

    // ---- Buttons ---- //
    const rawBtn = btn('raw','Raw');
    bindClickModes(rawBtn, {
      single(){ const r=getRawUrl(); r ? copyText(r) : toast('Not a file view'); },
      double(){ const r=getRawUrl(); r ? window.open(r,'_blank') : toast('Not a file view'); },
      long(){ downloadRaw(); }
    });

    const dlBtn = btn('dl','DL');
    bindClickModes(dlBtn, {
      single(){ downloadRaw(); },                 // 单击 = 真下载
      double(){ copyRawContentGestureSafe(); }    // 双击 = 复制 Raw 文本（手势安全）
    });

    const pathBtn = btn('path', inEdit() ? 'Cancel' : 'Path');
    pathBtn.addEventListener('click', ()=>{
      if(inEdit()) location.href = location.href.replace('/edit/','/blob/');
      else { const p=getRepoPath(); p ? copyText(p) : toast('Not a file view'); }
    });

    const editBtn = btn('edit','Edit');
    editBtn.addEventListener('click', ()=>{
      let url=location.href.replace('/blob/','/edit/').replace('/raw/','/edit/');
      if(!/\/edit\//.test(url) && getRawUrl()){
        const slug=getRepoSlug(), path=getRepoPath();
        const branch=(document.querySelector('.branch-name')?.textContent||'').trim()||'main';
        if(slug && path) url=`https://github.com/${slug}/edit/${branch}/${path}`;
      }
      location.href=url;
    });

    const nameBtn = btn('name','Name');
    nameBtn.addEventListener('click', ()=>{ const n=getFileName(); n ? copyText(n) : toast('Not a file view'); });

    const actBtn = btn('act','Action');
    actBtn.addEventListener('click', ()=>{ const slug=getRepoSlug(); slug ? window.open(`https://github.com/${slug}/actions`,'_blank') : toast('Not in repo'); });

    const hubBtn = btn('hub','Hub');
    hubBtn.addEventListener('click', openHub);

    bar.append(rawBtn, dlBtn, pathBtn, editBtn, nameBtn, actBtn, hubBtn);
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

    // 单击切显隐；双击切主题（双击优先，取消单击）
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

  /* ================= Boot ================= */
  function boot(){
    addStyle();
    try{
      const saved = localStorage.getItem(LS_THEME);
      applyTheme(saved && THEMES.includes(saved) ? saved : THEMES[0]);
    }catch{}
    buildBar();
    buildBadge();

    // 页面加载后也主动预热一次
    warmRawCache();
  }

  const tryBoot = ()=> (document.body ? boot() : requestAnimationFrame(tryBoot));
  tryBoot();
})();