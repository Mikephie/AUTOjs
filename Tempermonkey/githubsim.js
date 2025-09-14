// ==UserScript==
// @name         GitHub+ 玻璃风格 + ScriptHub（固定工具条·结构复刻·高对比暗黑）
// @namespace    https://mikephie.site/
// @version      2.5.0
// @description  固定横向工具条（桌面顶部/移动底部）、ScriptHub 路由完全复刻避免 Invalid URL、暗黑模式高对比霓虹、短标签按钮、快捷键 r/d/p/u/f/s/h、Alt+点徽标切换"仅文件页/全站"，兼容 PJAX 与 raw 页面
// @author       You
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  /* ==================== 样式（固定布局 + 高对比暗黑） ==================== */
  const STYLE = `
  :root{
    --fg: #EAF2FF;
    --fg-dim: #B7C2D9;
    --glass-bg: rgba(20,22,28,.55);
    --glass-stroke: rgba(255,255,255,.18);
    --glass-shadow: 0 18px 50px rgba(0,0,0,.45);
    --accent1: #3CC6FF;    /* 更亮的蓝青 */
    --accent2: #8B5CFF;    /* 更亮的紫 */
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

  /* 固定工具条容器：不参与页面流，完全不抖动 */
  .gplus-shbar{
    position: fixed; left:0; right:0; z-index: 2147483000;
    display:flex; align-items:center; gap:8px;
    padding:10px 10px;
    background: linear-gradient(135deg, var(--glass-bg), rgba(0,0,0,.08));
    border: 1px solid var(--glass-stroke);
    -webkit-backdrop-filter: saturate(160%) blur(18px);
    backdrop-filter: saturate(160%) blur(18px);
    box-shadow: var(--glass-shadow);
    pointer-events: none; /* 只有按钮可点，避免挡住页面 */
  }
  .gplus-shbar .title,.gplus-shbar .sub{pointer-events:auto}
  .gplus-shbar .title{color:var(--fg);font-weight:800;letter-spacing:.3px}
  .gplus-shbar .sub{color:var(--fg-dim);font-size:12px;margin-right:auto}

  /* 默认：桌面顶部固定 */
  .gplus-shbar{ top:0; }
  /* 移动端：底部固定，横向滚动 */
  @media (max-width: 768px){
    .gplus-shbar{
      top:auto; bottom: max(0px, env(safe-area-inset-bottom,0));
      overflow-x:auto; overscroll-behavior-x:contain; -webkit-overflow-scrolling:touch;
      scrollbar-width:none;
    }
    .gplus-shbar::-webkit-scrollbar{display:none}
    .gplus-shbar .title, .gplus-shbar .sub{display:none}
  }

  /* 按钮：短标签、暗黑更亮；只让按钮接收点击 */
  .gplus-btn{
    pointer-events:auto;
    position:relative;
    border: 1px solid rgba(255,255,255,.28);
    background: rgba(255,255,255,.08);
    color: var(--fg);
    padding: 10px 12px;
    border-radius: 12px;
    font-size: 12px; font-weight: 700; letter-spacing:.2px;
    min-height: 44px; min-width: 82px;
    text-align:center;
    cursor:pointer;
    transition: transform .08s ease, box-shadow .18s ease, background .18s ease;
    box-shadow: 0 10px 26px rgba(0,0,0,.35), inset 0 0 0 0 rgba(255,255,255,0);
  }
  /* 霓虹环 + 稍更强的发光，暗黑更突出 */
  .gplus-btn::after{
    content:""; position:absolute; inset:-3px; border-radius:14px; pointer-events:none;
    background: conic-gradient(from 0deg, var(--accent1), var(--accent2), var(--accent1));
    filter: blur(10px); opacity:.55; z-index:-1;
    animation: gplusGlow 2.4s linear infinite;
  }
  .gplus-btn:hover{ transform: translateY(-1px); box-shadow: 0 14px 30px rgba(0,0,0,.45); }
  .gplus-btn:active{ transform: scale(.98); }
  @media (prefers-reduced-motion: reduce){ .gplus-btn::after{animation:none; opacity:.35} }
  @keyframes gplusGlow { to { transform: rotate(360deg); } }

  /* 右下徽标（固定，不抖动） */
  .gplus-badge{
    position: fixed;
    right: max(18px, env(safe-area-inset-right,0));
    bottom: calc(20px + env(safe-area-inset-bottom,0));
    z-index:2147483001;
    display:inline-flex; align-items:center; gap:8px;
    background: linear-gradient(135deg, rgba(60,198,255,.30), rgba(139,92,255,.18));
    border:1px solid var(--glass-stroke);
    -webkit-backdrop-filter: blur(12px) saturate(150%); backdrop-filter: blur(12px) saturate(150%);
    color:var(--fg); padding:10px 14px; border-radius:14px; font-weight:800;
    box-shadow: 0 16px 40px rgba(0,0,0,.45), 0 0 22px rgba(60,198,255,.55), inset 0 0 22px rgba(139,92,255,.25);
    cursor:pointer; user-select:none;
  }
  .gplus-badge .dot{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 10px #22c55e}
  .gplus-badge.off .dot{background:#ef4444;box-shadow:0 0 10px #ef4444}
  .gplus-badge .text{font-size:12px;opacity:.9}
  .gplus-badge .brand{font-size:13px;text-shadow:0 0 8px rgba(60,198,255,.7)}

  /* RAW 页面右上浮条（固定） */
  .gplus-rawbar{
    position: fixed;
    top: max(8px, env(safe-area-inset-top,0));
    right: max(8px, env(safe-area-inset-right,0));
    left: max(8px, env(safe-area-inset-left,0));
    z-index:2147483000;
    display:flex; gap:8px; justify-content:flex-end; padding:8px;
    pointer-events:none;
  }
  .gplus-rawbar .gplus-btn{ pointer-events:auto }
  `;

  /* ==================== 状态 & 工具 ==================== */
  const STORE_ENABLED  = 'gplus.enabled';
  const STORE_ONLYBLOB = 'gplus.onlyBlob'; // "1" => 仅文件页显示工具条
  const qs  = (s, r=document)=>r.querySelector(s);
  const on  = (el, ev, fn, opt)=> el && el.addEventListener(ev, fn, opt);
  const isGitHub = ()=> location.hostname === 'github.com';
  const isRaw    = ()=> location.hostname === 'raw.githubusercontent.com';
  const enabled  = ()=> (localStorage.getItem(STORE_ENABLED) ?? '1') === '1';
  const setEnabled = (f)=> localStorage.setItem(STORE_ENABLED, f?'1':'0');
  const onlyBlob = ()=> (localStorage.getItem(STORE_ONLYBLOB) ?? '0') === '1';
  const setOnlyBlob = (f)=> localStorage.setItem(STORE_ONLYBLOB, f?'1':'0');

  function isBlobView(){
    if(!isGitHub()) return false;
    const p = location.pathname.split('/').filter(Boolean);
    return p.length>=5 && p[2]==='blob';
  }
  function getRepoSlug(){
    const p = location.pathname.split('/').filter(Boolean);
    return p.length>=2 ? `${p[0]}/${p[1]}` : '';
  }
  function getRepoPath(){
    if(!isBlobView()) return '';
    return location.pathname.split('/').filter(Boolean).slice(4).join('/');
  }
  function getFileName(){
    const path=getRepoPath(); if(!path) return '';
    const a=path.split('/'); return a[a.length-1]||'';
  }

  /* ===== Raw URL 推导 ===== */
  function getRawURL(){
    const clean = location.href.split('#')[0].split('?')[0];
    if (isRaw()) return clean;
    if (!isGitHub()) return null;

    // /owner/repo/blob/branch/path...
    let m = clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
    if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;

    // /owner/repo/raw/branch/path...
    m = clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
    if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;

    return null;
  }

  /* ===== ScriptHub 结构（完全复刻） =====
     你之前提供的结构是：
       http(s)://script.hub/convert/_start_/{ENCODED_RAW_URL}/_end_/plain.txt?type=plain-text&target=plain-text
     这里严格照抄，避免 Invalid URL。
     同时支持：http://127.0.0.1:9101（本地） & http/https 两套域
  */
  function pickHubBase(){
    // 优先使用你曾设置的 base
    const saved = localStorage.getItem('gplus.hubBase');
    if (saved) return saved;

    // 根据当前协议选择默认
    const httpsPreferred = location.protocol === 'https:';
    const candidates = httpsPreferred
      ? ['https://script.hub','http://script.hub','http://127.0.0.1:9101']
      : ['http://script.hub','http://127.0.0.1:9101','https://script.hub'];
    return candidates[0];
  }
  function buildScriptHubURL(){
    const raw = getRawURL();
    if(!raw) return null;
    const enc = encodeURIComponent(raw);  // 只编码一次
    const base = pickHubBase();
    return `${base}/convert/_start_/${enc}/_end_/plain.txt?type=plain-text&target=plain-text`;
  }

  /* ===== 动作 ===== */
  async function downloadCurrent(){
    const raw = getRawURL(); if(!raw) return toast('Not a file view');
    try{
      const res = await fetch(raw,{credentials:'omit'});
      const blob=await res.blob();
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url; a.download=getFileName()||'download';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    }catch{ open(raw,'_blank'); }
  }
  async function copyText(t){
    if(!t) return toast('Empty');
    try{ await navigator.clipboard.writeText(t); toast('Copied'); }
    catch{ prompt('Copy manually:', t); }
  }
  function toast(msg){
    const tip=document.createElement('div'); tip.textContent=msg;
    Object.assign(tip.style,{
      position:'fixed', left:'50%', top:'18px', transform:'translateX(-50%)',
      background:'rgba(0,0,0,.65)', color:'#fff', padding:'6px 10px', borderRadius:'8px',
      zIndex:2147483647, fontSize:'12px', backdropFilter:'blur(6px)'
    });
    document.body.appendChild(tip); setTimeout(()=>tip.remove(),1200);
  }

  /* ===== 注入基础样式 ===== */
  const style = document.createElement('style'); style.textContent = STYLE;
  document.documentElement.appendChild(style);

  /* ===== 右下徽标（Alt 切换"仅文件页/全站"） ===== */
  function ensureBadge(){
    if(qs('.gplus-badge')) return;
    const b=document.createElement('div');
    b.className='gplus-badge';
    b.innerHTML=`<div class="dot"></div><div class="brand">GitHubPlus</div><div class="text">Tap to ${enabled()?'Off':'On'}</div>`;
    if(!enabled()) b.classList.add('off');
    on(b,'click',(e)=>{
      if(e.altKey){
        const nx=!onlyBlob(); setOnlyBlob(nx);
        toast(nx?'仅文件页显示工具条':'所有页面显示工具条');
        if(isGitHub()) updateSHBar(true);
        return;
      }
      const nx=!enabled(); setEnabled(nx);
      b.classList.toggle('off', !nx);
      b.querySelector('.text').textContent=`Tap to ${nx?'Off':'On'}`;
      if(isGitHub()) updateSHBar(true); else if(isRaw()) updateRawBar(true);
      toast(nx?'UI Enabled':'UI Disabled');
    });
    document.body.appendChild(b);
  }

  /* ===== 固定横向工具条（短标签 + Hub） ===== */
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
    on(bar,'click',(e)=>{
      const btn=e.target.closest('.gplus-btn'); if(!btn) return;
      const act=btn.dataset.act;
      if(act==='raw'){ const raw=getRawURL(); return raw?open(raw,'_blank'):toast('Not a file view'); }
      if(act==='dl'){ return downloadCurrent(); }
      if(act==='p'){ const p=getRepoPath(); return p?copyText(p):toast('Not a file view'); }
      if(act==='u'){ const raw=getRawURL(); return raw?copyText(raw):toast('Not a file view'); }
      if(act==='f'){ const fn=getFileName(); return fn?copyText(fn):toast('Not a file view'); }
      if(act==='s'){ const rp=getRepoSlug(); return rp?copyText(rp):toast('Not in repo'); }
      if(act==='hub'){
        const url=buildScriptHubURL(); if(!url) return toast('Not a file view');
        try{ const w=open(url,'_blank'); if(!w) location.assign(url); } catch{ copyText(url); }
      }
    });
    return bar;
  }

  function placeSHBar(){
    if(qs('.gplus-shbar')) return;
    // 工具条固定定位，直接挂在 body；不和页面结构产生布局关系 → 不会上下移动
    document.body.appendChild(buildSHBar());
  }

  function updateSHBar(recreate=false){
    const bar=qs('.gplus-shbar'); const onUI=enabled();
    if(!isGitHub()) { if(bar) bar.classList.add('gplus-hidden'); return; }
    // "仅文件页显示"控制
    if(!onUI || (onlyBlob() && !isBlobView())){ if(bar) bar.classList.add('gplus-hidden'); return; }
    if(!bar || recreate){ if(bar) bar?.remove(); placeSHBar(); } else { bar.classList.remove('gplus-hidden'); }
  }

  /* ===== RAW 页面固定浮条 ===== */
  function ensureRawBar(){
    if(!isRaw() || qs('.gplus-rawbar')) return;
    const w=document.createElement('div'); w.className='gplus-rawbar';
    w.innerHTML=`
      <button class="gplus-btn" data-act="back" title="b">Back</button>
      <button class="gplus-btn" data-act="dl"   title="d">DL</button>
      <button class="gplus-btn" data-act="copy" title="u">URL</button>
    `;
    on(w,'click',(e)=>{
      const b=e.target.closest('.gplus-btn'); if(!b) return;
      const act=b.dataset.act;
      if(act==='back'){
        try{
          const u=new URL(location.href);
          const [owner, repo, branch, ...p]=u.pathname.split('/').filter(Boolean);
          const blob=`https://github.com/${owner}/${repo}/blob/${branch}/${p.join('/')}`;
          open(blob,'_self');
        }catch{ history.back(); }
      }
      if(act==='dl') downloadCurrent();
      if(act==='copy') copyText(location.href);
    });
    document.body.appendChild(w);
  }
  function updateRawBar(recreate=false){
    const bar=qs('.gplus-rawbar');
    if(!isRaw()) return;
    if(!enabled()){ if(bar) bar.classList.add('gplus-hidden'); return; }
    if(!bar || recreate){ if(bar) bar?.remove(); ensureRawBar(); }
    else { bar.classList.remove('gplus-hidden'); }
  }

  /* ===== 快捷键（桌面） ===== */
  function hotkeys(e){
    const tag=(e.target.tagName||'').toLowerCase();
    if(/(input|textarea|select)/.test(tag) || e.target.isContentEditable) return;
    const k=(e.key||'').toLowerCase();
    if(k==='r'){ const raw=getRawURL(); if(raw) open(raw,'_blank'); }
    if(k==='d'){ downloadCurrent(); }
    if(k==='p'){ const p=getRepoPath(); if(p) copyText(p); }
    if(k==='u'){ const raw=getRawURL(); if(raw) copyText(raw); }
    if(k==='f'){ const fn=getFileName(); if(fn) copyText(fn); }
    if(k==='s'){ const rp=getRepoSlug(); if(rp) copyText(rp); }
    if(k==='h'){ const url=buildScriptHubURL(); if(url) open(url,'_blank'); }
  }

  /* ===== 启动 ===== */
  (function boot(){
    // 样式
    const st=document.createElement('style'); st.textContent=STYLE; document.documentElement.appendChild(st);
    // UI
    ensureBadge();
    placeSHBar(); updateSHBar(true);
    if(isRaw()) updateRawBar(true);
    // 监听
    window.addEventListener('keydown', hotkeys, {passive:true});
  })();

  // 轻量监听，避免反复重建引起"闪烁"
  let lastHref=location.href;
  const mo=new MutationObserver(()=>{ if(isGitHub()) updateSHBar(); });
  mo.observe(document.documentElement,{childList:true,subtree:true});
  setInterval(()=>{ if(location.href!==lastHref){ lastHref=location.href; ensureBadge(); updateSHBar(true); if(isRaw()) updateRawBar(true); } }, 400);

})();