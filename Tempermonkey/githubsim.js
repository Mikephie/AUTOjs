// ==UserScript==
// @name         GitHub+ 玻璃风格 + ScriptHub（Octocat 徽标版）
// @namespace    https://mikephie.site/
// @version      3.9.0
// @description  固定工具条（移动底部横滑 / 桌面顶部可调）；Raw 单击=复制，双击=查看，长按=下载；Edit↔Cancel；All=全选复制；Hub 自动分流；双击徽标切换主题；徽标为 GitHub Octocat 圆标。
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  /* ==================== 样式 ==================== */
  const STYLE = `
  :root{
    --fg:#EAF2FF; --fg-dim:#B7C2D9;
    --glass-bg:rgba(20,22,28,.40);
    --glass-stroke:rgba(255,255,255,.16);
    --glass-shadow:0 12px 30px rgba(0,0,0,.4);
    --accent1:#ec4899; --accent2:#a855f7;
    --badge-cat:#0b0f17;
  }
  @media(prefers-color-scheme:light){
    :root{
      --fg:#0B1220; --fg-dim:#475369;
      --glass-bg:rgba(255,255,255,.65);
      --glass-stroke:rgba(0,0,0,.12);
      --glass-shadow:0 10px 25px rgba(0,0,0,.18);
      --accent1:#0EA5E9; --accent2:#6366F1;
      --badge-cat:#fff;
    }
  }
  .gplus-shbar{
    position:fixed;left:0;right:0;z-index:2147483000;
    display:flex;align-items:center;justify-content:center;
    gap:10px;padding:8px 12px;
    background:var(--glass-bg);border:1px solid var(--glass-stroke);
    -webkit-backdrop-filter:blur(18px) saturate(180%);
    backdrop-filter:blur(18px) saturate(180%);
    box-shadow:var(--glass-shadow);
  }
  @media(min-width:769px){.gplus-shbar{top:0;}}
  @media(max-width:768px){
    .gplus-shbar{
      bottom:calc(0px + env(safe-area-inset-bottom,0));
      top:auto;overflow-x:auto;white-space:nowrap;
      -webkit-overflow-scrolling:touch;scrollbar-width:none;
    }
    .gplus-shbar::-webkit-scrollbar{display:none}
  }
  .gplus-btn{
    position:relative;flex:0 0 auto;
    background:rgba(0,0,0,.25);color:var(--fg);
    padding:8px 14px;border-radius:12px;
    font-size:13px;font-weight:600;
    border:2px solid transparent;cursor:pointer;
    transition:transform .08s,box-shadow .18s;
  }
  .gplus-btn::after{
    content:"";position:absolute;inset:-2px;border-radius:14px;z-index:-1;
    background:linear-gradient(90deg,var(--accent1),var(--accent2));
  }
  .gplus-btn:hover{transform:translateY(-1px);}
  .gplus-btn:active{transform:scale(.97);}
  .gplus-badge{
    position:fixed;right:18px;bottom:80px;
    z-index:2147482000;width:56px;height:56px;
    border-radius:50%;display:flex;align-items:center;justify-content:center;
    background:var(--glass-bg);border:1px solid var(--glass-stroke);
    -webkit-backdrop-filter:blur(18px) saturate(180%);
    backdrop-filter:blur(18px) saturate(180%);
    cursor:pointer;
  }
  .gplus-badge svg{width:36px;height:36px;display:block;}
  `;
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: STYLE }));

  /* ==================== 工具函数 ==================== */
  function getRawUrl(){
    const href=location.href.split('#')[0].split('?')[0];
    const clean=location.origin+location.pathname;
    if(/^https?:\/\/raw\.githubusercontent\.com\//.test(href)) return href;
    const m1=clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
    if(m1) return `https://raw.githubusercontent.com/${m1[1]}/${m1[2]}/${m1[3]}/${m1[4]}`;
    const m2=clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
    if(m2) return `https://raw.githubusercontent.com/${m2[1]}/${m2[2]}/${m2[3]}/${m2[4]}`;
    return "";
  }
  async function copyText(t){if(!t)return;try{await navigator.clipboard.writeText(t);toast("Copied");}catch{prompt("Copy:",t);}}
  function toast(msg){const d=document.createElement("div");d.textContent=msg;Object.assign(d.style,{position:"fixed",left:"50%",top:"18px",transform:"translateX(-50%)",background:"rgba(0,0,0,.65)",color:"#fff",padding:"6px 10px",borderRadius:"8px",zIndex:2147483647,fontSize:"12px"});document.body.appendChild(d);setTimeout(()=>d.remove(),1200);}

  /* ==================== Hub 打开 ==================== */
  function pickBases(e){
    if (e && e.altKey)   return ['http://127.0.0.1:9101','https://scripthub.vercel.app','https://script.hub'];
    if (e && e.shiftKey) return ['https://script.hub','https://scripthub.vercel.app','http://127.0.0.1:9101'];
    return ['https://scripthub.vercel.app','https://script.hub','http://127.0.0.1:9101'];
  }
  function buildHubUrl(base, raw){
    if (base.includes('scripthub.vercel.app')) return `${base}/?src=${encodeURIComponent(raw)}`;
    return `${base}/convert/_start_/${encodeURIComponent(raw)}/_end_/plain.txt?type=plain-text&target=plain-text`;
  }
  function openScriptHub(e){
    const raw=getRawUrl(); if(!raw){toast("Not a file view");return;}
    const bases=pickBases(e);
    (function tryOpen(i){
      if(i>=bases.length){copyText(raw);toast("已复制 Raw，手动粘贴到 ScriptHub");return;}
      const url=buildHubUrl(bases[i], raw);
      try{
        const w=window.open(url,'_blank','noopener');
        if(!w) location.assign(url);
      }catch{ tryOpen(i+1); }
    })(0);
  }

  /* ==================== 工具条 ==================== */
  function buildBar(){
    const bar=document.createElement("div");bar.className="gplus-shbar";
    bar.innerHTML=`
      <button class="gplus-btn" data-act="raw">Raw</button>
      <button class="gplus-btn" data-act="dl">DL</button>
      <button class="gplus-btn" data-act="path">Path</button>
      <button class="gplus-btn" data-act="edit">Edit</button>
      <button class="gplus-btn" data-act="name">Name</button>
      <button class="gplus-btn" data-act="repo">Action</button>
      <button class="gplus-btn" data-act="hub">Hub</button>`;
    bar.addEventListener("click",async e=>{
      const btn=e.target.closest('.gplus-btn'); if(!btn) return;
      const act=btn.dataset.act, raw=getRawUrl();
      if(act==="raw"){ if(raw) await copyText(raw); }
      if(act==="dl"){ if(raw){const a=document.createElement("a");a.href=raw;a.download="";document.body.appendChild(a);a.click();a.remove();} }
      if(act==="path"){const p=location.pathname.split('/').slice(4).join('/'); if(p) copyText(p); }
      if(act==="edit"){location.href=location.href.replace(/\/blob\//,"/edit/");}
      if(act==="name"){const fn=location.pathname.split('/').pop(); if(fn) copyText(fn);}
      if(act==="repo"){const rp=location.pathname.split('/').slice(1,3).join('/'); if(rp) copyText(rp);}
      if(act==="hub"){openScriptHub(e);}
    });
    // Raw 双击 / 长按
    bar.querySelector('[data-act="raw"]').addEventListener("dblclick",()=>{const r=getRawUrl(); if(r) window.open(r,"_blank");});
    bar.querySelector('[data-act="raw"]').addEventListener("contextmenu",e=>{e.preventDefault();const r=getRawUrl();if(r){const a=document.createElement("a");a.href=r;a.download="";document.body.appendChild(a);a.click();a.remove();}});
    document.body.appendChild(bar);
  }

  /* ==================== 徽标 ==================== */
  function ensureBadge(){
    if(document.querySelector(".gplus-badge")) return;
    const badge=document.createElement("div");badge.className="gplus-badge";
    badge.innerHTML=`
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="60" cy="60" r="58" fill="currentColor" opacity="0.92"/>
        <path fill="var(--badge-cat)" d="M60 8C30.6 8 6 32.6 6 62c0 23.9 15.5 44.2 37 51.4
          2.7.5 3.6-1.2 3.6-2.6 0-1.3-.1-5.5-.1-10.1-15 3.3-18.2-6.4-18.2-6.4-2.5-6.4-6.2-8.1-6.2-8.1
          -5.1-3.5.4-3.5.4-3.5 5.6.4 8.5 5.8 8.5 5.8 5 8.5 13.1 6.1 16.3 4.6.5-3.6 2-6.1 3.6-7.5
          -12-1.4-24.6-6-24.6-26.9 0-5.9 2.1-10.7 5.7-14.4-.6-1.4-2.5-7.2.5-15
          0 0 4.7-1.5 15.5 5.5 4.5-1.2 9.3-1.8 14.1-1.8s9.6.6 14.1 1.8
          c10.8-7 15.5-5.5 15.5-5.5 3 7.8 1.1 13.6.5 15 3.5 3.7 5.7 8.5 5.7 14.4
          0 21-12.6 25.5-24.7 26.9 2.1 1.8 4 5.4 4 11 0 7.9-.1 14.2-.1 16.1
          0 1.4.9 3.1 3.6 2.6C98.5 106.2 114 85.9 114 62c0-29.4-24.6-54-54-54z"/>
      </svg>`;
    badge.addEventListener("click",()=>document.querySelector(".gplus-shbar")?.classList.toggle("gplus-hidden"));
    badge.addEventListener("dblclick",()=>{toggleTheme();});
    document.body.appendChild(badge);
  }

  /* ==================== 主题切换 ==================== */
  let theme=0;
  function toggleTheme(){
    theme=(theme+1)%3;
    if(theme===0){document.documentElement.style.setProperty('--accent1','#ec4899');document.documentElement.style.setProperty('--accent2','#a855f7');}
    if(theme===1){document.documentElement.style.setProperty('--accent1','#3b82f6');document.documentElement.style.setProperty('--accent2','#06b6d4');}
    if(theme===2){document.documentElement.style.setProperty('--accent1','#f59e0b');document.documentElement.style.setProperty('--accent2','#84cc16');}
  }

  /* ==================== 启动 ==================== */
  (function boot(){
    buildBar(); ensureBadge();
  })();

})();