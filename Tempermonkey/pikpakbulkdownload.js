// ==UserScript==
// @name         PikPak 批量下载助手（桌面+移动端通用）
// @namespace    https://github.com/Mikephie
// @version      2.0
// @description  批量提取 PikPak 文件下载链接，支持复制/打开，兼容桌面与手机 Tampermonkey。
// @match        https://mypikpak.com/drive/*
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  function waitForElement(selector, callback) {
    const el = document.querySelector(selector);
    if (el) return callback(el);
    setTimeout(() => waitForElement(selector, callback), 500);
  }

  function injectBtn() {
    if (document.getElementById('pikpak-export-btn')) return;

    const container = document.querySelector('[class*="action-bar-right"]');
    if (!container) return;

    const btn = document.createElement('button');
    btn.id = 'pikpak-export-btn';
    btn.innerText = '📥 批量导出下载';
    btn.style.cssText = `
      background:#1abc9c;color:white;padding:6px 10px;
      border:none;border-radius:5px;margin-left:10px;cursor:pointer;
    `;
    btn.onclick = batchExtract;
    container.appendChild(btn);
  }

  async function batchExtract() {
    const items = document.querySelectorAll('[aria-selected="true"]');
    if (!items.length) return alert('请先选中文件再操作！');

    let links = [];
    for (const item of items) {
      const name = item.querySelector('[class*="file-name"]')?.textContent.trim();
      const downloadBtn = item.querySelector('button[aria-label*="下载"]');
      if (!downloadBtn) {
        console.warn(`❌ ${name} 是文件夹或无下载项`);
        continue;
      }

      downloadBtn.click();
      await new Promise(r => setTimeout(r, 800));

      const realLink = document.querySelector('a[href^="https://api-drive.mypikpak.com"]');
      if (realLink) {
        const url = realLink.href;
        links.push(`${name}:\n${url}`);
        if (isMobile()) {
          GM_openInTab(url, { active: false });
        }
      }

      // 关闭弹窗
      document.querySelector('button[aria-label="关闭"]')?.click();
      await new Promise(r => setTimeout(r, 300));
    }

    if (links.length) {
      const result = links.join('\n\n');
      try {
        GM_setClipboard(result);
        alert(`✅ 共提取 ${links.length} 项，已复制到剪贴板`);
      } catch (e) {
        alert(`✅ 共提取 ${links.length} 项，已在新标签页打开（手机无法复制）`);
      }
      console.log('📥 下载链接:\n' + result);
    } else {
      alert('❌ 没有可下载的链接，请检查是否选择了文件夹');
    }
  }

  function isMobile() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  // 启动监听
  window.addEventListener('load', () => {
    setTimeout(() => waitForElement('[class*="action-bar-right"]', injectBtn), 2000);
  });
})();