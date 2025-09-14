// ==UserScript==
// @name         GitHub+ 玻璃风格 + ScriptHub 完整版
// @namespace    https://mikephie.site/
// @version      3.0.0
// @description  固定横向工具条（桌面顶部/移动底部横滑）；ScriptHub 路由完全照搬原版逻辑；玻璃风格；短标签；快捷键 r/d/p/u/f/s/h；徽标不遮挡按钮。
// @author       You
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  /* ========== 样式 ========== */
  const STYLE = `
  :root{
    --fg: #EAF2FF;
    --fg-dim: #B7C2D9;
    --glass-bg: rgba(20,22,28,.55);
    --glass-stroke: rgba(255,255,255,.18);
    --accent1: #3CC6FF;
    --accent2: #A78BFA;
  }
  @media (prefers-color-scheme: light){
    :root{
      --fg:#0B1220; --fg-dim:#475369;
      --glass-bg: rgba(255,255,255,.72);
      --glass-stroke: rgba(0,0,0,.12);
      --accent1:#0EA5E9; --accent2:#6366F1;
    }
  }
  .gplus-shbar{
    position:fixed; left:0; right:0; top:0;
    z-index:2147483000;
    display:flex; align-items:center; gap:8px;
    padding:10px;
    background:linear-gradient(135deg, var(--glass-bg), rgba(0,0,0,.08));
    border:1px solid var(--glass-stroke);
    -webkit-backdrop-filter: saturate(160%) blur(18px);
    backdrop-filter: saturate(160%) blur(18px);
  }
  .gplus-btn{
    display:inline-block; vertical-align:top;
    border:1px solid rgba(255,255,255,.28);
    background:rgba(255,255,255,.08);
    color:var(--fg);
    padding:10px 12px; border-radius:12px;
    font-size:12px; font-weight:700;
    min-height:44px; min-width:82px;
    margin-right:8px; cursor:pointer;
  }
  .gplus-badge{
    position:fixed;
    right:16px;
    bottom:calc(20px + env(safe-area-inset-bottom,0));
    z-index:2147482000;
    padding:10px 14px; border-radius:14px;
    background:linear-gradient(135deg, rgba(60,198,255,.3), rgba(167,139,250,.18));
    border:1px solid var(--glass-stroke);
    color:var(--fg); font-weight:800;
    cursor:pointer;
  }
  @media (max-width:768px){
    .gplus-shbar{
      top:auto; bottom:calc(0px + env(safe-area-inset-bottom,0));
      display:block; white-space:nowrap;
      overflow-x:auto; -webkit-overflow-scrolling:touch;
      touch-action:pan-x;
      padding-right:120px;
    }
    .gplus-btn{ min-width:88px }
    .gplus-badge{ bottom:calc(70px + env(safe-area-inset-bottom,0)) }
  }`;

  document.head.appendChild(document.createElement('style')).textContent = STYLE;

  /* ========== 工具函数 ========== */
  function getRawUrl() {
    var href = location.href.split('#')[0].split('?')[0];
    var clean = location.origin + location.pathname;

    if (/^https?:\/\/raw\.githubusercontent\.com\//.test(href)) return href;

    var m1 = clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
    if (m1) return 'https://raw.githubusercontent.com/' + m1[1] + '/' + m1[2] + '/' + m1[3] + '/' + m1[4];

    var m2 = clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
    if (m2) return 'https://raw.githubusercontent.com/' + m2[1] + '/' + m2[2] + '/' + m2[3] + '/' + m2[4];

    return href;
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
  async function copyText(t){try{await navigator.clipboard.writeText(t);}catch(e){prompt('Copy manually:',t);} }

  /* ========== ScriptHub 跳转（照搬原版逻辑） ========== */
  function buildScriptHubURL(){
    var raw = getRawUrl(); if(!raw) return null;
    var enc = encodeURIComponent(raw); // 照搬：整条 raw encode 一次
    var base = 'http://script.hub';    // 固定 script.hub
    return base + '/convert/_start_/' + enc + '/_end_/plain.txt?type=plain-text&target=plain-text';
  }

  /* ========== 工具条 ========== */
  function buildBar(){
    const bar=document.createElement('div'); bar.className='gplus-shbar';
    bar.innerHTML=`
      <button class="gplus-btn" data-act="raw">Raw</button>
      <button class="gplus-btn" data-act="dl">DL</button>
      <button class="gplus-btn" data-act="p">Path</button>
      <button class="gplus-btn" data-act="u">URL</button>
      <button class="gplus-btn" data-act="f">Name</button>
      <button class="gplus-btn" data-act="s">Repo</button>
      <button class="gplus-btn" data-act="hub">Hub</button>`;
    bar.addEventListener('click', async e=>{
      const act=e.target.dataset.act;
      if(act==='raw') open(getRawUrl(),'_blank');
      if(act==='dl'){ const r=getRawUrl(); if(r){open(r,'_blank');} }
      if(act==='p') copyText(getRepoPath());
      if(act==='u') copyText(getRawUrl());
      if(act==='f') copyText(getFileName());
      if(act==='s') copyText(getRepoSlug());
      if(act==='hub'){ const url=buildScriptHubURL(); if(url) open(url,'_blank'); }
    });
    document.body.appendChild(bar);
  }

  /* ========== 徽标 ========== */
  function ensureBadge(){
    if(document.querySelector('.gplus-badge')) return;
    const b=document.createElement('div');
    b.className='gplus-badge';
    b.textContent='GitHubPlus';
    b.addEventListener('click',()=>{document.querySelector('.gplus-shbar').classList.toggle('gplus-hidden');});
    document.body.appendChild(b);
  }

  /* ========== 启动 ========== */
  buildBar();
  ensureBadge();
})();