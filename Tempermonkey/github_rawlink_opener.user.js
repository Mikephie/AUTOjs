// ==UserScript==
// @name         GitHub Raw Link Opener / Script-Hub edit (No CodeHub)
// @namespace    GitHub / Script-Hub
// @version      3.8
// @description  始终渲染按钮；兼容 GitHub SPA；右下角栈叠；按钮底色 20% 透明；移除 Code Hub 按钮；修复转换/编码问题；兼容 /raw/ 视图
// @match        https://github.com/*
// @match        https://script.hub/*
// @match        http://script.hub/*
// @match        http://127.0.0.1:9101/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
(function () {
  "use strict";

  var STACK_ID = "__gku_stack__";

  hookHistory();
  onReady(render);
  window.addEventListener("hashchange", render, false);

  var mo;
  function ensureObserver() {
    if (mo) return;
    mo = new MutationObserver(function () {
      if (!document.getElementById(STACK_ID)) render();
    });
    onReady(function () {
      mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
    });
  }
  ensureObserver();

  function render() {
    if (!document.body) return;
    var old = document.getElementById(STACK_ID);
    if (old) old.remove();

    var stack = document.createElement("div");
    stack.id = STACK_ID;
    stack.style.cssText = [
      "position:fixed",
      "right:12px",
      "bottom:calc(12px + env(safe-area-inset-bottom,0px))",
      "display:flex",
      "flex-direction:column",
      "gap:8px",
      "z-index:2147483647",
      "pointer-events:auto",
    ].join(";") + ";";
    document.body.appendChild(stack);

    if (location.host === "github.com") {
      stack.appendChild(makeBtn("打开 Raw", openRawLink, [0,200,83]));
      stack.appendChild(makeBtn("打开 ScriptHub", openScriptHubLink, [156,39,176]));
    }

    if (/script\.hub|127\.0\.0\.1:9101/.test(location.host)) {
      stack.appendChild(makeBtn("打开 Script-Hub 编辑", reEditLink, [255,152,0]));
    }
  }

  function makeBtn(text, onClick, rgb) {
    var btn = document.createElement("button");
    var rgba20 = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0.2)";
    var border = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0.55)";
    var shadow = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0.35)";
    btn.textContent = text;
    btn.type = "button";
    btn.style.cssText = [
      "background:"+rgba20+" !important",
      "color:#fff !important",
      "border:1px solid "+border+" !important",
      "border-radius:14px !important",
      "padding:8px 14px !important",
      "font-size:12px !important",
      "font-weight:600 !important",
      "letter-spacing:.2px !important",
      "text-shadow:0 1px 1px rgba(0,0,0,.5) !important",
      "box-shadow:0 6px 16px "+shadow+" !important",
      "cursor:pointer !important",
      "user-select:none !important",
      "outline:none !important",
      "min-width:112px !important",
      "backdrop-filter:none !important",
      "-webkit-backdrop-filter:none !important",
    ].join(";");
    btn.addEventListener("mouseenter", function () {
      btn.style.boxShadow = "0 10px 22px " + shadow;
    }, false);
    btn.addEventListener("mouseleave", function () {
      btn.style.boxShadow = "0 6px 16px " + shadow;
    }, false);
    btn.addEventListener("mousedown", function () {
      btn.style.transform = "scale(0.98)";
    }, false);
    btn.addEventListener("mouseup", function () {
      btn.style.transform = "none";
    }, false);
    btn.addEventListener("click", onClick, false);
    return btn;
  }

  // --- 功能 ---
  function getRawUrl() {
    // 去掉查询和 hash
    var href = location.href.split("#")[0].split("?")[0];
    var clean = location.origin + location.pathname;

    // 已经是 raw 域名
    if (/^https?:\/\/raw\.githubusercontent\.com\//.test(href)) {
      return href;
    }

    // /owner/repo/blob/branch/path...
    var m1 = clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
    if (m1) {
      return "https://raw.githubusercontent.com/" + m1[1] + "/" + m1[2] + "/" + m1[3] + "/" + m1[4];
    }

    // /owner/repo/raw/branch/path...（GitHub 某些跳转会出现）
    var m2 = clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/);
    if (m2) {
      return "https://raw.githubusercontent.com/" + m2[1] + "/" + m2[2] + "/" + m2[3] + "/" + m2[4];
    }

    // 其他视图（PR/commit/files 等）无法确定 raw，回退当前页
    return href;
  }

  function openRawLink() {
    window.open(getRawUrl(), "_blank", "noopener,noreferrer");
  }

  function reEditLink() {
    // convert/file/view -> edit
    var url = location.href.replace(/\/(convert|file|view)\//, "/edit/");
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function openScriptHubLink(e) {
  var raw = getRawUrl();
  if (!raw) return;

  // ---- 1) 预热基站（尽量走 https 原站；Alt=本地；Shift=vercel） ----
  var base = 'https://script.hub';
  if (e && e.altKey)   base = 'http://127.0.0.1:9101';
  if (e && e.shiftKey) base = 'https://scripthub.vercel.app';

  // vercel 不支持 /convert，放到兜底流程，预热仍先用原站/本地
  var warmBase = (base.indexOf('scripthub.vercel.app') !== -1) ? 'https://script.hub' : base;

  // ---- 2) 准备多组 RAW 镜像，解决 DNS 解析失败 ----
  // raw：https://raw.githubusercontent.com/owner/repo/branch/path...
  var mirrors = [raw];
  try {
    var u = new URL(raw);
    var segs = u.pathname.split('/').filter(Boolean); // [owner, repo, branch, ...path]
    if (u.hostname === 'raw.githubusercontent.com' && segs.length >= 4) {
      var owner  = segs[0], repo = segs[1], branch = segs[2], rest = segs.slice(3).join('/');

      // 常用镜像（顺序按稳定性排）
      mirrors.push('https://ghproxy.net/https://raw.githubusercontent.com/' + owner + '/' + repo + '/' + branch + '/' + rest);
      mirrors.push('https://cdn.jsdelivr.net/gh/' + owner + '/' + repo + '@' + branch + '/' + rest);
      mirrors.push('https://gcore.jsdelivr.net/gh/' + owner + '/' + repo + '@' + branch + '/' + rest);
      mirrors.push('https://raw.kgithub.com/' + owner + '/' + repo + '/' + branch + '/' + rest);
      mirrors.push('https://raw.fastgit.org/' + owner + '/' + repo + '/' + branch + '/' + rest);
    }
  } catch (_) { /* 保底只用原始 raw */ }

  // ---- 3) 生成 convert URL（两种编码方式：FULL / PATH 更兼容）----
  function makeConvertUrl(baseHost, rawUrl, mode) {
    if (baseHost.indexOf('scripthub.vercel.app') !== -1) {
      // vercel 兜底：它不支持 convert，走 ?src=，仅把链接带到输入框
      return baseHost + '/?src=' + encodeURIComponent(rawUrl);
    }
    if (mode === 'PATH') {
      try {
        var u = new URL(rawUrl);
        var safe = u.protocol + '//' + u.host + encodeURIComponent(u.pathname + u.search + u.hash);
        return baseHost + '/convert/_start_/' + safe + '/_end_/plain.txt?type=plain-text&target=plain-text';
      } catch (e) {
        // 解析失败回退 FULL
      }
    }
    // FULL：整串 encode
    return baseHost + '/convert/_start_/' + encodeURIComponent(rawUrl) + '/_end_/plain.txt?type=plain-text&target=plain-text';
  }

  // ---- 4) 单标签轮流尝试（原站 FULL → 原站 PATH → 镜像们 FULL → 镜像们 PATH → vercel ?src → 本地）----
  var queue = [];

  // 当前（或预热）基站优先
  queue.push({ url: makeConvertUrl(warmBase, mirrors[0], 'FULL') });
  queue.push({ url: makeConvertUrl(warmBase, mirrors[0], 'PATH') });

  // 尝试所有镜像（FULL→PATH）
  for (var i = 1; i < mirrors.length; i++) {
    queue.push({ url: makeConvertUrl(warmBase, mirrors[i], 'FULL') });
    queue.push({ url: makeConvertUrl(warmBase, mirrors[i], 'PATH') });
  }

  // vercel 兜底（只会到首页并把链接填到输入框；不报错）
  queue.push({ url: makeConvertUrl('https://scripthub.vercel.app', raw, 'FULL') });

  // 若预热走的是原站，则再加一个本地作为最后兜底
  if (warmBase !== 'http://127.0.0.1:9101') {
    queue.push({ url: makeConvertUrl('http://127.0.0.1:9101', mirrors[0], 'FULL') });
    queue.push({ url: makeConvertUrl('http://127.0.0.1:9101', mirrors[0], 'PATH') });
  }

  // ---- 5) 先打开一个"预热页"，再在同一标签里轮流跳转（避免多标签）----
  var win = window.open(warmBase + '/', '_blank', 'noopener,noreferrer');
  if (!win) { win = window; } // 被拦截就用当前页

  var idx = 0;
  function step() {
    if (idx >= queue.length) {
      try { navigator.clipboard.writeText(raw); } catch (_) {}
      alert('ScriptHub 暂时无法解析 raw.githubusercontent.com；已复制 RAW 到剪贴板，请手动粘贴。');
      return;
    }
    try {
      win.location.href = queue[idx].url;
    } catch (_) {
      // 如果被同源策略阻挡，也直接在当前页替换
      location.assign(queue[idx].url);
    }
    idx += 1;
    // 每 600ms 切一次候选（足够快，又能给后端一定时间）
    setTimeout(step, 600);
  }

  // 给预热页 300ms 再开始切换
  setTimeout(step, 300);
}

  // --- 工具 ---
  function onReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") fn();
    else document.addEventListener("DOMContentLoaded", fn, { once: true });
  }
  function hookHistory() {
    var _push = history.pushState, _replace = history.replaceState;
    history.pushState = function () { var r = _push.apply(this, arguments); setTimeout(render, 0); return r; };
    history.replaceState = function () { var r = _replace.apply(this, arguments); setTimeout(render, 0); return r; };
    window.addEventListener("popstate", render, false);
  }
})();