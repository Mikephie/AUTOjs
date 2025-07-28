// ==UserScript==
// @name         PikPak 批量下载增强
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  为 PikPak 网页版添加多文件和文件夹下载按钮，支持批量下载链接生成。
// @author       Mikephie
// @match        https://drive.mypikpak.com/*
// @icon         https://mypikpak.com/favicon.ico
// @grant        GM_openInTab
// @grant        GM_download
// ==/UserScript==

(function () {
  'use strict';

  // 递归等待元素出现
  function waitFor(selector, callback) {
    const el = document.querySelector(selector);
    if (el) return callback(el);
    setTimeout(() => waitFor(selector, callback), 500);
  }

  // 添加批量下载按钮
  function addDownloadButton() {
    if (document.querySelector('#multiDownloadBtn')) return;

    const toolbar = document.querySelector('[class*="action-bar-right"]');
    if (!toolbar) return;

    const btn = document.createElement('button');
    btn.id = 'multiDownloadBtn';
    btn.textContent = '📦 批量下载';
    btn.style.cssText = `
      background-color: #4CAF50; color: white; border: none; padding: 6px 12px;
      margin-left: 10px; border-radius: 4px; cursor: pointer; font-weight: bold;
    `;
    btn.onclick = collectSelectedLinks;

    toolbar.appendChild(btn);
  }

  // 获取所有选中的文件项
  function collectSelectedLinks() {
    const selectedItems = document.querySelectorAll('[aria-selected="true"]');
    if (!selectedItems.length) return alert('请选择至少一个文件或文件夹');

    let downloadLinks = [];

    selectedItems.forEach((item) => {
      const name = item.querySelector('[class*="file-name"]')?.textContent.trim();
      const dlBtn = item.querySelector('button[aria-label*="下载"]');
      if (dlBtn) {
        dlBtn.click();
        setTimeout(() => {
          const aTag = document.querySelector('a[href^="https://api-drive.mypikpak.com"]');
          if (aTag) {
            downloadLinks.push(aTag.href);
            window.open(aTag.href, '_blank');
          }
        }, 1000);
      } else {
        alert(`暂不支持文件夹下载: ${name}`);
      }
    });

    if (!downloadLinks.length) alert('未找到可下载链接');
  }

  // 主逻辑入口
  function init() {
    waitFor('[class*="action-bar-right"]', () => {
      addDownloadButton();
    });
  }

  // 等待 DOM 加载完成后执行
  window.addEventListener('load', () => {
    setTimeout(init, 2000);
  });
})();