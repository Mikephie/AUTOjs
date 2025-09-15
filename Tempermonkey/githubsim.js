// ==UserScript==
// @name         GitHub+ 玻璃风格 + ScriptHub（vercel/?src + 原站/本地 convert 自动分流）
// @namespace    https://mikephie.site/
// @version      3.0.1
// @description  固定工具条（桌面顶部 / 移动底部横滑）；Hub 按钮自动根据基址选择 ?src 或 convert 路由；默认 vercel，Shift=script.hub，Alt=127.0.0.1；失败自动回退；暗黑高对比；短标签；快捷键 r/d/p/u/f/s/h；徽标不遮挡。
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
  border:2px solid transparent;
  border-radius:12px;
  background:rgba(255,255,255,.08);
  color:var(--fg);
  padding:10px 12px;
  font-size:12px;
  font-weight:700;
  letter-spacing:.2px;
  min-height:44px;
  min-width:82px;
  text-align:center;
  cursor:pointer;
  transition:transform .08s,box-shadow .18s,border .18s;
  /* 外框渐变高亮 */
  background-clip:padding-box;
}
.gplus-btn::before{
  content:"";
  position:absolute;inset:0;
  border-radius:12px;
  padding:2px; /* 外边框厚度 */
  background:linear-gradient(135deg,var(--accent1),var(--accent2));
  -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
  -webkit-mask-composite:xor;
  mask-composite:exclude;
  pointer-events:none;
}
.gplus-btn:hover{
  transform:translateY(-1px);
  box-shadow:0 0 12px var(--accent1),0 0 20px var(--accent2);
}
.gplus-btn:active{transform:scale(.97)}
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
    return href;
  }
  function getRepoPath(){const p=location.pathname.split('/').filter(Boolean);return p.length>=5?p.slice(4).join('/'):"";}
  function getFileName(){const p=getRepoPath();return p?p.split('/').pop():"";}
  function getRepoSlug(){const p=location.pathname.split('/').filter(Boolean);return p.length>=2?`${p[0]}/${p[1]}`:"";}
  async function copyText(t){if(!t)return;try{await navigator.clipboard.writeText(t);toast("Copied");}catch{prompt("Copy manually:",t);}}
  function toast(msg){const d=document.createElement("div");d.textContent=msg;Object.assign(d.style,{position:"fixed",left:"50%",top:"18px",transform:"translateX(-50%)",background:"rgba(0,0,0,.65)",color:"#fff",padding:"6px 10px",borderRadius:"8px",zIndex:2147483647,fontSize:"12px"});document.body.appendChild(d);setTimeout(()=>d.remove(),1200);}

  /* ==================== ScriptHub 打开（vercel 用 ?src，原站/本地用 convert） ==================== */
  function pickBases(e){
    // 默认优先 vercel；Shift：script.hub；Alt：本地
    if (e && e.altKey)   return ['http://127.0.0.1:9101','https://scripthub.vercel.app','https://script.hub'];
    if (e && e.shiftKey) return ['https://script.hub','https://scripthub.vercel.app','http://127.0.0.1:9101'];
    return ['https://scripthub.vercel.app','https://script.hub','http://127.0.0.1:9101'];
  }

  function buildHubUrl(base, raw){
    if (base.includes('scripthub.vercel.app')) {
      // vercel 部署：只识别 ?src=
      return `${base}/?src=${encodeURIComponent(raw)}`;
    }
    // 原站 / 本地：支持 convert 自动带入
    return `${base}/convert/_start_/${encodeURIComponent(raw)}/_end_/plain.txt?type=plain-text&target=plain-text`;
  }

// 点击 Hub：先复制 RAW，再打开目标首页（默认 vercel；Shift=script.hub；Alt=本地）
function openScriptHub(e){
  const raw = getRawUrl();
  if (!raw) { toast("Not a file view"); return; }

  // 复制 RAW（失败就弹出可手动复制）
  try {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(raw);
      toast("RAW 已复制");
    } else {
      throw new Error("no clipboard");
    }
  } catch (_) {
    try { prompt("Copy manually:", raw); } catch(_) {}
  }

  // 基址优先：默认 vercel；Shift=script.hub；Alt=本地
  let base = 'https://scripthub.vercel.app';
  if (e && e.shiftKey) base = 'https://script.hub';
  if (e && e.altKey)   base = 'http://127.0.0.1:9101';

  // 只打开首页，不再拼 /convert ---- 你手动粘贴即可
  const url = base.replace(/\/+$/,'') + '/';
  const w = window.open(url, '_blank', 'noopener');
  if (!w) location.assign(url);
}

  /* ==================== 工具条 UI ==================== */
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
      const btn=e.target.closest('.gplus-btn'); if(!btn) return;
      const act=btn.dataset.act;
      if(act==="raw"){const r=getRawUrl(); if(r) open(r,"_blank"); else toast('Not a file view');}
      if(act==="dl"){const r=getRawUrl(); if(r) open(r,"_blank"); else toast('Not a file view');}
      if(act==="p"){const p=getRepoPath(); if(p) copyText(p); else toast('Not a file view');}
      if(act==="u"){const r=getRawUrl(); if(r) copyText(r); else toast('Not a file view');}
      if(act==="f"){const fn=getFileName(); if(fn) copyText(fn); else toast('Not a file view');}
      if(act==="s"){const rp=getRepoSlug(); if(rp) copyText(rp); else toast('Not in repo');}
      if(act==="hub"){openScriptHub(e);}
    });
    document.body.appendChild(bar);
  }

  /* ==================== 徽标 ==================== */
  function ensureBadge(){
    if(document.querySelector(".gplus-badge")) return;
    const b=document.createElement("div");b.className="gplus-badge";b.textContent="GitHubPlus";
    b.addEventListener("click",()=>document.querySelector(".gplus-shbar")?.classList.toggle("gplus-hidden"));
    document.body.appendChild(b);
  }

  /* ==================== 快捷键 ==================== */
  function hotkeys(e){
    const tag=(e.target.tagName||"").toLowerCase();
    if(/(input|textarea|select)/.test(tag)||e.target.isContentEditable)return;
    const k=(e.key||"").toLowerCase();
    if(k==="r"){const r=getRawUrl(); if(r) open(r,"_blank");}
    if(k==="d"){const r=getRawUrl(); if(r) open(r,"_blank");}
    if(k==="p") copyText(getRepoPath());
    if(k==="u") copyText(getRawUrl());
    if(k==="f") copyText(getFileName());
    if(k==="s") copyText(getRepoSlug());
    if(k==="h") openScriptHub(e);
  }

  /* ==================== 启动 ==================== */
  (function boot(){
    buildBar(); ensureBadge();
    window.addEventListener("keydown",hotkeys,{passive:true});
  })();

})();