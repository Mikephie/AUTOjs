// ==UserScript==
// @name         GitHub Raw Link Opener / Script-Hub edit (No CodeHub)
// @namespace    GitHub / Script-Hub
// @version      4.9
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

  // 一次点击 -> 打开 data: 中转页；在新标签内自动重试 convert（FULL -> FULL -> PATH）
function openScriptHubLink(e) {
  try {
    var raw = getRawUrl();
    if (!raw) return;

    // 基址：默认原站 https；按住 Alt 为本地
    var base = 'https://script.hub';
    if (e && e.altKey) base = 'http://127.0.0.1:9101';

    // A) FULL：整串 encode（与原脚本一致）
    var urlFull = base + '/convert/_start_/' + encodeURIComponent(raw) + '/_end_/plain.txt?type=plain-text&target=plain-text';

    // B) PATH：仅编码 path+search+hash，保留协议和主机（部分环境更稳）
    var urlPath = urlFull;
    try {
      var u = new URL(raw);
      var safe = u.protocol + '//' + u.host + encodeURIComponent(u.pathname + u.search + u.hash);
      urlPath = base + '/convert/_start_/' + safe + '/_end_/plain.txt?type=plain-text&target=plain-text';
    } catch (_) {}

    // 准备中转页 HTML（注意转义 </script>）
    var urls = JSON.stringify([urlFull, urlFull, urlPath]);
    var html =
      '<!doctype html>' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>ScriptHub · Redirecting…</title>' +
      '<style>' +
        'html,body{height:100%;margin:0;background:#0b0f17;color:#eaf2ff;font:14px/1.6 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial;}' +
        '.wrap{display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:10px}' +
        '.dot{width:10px;height:10px;border-radius:50%;background:#22c55e;box-shadow:0 0 12px #22c55e}' +
        '.muted{opacity:.7}' +
      '</style>' +
      '<div class="wrap"><div class="dot"></div><div>Opening ScriptHub…</div><div class="muted">Auto retry in this tab.</div></div>' +
      '<script>' +
      '(function(){' +
        'var urls=' + urls + ';' +
        'var i=0;' +
        'function go(){' +
          'try{location.replace(urls[i]);}catch(e){location.href=urls[i];}' +
          'i++;' +
          'if(i<urls.length){setTimeout(go,900);}' + // 第二次/第三次自动尝试
        '}' +
        'setTimeout(go,120);' + // 首跳稍等 120ms
      '})();' +
      '<\\/script>';

    // 用 data: URL 打开中转页（不依赖同源，不会触发 noopener 问题）
    var relayUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
    var w = window.open(relayUrl, '_blank');
    if (!w) { // 被拦截就直接走 FULL（后端自己返回）
      location.href = urlFull;
    }

  } catch (err) {
    console.error('[ScriptHub] open error:', err);
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