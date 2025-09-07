'use strict';

/**
 * QuantumultX URL 处理器
 * 用于替换 QuantumultX 脚本中的 URL 并下载脚本
 */

const fs   = require('fs').promises;
const path = require('path');
const https = require('https');
const http  = require('http');

/**
 * HTTP/HTTPS GET 请求获取内容（跟随 30x 重定向）
 * @param {string} url
 * @param {number} depth
 * @returns {Promise<string>}
 */
function httpGet(url, depth = 0) {
  const MAX_REDIRECT = 10;
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      const code = res.statusCode || 0;
      // 跟随重定向
      if ([301, 302, 303, 307, 308].includes(code)) {
        const location = res.headers.location;
        if (!location) return reject(new Error(`重定向无 location: ${code}`));
        if (depth >= MAX_REDIRECT) return reject(new Error('重定向次数过多'));
        const next = new URL(location, url).toString();
        return httpGet(next, depth + 1).then(resolve).catch(reject);
      }
      if (code !== 200) {
        return reject(new Error(`HTTP请求失败，状态码: ${code}`));
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.end();
  });
}

/**
 * 转义正则中的特殊字符
 * @param {string} str
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 提取脚本内容：若全文被 /* ... *\/ 包裹，则取内部；否则原样（压缩多余空行）
 * @param {string} content
 */
function extractScriptContent(content) {
  const trimmed = content.trim();
  const wrapMatch = trimmed.match(/^\s*\/\*([\s\S]*?)\*\/\s*$/);
  if (wrapMatch && wrapMatch[1]) {
    return wrapMatch[1].trim();
  }
  return content.replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * 替换 QuantumultX 脚本中的 URL 并（可选）下载脚本
 * @param {string} filePath 输入文件
 * @param {object} options
 * @returns {Promise<{success:boolean,message:string,filePath:string,content?:string,error?:any}>}
 */
async function processQXUrl(filePath, options = {}) {
  // 默认选项
  const defaultOptions = {
    oldBaseUrl: 'https://raw.githubusercontent.com/Mikephie/Script/main/qx', // 不再作为过滤条件，仅保留字段
    newBaseUrl: 'https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx',
    useLocalPaths: true,          // true: 下载并改成本地相对路径；false: 统一远端 newBaseUrl
    downloadDir: './quantumultx', // 本地下载目录 & 输出目录
    debug: false
  };
  const opt = { ...defaultOptions, ...options };
  const { newBaseUrl, useLocalPaths, downloadDir, debug } = opt;

  const log = (...args) => debug && console.log('[DEBUG]', ...args);

  try {
    console.log(`读取文件: ${filePath}`);
    const original = await fs.readFile(filePath, 'utf-8');

    const extracted = extractScriptContent(original);
    log(`提取脚本内容成功，长度: ${extracted.length} 字节`);

    // 仅处理 [rewrite_local] 段
    const rewriteSection = extracted.match(/\[rewrite_local\]([\s\S]*?)(?=\n\[[^\]]+\]|$)/i);
    if (!rewriteSection || !rewriteSection[1]) {
      console.log('未找到 [rewrite_local] 段，返回原始内容');
      return {
        success: false,
        message: '未找到 [rewrite_local] 段',
        filePath,
        content: original
      };
    }

    await fs.mkdir(downloadDir, { recursive: true });
    console.log(`确保下载目录存在: ${downloadDir}`);

    const lines = rewriteSection[1].split('\n');
    const updatedLines = [];
    const downloadPromises = [];

    console.log(`找到 ${lines.length} 行内容进行处理`);

    // 匹配一行中最后一个 URL（在 url script-xxx 规则后面）
    const RULE_RE =
      /^(.*\burl\s+script-(?:response-body|request-body|request-header)\b.*?)(https?:\/\/\S+)(\s*)$/i;

    for (let line of lines) {
      const raw = line.trim();

      // 空行/注释原样保留
      if (!raw || raw.startsWith('#')) {
        updatedLines.push(line);
        continue;
      }

      const m = raw.match(RULE_RE);
      if (!m) {
        updatedLines.push(line);
        continue;
      }

      const [, prefix, scriptUrl, tailSpace] = m;

      // 解析脚本文件名
      const scriptName = (() => {
        try {
          const u = new URL(scriptUrl);
          return decodeURIComponent(u.pathname.split('/').pop() || 'script.js');
        } catch {
          return scriptUrl.split('/').pop() || 'script.js';
        }
      })();

      if (useLocalPaths) {
        // 下载到本地并替换为相对路径
        const p = (async () => {
          try {
            console.log(`下载脚本: ${scriptUrl}`);
            const scriptContent = await httpGet(scriptUrl);
            const localPath = path.join(downloadDir, scriptName);
            await fs.writeFile(localPath, scriptContent);
            const relative = `./${path
              .relative('.', localPath)
              .replace(/\\/g, '/')}`;
            log(`URL → 本地: ${scriptUrl}  =>  ${relative}`);
            return `${prefix}${relative}${tailSpace}`;
          } catch (e) {
            console.error(`下载失败(${scriptUrl}): ${e.message}`);
            // 兜底：统一指向 newBaseUrl
            const base = newBaseUrl.replace(/\/$/, '');
            const newUrl = `${base}/${scriptName}`;
            log(`改用 newBaseUrl: ${newUrl}`);
            return `${prefix}${newUrl}${tailSpace}`;
          }
        })();
        downloadPromises.push(p);
        updatedLines.push(p);
      } else {
        // 不下载：直接规范到新仓库 URL
        const base = newBaseUrl.replace(/\/$/, '');
        const newUrl = `${base}/${scriptName}`;
        log(`URL 统一: ${scriptUrl}  =>  ${newUrl}`);
        updatedLines.push(`${prefix}${newUrl}${tailSpace}`);
      }
    }

    // 兑现占位 Promise
    if (downloadPromises.length > 0) {
      console.log(`等待 ${downloadPromises.length} 个下载任务完成...`);
      await Promise.all(downloadPromises);
      for (let i = 0; i < updatedLines.length; i++) {
        if (updatedLines[i] instanceof Promise) {
          updatedLines[i] = await updatedLines[i];
        }
      }
    }

    const updatedRewrite = updatedLines.join('\n');

    // 用新的 rewrite_local 段替换回提取内容
    const updatedExtracted = extracted.replace(rewriteSection[1], updatedRewrite);

    // 如果原文件整体被 /*...*/ 包裹，则包裹回去；否则直接写
    const trimmed = original.trim();
    const isWrapped = /^\s*\/\*[\s\S]*\*\/\s*$/.test(trimmed);
    const updatedContent = isWrapped ? `/*${updatedExtracted}*/` : updatedExtracted;

    // 输出到 downloadDir 下同名文件
    const fileName = path.basename(filePath);
    const outputPath = path.join(downloadDir, fileName);
    await fs.writeFile(outputPath, updatedContent);
    console.log(`更新后的内容已保存到: ${outputPath}`);

    return {
      success: true,
      message: `已统一处理 URL（下载:${useLocalPaths ? '是' : '否'}）`,
      filePath: outputPath,
      content: updatedContent
    };
  } catch (err) {
    console.error(`处理文件出错: ${err.message}`);
    console.error(err.stack);
    return {
      success: false,
      message: `处理出错: ${err.message}`,
      filePath,
      error: err
    };
  }
}

module.exports = {
  processQXUrl,
  extractScriptContent,
  escapeRegExp
};
