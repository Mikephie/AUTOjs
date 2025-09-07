#!/usr/bin/env node

/**
 * 批量处理所有 QuantumultX 脚本 URL
 * 将本地路径或任意远端 URL 统一为 remoteBaseUrl/scriptName
 */

const fs = require('fs').promises;
const path = require('path');

// 配置
const CONFIG = {
  // 输入/输出目录
  inputDir: 'quantumultx',
  outputDir: 'quantumultx',

  // 远程基础 URL（末尾不要带斜杠）
  remoteBaseUrl: 'https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx',

  // 文件模式
  filePatterns: ['.conf', '.txt', '.js'],

  // 是否备份原文件
  backup: true,

  // 是否将已是远端的 URL 也统一到 remoteBaseUrl（true 更省心）
  normalizeAll: true
};

/**
 * 主函数
 */
async function main() {
  console.log('===== 批量处理 QuantumultX 脚本 URL =====');
  console.log(`输入目录: ${CONFIG.inputDir}`);
  console.log(`输出目录: ${CONFIG.outputDir}`);
  console.log(`远程基础URL: ${CONFIG.remoteBaseUrl}`);

  try {
    await fs.mkdir(CONFIG.outputDir, { recursive: true });

    const files = await findFiles(CONFIG.inputDir, CONFIG.filePatterns);
    console.log(`找到 ${files.length} 个文件需要处理`);

    if (files.length === 0) {
      console.log('没有找到匹配的文件');
      return;
    }

    let successCount = 0;
    let modifiedCount = 0;

    for (const file of files) {
      console.log(`\n处理文件: ${file}`);
      try {
        const result = await processFile(file);
        if (result.success) {
          successCount++;
          if (result.modified) modifiedCount++;
        }
      } catch (err) {
        console.error(`处理文件 ${file} 失败: ${err.message}`);
      }
    }

    console.log(`\n处理完成: ${successCount}/${files.length} 个文件成功，${modifiedCount} 个文件被修改`);
  } catch (err) {
    console.error('处理过程出错:', err);
    process.exit(1);
  }
}

/**
 * 查找匹配的文件
 * @param {string} dir
 * @param {string[]} patterns
 * @returns {Promise<string[]>}
 */
async function findFiles(dir, patterns) {
  const result = [];
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        const subFiles = await findFiles(fullPath, patterns);
        result.push(...subFiles);
      } else if (item.isFile()) {
        if (patterns.some(ext => item.name.endsWith(ext))) {
          result.push(fullPath);
        }
      }
    }
  } catch (err) {
    console.error(`读取目录 ${dir} 失败:`, err);
  }
  return result;
}

/**
 * 处理单个文件：把 script-xxx 后的目标（本地或远端）统一成 remoteBaseUrl/scriptName
 * @param {string} filePath
 */
async function processFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');

  // 匹配整行中的 “url script-<type> <目标>”
  // 捕获：prefix = "url script-xxx "；target = 紧随其后的 <本地/远端>（直到空白）
  const RE = /(url\s+script-(?:response-body|request-body|request-header)\s+)(\S+)/gi;

  let changed = false;

  const modifiedContent = content.replace(RE, (match, prefix, target) => {
    // target 可能是 ./local.js、quantumultx/qqyd.js 或 https://.../qqyd.js
    const isRemote = /^https?:\/\//i.test(target);

    if (!CONFIG.normalizeAll && isRemote) {
      // 不规范远端的情况下，远端 URL 原样保留
      return match;
    }

    // 提取脚本文件名
    let scriptName = '';
    if (isRemote) {
      try {
        const u = new URL(target);
        // 去掉 query/hash
        const last = u.pathname.split('/').pop() || '';
        scriptName = decodeURIComponent(last.split('?')[0].split('#')[0]);
      } catch {
        scriptName = target.split('/').pop() || '';
      }
    } else {
      // 本地或相对路径
      scriptName = target.split('/').pop() || target.split('\\').pop() || '';
    }

    if (!scriptName) {
      return match; // 找不到文件名就不改
    }

    const remoteUrl = `${CONFIG.remoteBaseUrl.replace(/\/$/, '')}/${scriptName}`;
    if (target !== remoteUrl) changed = true;

    console.log(`统一: ${target}  ->  ${remoteUrl}`);
    return `${prefix}${remoteUrl}`;
  });

  if (!changed) {
    console.log('文件内容没有需要替换的条目');
    return { success: true, modified: false };
  }

  if (CONFIG.backup) {
    const backupPath = `${filePath}.bak`;
    await fs.writeFile(backupPath, content);
    console.log(`已备份原文件: ${backupPath}`);
  }

  await fs.writeFile(filePath, modifiedContent);
  console.log(`已写入修改后的内容: ${filePath}`);

  return { success: true, modified: true };
}

// 运行主函数
main().catch(err => {
  console.error('未处理的错误:', err);
  process.exit(1);
});
