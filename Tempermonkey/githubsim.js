// ==UserScript==
// @name         GitHub+ 玻璃风格 + ScriptHub（vercel首选·自动带入Raw）
// @namespace    https://mikephie.site/
// @version      2.9.0
// @description  固定横向工具条（桌面顶部 / 移动底部横滑）；Hub 按钮走 convert 路由，自动带入 Raw；首选 scripthub.vercel.app，失败回退；暗黑高对比；短标签；快捷键 r/d/p/u/f/s/h；徽标不遮挡。
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
    --fg:#EAF2FF; --fg-dim:#B7C2D9;
    --glass-bg:rgba(20,22,28,.55);
    --glass-stroke:rgba(255,255,255,.18);
    --glass-shadow:0 18px 50px rgba(0,0,0,.45);
    --accent1:#3CC6FF; --accent2:#A78BFA;
  }
  @media(prefers-color-scheme:light){
    :root{
      --fg:#0B1220; --fg-dim:#475369;
      --glass-bg:rgba(255,255,255,.72);
      --glass-stroke:rgba(0,0,0,.12);
      --glass-shadow:0 12px 35px rgba(0,0,0,.18);
      --accent1:#0EA5E9; --accent2:#6366F1;
    }
  }
  .gplus-hidden{display:none!important}
  .gplus-shbar{
    position:fixed;left:0;right:0;top:0;z-index:2147483000;
    display:flex;align-items:center;gap:8px;padding:10px;
    background:linear-gradient(135deg,var(--glass-bg),rgba(0,0,0,.08));
    border:1px solid var(--glass-stroke);
    -webkit-backdrop-filter:saturate(160%) blur(18px);
    backdrop-filter:saturate(160%) blur(18px);
    box-shadow:var(--glass-shadow);
  }
  .gplus-btn{
    position:relative;flex:0 0 auto;
    border:1px solid rgba(255,255,255,.28);
    background:rgba(255,255,255,.08);
    color:var(--fg);padding:10px 12px;border-radius:12px;
    font-size:12px;font-weight:700;letter-spacing:.2px;
    min-height:44px;min-width:82px;text-align:center;
    cursor:pointer;transition:transform .08s,box-shadow .18s;
  }
  .gplus-btn::after{
    content:"";position:absolute;inset:-3px;border-radius:14px;z-index:-1;
    background:conic-gradient(from 0deg,var(--accent1),var(--accent2),var(--accent1));
    filter:blur(10px);opacity:.65;animation:gplusGlow 2.2s linear infinite;
  }
  .gplus-btn:hover{transform:translateY(-1px);box-shadow:0 14px 30px rgba(0,0,0,.45)}
  .gplus-btn:active{transform:scale(.98)}
  @keyframes gplusGlow{to{transform:rotate(360deg)}}
  @media(max-width:768px){
    .gplus-shbar{
      top:auto;bottom:calc(0px + env(safe-area-inset-bottom,0));
      display:block;white-space:nowrap;overflow-x:auto;
      -webkit-overflow-scrolling:touch;touch-action:pan-x;
      padding:10px 10px calc(10px + env(safe-area-inset-bottom,0));
      padding-right:120px;scrollbar-width:none;
    }
    .gplus-shbar::-webkit-scrollbar{display:none}
    .gplus-btn{display:inline-block;min-width:88px;margin-right:8px}
    .gplus-badge{bottom:calc(70px + env(safe-area-inset-bottom,0))}
  }
  .gplus-badge{
    position:fixed;right:16px;bottom:20px;z-index:2147482000;
    display:inline-flex;align-items:center;gap:6px;
    background:linear-gradient(135deg,rgba(60,198,255,.3),rgba(167,139,250,.18));
    border:1px solid var(--glass-stroke);
    -webkit-backdrop-filter:blur(12px) saturate(150%);
    backdrop-filter:blur(12px) saturate(150%);
    color:var(--fg);padding:8px 12px;border-radius:14px;font-weight:800;
    box-shadow:0 12px 28px rgba(0,0,0,.45);
    cursor:pointer;user-select:none;font-size:12px;
  }`;
  document.head.appendChild(Object.assign(document.createElement('style'),{textContent:STYLE}));

  /* ========== 工具函数 ========== */
  function getRawUrl(){
    const href=location.href.split('#')[0].split('?')[0];
    const clean=location.origin+location.pathname;
    if(/^https?:\/\/raw\.githubusercontent\.com\//.test(href)) return href;
    const m1=clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
    if(m1) return `https://raw.githubusercontent.com/${m1[1]}/${m1[2]}/${m1[3]}/${m1[4]}`;
    const m2=clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
    if(m2) return `https://raw.githubusercontent.com/${m2[1]}/${m2[2]}/${m2[3]}/${m2[4]}`;
    return href;
  }
  function getRepoPath(){const p=location.pathname.split('/').filter(Boolean);return p.length>=5?p.slice(4).join('/'):"";}
  function getFileName(){const p=getRepoPath();return p?p.split('/').pop():"";}
  function getRepoSlug(){const p=location.pathname.split('/').filter(Boolean);return p.length>=2?`${p[0]}/${p[1]}`:"";}
  async function copyText(t){if(!t)return;try{await navigator.clipboard.writeText(t);toast("Copied");}catch{prompt("Copy manually:",t);}}
  function toast(msg){const d=document.createElement("div");d.textContent=msg;Object.assign(d.style,{position:"fixed",left:"50%",top:"18px",transform:"translateX(-50%)",background:"rgba(0,0,0,.65)",color:"#fff",padding:"6px 10px",borderRadius:"8px",zIndex:2147483647,fontSize:"12px"});document.body.appendChild(d);setTimeout(()=>d.remove(),1200);}

  /* ========== ScriptHub 打开（convert 路由，自动带入 Raw） ========== */
  function openScriptHub(e){
    const raw=getRawUrl(); if(!raw){toast("Not a file view");return;}
    const tail="/convert/_start_/"+encodeURIComponent(raw)+"/_end_/plain.txt?type=plain-text&target=plain-text";
    let bases=["https://scripthub.vercel.app","https://script.hub","http://127.0.0.1:9101"];
    if(e&&e.shiftKey) bases=["https://script.hub","https://scripthub.vercel.app","http://127.0.0.1:9101"];
    if(e&&e.altKey) bases=["http://127.0.0.1:9101","https://scripthub.vercel.app","https://script.hub"];
    (function tryOpen(i){if(i>=bases.length){copyText(raw);toast("已复制 Raw，手动粘贴");return;}
      const url=bases[i]+tail; try{const w=window.open(url,"_blank","noopener");if(!w)location.assign(url);}catch{tryOpen(i+1);}
    })(0);
  }

  /* ========== 工具条 UI ========== */
  function buildBar(){
    const bar=document.createElement("div");bar.className="gplus-shbar";
    bar.innerHTML=`
      <button class="gplus-btn" data-act="raw" title="r">Raw</button>
      <button class="gplus-btn" data-act="dl"  title="d">DL</button>
      <button class="gplus-btn" data-act="p"   title="p">Path</button>
      <button class="gplus-btn" data-act="u"   title="u">URL</button>
      <button class="gplus-btn" data-act="f"   title="f">Name</button>
      <button class="gplus-btn" data-act="s"   title="s">Repo</button>
      <button class="gplus-btn" data-act="hub" title="h">Hub</button>`;
    bar.addEventListener("click",e=>{
      const act=e.target.dataset.act;
      if(act==="raw"){const r=getRawUrl();if(r)open(r,"_blank");}
      if(act==="dl"){const r=getRawUrl();if(r)open(r,"_blank");}
      if(act==="p") copyText(getRepoPath());
      if(act==="u") copyText(getRawUrl());
      if(act==="f") copyText(getFileName());
      if(act==="s") copyText(getRepoSlug());
      if(act==="hub") openScriptHub(e);
    });
    document.body.appendChild(bar);
  }
  function ensureBadge(){
    if(document.querySelector(".gplus-badge")) return;
    const b=document.createElement("div");b.className="gplus-badge";b.textContent="GitHubPlus";
    b.addEventListener("click",()=>document.querySelector(".gplus-shbar")?.classList.toggle("gplus-hidden"));
    document.body.appendChild(b);
  }

  /* ========== 快捷键 ========== */
  function hotkeys(e){
    const tag=(e.target.tagName||"").toLowerCase();
    if(/(input|textarea|select)/.test(tag)||e.target.isContentEditable)return;
    const k=(e.key||"").toLowerCase();
    if(k==="r"){const r=getRawUrl();if(r)open(r,"_blank");}
    if(k==="d"){const r=getRawUrl();if(r)open(r,"_blank");}
    if(k==="p") copyText(getRepoPath());
    if(k==="u") copyText(getRawUrl());
    if(k==="f") copyText(getFileName());
    if(k==="s") copyText(getRepoSlug());
    if(k==="h") openScriptHub(e);
  }

  /* ========== 启动 ========== */
  (function boot(){
    buildBar(); ensureBadge();
    window.addEventListener("keydown",hotkeys,{passive:true});
  })();

})();