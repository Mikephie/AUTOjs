/**

- QuantumultX URL 处理器
- 用于替换 QuantumultX 脚本中的 URL 并下载脚本
  */

const fs = require(‘fs’).promises;
const path = require(‘path’);
const https = require(‘https’);
const http = require(‘http’);

/**

- HTTP/HTTPS GET 请求获取内容
- @param {string} url URL地址
- @returns {Promise<string>} 响应内容
  */
  function httpGet(url) {
  return new Promise((resolve, reject) => {
  const client = url.startsWith(‘https’) ? https : http;
  const request = client.get(url, (response) => {
  // 处理重定向
  if (response.statusCode === 301 || response.statusCode === 302) {
  const redirectUrl = response.headers.location;
  if (redirectUrl) {
  console.log(`重定向到: ${redirectUrl}`);
  httpGet(redirectUrl).then(resolve).catch(reject);
  return;
  }
  }
  
  if (response.statusCode !== 200) {
  reject(new Error(`HTTP请求失败，状态码: ${response.statusCode}`));
  return;
  }
  
  let data = ‘’;
  response.on(‘data’, (chunk) => {
  data += chunk;
  });
  
  response.on(‘end’, () => {
  resolve(data);
  });
  });
  
  request.on(‘error’, (err) => {
  reject(err);
  });
  
  request.end();
  });
  }

/**

- 转义正则表达式中的特殊字符
- @param {string} string 需要转义的字符串
- @returns {string} 转义后的字符串
  */
  function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[]\]/g, ‘\$&’);
  }

/**

- 提取脚本内容
- @param {string} content 文件内容
- @returns {string} 提取的脚本内容
  */
  function extractScriptContent(content) {
  // 检查是否是被 /* */ 包裹的内容
  const commentMatch = content.match(//*([\s\S]*)*//);
  if (commentMatch && commentMatch[1]) {
  return commentMatch[1].trim();
  }

// 如果不是被注释包裹，则直接返回，但去掉多余的空行
return content.replace(/\n{3,}/g, "\n\n").trim();
}

/**

- 替换 QuantumultX 脚本中的 URL 并下载脚本
- @param {string} filePath 输入文件路径
- @param {object} options 配置选项
- @returns {Promise<object>} 处理结果
  */
  async function processQXUrl(filePath, options = {}) {
  // 默认选项
  const defaultOptions = {
  oldBaseUrl: ‘https://raw.githubusercontent.com/Mikephie/Script/main/qx’,
  newBaseUrl: ‘https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx’,
  useLocalPaths: true,
  downloadDir: ‘./quantumultx’,
  debug: false
  };

// 合并选项
const finalOptions = { …defaultOptions, …options };
const { oldBaseUrl, newBaseUrl, useLocalPaths, downloadDir, debug } = finalOptions;

// 用于日志输出的函数
const logDebug = (message) => {
if (debug) {
console.log(`[DEBUG] ${message}`);
}
};

try {
// 读取文件内容
console.log(`读取文件: ${filePath}`);
const content = await fs.readFile(filePath, ‘utf-8’);

```
// 提取脚本内容
const extractedContent = extractScriptContent(content);
logDebug(`提取脚本内容成功，长度: ${extractedContent.length} 字节`);

// 检查是否包含 [rewrite_local] 部分
const rewriteSection = extractedContent.match(/\[rewrite_local\]([\s\S]*?)(?=\[|$)/i);

if (!rewriteSection || !rewriteSection[1]) {
  console.log('未找到 [rewrite_local] 部分，返回原始内容');
  return { 
    success: false, 
    message: '未找到 [rewrite_local] 部分',
    filePath: filePath,
    content: content
  };
}

// 确保下载目录存在
await fs.mkdir(downloadDir, { recursive: true });
console.log(`确保下载目录存在: ${downloadDir}`);

// 处理 rewrite_local 部分
const lines = rewriteSection[1].split('\n');
let updatedLines = [];
const downloadPromises = [];

console.log(`找到 ${lines.length} 行内容进行处理`);

for (let line of lines) {
  line = line.trim();
  
  // 跳过空行和注释行
  if (!line || line.startsWith('#')) {
    updatedLines.push(line);
    continue;
  }
  
  // 识别包含脚本 URL 的行
  if (line.includes(' url script-') && line.includes(oldBaseUrl)) {
    // 提取 URL
    const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
    
    if (urlMatch && urlMatch[1]) {
      const scriptUrl = urlMatch[1];
      const scriptName = scriptUrl.split('/').pop(); // 获取脚本文件名
      
      console.log(`发现脚本URL: ${scriptUrl}`);
      
      // 如果使用本地路径，需要下载脚本
      if (useLocalPaths) {
        const downloadPromise = (async () => {
          try {
            // 下载脚本
            console.log(`下载脚本: ${scriptUrl}`);
            const scriptContent = await httpGet(scriptUrl);
            
            // 保存到本地
            const localPath = path.join(downloadDir, scriptName);
            await fs.writeFile(localPath, scriptContent);
            console.log(`脚本已保存到: ${localPath}`);
            
            // 替换为本地相对路径
            const relativePath = `./${path.relative('.', localPath).replace(/\\/g, '/')}`;
            console.log(`URL替换为本地路径: ${relativePath}`);
            
            return line.replace(scriptUrl, relativePath);
          } catch (err) {
            console.error(`下载脚本失败: ${err.message}`);
            
            // 下载失败时使用新的远程URL
            if (newBaseUrl) {
              const newUrl = `${newBaseUrl}/${scriptName}`;
              console.log(`下载失败，URL替换为新的远程URL: ${newUrl}`);
              return line.replace(scriptUrl, newUrl);
            }
            
            return line; // 保持原始URL
          }
        })();
        
        downloadPromises.push(downloadPromise);
        updatedLines.push(downloadPromise); // 临时存储promise
      } else if (newBaseUrl) {
        // 不下载，直接替换URL
        const newUrl = `${newBaseUrl}/${scriptName}`;
        console.log(`URL替换为新的远程URL: ${newUrl}`);
        updatedLines.push(line.replace(scriptUrl, newUrl));
      } else {
        // 保持原始URL
        updatedLines.push(line);
      }
    } else {
      // 无法提取URL，保持原行不变
      updatedLines.push(line);
    }
  } else {
    // 不需要处理的行
    updatedLines.push(line);
  }
}

// 等待所有下载完成
if (downloadPromises.length > 0) {
  console.log(`等待 ${downloadPromises.length} 个下载任务完成...`);
  await Promise.all(downloadPromises);
  
  // 解析所有 promise 中的行
  for (let i = 0; i < updatedLines.length; i++) {
    if (updatedLines[i] instanceof Promise) {
      updatedLines[i] = await updatedLines[i];
    }
  }
}

// 构建新的内容
let updatedRewriteSection = updatedLines.join('\n');
let updatedContent = extractedContent.replace(
  rewriteSection[1],
  updatedRewriteSection
);

// 如果原始内容是被注释包裹的，恢复注释包裹
if (content.trim().startsWith('/*') && content.trim().endsWith('*/')) {
  updatedContent = `/*${updatedContent}*/`;
}

// 保存更新后的内容
const fileName = path.basename(filePath);
const outputPath = path.join(downloadDir, fileName);
await fs.writeFile(outputPath, updatedContent);
console.log(`更新后的内容已保存到: ${outputPath}`);

return {
  success: true,
  message: `已处理 ${downloadPromises.length} 个脚本URL`,
  filePath: outputPath,
  content: updatedContent
};
```

} catch (error) {
console.error(`处理文件出错: ${error.message}`);
console.error(error.stack);

```
return {
  success: false,
  message: `处理出错: ${error.message}`,
  filePath: filePath,
  error: error
};
```

}
}

module.exports = {
processQXUrl,
extractScriptContent
};
