// ==UserScript==
// @name         GitHub+ 玻璃工具条（主题可切换）+ ScriptHub（复制后跳转）
// @namespace    https://mikephie.site/
// @version      3.1.0
// @description  顶部/底部玻璃工具条：Raw/下载/复制Path/URL/Name/Repo/ScriptHub。霓虹描边、主题可切换、移动端底部横滑、可靠下载、Hub先复制RAW再跳首页（Shift=script.hub，Alt=本地）。
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
(() => {
  'use strict';

  /* ========= 主题：neon | blue | pink | white ========= */
  const THEME = 'neon';

  /* ============== 样式（玻璃 + 边框主题） ============== */
  const STYLE = `
  :root{
    --fg:#EAF2FF; --fg-dim:#B7C2D9;
    --glass-bg:rgba(12,14,20,.42);
    --glass-stroke:rgba(255,255,255,.14);
    --shadow:0 18px 50px rgba(0,0,0,.48);
  }
  @media(prefers-color-scheme:light){
    :root{
      --fg:#0B1220; --fg-dim:#56617A;
      --glass-bg:rgba(255,255,255,.55);
      --glass-stroke:rgba(0,0,0,.1);
      --shadow:0 12px 35px rgba(0,0,0,.18);
    }
  }

  .gplus-hidden{display:none!important}

  .gplus-shbar{
    position:fixed; left:0; right:0; top:0; z-index:2147483000;
    display:flex; align-items:center; gap:10px; padding:10px 12px;
    background:linear-gradient(135deg,var(--glass-bg),rgba(0,0,0,.08));
    border:1px solid var(--glass-stroke);
    -webkit-backdrop-filter:blur(16px) saturate(160%);
    backdrop-filter:blur(16px) saturate(160%);
    box-shadow:var(--shadow);
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
    position:relative; display:inline-block;
    color:var(--fg); background:rgba(255,255,255,.06);
    -webkit-backdrop-filter:blur(16px) saturate(180%);
    backdrop-filter:blur(16px) saturate(180%);
    padding:10px 14px; border-radius:14px; min-height:44px; min-width:88px;
    font-size:13px; font-weight:800; letter-spacing:.3px; text-align:center;
    border:2px solid transparent; background-clip:padding-box;
    cursor:pointer; user-select:none;
    transition:transform .08s, box-shadow .25s;
  }
  .gplus-btn:active{ transform:scale(.97); }
  .gplus-btn:hover{ transform:translateY(-1px); }

  /* 霓虹边框动画（共用） */
  @keyframes flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}

  /* 主题：neon */
  .theme-neon .gplus-btn::before{
    content:""; position:absolute; inset:0; border-radius:14px; padding:2px;
    background:linear-gradient(135deg,#00f0ff,#0070ff,#b100ff,#ff2ddf,#00f0ff);
    background-size:400% 400%; animation:flow 6s ease infinite;
    -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
    -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none;
  }
  .theme-neon .gplus-btn:hover{ box-shadow:0 0 15px #00e0ff,0 0 25px #b100ff; }

  /* 主题：blue */
  .theme-blue .gplus-btn::before{
    content:""; position:absolute; inset:0; border-radius:14px; padding:2px;
    background:linear-gradient(135deg,#3b82f6,#06b6d4,#3b82f6);
    background-size:300% 300%; animation:flow 8s ease infinite;
    -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
    -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none;
  }
  .theme-blue .gplus-btn:hover{ box-shadow:0 0 18px #06b6d4; }

  /* 主题：pink */
  .theme-pink .gplus-btn::before{
    content:""; position:absolute; inset:0; border-radius:14px; padding:2px;
    background:linear-gradient(135deg,#ec4899,#a855f7,#ec4899);
    background-size:300% 300%; animation:flow 7s ease infinite;
    -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
    -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none;
  }
  .theme-pink .gplus-btn:hover{ box-shadow:0 0 18px #ec4899; }

  /* 主题：white（极简白边） */
  .theme-white .gplus-btn::before{
    content:""; position:absolute; inset:0; border-radius:14px; padding:2px;
    background:linear-gradient(135deg,#ffffff,#f8fafc);
    -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
    -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none;
  }
  .theme-white .gplus-btn:hover{ box-shadow:0 0 14px #fff; }

  .gplus-badge{
    position:fixed; right:14px; bottom:18px; z-index:2147482000;
    display:inline-flex; align-items:center; gap:6px;
    background:linear-gradient(135deg,rgba(0,231,255,.25),rgba(177,0,255,.18));
    border:1px solid var(--glass-stroke); padding:8px 12px; border-radius:12px;
    -webkit-backdrop-filter:blur(10px) saturate(150%); backdrop-filter:blur(10px) saturate(150%);
    color:var(--fg); font-weight:900; font-size:12px; box-shadow:var(--shadow); cursor:pointer;
  }`;
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: STYLE }));

  /* ============== 工具函数 ============== */
  const $ = (s, r=document) => r.querySelector(s);
  function toast(msg){ const d=document.createElement('div'); d.textContent=msg;
    Object.assign(d.style,{position:'fixed',left:'50%',top:'18px',transform:'translateX(-50%)',
      background:'rgba(0,0,0,.65)',color:'#fff',padding:'6px 10px',borderRadius:'8px',
      zIndex:2147483647,fontSize:'12px'}); document.body.appendChild(d); setTimeout(()=>d.remove(),1200); }

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

  /* 可靠下载：fetch -> Blob -> a[download] */
  async function downloadRaw(){
    const url=getRawUrl(); if(!url){ toast('Not a file view'); return; }
    let filename=getFileName() || url.split('/').pop() || 'download.txt';
    toast('Downloading…');
    try{
      const res=await fetch(url,{mode:'cors',credentials:'omit'}); if(!res.ok) throw new Error('HTTP '+res.status);
      const blob=await res.blob();
      const a=document.createElement('a'); const obj=URL.createObjectURL(blob);
      a.href=obj; a.download=filename; a.rel='noopener'; a.style.display='none'; document.body.appendChild(a); a.click();
      setTimeout(()=>{ URL.revokeObjectURL(obj); a.remove(); }, 1000);
      toast('Saved: '+filename);
    }catch(err){
      console.error('[DL] error:',err);
      window.open(url,'_blank'); toast('Fallback: opened Raw');
    }
  }

  /* Hub：先复制 RAW，再打开首页（默认 vercel；Shift=script.hub；Alt=本地） */
  function openScriptHub(e){
    const raw=getRawUrl(); if(!raw){ toast('Not a file view'); return; }
    try{ navigator.clipboard && navigator.clipboard.writeText(raw); toast('RAW 已复制'); }catch(_){ try{ prompt('Copy manually:',raw); }catch(__){} }
    let base='https://scripthub.vercel.app';
    if (e && e.shiftKey) base='https://script.hub';
    if (e && e.altKey)   base='http://127.0.0.1:9101';
    const url=base.replace(/\/+$/,'')+'/';
    const w=window.open(url,'_blank','noopener'); if(!w) location.assign(url);
  }

  /* ============== 工具条 UI ============== */
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

  /* ============== 徽标（折叠/展开） ============== */
  function ensureBadge(){
    if(document.querySelector('.gplus-badge')) return;
    const b=document.createElement('div'); b.className='gplus-badge'; b.textContent='GitHubPlus';
    b.addEventListener('click', ()=>document.querySelector('.gplus-shbar')?.classList.toggle('gplus-hidden'));
    document.body.appendChild(b);
  }

  /* ============== 快捷键 ============== */
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

  /* ============== 启动 ============== */
  (function boot(){
    document.body.classList.add('theme-' + THEME);   // 应用主题
    buildBar(); ensureBadge();
    window.addEventListener('keydown', hotkeys, { passive:true });
  })();

})();