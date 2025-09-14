// ==UserScript==
// @name         GitHub+ (Alex版) 玻璃风格 + ScriptHub（嵌入式, 自适配 v1.8.3）
// @namespace    https://mikephie.site/
// @version      1.8.3
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