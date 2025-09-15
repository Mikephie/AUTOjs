// ==UserScript==
// @name         GitHub+ 玻璃工具条（主题长按切换 + 真下载）+ ScriptHub
// @namespace    https://mikephie.site/
// @version      3.3.1
// @description  顶部/移动端底部玻璃工具条：Raw / DL / Path / URL / Name / Repo / Hub。Hub长按切换主题（霓虹/蓝/粉/白边，记忆存储）；更通透玻璃；GitHubPlus徽标可点且不重叠；快捷键 r/d/p/u/f/s/h。
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
(() => {
  'use strict';

  /* ================= 主题 ================= */
  const THEMES = ['neon','blue','pink','white'];
  const THEME_KEY = '__gplus_theme__';
  let currentTheme = localStorage.getItem(THEME_KEY) || 'neon';

  /* ================= 样式 ================= */
  const STYLE = `
  :root{ --fg:#fff; }
  @media(prefers-color-scheme:light){ :root{ --fg:#000; } }
  .gplus-hidden{display:none!important}

  /* 工具条：更通透玻璃 */
  .gplus-shbar{
    position:fixed; left:0; right:0; top:0; z-index:2147483600;
    display:flex; align-items:center; gap:10px; padding:10px 12px;
    background:rgba(40,40,50,0.14); /* 再透明一点 */
    -webkit-backdrop-filter:blur(20px) saturate(180%);
    backdrop-filter:blur(20px) saturate(180%);
    border-bottom:1px solid rgba(255,255,255,0.16);
    pointer-events:auto;
  }
  @media(max-width:768px){
    .gplus-shbar{
      top:auto; bottom:calc(0px + env(safe-area-inset-bottom,0));
      display:block; white-space:nowrap; overflow-x:auto;
      -webkit-overflow-scrolling:touch; touch-action:pan-x;
      padding:10px 12px calc(10px + env(safe-area-inset-bottom,0));
      scrollbar-width:none;
    }
    .gplus-shbar::-webkit-scrollbar{display:none}
  }

  .gplus-btn{
    position:relative; display:inline-block; color:var(--fg);
    background:rgba(0,0,0,0.20); /* 再透明一点 */
    -webkit-backdrop-filter:blur(12px) saturate(170%);
    backdrop-filter:blur(12px) saturate(170%);
    padding:10px 14px; border-radius:14px; min-height:44px; min-width:88px;
    font-size:13px; font-weight:700; letter-spacing:.3px; text-align:center;
    border:2px solid transparent; background-clip:padding-box;
    cursor:pointer; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none;
    transition:transform .08s, box-shadow .25s;
  }
  .gplus-btn:active{ transform:scale(.97); }
  .gplus-btn:hover{ transform:translateY(-1px); }

  @keyframes flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}

  /* 主题：霓虹/蓝/粉/白边 */
  .theme-neon .gplus-btn::before{
    content:""; position:absolute; inset:0; border-radius:14px; padding:2px;
    background:linear-gradient(135deg,#00f0ff,#0070ff,#b100ff,#ff2ddf,#00f0ff);
    background-size:400% 400%; animation:flow 6s ease infinite;
    -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
    -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none;
  }
  .theme-neon .gplus-btn:hover{ box-shadow:0 0 15px #00e0ff,0 0 25px #b100ff; }

  .theme-blue .gplus-btn::before{
    content:""; position:absolute; inset:0; border-radius:14px; padding:2px;
    background:linear-gradient(135deg,#3b82f6,#06b6d4,#3b82f6);
    background-size:300% 300%; animation:flow 8s ease infinite;
    -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
    -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none;
  }
  .theme-blue .gplus-btn:hover{ box-shadow:0 0 18px #06b6d4; }

  .theme-pink .gplus-btn::before{
    content:""; position:absolute; inset:0; border-radius:14px; padding:2px;
    background:linear-gradient(135deg,#ec4899,#a855f7,#ec4899);
    background-size:300% 300%; animation:flow 7s ease infinite;
    -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
    -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none;
  }
  .theme-pink .gplus-btn:hover{ box-shadow:0 0 18px #ec4899; }

  .theme-white .gplus-btn::before{
    content:""; position:absolute; inset:0; border-radius:14px; padding:2px;
    background:linear-gradient(135deg,#ffffff,#f8fafc);
    -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
    -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none;
  }
  .theme-white .gplus-btn:hover{ box-shadow:0 0 14px #fff; }

  /* GitHubPlus 徽标（可点、上移） */
  .gplus-badge{
    position:fixed; right:12px; z-index:2147483700;
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 12px; border-radius:12px;
    color:var(--fg); font-weight:900; font-size:12px;
    background:rgba(40,40,50,.20);
    -webkit-backdrop-filter:blur(12px) saturate(160%);
    backdrop-filter:blur(12px) saturate(160%);
    border:1px solid rgba(255,255,255,.2);
    box-shadow:0 12px 28px rgba(0,0,0,.45);
    cursor:pointer; user-select:none; pointer-events:auto;
  }
  @media(min-width:769px){ .gplus-badge{ bottom:24px; } }
  @media(max-width:768px){ .gplus-badge{ bottom:calc(66px + env(safe-area-inset-bottom,0)); } }
  `;
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: STYLE }));

  /* ================= 工具 ================= */
  const $ = (s, r=document) => r.querySelector(s);
  function toast(msg){ const d=document.createElement('div'); d.textContent=msg;
    Object.assign(d.style,{position:'fixed',left:'50%',top:'18px',transform:'translateX(-50%)',
      background:'rgba(0,0,0,.65)',color:'#fff',padding:'6px 10px',borderRadius:'8px',
      zIndex:2147483800,fontSize:'12px'}); document.body.appendChild(d); setTimeout(()=>d.remove(),1200); }

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
  async function copyText(t){ if(!t) return; try{ await navigator.clipboard.writeText(t); toast('Copied'); } catch{ prompt('Copy manually:',t); } }

  /* ================= 真下载 ================= */
  async function downloadRaw(){
    const url = getRawUrl();
    if (!url) { toast('Not a file view'); return; }

    let filename = getFileName() || url.split('/').pop() || 'download.txt';
    toast('Downloading…');

    try {
      const res = await fetch(url, { mode: 'cors', credentials: 'omit', cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);

      const buf  = await res.arrayBuffer();
      const blob = new Blob([buf], { type: 'application/octet-stream' });

      const a = document.createElement('a');
      const obj = URL.createObjectURL(blob);
      a.href = obj; a.download = filename; a.style.display = 'none';
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(obj); a.remove(); }, 1200);
      toast('Saved: ' + filename);

    } catch (err) {
      console.error('[DL] error:', err);
      const r = getRawUrl(); r && window.open(r,'_blank');
      toast('Fallback: opened Raw');
    }
  }

  /* ================= Hub 打开 ================= */
  function openScriptHub(e){
    const raw=getRawUrl(); if(!raw){ toast('Not a file view'); return; }
    try{ navigator.clipboard && navigator.clipboard.writeText(raw); toast('RAW 已复制'); }
    catch(_){ try{ prompt('Copy manually:',raw); }catch(__){} }

    let base='https://scripthub.vercel.app';
    if (e && e.shiftKey) base='https://script.hub';
    if (e && e.altKey)   base='http://127.0.0.1:9101';

    const url=base.replace(/\/+$/,'')+'/';
    const w=window.open(url,'_blank','noopener'); if(!w) location.assign(url);
  }

  /* ================= 主题应用/切换 ================= */
  function applyTheme(theme){
    THEMES.forEach(t => document.body.classList.remove('theme-'+t));
    document.body.classList.add('theme-'+theme);
    localStorage.setItem(THEME_KEY, theme);
    currentTheme = theme;
    toast('Theme: ' + theme);
  }

  // Pointer 长按（iOS/Android/桌面统一）
  function attachHubLongPress(){
    const hubBtn = document.querySelector('.gplus-btn[data-act="hub"]');
    if (!hubBtn) return;

    let timer = null;
    let longPressed = false;
    const THRESHOLD = 520; // ms

    const start = (ev) => {
      longPressed = false;
      timer = setTimeout(() => {
        longPressed = true;
        const i = THEMES.indexOf(currentTheme);
        applyTheme(THEMES[(i+1)%THEMES.length]);
      }, THRESHOLD);
    };
    const cancel = () => { if (timer) clearTimeout(timer); };

    // 用 pointer 事件更稳
    hubBtn.addEventListener('pointerdown', start);
    ['pointerup','pointerleave','pointercancel'].forEach(t=>hubBtn.addEventListener(t, cancel));

    // 长按后不再触发点击
    hubBtn.addEventListener('click', (e) => {
      if (longPressed) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    // 阻止系统长按菜单
    hubBtn.addEventListener('contextmenu', (e)=>{ e.preventDefault(); }, {capture:true});
  }

  /* ================= UI ================= */
  function buildBar(){
    const bar=document.createElement('div'); bar.className='gplus-shbar';
    bar.innerHTML = `
      <button class="gplus-btn" data-act="raw"  title="r">Raw</button>
      <button class="gplus-btn" data-act="dl"   title="d">DL</button>
      <button class="gplus-btn" data-act="p"    title="p">Path</button>
      <button class="gplus-btn" data-act="u"    title="u">URL</button>
      <button class="gplus-btn" data-act="f"    title="f">Name</button>
      <button class="gplus-btn" data-act="s"    title="s">Repo</button>
      <button class="gplus-btn" data-act="hub"  title="h">Hub</button>
    `;
    bar.addEventListener('click', (e)=>{
      const btn=e.target.closest('.gplus-btn'); if(!btn) return;
      const act=btn.dataset.act;
      if(act==='raw'){ const r=getRawUrl(); if(r) window.open(r,'_blank'); else toast('Not a file view'); }
      if(act==='dl'){ downloadRaw(); }
      if(act==='p'){ const p=getRepoPath(); if(p) copyText(p); else toast('Not a file view'); }
      if(act==='u'){ const r=getRawUrl(); if(r) copyText(r); else toast('Not a file view'); }
      if(act==='f'){ const fn=getFileName(); if(fn) copyText(fn); else toast('Not a file view'); }
      if(act==='s'){ const rp=getRepoSlug(); if(rp) copyText(rp); else toast('Not in repo'); }
      if(act==='hub'){ openScriptHub(e); }
    });
    document.body.appendChild(bar);
  }

  function ensureBadge(){
    if (document.querySelector('.gplus-badge')) return;
    const b=document.createElement('div');
    b.className='gplus-badge';
    b.textContent='GitHubPlus';
    // pointer 事件，避免某些环境 click 不触发
    b.addEventListener('pointerdown', ()=>{
      const bar=document.querySelector('.gplus-shbar');
      if (bar) bar.classList.toggle('gplus-hidden');
    });
    document.body.appendChild(b);
  }

  /* ================= 快捷键 ================= */
  function hotkeys(e){
    const tag=(e.target.tagName||'').toLowerCase();
    if(/(input|textarea|select)/.test(tag)||e.target.isContentEditable) return;
    const k=(e.key||'').toLowerCase();
    if(k==='r'){ const r=getRawUrl(); if(r) window.open(r,'_blank'); }
    if(k==='d'){ downloadRaw(); }
    if(k==='p'){ const p=getRepoPath(); if(p) copyText(p); }
    if(k==='u'){ const r=getRawUrl(); if(r) copyText(r); }
    if(k==='f'){ const fn=getFileName(); if(fn) copyText(fn); }
    if(k==='s'){ const rp=getRepoSlug(); if(rp) copyText(rp); }
    if(k==='h'){ openScriptHub(e); }
  }

  /* ================= GitHub SPA 兼容（可选） ================= */
  function hookHistory(){
    const _ps=history.pushState, _rs=history.replaceState;
    const fire=()=>setTimeout(mount,0);
    history.pushState=function(){ const r=_ps.apply(this,arguments); fire(); return r; };
    history.replaceState=function(){ const r=_rs.apply(this,arguments); fire(); return r; };
    window.addEventListener('popstate', fire, false);
  }

  /* ================= 装载/重挂监听 ================= */
  function mount(){
    // 主题
    THEMES.forEach(t => document.body.classList.remove('theme-'+t));
    document.body.classList.add('theme-'+currentTheme);
    // UI
    if (!document.querySelector('.gplus-shbar')) buildBar();
    if (!document.querySelector('.gplus-badge')) ensureBadge();
    // 长按
    attachHubLongPress();
  }

  /* ================= 启动 ================= */
  (function boot(){
    document.body && document.body.classList.add('theme-'+currentTheme);
    buildBar(); ensureBadge(); attachHubLongPress();
    window.addEventListener('keydown', hotkeys, { passive:true });
    hookHistory(); // 兼容 GitHub SPA 导航后继续可用
  })();
})();