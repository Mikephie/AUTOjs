// ==UserScript==
// @name         GitHub+ 玻璃风格 + ScriptHub（固定工具条·移动横滑修复·粘贴到ScriptHub）
// @namespace    https://mikephie.site/
// @version      2.7.1
// @description  固定横向工具条（桌面顶部 / 移动底部横滑）；点击 Hub 仅把当前 Raw 链接带到 script.hub 输入框（?src=raw）；暗黑高对比；短标签；快捷键 r/d/p/u/f/s/h；徽标不遮挡按钮。
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  /* ==================== 样式（固定 + 高对比 + 移动横滑） ==================== */
  const STYLE = `
  :root{
    --fg: #EAF2FF;
    --fg-dim: #B7C2D9;
    --glass-bg: rgba(20,22,28,.55);
    --glass-stroke: rgba(255,255,255,.18);
    --glass-shadow: 0 18px 50px rgba(0,0,0,.45);
    --accent1: #3CC6FF;       /* 暗黑更亮的蓝青 */
    --accent2: #A78BFA;       /* 暗黑更亮的紫 */
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

  /* 固定工具条：不参与页面流（不抖动） */
  .gplus-shbar{
    position: fixed; left:0; right:0; z-index: 2147483000;
    display:flex; align-items:center; gap:8px;
    padding:10px 10px;
    background: linear-gradient(135deg, var(--glass-bg), rgba(0,0,0,.08));
    border: 1px solid var(--glass-stroke);
    -webkit-backdrop-filter: saturate(160%) blur(18px);
    backdrop-filter: saturate(160%) blur(18px);
    box-shadow: var(--glass-shadow);
    top:0; /* 若想桌面也底部：改为 top:auto; bottom:0; */
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
    text-align:center; cursor:pointer;
    transition: transform .08s ease, box-shadow .18s ease, background .18s ease;
    flex: 0 0 auto;
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

  /* 右下徽标（固定） */
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
  }

  /* 移动端：底部固定 + 单行横滑 + 预留徽标空间 */
  @media (max-width: 768px){
    .gplus-shbar{
      top:auto; bottom: calc(0px + env(safe-area-inset-bottom, 0));
      display: block;                 /* block + inline-block 防止 flex 压缩换行 */
      white-space: nowrap;            /* 强制单行 */
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-x: contain;
      touch-action: pan-x;
      scrollbar-width: none;
      border-top: 1px solid var(--glass-stroke); border-bottom: none;
      padding: 10px 10px calc(10px + env(safe-area-inset-bottom,0));
      padding-right: 120px;           /* 初始预留，JS 动态覆盖 */
    }
    .gplus-shbar::-webkit-scrollbar{ display:none }
    .gplus-shbar .title, .gplus-shbar .sub{ display:none }
    .gplus-btn{
      display:inline-block; vertical-align: top;
      min-width: 88px; margin-right: 8px;
    }
    .gplus-badge{
      bottom: calc(70px + env(safe-area-inset-bottom,0));
      right: max(12px, env(safe-area-inset-right,0));
      z-index: 2147482000; /* 比工具条低，永不盖住 */
    }
  }
  `;

  /* ==================== 注入样式 ==================== */
  const style = document.createElement('style'); style.textContent = STYLE;
  document.documentElement.appendChild(style);

  /* ==================== 工具函数 ==================== */
  function getRawUrl() {
    // 完全照搬原版解析：支持 /blob 与 /raw
    var href = location.href.split('#')[0].split('?')[0];
    var clean = location.origin + location.pathname;

    if (/^https?:\/\/raw\.githubusercontent\.com\//.test(href)) return href;

    var m1 = clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
    if (m1) return 'https://raw.githubusercontent.com/' + m1[1] + '/' + m1[2] + '/' + m1[3] + '/' + m1[4];

    var m2 = clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
    if (m2) return 'https://raw.githubusercontent.com/' + m2[1] + '/' + m2[2] + '/' + m2[3] + '/' + m2[4];

    return href; // 其他视图：原样返回（ScriptHub页不会用到）
  }
  function getRepoPath(){
    const p=location.pathname.split('/').filter(Boolean);
    return p.length>=5?p.slice(4).join('/'):'';
  }
  function getFileName(){
    const p=getRepoPath(); if(!p) return ''; return p.split('/').pop();
  }
  function getRepoSlug(){
    const p=location.pathname.split('/').filter(Boolean);
    return p.length>=2?`${p[0]}/${p[1]}`:'';
  }
  async function copyText(t){
    if(!t) return;
    try{ await navigator.clipboard.writeText(t); } catch{ prompt('Copy manually:', t); }
  }
  function fitMobileBar() {
    if (window.matchMedia('(max-width: 768px)').matches) {
      const bar = document.querySelector('.gplus-shbar');
      const badge = document.querySelector('.gplus-badge');
      if (!bar || !badge) return;
      const w = Math.ceil(badge.getBoundingClientRect().width || 0);
      bar.style.paddingRight = (w + 24) + 'px'; // 动态预留，避免被徽标遮挡
    }
  }

  /* ==================== ScriptHub：打开主页并把 Raw 粘到输入框 ==================== */
  function openScriptHub(){
    const raw = getRawUrl();
    if (!raw) { alert('当前不是文件页，无法获取 Raw 链接'); return; }
    const hub = (location.protocol === 'https:' ? 'https://script.hub' : 'http://script.hub');
    const url = hub + '/?src=' + encodeURIComponent(raw); // 只把 raw 塞进 src
    window.open(url, '_blank');
  }

  /* ==================== 工具条 ==================== */
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
      if(act==='raw'){ const r=getRawUrl(); if(r) open(r,'_blank'); }
      if(act==='dl'){ const r=getRawUrl(); if(r) open(r,'_blank'); }
      if(act==='p'){ const p=getRepoPath(); if(p) copyText(p); }
      if(act==='u'){ const r=getRawUrl(); if(r) copyText(r); }
      if(act==='f'){ const fn=getFileName(); if(fn) copyText(fn); }
      if(act==='s'){ const rp=getRepoSlug(); if(rp) copyText(rp); }
      if(act==='hub'){ openScriptHub(); }
    }, false);
    return bar;
  }
  function placeSHBar(){
    if(document.querySelector('.gplus-shbar')) return;
    document.body.appendChild(buildSHBar()); // 固定挂 body，不进文档流 → 不移动
  }

  /* ==================== 徽标 ==================== */
  function ensureBadge(){
    if(document.querySelector('.gplus-badge')) return;
    const b=document.createElement('div');
    b.className='gplus-badge';
    b.innerHTML = `<div class="dot" style="width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 10px #22c55e;margin-right:8px"></div><div class="brand">GitHubPlus</div>`;
    b.addEventListener('click',()=>{ document.querySelector('.gplus-shbar')?.classList.toggle('gplus-hidden'); fitMobileBar(); });
    document.body.appendChild(b);
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
    if(k==='h'){ openScriptHub(); }
  }

  /* ==================== 启动 ==================== */
  (function boot(){
    placeSHBar();
    ensureBadge();
    fitMobileBar();
    window.addEventListener('resize', fitMobileBar, {passive:true});
    window.addEventListener('orientationchange', fitMobileBar, {passive:true});
    window.addEventListener('keydown', hotkeys, {passive:true});
    setInterval(fitMobileBar, 1200); // 兜底适配（地址栏收起/旋转）
  })();

})();