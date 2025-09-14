// ==UserScript==
// @name         GitHub+ (Alex版) 玻璃风格 + ScriptHub（嵌入式, 自适配 v1.8.3）
// @namespace    https://mikephie.site/
// @version      1.8.9
// @description  不改 Alex 逻辑；弹窗玻璃；按钮"彩色外圈高亮 + 更强点击反馈"；ScriptHub 仅嵌入按钮区/Raw旁；适配 document / shadowRoot / 同域 iframe；iOS OK。
// @author       Mikephie
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @run-at       document-end
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  /* ========== 基础 CSS（玻璃容器 + 强化高亮/按压） ========== */
  const BASE_CSS = `
  :root{
    --glass-bg: rgba(255,255,255,.10);
    --glass-stroke: rgba(255,255,255,.26);
    --glass-shadow: 0 18px 50px rgba(0,0,0,.35);
    --glass-fg: #e6edf3;
    --btn-bg: rgba(255,255,255,.10);
  }
  @media (prefers-color-scheme: light){
    :root{ --glass-fg:#111; --btn-bg: rgba(255,255,255,.12); }
  }

  .x-glassified{
    border-radius:16px !important; border:1px solid var(--glass-stroke) !important;
    background:linear-gradient(135deg,var(--glass-bg),rgba(255,255,255,0.02)) !important;
    backdrop-filter:blur(16px) saturate(1.15) !important; -webkit-backdrop-filter:blur(16px) saturate(1.15) !important;
    box-shadow:var(--glass-shadow) !important;
  }

  /* 统一按钮（.xg-btn） */
  .x-glassified .xg-btn{
    --tone:255,255,255; /* 默认白 */
    background:var(--btn-bg) !important; color:var(--glass-fg) !important;
    border:1.5px solid var(--glass-stroke) !important; border-radius:12px !important;
    height:34px !important; line-height:34px !important; padding:0 12px !important;
    display:inline-flex !important; align-items:center; gap:8px;
    backdrop-filter:blur(8px) !important; -webkit-backdrop-filter:blur(8px) !important;
    transition:transform .08s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease, filter .18s ease !important;
    box-shadow:inset 0 1px 2px rgba(255,255,255,.22), 0 4px 12px rgba(0,0,0,.22) !important;
    position:relative; overflow:visible;
  }
  /* 彩色映射 */
  .xg-btn[data-tone="primary"]{ --tone:  80,160,255; }  /* 蓝 */
  .xg-btn[data-tone="success"]{ --tone:  82,255,168; }  /* 绿 */
  .xg-btn[data-tone="danger"] { --tone: 255, 96, 96; }  /* 红 */
  .xg-btn[data-tone="neutral"]{ --tone: 255,255,255; }  /* 白 */

  /* 外圈高亮：彩色边框+光环（hover/聚焦/触控激活） */
  .xg-btn::after{
    content:""; position:absolute; inset:-3px; border-radius:inherit; pointer-events:none;
    box-shadow:0 0 0 0 rgba(var(--tone),0);
    transition:box-shadow .18s ease;
  }
  .xg-btn[data-armed="1"],
  .xg-btn:hover,
  .xg-btn:focus-visible{
    border-color:rgba(var(--tone), .75) !important;
    box-shadow:
      inset 0 1px 2px rgba(255,255,255,.24),
      0 6px 18px rgba(0,0,0,.26) !important;
    filter:saturate(1.08);
  }
  .xg-btn[data-armed="1"]::after,
  .xg-btn:hover::after,
  .xg-btn:focus-visible::after{
    box-shadow:
      0 0 0 2px rgba(var(--tone), .45),
      0 0 18px 2px rgba(var(--tone), .28);
  }

  /* 点击反馈：更深色、加粗边框、第二层亮圈、轻微下压与缩放 */
  .xg-btn[data-pressed="1"],
  .xg-btn:active{
    transform:translateY(1px) scale(0.985) !important;
    background:
      linear-gradient(0deg, rgba(var(--tone), .18), rgba(var(--tone), .08)),
      var(--btn-bg) !important;
    border-color:rgba(var(--tone), .95) !important;
    box-shadow:inset 0 1px 3px rgba(0,0,0,.42), 0 2px 8px rgba(0,0,0,.22) !important;
    filter:saturate(1.18);
  }
  .xg-btn[data-pressed="1"]::after,
  .xg-btn:active::after{
    box-shadow:
      0 0 0 3px rgba(var(--tone), .60),
      0 0 22px 3px rgba(var(--tone), .35);
  }
  `;

  function injectStyle(root, id='__alex_glass_v183__'){
    const doc = root instanceof ShadowRoot ? root : document;
    if (doc.getElementById && doc.getElementById(id)) return;
    const s = document.createElement('style'); s.id = id; s.textContent = BASE_CSS;
    (root.head || root).appendChild(s);
  }

  /* ========== 识别面板并强制玻璃（内联） ========== */
  function looksLikePanel(el){
    const cs = getComputedStyle(el);
    const pos = cs.position; if (!(pos==='fixed'||pos==='absolute')) return false;
    const z = +cs.zIndex || 0; if (z < 10) return false;
    const r = Math.max(...['borderTopLeftRadius','borderTopRightRadius','borderBottomLeftRadius','borderBottomRightRadius']
      .map(k=>parseFloat(cs[k]||'0')) );
    const {width:w,height:h} = el.getBoundingClientRect();
    return r>=8 && w>=200 && h>=120;
  }
  function forceGlassInline(el){
    if (el.__glassified) return;
    el.__glassified = true;
    el.classList.add('x-glassified');
    const st = el.style;
    st.background='linear-gradient(135deg,var(--glass-bg),rgba(255,255,255,0.02))';
    st.backgroundColor='transparent'; st.backgroundImage='none';
    st.backdropFilter='blur(16px) saturate(1.15)'; st.webkitBackdropFilter='blur(16px) saturate(1.15)';
    st.border='1px solid var(--glass-stroke)'; if(!st.borderRadius) st.borderRadius='16px';
    st.boxShadow='var(--glass-shadow)';
  }

  /* ========== 面板内按钮：赋色 & 状态切换（iOS 触控也有效） ========== */
  const BTN_TEXT_TONE = [
    {keys:['删除','Delete'], tone:'danger'},
    {keys:['Fork','Fork仓库'], tone:'primary'},
    {keys:['下载','Download','ZIP'], tone:'primary'},
    {keys:['Raw','打开 Raw','打开Raw文件','Open Raw'], tone:'primary'},
    {keys:['上传','Upload'], tone:'success'},
  ];
  function pickTone(el){
    const cls = el.className || '';
    if (/danger|error/i.test(cls)) return 'danger';
    if (/success/i.test(cls)) return 'success';
    if (/primary|accent/i.test(cls)) return 'primary';
    const txt = (el.textContent||'').trim();
    for (const g of BTN_TEXT_TONE) if (g.keys.some(k=>txt.includes(k))) return g.tone;
    return 'neutral';
  }

  function wireButtonStates(el){
    if (el.__xgWired) return;
    el.__xgWired = true;
    const arm   = () => el.setAttribute('data-armed','1');
    const clear = () => { el.removeAttribute('data-armed'); el.removeAttribute('data-pressed'); };
    const press = () => el.setAttribute('data-pressed','1');
    const rel   = () => el.removeAttribute('data-pressed');
    el.addEventListener('mouseenter', arm);
    el.addEventListener('mouseleave', clear);
    el.addEventListener('focus', arm);
    el.addEventListener('blur', clear);
    el.addEventListener('touchstart', ()=>{ arm(); press(); }, {passive:true});
    el.addEventListener('touchend',   ()=>{ rel(); }, {passive:true});
    el.addEventListener('mousedown',  press);
    el.addEventListener('mouseup',    rel);
  }

  function beautifyButtons(scope){
    const btns = scope.querySelectorAll?.('button, a.btn, a.Button, .gh-header-btn, .gh-download-btn, .gh-copy-btn') || [];
    btns.forEach(el=>{
      if (el.__btnGlassified) return;
      el.__btnGlassified = true;
      el.classList.add('xg-btn');
      el.dataset.tone = pickTone(el);
      wireButtonStates(el);
    });
  }

  /* ========== ScriptHub：仅嵌入按钮区/Raw 相关按钮旁 ========== */
  const BTN_TEXTS = ['打开Raw文件','打开 Raw','Raw','Open Raw','下载文件','下载','Download','编辑文件','编辑','Edit'];
  function getRawUrl(href, scope){
    href=(href||location.href).split('#')[0].split('?')[0];
    if (/^https?:\/\/raw\.githubusercontent\.com\//.test(href)) return href;
    let m = href.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
    if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
    m = href.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
    if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
    const a = scope.querySelector?.('a.Link--primary[href*="/blob/"]');
    if (a) return getRawUrl(a.href, scope);
    return null;
  }
  function injectSH(scope){
    if (!scope.querySelector || scope.querySelector('[data-alex-sh-btn]')) return;
    const buttons = Array.from(scope.querySelectorAll('button,a')).filter(el=>{
      const t=(el.textContent||'').trim(); return BTN_TEXTS.includes(t);
    });
    if (!buttons.length) return;
    const host = buttons[0].parentElement || buttons[0].closest('div,span,section') || scope;

    const btn = (scope.ownerDocument || document).createElement('button');
    btn.setAttribute('data-alex-sh-btn','1');
    btn.textContent='ScriptHub 转换';
    btn.className='xg-btn'; btn.dataset.tone='primary';
    host.appendChild(btn);
    wireButtonStates(btn);

    btn.addEventListener('click', ()=>{
      const raw = getRawUrl(undefined, scope);
      if (!raw) return;
      const url = `http://script.hub/convert/_start_/${encodeURIComponent(raw)}/_end_/plain.txt?type=plain-text&target=plain-text`;
      window.open(url,'_blank','noopener,noreferrer');
    });
  }

  /* ========== 处理每个根：注入 CSS、识别面板、按钮美化、嵌入 SH ========== */
  function processRoot(root){
    injectStyle(root);
    root.querySelectorAll?.('*').forEach(el=>{
      try{
        if (looksLikePanel(el)) {
          forceGlassInline(el);
          beautifyButtons(el);
          injectSH(el);
        }
      }catch(e){}
    });
    setTimeout(()=>{ root.querySelectorAll?.('.x-glassified').forEach(p=>{ beautifyButtons(p); injectSH(p); }); }, 60);
  }

  function scanAll(){
    processRoot(document);
    const walker = document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT);
    let node; while ((node = walker.nextNode())) if (node.shadowRoot) processRoot(node.shadowRoot);
    document.querySelectorAll('iframe').forEach(f=>{
      try{ const doc=f.contentDocument; if (doc && doc.location && doc.location.origin===location.origin) processRoot(doc); }catch(e){}
    });
  }

  const mo=new MutationObserver(scanAll);
  mo.observe(document.documentElement,{childList:true,subtree:true});

  const _p=history.pushState,_r=history.replaceState;
  history.pushState=function(){ const ret=_p.apply(this,arguments); queueMicrotask(scanAll); return ret; };
  history.replaceState=function(){ const ret=_r.apply(this,arguments); queueMicrotask(scanAll); return ret; };
  window.addEventListener('popstate',scanAll,false);

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',scanAll,{once:true});
  else scanAll();
})();

/* === GitHubPlus v2.6：青蓝霓虹 + 真·常驻（自动重开 + 反隐藏 + 反移除） === */
(function () {
  'use strict';

  /* ---------- 样式（青蓝霓虹 + 玻璃） ---------- */
  const STYLE_ID = '__ghplus_fab_v26_blue__';
  if (!document.getElementById(STYLE_ID)) {
    const s = document.createElement('style'); s.id = STYLE_ID;
    s.textContent = `
      .ghplus-fab{
        position:fixed; right:16px; bottom:16px; z-index:2147483647;
        display:inline-flex; align-items:center; gap:.5em;
        font:600 14px/1.2 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
        border-radius:12px; padding:.52em .9em;
        backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
        cursor:pointer; user-select:none;
        transition:transform .08s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease, color .18s ease;
      }
      @media (prefers-color-scheme: dark){
        .ghplus-fab{ color:#e6f9ff; background:rgba(0,247,255,.10); border:1px solid rgba(0,247,255,.45); box-shadow:0 8px 22px rgba(0,0,0,.35),0 0 20px rgba(0,247,255,.20); }
        .ghplus-fab:hover{ box-shadow:0 10px 26px rgba(0,0,0,.40),0 0 28px rgba(0,247,255,.35); }
        .ghplus-fab:active{ transform:translateY(1px) scale(.985); background:rgba(0,247,255,.18); border-color:rgba(0,247,255,.75); box-shadow:inset 0 1px 3px rgba(0,0,0,.45), 0 0 32px rgba(0,247,255,.45); }
      }
      @media (prefers-color-scheme: light){
        .ghplus-fab{ color:#0a2230; background:rgba(0,160,200,.10); border:1px solid rgba(0,160,200,.35); box-shadow:0 8px 18px rgba(0,0,0,.15); }
        .ghplus-fab:hover{ box-shadow:0 10px 22px rgba(0,0,0,.2),0 0 16px rgba(0,160,200,.25); }
        .ghplus-fab:active{ transform:translateY(1px) scale(.985); background:rgba(0,160,200,.16); border-color:rgba(0,160,200,.6); }
      }
      .ghplus-fab .icon{
        width:18px;height:18px;flex:0 0 18px;background:currentColor; position:relative;
        -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M20 10c2 0 6 4 8 6h8c2-2 6-6 8-6 1 0 2 1 2 2v10c6 6 8 13 8 18 0 13-12 22-28 22S8 53 8 40c0-5 2-12 8-18V12c0-1 1-2 2-2zM24 40a4 4 0 1 0 0 8h16a4 4 0 1 0 0-8H24z' fill='currentColor'/%3E%3C/svg%3E") no-repeat center/contain;
                mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M20 10c2 0 6 4 8 6h8c2-2 6-6 8-6 1 0 2 1 2 2v10c6 6 8 13 8 18 0 13-12 22-28 22S8 53 8 40c0-5 2-12 8-18V12c0-1 1-2 2-2zM24 40a4 4 0 1 0 0 8h16a4 4 0 1 0 0-8H24z' fill='currentColor'/%3E%3C/svg%3E") no-repeat center/contain;
      }
      /* 青蓝霓虹脉冲 */
      .ghplus-fab .icon::before{
        content:""; position:absolute; inset:-4px; border-radius:999px; pointer-events:none;
        background: radial-gradient(closest-side, rgba(0,247,255,.70), rgba(0,247,255,0) 70%);
        opacity:.6; filter: blur(6px);
        animation: ghplus-pulse 2.2s ease-in-out infinite;
      }
      @media (prefers-color-scheme: light){
        .ghplus-fab .icon::before{ background: radial-gradient(closest-side, rgba(0,160,200,.55), rgba(0,160,200,0) 70%); opacity:.5; }
      }
      @keyframes ghplus-pulse{
        0%{ transform: scale(.85); opacity:.3; }
        40%{ transform: scale(1.15); opacity:.75; }
        100%{ transform: scale(.85); opacity:.3; }
      }
      /* 永远隐藏原 Fix GitHub */
      .__ghplus_hide_badge__{ opacity:0 !important; pointer-events:none !important; }
    `;
    document.head.appendChild(s);
  }

  /* ---------- 我们自己的青蓝霓虹浮标 ---------- */
  function ensureFab(){
    if (document.querySelector('.ghplus-fab')) return;
    const fab = document.createElement('button');
    fab.className = 'ghplus-fab';
    fab.innerHTML = `<span class="icon"></span><span>GitHubPlus</span>`;
    document.body.appendChild(fab);
    wireToggle(fab);
  }

  /* ---------- 隐藏原 Fix GitHub（即使被还原也会继续隐藏） ---------- */
  const TEXT_RE = /fix\s*github/i;
  function nearBR(el){
    const r = el.getBoundingClientRect();
    const right = innerWidth - r.right;
    const bottom = innerHeight - r.bottom;
    return right >= -4 && right <= 220 && bottom >= -4 && bottom <= 220;
  }
  function looksLikeOld(el){
    if (!el || el.nodeType !== 1) return false;
    const cs = getComputedStyle(el);
    if (!(cs.position==='fixed'||cs.position==='absolute'||cs.position==='sticky')) return false;
    if (!nearBR(el)) return false;
    const txt = (el.textContent||'').replace(/\s+/g,' ').trim();
    return TEXT_RE.test(txt) || /fix-github/i.test(el.className||'');
  }
  function hideOld(){
    document.querySelectorAll('a,button,div,span').forEach(el=>{
      if (looksLikeOld(el)){
        el.classList.add('__ghplus_hide_badge__');
        el.style.setProperty('opacity','0','important');
        el.style.setProperty('pointer-events','none','important');
      }
    });
  }

  // 持续确保：浮标存在 & 原标隐藏
  setInterval(()=>{ ensureFab(); hideOld(); }, 500);
  const mo=new MutationObserver(()=>{ ensureFab(); hideOld(); });
  mo.observe(document.documentElement,{childList:true,subtree:true});

  /* ---------- 常驻逻辑（真·停留） ---------- */
  const STATE = {
    pinned: false,
    guardianTimer: null,
    removalObserver: null,
    reopenCooldown: 0
  };

  function looksLikePanel(n){
    if (!n || n.nodeType !== 1) return false;
    const cs=getComputedStyle(n);
    const pos=cs.position; if(!(pos==='fixed'||pos==='absolute')) return false;
    const z=+cs.zIndex||0; if(z<10) return false;
    const rect=n.getBoundingClientRect();
    const r = Math.max(
      parseFloat(cs.borderTopLeftRadius||'0'),
      parseFloat(cs.borderTopRightRadius||'0'),
      parseFloat(cs.borderBottomLeftRadius||'0'),
      parseFloat(cs.borderBottomRightRadius||'0')
    );
    return rect.width>=200 && rect.height>=120 && r>=8;
  }

  function findPanel(){
    // 优先找最近出现的高层元素
    const list = Array.from(document.querySelectorAll('div,section,dialog')).reverse();
    return list.find(looksLikePanel) || null;
  }

  function openPanelViaOldBadge(){
    // 稍微"点"一下原浮标来打开面板（即使它被隐藏）
    const old = Array.from(document.querySelectorAll('a,button,div,span')).find(looksLikeOld);
    if (old) old.click();
  }

  function armGuardian(panel){
    // 基本显示
    panel.style.display='block';
    panel.style.opacity='1';
    panel.style.visibility='visible';
    panel.style.pointerEvents='auto';
    panel.style.zIndex = '2147483647';
    panel.setAttribute('data-ghplus-sticky','1');

    // 阻断常见的"自动关闭"触发
    ['mouseleave','pointerleave','mouseout','blur','transitionend','animationend'].forEach(ev=>{
      panel.addEventListener(ev, e=>{ e.stopImmediatePropagation(); }, true);
    });

    // 守护：每 250ms 修正隐藏属性
    if (STATE.guardianTimer) clearInterval(STATE.guardianTimer);
    STATE.guardianTimer = setInterval(()=>{
      if (!document.body.contains(panel)) { // 被移除了
        clearInterval(STATE.guardianTimer); STATE.guardianTimer=null;
        if (STATE.pinned) tryReopen();
        return;
      }
      // 被隐藏则还原
      if (panel.hasAttribute('hidden')) panel.removeAttribute('hidden');
      if (panel.getAttribute('aria-hidden') === 'true') panel.setAttribute('aria-hidden','false');
      const cs = getComputedStyle(panel);
      if (cs.display === 'none') panel.style.display = 'block';
      if (cs.visibility === 'hidden') panel.style.visibility = 'visible';
      if (+cs.opacity === 0) panel.style.opacity = '1';
    }, 250);

    // 监听移除：如果父节点把它删了 → 立刻重开
    if (STATE.removalObserver) { STATE.removalObserver.disconnect(); STATE.removalObserver=null; }
    const parent = panel.parentNode || document.body;
    STATE.removalObserver = new MutationObserver(muts=>{
      if (!STATE.pinned) return;
      for (const m of muts){
        for (const node of m.removedNodes){
          if (node === panel) { // 被删了
            tryReopen();
            return;
          }
        }
      }
    });
    STATE.removalObserver.observe(parent, {childList:true});

    // 只在"停留开启"时屏蔽"点击外部关闭"的捕获
    const blockOutsideClose = (e)=>{
      if (!STATE.pinned) return;
      // 不阻断正常的页面点击，只阻断那些全局捕获监听（通过提前 stopImmediatePropagation）
      e.stopImmediatePropagation();
    };
    document.addEventListener('click', blockOutsideClose, true);
    document.addEventListener('touchstart', blockOutsideClose, true);

    // 卸载函数
    panel.__ghplus_unstick = ()=>{
      if (STATE.guardianTimer){ clearInterval(STATE.guardianTimer); STATE.guardianTimer=null; }
      if (STATE.removalObserver){ STATE.removalObserver.disconnect(); STATE.removalObserver=null; }
      document.removeEventListener('click', blockOutsideClose, true);
      document.removeEventListener('touchstart', blockOutsideClose, true);
      panel.removeAttribute('data-ghplus-sticky');
    };
  }

  function tryReopen(){
    const now = Date.now();
    if (now - STATE.reopenCooldown < 400) return; // 防抖
    STATE.reopenCooldown = now;
    openPanelViaOldBadge();
    setTimeout(()=>{
      const p = findPanel();
      if (p && STATE.pinned) armGuardian(p);
    }, 50);
  }

  function pinOn(){
    STATE.pinned = true;
    // 若已有面板 → 直接守护；否则"点"原浮标触发一次创建
    let p = findPanel();
    if (p) { armGuardian(p); }
    else {
      openPanelViaOldBadge();
      setTimeout(()=>{ p=findPanel(); if (p && STATE.pinned) armGuardian(p); }, 80);
    }
  }

  function pinOff(){
    STATE.pinned = false;
    const p = findPanel();
    if (p && p.__ghplus_unstick) p.__ghplus_unstick();
    if (p) { // 礼貌地"关闭"
      p.style.display='none';
      p.style.opacity=''; p.style.visibility='';
    }
  }

  function wireToggle(fab){
    if (fab.__wired) return;
    fab.__wired = true;
    fab.addEventListener('click', (e)=>{
      e.preventDefault(); e.stopPropagation();
      if (STATE.pinned) pinOff(); else pinOn();
    }, {passive:false});
  }

  // 启动
  ensureFab();
  hideOld();
})();