// ==UserScript==
// @name         GitHub+ 玻璃风格 + ScriptHub（vercel首选·固定工具条·移动横滑）
// @namespace    https://mikephie.site/
// @version      2.8.0
// @description  固定横向工具条（桌面顶部 / 移动底部横滑）；Hub 按钮把 Raw 链接带到 ScriptHub 输入框（?src=raw），首选 https://scripthub.vercel.app，失败自动回退到 script.hub / 本地；暗黑高对比；短标签；快捷键 r/d/p/u/f/s/h；徽标不遮挡。
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  /* ==================== 样式 ==================== */
  const STYLE = `
  :root{
    --fg: #EAF2FF;
    --fg-dim: #B7C2D9;
    --glass-bg: rgba(20,22,28,.55);
    --glass-stroke: rgba(255,255,255,.18);
    --glass-shadow: 0 18px 50px rgba(0,0,0,.45);
    --accent1: #3CC6FF;
    --accent2: #A78BFA;
  }
  @media (prefers-color-scheme: light){
    :root{
      --fg:#0B1220; --fg-dim:#475369;
      --glass-bg: rgba(255,255,255,.72);
      --glass-stroke: rgba(0,0,0,.12);
      --glass-shadow: 0 12px 35px rgba(0,0,0,.18);
      --accent1:#0EA5E9; --accent2:#6366F1;
    }
  }
  .gplus-hidden{display:none!important}

  .gplus-shbar{
    position: fixed; left:0; right:0; z-index: 2147483000;
    display:flex; align-items:center; gap:8px;
    padding:10px 10px;
    background: linear-gradient(135deg, var(--glass-bg), rgba(0,0,0,.08));
    border: 1px solid var(--glass-stroke);
    -webkit-backdrop-filter: saturate(160%) blur(18px);
    backdrop-filter: saturate(160%) blur(18px);
    box-shadow: var(--glass-shadow);
    top:0; /* 想桌面也底部 → 改为 top:auto; bottom:0; */
  }
  .gplus-shbar .title{color:var(--fg);font-weight:800;letter-spacing:.3px}
  .gplus-shbar .sub{color:var(--fg-dim);font-size:12px;margin-right:auto}

  .gplus-btn{
    position:relative;
    border: 1px solid rgba(255,255,255,.28);
    background: rgba(255,255,255,.08);
    color: var(--fg);
    padding: 10px 12px;
    border-radius: 12px;
    font-size: 12px; font-weight: 700; letter-spacing:.2px;
    min-height: 44px; min-width: 82px;
    text-align:center; cursor:pointer; flex:0 0 auto;
    transition: transform .08s ease, box-shadow .18s ease, background .18s ease;
  }
  .gplus-btn::after{
    content:""; position:absolute; inset:-3px; border-radius:14px; pointer-events:none;
    background: conic-gradient(from 0deg, var(--accent1), var(--accent2), var(--accent1));
    filter: blur(10px); opacity:.65; z-index:-1;
    animation: gplusGlow 2.2s linear infinite;
  }
  .gplus-btn:hover{ transform: translateY(-1px); box-shadow: 0 14px 30px rgba(0,0,0,.45) }
  .gplus-btn:active{ transform: scale(.98) }
  @media (prefers-reduced-motion: reduce){ .gplus-btn::after{animation:none; opacity:.38} }
  @keyframes gplusGlow { to { transform: rotate(360deg); } }

  .gplus-badge{
    position: fixed;
    right: max(18px, env(safe-area-inset-right,0));
    bottom: calc(20px + env(safe-area-inset-bottom,0));
    z-index:2147482000; /* 比工具条低，避免遮挡滑动 */
    display:inline-flex; align-items:center; gap:8px;
    background: linear-gradient(135deg, rgba(60,198,255,.30), rgba(167,139,250,.18));
    border:1px solid var(--glass-stroke);
    -webkit-backdrop-filter: blur(12px) saturate(150%); backdrop-filter: blur(12px) saturate(150%);
    color:var(--fg); padding:10px 14px; border-radius:14px; font-weight:800;
    box-shadow: 0 16px 40px rgba(0,0,0,.45), 0 0 22px rgba(60,198,255,.55), inset 0 0 22px rgba(167,139,250,.25);
    cursor:pointer; user-select:none;
  }

  .gplus-rawbar{
    position: fixed;
    top: max(8px, env(safe-area-inset-top,0));
    right: max(8px, env(safe-area-inset-right,0));
    left: max(8px, env(safe-area-inset-left,0));
    z-index:2147483000;
    display:flex; gap:8px; justify-content:flex-end; padding:8px;
  }

  @media (max-width: 768px){
    .gplus-shbar{
      top:auto; bottom: calc(0px + env(safe-area-inset-bottom, 0));
      display:block; white-space:nowrap; overflow-x:auto;
      -webkit-overflow-scrolling:touch; overscroll-behavior-x:contain; touch-action:pan-x;
      scrollbar-width:none;
      border-top:1px solid var(--glass-stroke); border-bottom:none;
      padding:10px 10px calc(10px + env(safe-area-inset-bottom,0));
      padding-right:120px; /* 初始，JS 动态覆盖 */
    }
    .gplus-shbar::-webkit-scrollbar{display:none}
    .gplus-shbar .title, .gplus-shbar .sub{display:none}
    .gplus-btn{display:inline-block; vertical-align:top; min-width:88px; margin-right:8px}
    .gplus-badge{bottom:calc(70px + env(safe-area-inset-bottom,0)); right:max(12px, env(safe-area-inset-right,0))}
  }
  `;
  const style = document.createElement('style');
  style.textContent = STYLE;
  document.documentElement.appendChild(style);

  /* ==================== 工具函数 ==================== */
  function getRawUrl() {
    var href = location.href.split('#')[0].split('?')[0];
    var clean = location.origin + location.pathname;

    if (/^https?:\/\/raw\.githubusercontent\.com\//.test(href)) return href;

    var m1 = clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
    if (m1) return 'https://raw.githubusercontent.com/' + m1[1] + '/' + m1[2] + '/' + m1[3] + '/' + m1[4];

    var m2 = clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
    if (m2) return 'https://raw.githubusercontent.com/' + m2[1] + '/' + m2[2] + '/' + m2[3] + '/' + m2[4];

    return href; // 其他视图：回退原页（Hub 时会提示）
  }
  function getRepoPath(){
    const p=location.pathname.split('/').filter(Boolean);
    return p.length>=5?p.slice(4).join('/'):'';
  }
  function getFileName(){ const p=getRepoPath(); return p? p.split('/').pop() :''; }
  function getRepoSlug(){ const p=location.pathname.split('/').filter(Boolean); return p.length>=2?`${p[0]}/${p[1]}`:''; }
  async function copyText(t){ if(!t) return; try{ await navigator.clipboard.writeText(t); toast('Copied'); }catch{ prompt('Copy manually:', t); } }
  function toast(msg){
    const tip=document.createElement('div'); tip.textContent=msg;
    Object.assign(tip.style,{position:'fixed',left:'50%',top:'18px',transform:'translateX(-50%)',background:'rgba(0,0,0,.65)',color:'#fff',padding:'6px 10px',borderRadius:'8px',zIndex:2147483647,fontSize:'12px',backdropFilter:'blur(6px)'});
    document.body.appendChild(tip); setTimeout(()=>tip.remove(),1200);
  }

  /* ==================== ScriptHub 打开（vercel首选 + 回退） ==================== */
  function openScriptHub(e){
    const raw = getRawUrl();
    if (!raw) { toast('Not a file view'); return; }

    // 普通点击：vercel；Shift：script.hub；Alt：本地
    let bases = ['https://scripthub.vercel.app', 'https://script.hub', 'http://127.0.0.1:9101'];
    if (e && e.shiftKey) bases = ['https://script.hub', 'https://scripthub.vercel.app', 'http://127.0.0.1:9101'];
    if (e && e.altKey)   bases = ['http://127.0.0.1:9101', 'https://scripthub.vercel.app', 'https://script.hub'];

    const target = '/?src=' + encodeURIComponent(raw);

    (function tryOpen(i){
      if (i >= bases.length) { copyText(raw); toast('已复制 Raw，手动在 ScriptHub 粘贴'); return; }
      const url = bases[i] + target;
      try {
        const w = window.open(url, '_blank', 'noopener');
        if (!w) location.assign(url);
      } catch {
        tryOpen(i+1); // 回退到下一个基址
      }
    })(0);
  }

  /* ==================== UI：工具条 & 徽标 ==================== */
  function buildSHBar(){
    const bar=document.createElement('div'); bar.className='gplus-shbar';
    bar.innerHTML=`
      <span class="title">ScriptHub</span><span class="sub">Raw • Download • Copy</span>
      <button class="gplus-btn" data-act="raw" title="r">Raw</button>
      <button class="gplus-btn" data-act="dl"  title="d">DL</button>
      <button class="gplus-btn" data-act="p"   title="p">Path</button>
      <button class="gplus-btn" data-act="u"   title="u">URL</button>
      <button class="gplus-btn" data-act="f"   title="f">Name</button>
      <button class="gplus-btn" data-act="s"   title="s">Repo</button>
      <button class="gplus-btn" data-act="hub" title="h">Hub</button>
    `;
    bar.addEventListener('click',(e)=>{
      const btn=e.target.closest('.gplus-btn'); if(!btn) return;
      const act=btn.dataset.act;
      if(act==='raw'){ const r=getRawUrl(); return r?open(r,'_blank'):toast('Not a file view'); }
      if(act==='dl'){ const r=getRawUrl(); return r?open(r,'_blank'):toast('Not a file view'); }
      if(act==='p'){ const p=getRepoPath(); return p?copyText(p):toast('Not a file view'); }
      if(act==='u'){ const r=getRawUrl(); return r?copyText(r):toast('Not a file view'); }
      if(act==='f'){ const fn=getFileName(); return fn?copyText(fn):toast('Not a file view'); }
      if(act==='s'){ const rp=getRepoSlug(); return rp?copyText(rp):toast('Not in repo'); }
      if(act==='hub'){ openScriptHub(e); }
    }, false);
    return bar;
  }

  function fitMobileBar() {
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    const bar = document.querySelector('.gplus-shbar');
    const badge = document.querySelector('.gplus-badge');
    if (!bar || !badge) return;
    const w = Math.ceil(badge.getBoundingClientRect().width || 0);
    bar.style.paddingRight = (w + 24) + 'px';
  }

  function placeSHBar(){ if(!document.querySelector('.gplus-shbar')) document.body.appendChild(buildSHBar()); }

  function ensureBadge(){
    if(document.querySelector('.gplus-badge')) return;
    const b=document.createElement('div');
    b.className='gplus-badge';
    b.innerHTML = `<div class="dot" style="width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 10px #22c55e"></div><div class="brand">GitHubPlus</div>`;
    b.addEventListener('click',()=>{ document.querySelector('.gplus-shbar')?.classList.toggle('gplus-hidden'); fitMobileBar(); });
    document.body.appendChild(b);
  }

  /* ==================== RAW 页浮条（可选保留） ==================== */
  function ensureRawBar(){
    if(location.hostname!=='raw.githubusercontent.com' || document.querySelector('.gplus-rawbar')) return;
    const w=document.createElement('div'); w.className='gplus-rawbar';
    w.innerHTML=`
      <button class="gplus-btn" data-act="back" title="b">Back</button>
      <button class="gplus-btn" data-act="dl"   title="d">DL</button>
      <button class="gplus-btn" data-act="copy" title="u">URL</button>
    `;
    w.addEventListener('click',(e)=>{
      const b=e.target.closest('.gplus-btn'); if(!b) return;
      const act=b.dataset.act;
      if(act==='back'){
        try{
          const u=new URL(location.href);
          const [owner, repo, branch, ...p]=u.pathname.split('/').filter(Boolean);
          open(`https://github.com/${owner}/${repo}/blob/${branch}/${p.join('/')}`,'_self');
        }catch{ history.back(); }
      }
      if(act==='dl') open(location.href,'_blank');
      if(act==='copy') copyText(location.href);
    }, false);
    document.body.appendChild(w);
  }

  /* ==================== 快捷键（桌面） ==================== */
  function hotkeys(e){
    const tag=(e.target.tagName||'').toLowerCase();
    if(/(input|textarea|select)/.test(tag) || e.target.isContentEditable) return;
    const k=(e.key||'').toLowerCase();
    if(k==='r'){ const r=getRawUrl(); if(r) open(r,'_blank'); }
    if(k==='d'){ const r=getRawUrl(); if(r) open(r,'_blank'); }
    if(k==='p'){ const p=getRepoPath(); if(p) copyText(p); }
    if(k==='u'){ const r=getRawUrl(); if(r) copyText(r); }
    if(k==='f'){ const fn=getFileName(); if(fn) copyText(fn); }
    if(k==='s'){ const rp=getRepoSlug(); if(rp) copyText(rp); }
    if(k==='h'){ openScriptHub(e); }
  }

  /* ==================== 启动 ==================== */
  (function boot(){
    placeSHBar();
    ensureBadge();
    ensureRawBar();
    fitMobileBar();
    window.addEventListener('resize', fitMobileBar, {passive:true});
    window.addEventListener('orientationchange', fitMobileBar, {passive:true});
    window.addEventListener('keydown', hotkeys, {passive:true});
    setInterval(fitMobileBar, 1200);
  })();

})();