// ==UserScript==
// @name         GitHub+ 玻璃工具条（Raw 单击复制 / 双击 RawContent / 长按下载 · Edit/Action · 编辑页DL=全选）+ ScriptHub
// @namespace    https://mikephie.site/
// @version      3.7.0
// @description  顶部/移动端底部玻璃工具条：Raw(单击复制/双击RawContent/长按下载) / DL(编辑页=全选) / Path / Edit / Name / Action / Hub。Pointer 手势判定避免 dblclick 兼容问题；Hub 点击跳 ScriptHub、长按 Hub 切主题；玻璃模糊+霓虹描边；真下载；徽标霓虹胶囊&可拖拽；快捷键 r/d/p/e/a/h；GitHub SPA 兼容。
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
    background:rgba(40,40,50,0.14);
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
    background:rgba(0,0,0,0.20);
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

  /* ── GitHubPlus 徽标：霓虹玻璃胶囊 + 可拖拽 ── */
  .gplus-badge{
    position:fixed; right:12px; z-index:2147483700;
    display:inline-flex; align-items:center; gap:8px;
    padding:9px 14px 9px 26px;
    border-radius:16px;
    color:var(--fg); font-weight:900; font-size:12px; letter-spacing:.2px;
    background:rgba(20,22,30,.22);
    -webkit-backdrop-filter:blur(12px) saturate(160%);
    backdrop-filter:blur(12px) saturate(160%);
    border:1px solid rgba(255,255,255,.18);
    box-shadow:0 10px 26px rgba(0,0,0,.42);
    text-shadow:0 1px 1px rgba(0,0,0,.35);
    cursor:pointer; user-select:none; pointer-events:auto;
    transition:transform .08s, box-shadow .25s, background .25s;
  }
  .gplus-badge:hover{ transform:translateY(-1px); box-shadow:0 14px 34px rgba(0,0,0,.5); }
  .gplus-badge:active{ transform:scale(.98); }
  .gplus-badge::before{
    content:""; position:absolute; inset:0; border-radius:16px; padding:2px;
    background:linear-gradient(135deg,#00f0ff,#0070ff,#b100ff,#ff2ddf,#00f0ff);
    background-size:400% 400%; animation:badgeFlow 6s linear infinite;
    -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
    -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none;
  }
  .gplus-badge::after{
    content:""; position:absolute; left:10px; top:50%; transform:translateY(-50%);
    width:8px; height:8px; border-radius:50%;
    background:#22c55e; box-shadow:0 0 10px #22c55e,0 0 18px rgba(34,197,94,.6);
    animation:pulse 1.8s ease-in-out infinite;
  }
  @keyframes badgeFlow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  @keyframes pulse{0%,100%{transform:translateY(-50%) scale(1)}50%{transform:translateY(-50%) scale(1.25)}}
  @media(min-width:769px){ .gplus-badge{ bottom:24px; } }
  @media(max-width:768px){ .gplus-badge{ bottom:calc(72px + env(safe-area-inset-bottom,0)); } }
  `;
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: STYLE }));

  /* ================= 工具 ================= */
  const $ = (s, r=document) => r.querySelector(s);
  function toast(msg){ const d=document.createElement('div'); d.textContent=msg;
    Object.assign(d.style,{position:'fixed',left:'50%',top:'18px',transform:'translateX(-50%)',
      background:'rgba(0,0,0,.65)',color:'#fff',padding:'6px 10px',borderRadius:'8px',
      zIndex:2147483800,fontSize:'12px'}); document.body.appendChild(d); setTimeout(()=>d.remove(),1200); }

  function isEditPage(){
    const u = location.href.split('#')[0].split('?')[0];
    return /^https?:\/\/github\.com\/[^\/]+\/[^\/]+\/edit\//.test(u);
  }

  // RAW URL
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

  // Edit URL（从 raw 或 blob 反推 /edit/...）
  function getEditUrl(){
    const url=location.href.split('#')[0].split('?')[0];
    const mRaw=url.match(/^https?:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)$/);
    if(mRaw) return `https://github.com/${mRaw[1]}/${mRaw[2]}/edit/${mRaw[3]}/${mRaw[4]}`;
    const mBlob=url.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
    if(mBlob) return `https://github.com/${mBlob[1]}/${mBlob[2]}/edit/${mBlob[3]}/${mBlob[4]}`;
    const mRaw2=url.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
    if(mRaw2) return `https://github.com/${mRaw2[1]}/${mRaw2[2]}/edit/${mRaw2[3]}/${mRaw2[4]}`;
    return '';
  }

  async function copyText(t){ if(!t) return; try{ await navigator.clipboard.writeText(t); toast('Copied'); } catch{ prompt('Copy manually:',t); } }

  /* ================= 真下载 ================= */
  async function downloadRaw(){
    const url = getRawUrl(); if (!url) { toast('Not a file view'); return; }
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

  /* ================= ScriptHub ================= */
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

  /* ================= 主题 ================= */
  function applyTheme(theme){
    THEMES.forEach(t => document.body.classList.remove('theme-'+t));
    document.body.classList.add('theme-'+theme);
    localStorage.setItem(THEME_KEY, theme);
    currentTheme = theme;
    toast('Theme: ' + theme);
  }

  function attachHubLongPress(){
    const hubBtn = document.querySelector('.gplus-btn[data-act="hub"]');
    if (!hubBtn) return;
    let timer = null, longPressed = false;
    const THRESHOLD = 520;
    const start = () => {
      longPressed = false;
      timer = setTimeout(() => {
        longPressed = true;
        const i = THEMES.indexOf(currentTheme);
        applyTheme(THEMES[(i+1)%THEMES.length]);
      }, THRESHOLD);
    };
    const cancel = () => { if (timer) clearTimeout(timer); };
    hubBtn.addEventListener('pointerdown', start);
    ['pointerup','pointerleave','pointercancel'].forEach(t=>hubBtn.addEventListener(t, cancel));
    hubBtn.addEventListener('click', (e) => { if (longPressed) { e.preventDefault(); e.stopPropagation(); } }, true);
    hubBtn.addEventListener('contextmenu', (e)=>{ e.preventDefault(); }, {capture:true});
  }

  /* ================= 徽标（单击折叠 / 双击切主题 / 可拖拽） ================= */
  function ensureBadge(){
    if (document.querySelector('.gplus-badge')) return;
    const b=document.createElement('div');
    b.className='gplus-badge';
    b.textContent='GitHubPlus';
    document.body.appendChild(b);
    attachBadgeGestures(b);
  }
  function attachBadgeGestures(badge){
    let dragging=false, moved=false;
    let sx=0, sy=0, startRight=0, startBottom=0;
    let lastTap=0, singleTimer=null;
    const TAP_GAP = 280, MOVE_THRESH = 6;

    const onDown = (e) => {
      const ev = (e.touches && e.touches[0]) || e;
      dragging = true; moved = false;
      sx = ev.clientX; sy = ev.clientY;
      const rect = badge.getBoundingClientRect();
      startRight = window.innerWidth - rect.right;
      startBottom = window.innerHeight - rect.bottom;
      badge.setPointerCapture?.(e.pointerId || 1);
      e.preventDefault(); e.stopPropagation();
    };
    const onMove = (e) => {
      if (!dragging) return;
      const ev = (e.touches && e.touches[0]) || e;
      const dx = ev.clientX - sx;
      const dy = ev.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > MOVE_THRESH) moved = true;
      badge.style.right = Math.max(6, startRight - dx) + 'px';
      badge.style.bottom = Math.max(6, startBottom + dy) + 'px';
    };
    const onUp = (e) => {
      if (!dragging) return;
      dragging = false;
      if (moved) { e.preventDefault(); e.stopPropagation(); return; }
      const now = performance.now();
      if (now - lastTap < TAP_GAP) {
        if (singleTimer) { clearTimeout(singleTimer); singleTimer = null; }
        const i = THEMES.indexOf(currentTheme);
        applyTheme(THEMES[(i+1)%THEMES.length]);
        lastTap = 0;
      } else {
        lastTap = now;
        singleTimer = setTimeout(() => {
          singleTimer = null;
          const bar = document.querySelector('.gplus-shbar');
          if (bar) bar.classList.toggle('gplus-hidden');
        }, TAP_GAP);
      }
      e.preventDefault(); e.stopPropagation();
    };

    if ('onpointerdown' in window){
      badge.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove, { passive:false });
      window.addEventListener('pointerup', onUp, { passive:false });
      window.addEventListener('pointercancel', onUp, { passive:false });
    }else{
      badge.addEventListener('touchstart', onDown, {passive:false});
      window.addEventListener('touchmove', onMove, {passive:false});
      window.addEventListener('touchend', onUp, {passive:false});
      window.addEventListener('touchcancel', onUp, {passive:false});
      badge.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    badge.addEventListener('contextmenu', (e)=>e.preventDefault(), {capture:true});
  }

  /* ================= 工具条 UI ================= */
  function buildBar(){
    const bar=document.createElement('div'); bar.className='gplus-shbar';
    bar.innerHTML = `
      <button class="gplus-btn" data-act="raw"  title="Raw (tap=copy / double=open raw / hold=download)">Raw</button>
      <button class="gplus-btn" data-act="dl"   title="Download raw / Select All in edit">DL</button>
      <button class="gplus-btn" data-act="p"    title="Copy path">Path</button>
      <button class="gplus-btn" data-act="edit" title="Open edit page">Edit</button>
      <button class="gplus-btn" data-act="f"    title="Copy filename">Name</button>
      <button class="gplus-btn" data-act="act"  title="Open Actions">Action</button>
      <button class="gplus-btn" data-act="hub"  title="ScriptHub (click) / Theme (hold)">Hub</button>
    `;

    // 其他按钮 click
    bar.addEventListener('click', (e)=>{
      const btn=e.target.closest('.gplus-btn'); if(!btn) return;
      const act=btn.dataset.act;
      if(act==='raw') return; // raw 交给 Pointer 手势
      if(act==='dl'){
        if(isEditPage()){
          selectAllInEditor();
        }else{
          downloadRaw();
        }
        return;
      }
      if(act==='p'){ const p=getRepoPath(); if(p) copyText(p); else toast('Not a file view'); return; }
      if(act==='edit'){
        const editUrl = getEditUrl();
        if(editUrl) window.open(editUrl,'_blank'); else toast('Edit URL not available');
        return;
      }
      if(act==='f'){ const fn=getFileName(); if(fn) copyText(fn); else toast('Not a file view'); return; }
      if(act==='act'){
        const slug=getRepoSlug();
        if(slug) window.open(`https://github.com/${slug}/actions`,'_blank'); else toast('Not in repo');
        return;
      }
      if(act==='hub'){ openScriptHub(e); return; }
    });

    document.body.appendChild(bar);

    // Raw 按钮：Pointer 手势（单击=复制、双击=打开 raw、长按=下载）
    const rawBtn = document.querySelector('.gplus-btn[data-act="raw"]');
    attachRawGestures(rawBtn);

    // 根据是否在编辑页，更新 DL 按钮文案
    updateModeButtons();
  }

  function updateModeButtons(){
    const dlBtn = document.querySelector('.gplus-btn[data-act="dl"]');
    if(!dlBtn) return;
    if(isEditPage()){
      dlBtn.textContent = 'All';
      dlBtn.title = 'Select All (editor)';
    }else{
      dlBtn.textContent = 'DL';
      dlBtn.title = 'Download raw';
    }
  }

  // 选择编辑器中的所有内容（尽量兼容 GitHub 现状）
  function selectAllInEditor(){
    // 优先找经典 textarea
    const ta = document.querySelector('textarea#code-editor, textarea[name="value"], textarea.js-code-text');
    if (ta) {
      ta.focus();
      ta.select();
      toast('Selected all');
      return;
    }
    // 兼容 contenteditable（如 Monaco/CodeMirror 容器）
    const editable = document.querySelector('[contenteditable="true"], .cm-content, .monaco-editor, .CodeMirror');
    if (editable) {
      // 尝试让其获得焦点后全选
      editable.focus();
      try {
        document.execCommand('selectAll');
        toast('Selected all');
        return;
      } catch {}
    }
    // 退路：选中主文本域（view 页面）
    const blob = document.querySelector('table.highlight, .blob-wrapper, .markdown-body');
    if (blob) {
      const range = document.createRange();
      range.selectNodeContents(blob);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      toast('Selected all (viewer)');
      return;
    }
    toast('Editor not found');
  }

  // Raw：Pointer 手势（单击=复制、双击=raw content、长按=下载）
  function attachRawGestures(btn){
    if(!btn) return;
    let down=false, moved=false, sx=0, sy=0;
    let lastTap=0, singleTimer=null, longTimer=null, longPressed=false;
    const TAP_GAP=260, MOVE_THRESH=6, HOLD_MS=520;

    const onDown=(e)=>{
      const ev=(e.touches&&e.touches[0])||e;
      down=true; moved=false; longPressed=false; sx=ev.clientX; sy=ev.clientY;
      btn.setPointerCapture?.(e.pointerId||1);
      // 启动长按计时
      longTimer = setTimeout(()=>{
        longPressed=true;
        // 长按：真下载
        downloadRaw();
      }, HOLD_MS);
      e.preventDefault(); e.stopPropagation();
    };
    const onMove=(e)=>{
      if(!down) return;
      const ev=(e.touches&&e.touches[0])||e;
      const dx=Math.abs(ev.clientX-sx), dy=Math.abs(ev.clientY-sy);
      if(dx+dy>MOVE_THRESH){
        moved=true;
        if(longTimer){ clearTimeout(longTimer); longTimer=null; }
      }
    };
    const clearTimers=()=>{
      if(longTimer){ clearTimeout(longTimer); longTimer=null; }
      if(singleTimer){ /* 单击定时保留由逻辑自行清理 */ }
    };
    const onUp=(e)=>{
      if(!down) return; down=false;
      // 任何结束都先清长按
      if(longTimer){ clearTimeout(longTimer); longTimer=null; }
      if(moved){ e.preventDefault(); e.stopPropagation(); return; }
      if(longPressed){ // 已经触发长按 -> 不再处理单/双击
        e.preventDefault(); e.stopPropagation(); return;
      }
      const now=performance.now();
      if(now-lastTap<TAP_GAP){
        // 双击 -> 打开 raw content
        if(singleTimer){ clearTimeout(singleTimer); singleTimer=null; }
        const r=getRawUrl();
        r? window.open(r,'_blank') : toast('Raw URL not available');
        lastTap=0;
      }else{
        // 单击 -> 复制 RAW
        lastTap=now;
        singleTimer=setTimeout(()=>{
          singleTimer=null;
          const r=getRawUrl();
          r? copyText(r) : toast('Not a file view');
        }, TAP_GAP);
      }
      e.preventDefault(); e.stopPropagation();
    };

    if('onpointerdown' in window){
      btn.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove, {passive:false});
      window.addEventListener('pointerup', onUp, {passive:false});
      window.addEventListener('pointercancel', (e)=>{ down=false; clearTimers(); }, {passive:false});
    }else{
      btn.addEventListener('touchstart', onDown, {passive:false});
      window.addEventListener('touchmove', onMove, {passive:false});
      window.addEventListener('touchend', onUp, {passive:false});
      window.addEventListener('touchcancel', (e)=>{ down=false; clearTimers(); }, {passive:false});
      btn.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }

    btn.addEventListener('contextmenu', (e)=>e.preventDefault(), {capture:true});
  }

  /* ================= 快捷键（r/d/p/e/a/h） ================= */
  function hotkeys(e){
    const tag=(e.target.tagName||'').toLowerCase();
    if(/(input|textarea|select)/.test(tag)||e.target.isContentEditable) return;
    const k=(e.key||'').toLowerCase();
    if(k==='r'){ const r=getRawUrl(); if(r) copyText(r); }
    if(k==='d'){ isEditPage()? selectAllInEditor() : downloadRaw(); }
    if(k==='p'){ const p=getRepoPath(); if(p) copyText(p); }
    if(k==='e'){ const u=getEditUrl(); if(u) window.open(u,'_blank'); }
    if(k==='a'){ const slug=getRepoSlug(); slug && window.open(`https://github.com/${slug}/actions`,'_blank'); }
    if(k==='h'){ openScriptHub(e); }
  }

  /* ================= SPA 兼容 ================= */
  function hookHistory(){
    const _ps=history.pushState, _rs=history.replaceState;
    const fire=()=>setTimeout(()=>{ mount(); updateModeButtons(); },0);
    history.pushState=function(){ const r=_ps.apply(this,arguments); fire(); return r; };
    history.replaceState=function(){ const r=_rs.apply(this,arguments); fire(); return r; };
    window.addEventListener('popstate', fire, false);
  }

  /* ================= 装载 ================= */
  function mount(){
    THEMES.forEach(t => document.body.classList.remove('theme-'+t));
    document.body.classList.add('theme-'+currentTheme);
    if (!document.querySelector('.gplus-shbar')) buildBar();
    if (!document.querySelector('.gplus-badge')) ensureBadge();
    attachHubLongPress();
    updateModeButtons();
  }

  /* ================= 启动 ================= */
  (function boot(){
    document.body && document.body.classList.add('theme-'+currentTheme);
    buildBar(); ensureBadge();
    attachHubLongPress();
    window.addEventListener('keydown', hotkeys, { passive:true });
    hookHistory(); // GitHub SPA
  })();
})();