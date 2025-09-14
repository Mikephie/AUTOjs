// ==UserScript==
// @name         GitHub+ (MIKE版) 玻璃风格 + ScriptHub（常驻稳定版 · 修复+霓虹）
// @namespace    https://mikephie.site/
// @version      2.4.0
// @description  玻璃工具条 + 右下徽标；ScriptHub 跳转修复（避免 Invalid URL）；短标签按钮（Raw/DL/Path/URL/Name/Repo/Hub）；霓虹发光不闪烁；SPA 兼容；移动端底部横向滚动；快捷键 r/d/p/u/f/s/h；Alt+点徽标切换"仅文件页/全站"
// @author       Mikephie
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  /* ==================== 样式（玻璃 + 霓虹 + 移动优化） ==================== */
  const STYLE = `
  :root{
    --glass-bg: rgba(255,255,255,.10);
    --glass-stroke: rgba(255,255,255,.22);
    --glass-shadow: 0 18px 50px rgba(0,0,0,.35);
    --fg: #eaf2ff; --fg-dim: #b7c2d9;
    --accent1: #22c1c3; --accent2: #2e8bff;
  }
  @media (prefers-color-scheme: light) {
    :root{
      --glass-bg: rgba(255,255,255,.55);
      --glass-stroke: rgba(0,0,0,.12);
      --glass-shadow: 0 12px 35px rgba(0,0,0,.15);
      --fg: #0b1220; --fg-dim: #475369;
      --accent1: #0ea5e9; --accent2: #6366f1;
    }
  }
  .gplus-hidden{display:none!important}

  /* 顶部工具条（桌面）；移动端会固定到底部横滚 */
  .gplus-shbar{
    position: sticky; top: 0; z-index: 1002;
    -webkit-backdrop-filter: saturate(140%) blur(16px);
    backdrop-filter: saturate(140%) blur(16px);
    background: linear-gradient(135deg, var(--glass-bg), rgba(0,0,0,.05));
    border-bottom: 1px solid var(--glass-stroke);
    box-shadow: var(--glass-shadow);
    padding: 10px 10px;
    display: flex; gap: 8px; align-items: center;
  }
  .gplus-shbar .title{font-weight:700; letter-spacing:.3px; color:var(--fg)}
  .gplus-shbar .sub{color:var(--fg-dim); font-size:12px; margin-right:auto}

  .gplus-btn{
    position:relative; border:1px solid var(--glass-stroke);
    padding:10px 12px; background: rgba(255,255,255,.06);
    border-radius: 12px; cursor:pointer; color:var(--fg); font-weight:600;
    min-height:44px; line-height:1; flex:0 0 auto;
    transition: transform .12s ease, box-shadow .18s ease;
    /* 短宽按钮 */
    min-width: 84px;
    text-align:center;
  }
  .gplus-btn:hover{ transform:translateY(-1px); }
  .gplus-btn::after{
    content:""; position:absolute; inset:-2px; border-radius:14px; pointer-events:none;
    background: conic-gradient(from 0deg, var(--accent1), var(--accent2), var(--accent1));
    filter: blur(10px); opacity:.45; z-index:-1;
    animation: gplusGlow 3.2s linear infinite;
  }
  @media (prefers-reduced-motion: reduce){ .gplus-btn::after{animation:none; opacity:.25} }
  @keyframes gplusGlow { to { transform: rotate(360deg); } }

  /* 右下角徽标 */
  .gplus-badge{
    position: fixed;
    right: max(18px, env(safe-area-inset-right,0));
    bottom: calc(20px + env(safe-area-inset-bottom,0));
    z-index:1003; display:inline-flex; align-items:center; gap:8px;
    background: linear-gradient(135deg, rgba(46,139,255,.25), rgba(34,193,195,.12));
    border:1px solid var(--glass-stroke);
    box-shadow: 0 14px 40px rgba(0,0,0,.35), 0 0 18px rgba(46,139,255,.35), inset 0 0 18px rgba(34,193,195,.18);
    color:var(--fg); padding:10px 14px; border-radius:14px; font-weight:800; letter-spacing:.4px;
    -webkit-backdrop-filter: blur(12px) saturate(150%); backdrop-filter: blur(12px) saturate(150%);
    cursor:pointer; user-select:none;
  }
  .gplus-badge .dot{width:8px; height:8px; border-radius:50%; background:#22c55e; box-shadow:0 0 10px #22c55e}
  .gplus-badge.off .dot{background:#ef4444; box-shadow:0 0 10px #ef4444}
  .gplus-badge .text{font-size:12px; opacity:.9}
  .gplus-badge .brand{font-size:13px; text-shadow:0 0 8px rgba(46,139,255,.6)}

  /* RAW 顶部浮条 */
  .gplus-rawbar{
    position: fixed; top: max(8px, env(safe-area-inset-top,0));
    right:max(8px, env(safe-area-inset-right,0));
    left: max(8px, env(safe-area-inset-left,0));
    z-index:2147483646; display:flex; gap:8px; justify-content:flex-end; padding:8px; pointer-events:none;
  }
  .gplus-rawbar .gplus-btn{ pointer-events: all; }

  /* 移动端：工具条到底部并横向滚动；徽标抬高避免遮挡 */
  @media (max-width: 768px){
    .gplus-shbar{
      position: fixed; bottom: calc(0px + env(safe-area-inset-bottom,0)); top:auto; left:0; right:0;
      border-top:1px solid var(--glass-stroke); border-bottom:none;
      padding: 10px 10px calc(10px + env(safe-area-inset-bottom,0));
      overflow-x:auto; overscroll-behavior-x:contain; -webkit-overflow-scrolling:touch;
      scrollbar-width:none
    }
    .gplus-shbar::-webkit-scrollbar{display:none}
    .gplus-shbar .title, .gplus-shbar .sub{display:none}
    .gplus-btn{min-width:88px}
    .gplus-badge{ bottom: calc(70px + env(safe-area-inset-bottom,0)) }
  }
  `;

  /* ==================== 常量/工具 ==================== */
  const STORE_ENABLED  = 'gplus.enabled';
  const STORE_ONLYBLOB = 'gplus.onlyBlob'; // "1" = 仅文件页显示工具条
  const qs  = (s, r=document)=>r.querySelector(s);
  const on  = (el, ev, fn, opt)=> el && el.addEventListener(ev, fn, opt);
  const isGitHub = ()=> location.hostname === 'github.com';
  const isRaw    = ()=> location.hostname === 'raw.githubusercontent.com';
  const enabled  = ()=> (localStorage.getItem(STORE_ENABLED) ?? '1') === '1';
  const setEnabled = (f)=> localStorage.setItem(STORE_ENABLED, f?'1':'0');
  const onlyBlob = ()=> (localStorage.getItem(STORE_ONLYBLOB) ?? '0') === '1';
  const setOnlyBlob = (f)=> localStorage.setItem(STORE_ONLYBLOB, f?'1':'0');

  function isBlobView() {
    if (!isGitHub()) return false;
    const p = location.pathname.split('/').filter(Boolean);
    return p.length >= 5 && p[2] === 'blob';
  }
  function getRepoSlug(){
    const p = location.pathname.split('/').filter(Boolean);
    return p.length >= 2 ? `${p[0]}/${p[1]}` : '';
  }
  function getRepoPath(){
    if(!isBlobView()) return '';
    const p = location.pathname.split('/').filter(Boolean);
    return p.slice(4).join('/');
  }
  function getFileName(){
    const path = getRepoPath(); if(!path) return '';
    const seg = path.split('/'); return seg[seg.length-1] || '';
  }

  // ---- 强化：原地/raw 域名/两类路径都能稳定拿到 raw；避免空值
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

    return null; // 非文件页
  }

  // ---- ScriptHub URL 生成：只编码一次；为空时给出提示
  function buildScriptHubURL(){
    const raw = getRawURL();
    if(!raw) return null;
    const enc = encodeURIComponent(raw); // 不能二次编码
    // 依次尝试（你可按需调整优先级/协议）
    const base = 'http://script.hub';
    return `${base}/convert/_start_/${enc}/_end_/plain.txt?type=plain-text&target=plain-text`;
  }

  async function downloadCurrent(){
    const raw = getRawURL(); if(!raw) return toast('Not a file view');
    try{
      const res = await fetch(raw, {credentials:'omit'});
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = getFileName() || 'download'; document.body.appendChild(a);
      a.click(); a.remove(); URL.revokeObjectURL(url);
    }catch{ open(raw, '_blank'); }
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
      background:'rgba(0,0,0,.6)', color:'#fff', padding:'6px 10px', borderRadius:'8px',
      zIndex:2147483647, fontSize:'12px', backdropFilter:'blur(6px)'
    });
    document.body.appendChild(tip); setTimeout(()=>tip.remove(),1200);
  }

  /* ==================== 注入样式 ==================== */
  const style = document.createElement('style'); style.textContent = STYLE;
  document.documentElement.appendChild(style);

  /* ==================== 徽标（Alt 切换范围） ==================== */
  function ensureBadge(){
    if(qs('.gplus-badge')) return;
    const badge = document.createElement('div');
    badge.className = 'gplus-badge';
    badge.innerHTML = `<div class="dot"></div><div class="brand">GitHubPlus</div><div class="text">Tap to ${enabled()?'Off':'On'}</div>`;
    if(!enabled()) badge.classList.add('off');
    on(badge,'click',(e)=>{
      if(e.altKey){
        const nx=!onlyBlob(); setOnlyBlob(nx);
        toast(nx?'仅文件页显示工具条':'所有页面显示工具条');
        if(isGitHub()) updateSHBar(true);
        return;
      }
      const nx=!enabled(); setEnabled(nx);
      badge.classList.toggle('off', !nx);
      badge.querySelector('.text').textContent = `Tap to ${nx?'Off':'On'}`;
      if(isGitHub()) updateSHBar(true); else if(isRaw()) updateRawBar(true);
      toast(nx?'UI Enabled':'UI Disabled');
    });
    document.body.appendChild(badge);
  }

  /* ==================== 工具条（短名 + Hub） ==================== */
  function buildSHBar(){
    const bar = document.createElement('div'); bar.className='gplus-shbar';
    bar.innerHTML = `
      <span class="title">ScriptHub</span><span class="sub">Raw • Download • Copy</span>
      <button class="gplus-btn" data-act="raw"  title="r">Raw</button>
      <button class="gplus-btn" data-act="dl"   title="d">DL</button>
      <button class="gplus-btn" data-act="p"    title="p">Path</button>
      <button class="gplus-btn" data-act="u"    title="u">URL</button>
      <button class="gplus-btn" data-act="f"    title="f">Name</button>
      <button class="gplus-btn" data-act="s"    title="s">Repo</button>
      <button class="gplus-btn" data-act="hub"  title="h">Hub</button>
    `;
    on(bar,'click',(e)=>{
      const b=e.target.closest('.gplus-btn'); if(!b) return;
      const act=b.dataset.act;
      if(act==='raw'){ const raw=getRawURL(); return raw?open(raw,'_blank'):toast('Not a file view'); }
      if(act==='dl'){ return downloadCurrent(); }
      if(act==='p'){ const p=getRepoPath(); return p?copyText(p):toast('Not a file view'); }
      if(act==='u'){ const raw=getRawURL(); return raw?copyText(raw):toast('Not a file view'); }
      if(act==='f'){ const fn=getFileName(); return fn?copyText(fn):toast('Not a file view'); }
      if(act==='s'){ const rp=getRepoSlug(); return rp?copyText(rp):toast('Not in repo'); }
      if(act==='hub'){
        const url = buildScriptHubURL();
        if(!url) return toast('Not a file view');
        // iOS/Safari 可能拦截新窗口；先尝试 _blank，失败则当前页打开，仍不行就复制
        try{ const w=open(url,'_blank'); if(!w) location.assign(url); }
        catch{ copyText(url); }
      }
    });
    return bar;
  }

  function placeSHBar(){
    if(!isGitHub()) return;
    if(qs('.gplus-shbar')) return;
    if(onlyBlob() && !isBlobView()) return;
    const container=document.createElement('div'); container.appendChild(buildSHBar());
    const anchor=qs('#repo-content-pjax-container') || qs('main') || document.body;
    anchor.parentElement.insertBefore(container, anchor);
  }

  function updateSHBar(recreate=false){
    const bar=qs('.gplus-shbar'); const onUI=enabled();
    if(!isGitHub()) return;
    if(!onUI || (onlyBlob() && !isBlobView())){ if(bar) bar.classList.add('gplus-hidden'); return; }
    if(!bar || recreate){ if(bar) bar.remove(); placeSHBar(); }
    else { bar.classList.remove('gplus-hidden'); }
  }

  /* ==================== RAW 浮条 ==================== */
  function ensureRawBar(){
    if(!isRaw() || qs('.gplus-rawbar')) return;
    const w=document.createElement('div'); w.className='gplus-rawbar';
    w.innerHTML = `
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
    if(!bar || recreate){ if(bar) bar.remove(); ensureRawBar(); }
    else { bar.classList.remove('gplus-hidden'); }
  }

  /* ==================== 快捷键（桌面） ==================== */
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

  /* ==================== 启动 / 防闪烁渲染 ==================== */
  const styleEl=document.createElement('style'); styleEl.textContent=STYLE;
  document.documentElement.appendChild(styleEl);

  function boot(){
    ensureBadge();
    if(isGitHub()){
      updateSHBar(true);
      window.addEventListener('keydown', hotkeys, {passive:true});
    }else if(isRaw()){
      updateRawBar(true);
      window.addEventListener('keydown', hotkeys, {passive:true});
    }
  }
  boot();

  // 节流的 MutationObserver（不频繁重建，避免闪烁）
  let renderReq = false;
  const mo = new MutationObserver(()=>{ if(!renderReq){ renderReq = true; requestAnimationFrame(()=>{ renderReq=false; if(isGitHub()) updateSHBar(); }); } });
  mo.observe(document.documentElement, {subtree:true, childList:true});

  // 监听 URL 变化（PJAX & 前进后退）
  let lastHref = location.href;
  setInterval(()=>{ if(location.href!==lastHref){ lastHref=location.href; boot(); } }, 400);
})();