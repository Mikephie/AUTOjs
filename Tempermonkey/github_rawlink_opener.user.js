// ==UserScript==
// @name         GitHub Raw Link Opener / Script-Hub edit (No CodeHub)
// @namespace    GitHub / Script-Hub
// @version      4.1
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
  try {
    var raw = getRawUrl();
    if (!raw) return;

    // 三个基址
    var BASE_VERCEL = 'https://scripthub.vercel.app'; // 稳定：无报错，但不会自动带入（我会顺手复制 RAW）
    var BASE_ORIGIN = 'https://script.hub';           // 直连：/convert 一次带入，但可能首击 DNS 报错
    var BASE_LOCAL  = 'http://127.0.0.1:9101';        // 本地：/convert 一次带入

    // 点击修饰键：
    // 默认（无修饰键）→ 稳定模式 vercel 首页
    // Alt → 直连 convert（origin；Alt+Ctrl → 本地）
    // Shift → 原站首页（手动粘贴）
    var useStable = !(e && (e.altKey || e.shiftKey));
    var base = BASE_VERCEL;

    if (e && e.shiftKey) base = BASE_ORIGIN;  // 原站首页（手动）
    if (e && e.altKey)   base = BASE_ORIGIN;  // 直连 convert
    if (!e)              base = BASE_VERCEL;

    if (useStable) {
      // 稳定模式：打开 vercel 首页，并把 RAW 放进剪贴板
      try { if (navigator.clipboard) navigator.clipboard.writeText(raw); } catch (_) {}
      var urlHome = BASE_VERCEL + '/';
      var w0 = window.open(urlHome, '_blank', 'noopener,noreferrer');
      if (!w0) location.href = urlHome;
      return;
    }

    // 直连模式：一次带入（Alt+Ctrl 用本地）
    if (e && e.altKey && e.ctrlKey) base = BASE_LOCAL;

    var enc = encodeURIComponent(raw);
    var convert = base + '/convert/_start_/' + enc + '/_end_/plain.txt?type=plain-text&target=plain-text';

    // 先开首页"预热"，避免有环境需要点两次
    var w = window.open(base + '/', '_blank', 'noopener,noreferrer') || window;

    setTimeout(function () {
      try {
        w.location.href = convert;
      } catch (_) {
        location.href = convert;
      }
    }, 400);
  } catch (err) {
    console.error('[ScriptHub] open error:', err);
    // 保底：打开 vercel 首页，至少有页面反馈
    var fb = 'https://scripthub.vercel.app/';
    window.open(fb, '_blank', 'noopener,noreferrer') || (location.href = fb);
  }
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