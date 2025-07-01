/**

- 优化版三合一脚本转换器 - QX, Loon, Surge
- 最后更新: 2025-07-01
- 功能:
- - 解析和检测脚本格式
- - QuantumultX脚本下载到本地并更新链接
- - 转换脚本为Loon和Surge格式
    */

const fs = require(‘fs’).promises;
const path = require(‘path’);
const fetch = require(‘node-fetch’);

// 基础目录配置
const BASE_DIRS = {
quantumultx: ‘./quantumultx’,
loon: ‘./loon’,
surge: ‘./surge’
/**

- 转换为Loon格式
- @param {Object/**
- 转义正则表达式中的特殊字符
- @param {string} string 需要转义的字符串
- @returns {string} 转义后的字符串
  */
  function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[]\]/g, ‘\$&’);
  }

/**

- 示例使用方法
  */
  async function main() {
  try {
  // 获取命令行参数
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
  console.log(‘用法: node script_converter.js <文件路径> [选项]’);
  console.log(‘选项:’);
  console.log(’  –old-url=URL     旧的基础URL’);
  console.log(’  –new-url=URL     新的基础URL’);
  console.log(’  –local-only      仅使用本地路径’);
  console.log(’  –no-loon         不转换为Loon’);
  console.log(’  –no-surge        不转换为Surge’);
  console.log(‘示例: node script_converter.js my_script.conf –old-url=https://old.com –new-url=https://new.com’);
  return;
  }
  
  const filePath = args[0];
  
  // 解析选项
  const options = {};
  for (let i = 1; i < args.length; i++) {
  const arg = args[i];
  
  if (arg.startsWith(’–old-url=’)) {
  options.oldBaseUrl = arg.split(’=’)[1];
  } else if (arg.startsWith(’–new-url=’)) {
  options.newBaseUrl = arg.split(’=’)[1];
  } else if (arg === ‘–local-only’) {
  options.useLocalPaths = true;
  options.newBaseUrl = null;
  } else if (arg === ‘–no-loon’) {
  options.convertLoon = false;
  } else if (arg === ‘–no-surge’) {
  options.convertSurge = false;
  }
  }
  
  // 处理脚本
  const result = await processScript(filePath, options);
  console.log(‘处理完成！生成的文件:’);
  Object.entries(result).forEach(([type, path]) => {
  console.log(`- ${type}: ${path}`);
  });

} catch (error) {
console.error(‘出错:’, error);
process.exit(1);
}
}

// 如果直接运行此脚本
if (require.main === module) {
main();
}

module.exports = {
processScript,
extractScriptContent,
parseScript,
convertToLoon,
convertToSurge,
detectScriptType,
processQXScript
}; scriptInfo 脚本信息

- @returns {string} Loon格式的脚本内容
  */
  function convertToLoon(input) {
  // 如果输入是字符串，先处理它
  let scriptInfo;
  if (typeof input === ‘string’) {
  const extractedContent = extractScriptContent(input);
  scriptInfo = parseScript(extractedContent);
  } else {
  scriptInfo = input;
  }

// 使用元数据
const name = scriptInfo.metadata.name || "Converted Script";
const desc = scriptInfo.metadata.desc || scriptInfo.metadata.description || "配置信息";
const author = scriptInfo.metadata.author || "Converter";

let config = `#!name=${name} #!desc=${desc}`;

// 添加category字段（如果存在）
if (scriptInfo.metadata.category) {
config += `\n#!category=${scriptInfo.metadata.category}`;
}

config += `\n#!author=${author}`;

if (scriptInfo.metadata.homepage) {
config += `\n#!homepage=${scriptInfo.metadata.homepage}`;
}

if (scriptInfo.metadata.icon) {
config += `\n#!icon=${scriptInfo.metadata.icon}`;
}

// 处理Rule部分
if (scriptInfo.rules.length > 0) {
config += "\n\n[Rule]";

```
let lastComment = "";
for (const rule of scriptInfo.rules) {
  // 如果有新注释，添加它
  if (rule.comment && rule.comment !== lastComment) {
    config += `\n${rule.comment}`;
    lastComment = rule.comment;
  }
  
  // 修复规则格式
  let loonRule = rule.content;
  
  // 移除逗号周围的额外空格
  loonRule = loonRule.replace(/\s*,\s*/g, ',');
  
  // 将最后一个逗号后的策略名转为大写
  loonRule = loonRule.replace(/,([^,]+)$/g, function(match, policy) {
    return ',' + policy.trim().toUpperCase();
  });
  
  config += `\n${loonRule}`;
}

config += "\n";
```

}

// 处理Rewrite部分
if (scriptInfo.rewrites.length > 0) {
config += "\n[Rewrite]";

```
let lastComment = "";
for (const rule of scriptInfo.rewrites) {
  // 如果有新注释，添加它
  if (rule.comment && rule.comment !== lastComment) {
    config += `\n${rule.comment}`;
    lastComment = rule.comment;
  }
  
  // 转换QX格式为Loon格式
  let loonRewrite = rule.content;
  
  // 将QX pattern - reject-dict 等转为 Loon pattern - REJECT (大写)
  loonRewrite = loonRewrite.replace(/ - reject($| )/g, ' - REJECT$1');
  loonRewrite = loonRewrite.replace(/ - reject-dict($| )/g, ' - REJECT$1');
  loonRewrite = loonRewrite.replace(/ - reject-img($| )/g, ' - REJECT$1');
  
  config += `\n${loonRewrite}`;
}

config += "\n";
```

}

// 处理Script部分
if (scriptInfo.scripts.length > 0) {
// 添加一个空行在[Script]之前
config += "\n\n[Script]";

```
let lastComment = "";
for (const rule of scriptInfo.scripts) {
  // 如果有新注释，添加它
  if (rule.comment && rule.comment !== lastComment) {
    config += `\n${rule.comment}`;
    lastComment = rule.comment;
  }
  
  config += `\n${rule.content}`;
}

config += "\n";
```

}

// MITM部分
if (scriptInfo.hostname) {
config += "\n[MITM]\n";
config += `hostname = ${scriptInfo.hostname}\n`;
}

return config;
};

/**

- 主函数 - 处理脚本并转换
- @param {string} filePath 输入脚本路径
- @param {Object} options 选项配置
- @returns {Promise<Object>} 处理结果
  */
  async function processScript(filePath, options = {}) {
  const defaultOptions = {
  oldBaseUrl: ‘https://raw.githubusercontent.com/Mikephie/Script/main/qx’,
  newBaseUrl: ‘https://raw.githubusercontent.com/Mikephie/AUTOjs/refs/heads/main/quantumultx’,
  useLocalPaths: true,  // 是否使用本地路径替换URL
  convertLoon: true,    // 是否转换为Loon
  convertSurge: true    // 是否转换为Surge
  };

// 合并选项
const finalOptions = { …defaultOptions, …options };

try {
// 读取原始脚本
console.log(`正在读取文件: ${filePath}`);
const content = await fs.readFile(filePath, ‘utf-8’);

```
// 检测脚本类型
const scriptType = detectScriptType(content);
console.log(`检测到脚本类型: ${scriptType}`);

// 提取文件名作为脚本名
const fileName = path.basename(filePath, path.extname(filePath));

// 确保所有必要的目录存在
await ensureDirectories();

// 根据脚本类型处理
const results = {};

if (scriptType === 'quantumultx') {
  // 处理QuantumultX脚本
  console.log('处理QuantumultX脚本...');
  const updatedQX = await processQXScript(
    content, 
    finalOptions.oldBaseUrl, 
    finalOptions.useLocalPaths ? null : finalOptions.newBaseUrl, 
    BASE_DIRS.quantumultx
  );
  
  // 保存更新后的QX脚本
  const qxOutputPath = path.join(BASE_DIRS.quantumultx, `${fileName}.conf`);
  await fs.writeFile(qxOutputPath, updatedQX);
  console.log(`QuantumultX脚本已保存至: ${qxOutputPath}`);
  results.quantumultx = qxOutputPath;
  
  if (finalOptions.convertLoon) {
    // 转换为Loon
    console.log('转换为Loon格式...');
    const extractedContent = extractScriptContent(updatedQX);
    const scriptInfo = parseScript(extractedContent);
    const loonContent = convertToLoon(scriptInfo);
    
    // 保存Loon脚本
    const loonOutputPath = path.join(BASE_DIRS.loon, `${fileName}.plugin`);
    await fs.writeFile(loonOutputPath, loonContent);
    console.log(`Loon脚本已保存至: ${loonOutputPath}`);
    results.loon = loonOutputPath;
  }
  
  if (finalOptions.convertSurge) {
    // 转换为Surge
    console.log('转换为Surge格式...');
    const extractedContent = extractScriptContent(updatedQX);
    const scriptInfo = parseScript(extractedContent);
    const surgeContent = convertToSurge(scriptInfo);
    
    // 保存Surge脚本
    const surgeOutputPath = path.join(BASE_DIRS.surge, `${fileName}.sgmodule`);
    await fs.writeFile(surgeOutputPath, surgeContent);
    console.log(`Surge脚本已保存至: ${surgeOutputPath}`);
    results.surge = surgeOutputPath;
  }
} else if (scriptType === 'loon') {
  // 处理Loon脚本
  console.log('处理Loon脚本...');
  
  // 保存原始Loon脚本
  const loonOutputPath = path.join(BASE_DIRS.loon, `${fileName}.plugin`);
  await fs.writeFile(loonOutputPath, content);
  console.log(`Loon脚本已保存至: ${loonOutputPath}`);
  results.loon = loonOutputPath;
  
  if (finalOptions.convertSurge) {
    // 转换为Surge
    console.log('转换为Surge格式...');
    const extractedContent = extractScriptContent(content);
    const scriptInfo = parseScript(extractedContent);
    const surgeContent = convertToSurge(scriptInfo);
    
    // 保存Surge脚本
    const surgeOutputPath = path.join(BASE_DIRS.surge, `${fileName}.sgmodule`);
    await fs.writeFile(surgeOutputPath, surgeContent);
    console.log(`Surge脚本已保存至: ${surgeOutputPath}`);
    results.surge = surgeOutputPath;
  }
} else if (scriptType === 'surge') {
  // 处理Surge脚本
  console.log('处理Surge脚本...');
  
  // 保存原始Surge脚本
  const surgeOutputPath = path.join(BASE_DIRS.surge, `${fileName}.sgmodule`);
  await fs.writeFile(surgeOutputPath, content);
  console.log(`Surge脚本已保存至: ${surgeOutputPath}`);
  results.surge = surgeOutputPath;
  
  if (finalOptions.convertLoon) {
    // 转换为Loon
    console.log('转换为Loon格式...');
    const extractedContent = extractScriptContent(content);
    const scriptInfo = parseScript(extractedContent);
    const loonContent = convertToLoon(scriptInfo);
    
    // 保存Loon脚本
    const loonOutputPath = path.join(BASE_DIRS.loon, `${fileName}.plugin`);
    await fs.writeFile(loonOutputPath, loonContent);
    console.log(`Loon脚本已保存至: ${loonOutputPath}`);
    results.loon = loonOutputPath;
  }
} else {
  console.log('未知脚本类型，尝试通用处理...');
  
  // 尝试解析
  const extractedContent = extractScriptContent(content);
  const scriptInfo = parseScript(extractedContent);
  
  // 转换为多种格式
  const loonContent = convertToLoon(scriptInfo);
  const surgeContent = convertToSurge(scriptInfo);
  
  // 保存所有格式
  if (finalOptions.convertLoon) {
    const loonOutputPath = path.join(BASE_DIRS.loon, `${fileName}.plugin`);
    await fs.writeFile(loonOutputPath, loonContent);
    console.log(`Loon脚本已保存至: ${loonOutputPath}`);
    results.loon = loonOutputPath;
  }
  
  if (finalOptions.convertSurge) {
    const surgeOutputPath = path.join(BASE_DIRS.surge, `${fileName}.sgmodule`);
    await fs.writeFile(surgeOutputPath, surgeContent);
    console.log(`Surge脚本已保存至: ${surgeOutputPath}`);
    results.surge = surgeOutputPath;
  }
}

console.log('脚本处理完成!');
return results;
```

} catch (error) {
console.error(‘处理脚本时出错:’, error);
throw error;
}
}

/**

- 确保所有必要的目录存在
  */
  async function ensureDirectories() {
  for (const dir of Object.values(BASE_DIRS)) {
  try {
  await fs.mkdir(dir, { recursive: true });
  console.log(`目录已创建或已存在: ${dir}`);
  } catch (err) {
  console.error(`创建目录失败 ${dir}: ${err.message}`);
  throw err;
  }
  }
  }

/**

- 替换QuantumultX脚本中的URL链接并下载脚本到本地
- @param {string} content 原始脚本内容
- @param {string} oldBaseUrl 旧的基础URL
- @param {string} newBaseUrl 新的基础URL或null（如果使用本地路径）
- @param {string} localDir 本地保存目录
- @returns {Promise<string>} 替换URL后的脚本内容
  */
  async function processQXScript(content, oldBaseUrl, newBaseUrl, localDir = ‘./quantumultx’) {
  // 提取脚本内容
  const extractedContent = extractScriptContent(content);

// 找出所有的[rewrite_local]部分
const rewriteSection = extractedContent.match(/[rewrite_local]([\s\S]*?)(?=[|$)/i);

if (!rewriteSection || !rewriteSection[1]) {
console.log(‘未找到 [rewrite_local] 部分’);
return content; // 没有找到rewrite_local部分，返回原内容
}

// 创建本地目录（如果不存在）
try {
await fs.mkdir(localDir, { recursive: true });
console.log(`目录 ${localDir} 已创建或已存在`);
} catch (err) {
console.error(`创建目录失败: ${err.message}`);
return content;
}

// 解析和处理rewrite_local部分
const lines = rewriteSection[1].split(’\n’);
let updatedLines = [];
const scriptDownloadPromises = [];

for (let line of lines) {
line = line.trim();
if (!line || line.startsWith(’#’)) {
updatedLines.push(line);
continue;
}

```
// 识别包含脚本URL的行
if (line.includes(' url script-') && line.includes(oldBaseUrl)) {
  // 提取URL
  const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
  if (urlMatch && urlMatch[1]) {
    const scriptUrl = urlMatch[1];
    const scriptName = scriptUrl.split('/').pop(); // 获取脚本文件名
    
    // 创建下载任务
    const downloadPromise = (async () => {
      try {
        // 下载脚本
        console.log(`正在下载脚本: ${scriptUrl}`);
        const response = await fetch(scriptUrl);
        
        if (!response.ok) {
          throw new Error(`下载失败: HTTP状态 ${response.status}`);
        }
        
        const scriptContent = await response.text();
        
        // 保存到本地
        const localPath = path.join(localDir, scriptName);
        await fs.writeFile(localPath, scriptContent);
        console.log(`脚本已下载到: ${localPath}`);
        
        // 更新行中的URL
        let updatedLine;
        if (newBaseUrl) {
          // 使用新的远程URL
          const newUrl = `${newBaseUrl}/${scriptName}`;
          updatedLine = line.replace(scriptUrl, newUrl);
          console.log(`URL已更新为: ${newUrl}`);
        } else {
          // 使用本地路径
          const relativePath = `./${path.relative('.', localPath).replace(/\\/g, '/')}`;
          updatedLine = line.replace(scriptUrl, relativePath);
          console.log(`URL已更新为本地路径: ${relativePath}`);
        }
        
        return updatedLine;
      } catch (err) {
        console.error(`下载脚本 ${scriptUrl} 失败: ${err.message}`);
        return line; // 出错时保持原行不变
      }
    })();
    
    scriptDownloadPromises.push(downloadPromise);
    updatedLines.push(downloadPromise); // 临时存储promise，稍后解析
  } else {
    updatedLines.push(line);
  }
} else {
  updatedLines.push(line);
}
```

}

// 等待所有下载完成并获取更新后的行
await Promise.all(scriptDownloadPromises);

// 解析所有promise中的行
for (let i = 0; i < updatedLines.length; i++) {
if (updatedLines[i] instanceof Promise) {
updatedLines[i] = await updatedLines[i];
}
}

// 构建新的内容
let updatedRewriteSection = updatedLines.join(’\n’);
let updatedContent = extractedContent.replace(
rewriteSection[1],
updatedRewriteSection
);

// 如果原始内容是被注释包裹的，恢复注释包裹
if (content.trim().startsWith(’/*’) && content.trim().endsWith(’*/’)) {
updatedContent = `/*${updatedContent}*/`;
}

return updatedContent;
}

/**

- 从文件内容中提取脚本内容
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

- 检测脚本类型
- @param {string} content 脚本内容
- @returns {string} 脚本类型 (quantumultx, loon, surge, unknown)
  */
  function detectScriptType(content) {
  // 检测Loon特有标记
  if (content.includes(’#!name=’) &&
  (content.includes(’[Rewrite]’) || content.includes(’[Script]’))) {
  return ‘loon’;
  }

// 检测Surge特有标记
if (content.includes(’#!name=’) &&
(content.includes(’[Script]’) || content.includes(’[Rule]’)) &&
(content.includes(‘type=http-response’) || content.includes(‘type=cron’))) {
return ‘surge’;
}

// 检测QuantumultX特有标记
if ((content.includes(’[rewrite_local]’) || content.includes(’[filter_local]’)) ||
content.includes(‘url script-’) ||
content.includes(’// @author’) ||
content.includes(’// @name’)) {
return ‘quantumultx’;
}

// 如果无法确定，返回unknown
return ‘unknown’;
}

/**

- 解析脚本内容
- @param {string} content 脚本内容
- @returns {Object} 解析结果
  */
  function parseScript(content) {
  const result = {
  metadata: {},
  rules: [],
  rewrites: [],
  scripts: [],
  hostname: ""
  };

// 提取元数据
extractMetadata(content, result);

// 处理节点 - 优先考虑标准Loon格式
const loonSections = {
"Rule": content.match(/[Rule]([\s\S]*?)(?=[|$)/i),
"Rewrite": content.match(/[Rewrite]([\s\S]*?)(?=[|$)/i),
"Script": content.match(/[Script]([\s\S]*?)(?=[|$)/i),
"MITM": content.match(/[MITM]([\s\S]*?)(?=[|$|$)/i)
};

// 处理QX格式作为备选
const qxSections = {
"filter_local": content.match(/[filter_local]([\s\S]*?)(?=[|$)/i),
"rewrite_local": content.match(/[rewrite_local]([\s\S]*?)(?=[|$)/i),
"mitm": content.match(/[mitm]([\s\S]*?)(?=[|$|$)/i)
};

// 解析Loon格式
if (loonSections.Rule && loonSections.Rule[1]) {
parseSectionWithComments(loonSections.Rule[1], result.rules);
}

if (loonSections.Rewrite && loonSections.Rewrite[1]) {
parseSectionWithComments(loonSections.Rewrite[1], result.rewrites);
}

if (loonSections.Script && loonSections.Script[1]) {
parseSectionWithComments(loonSections.Script[1], result.scripts);
}

// 处理QX格式 - 如果Loon格式为空
if (result.rules.length === 0 && qxSections.filter_local && qxSections.filter_local[1]) {
parseQXRules(qxSections.filter_local[1], result);
}

if (result.rewrites.length === 0 && result.scripts.length === 0 &&
qxSections.rewrite_local && qxSections.rewrite_local[1]) {
parseQXRewrites(qxSections.rewrite_local[1], result);
}

// 提取hostname
extractHostname(loonSections.MITM, qxSections.mitm, result);

return result;
}

/**

- 提取元数据
- @param {string} content 脚本内容
- @param {Object} result 结果对象
  */
  function extractMetadata(content, result) {
  // 标准元数据字段
  const metadataFields = {
  name: /#!name\s*=\s*(.+?)($|\n)/i,
  desc: /#!desc\s*=\s*(.+?)($|\n)/i,
  category: /#!category\s*=\s*(.+?)($|\n)/i,
  author: /#!author\s*=\s*(.+?)($|\n)/i,
  icon: /#!icon\s*=\s*(.+?)($|\n)/i
  };

// 提取每个字段
for (const [field, pattern] of Object.entries(metadataFields)) {
const match = content.match(pattern);
if (match && match[1]) {
result.metadata[field] = match[1].trim();
}
}

// 如果没有找到标准元数据，尝试从QX格式提取
if (!result.metadata.name) {
// 尝试从内容第一行或注释中提取
const titleMatch = content.match(/^//\s*(.+?)(?:\n|$)/);
if (titleMatch) {
result.metadata.name = titleMatch[1].trim();
}

```
// 尝试从@name属性提取
const nameMatch = content.match(/\/\/\s*@name\s+(.+?)(?:\n|$)/i);
if (nameMatch) {
  result.metadata.name = nameMatch[1].trim();
}

// 尝试从@desc属性提取
const descMatch = content.match(/\/\/\s*@desc(?:ription)?\s+(.+?)(?:\n|$)/i);
if (descMatch) {
  result.metadata.desc = descMatch[1].trim();
}

// 尝试从@author属性提取
const authorMatch = content.match(/\/\/\s*@author\s+(.+?)(?:\n|$)/i);
if (authorMatch) {
  result.metadata.author = authorMatch[1].trim();
}
```

}

// 如果还是没找到名称，尝试从文件名或特征提取
if (!result.metadata.name) {
const titleMatch = content.match(/(脚本|script|重写|rewrite)/i);
if (titleMatch) {
result.metadata.name = "Custom " + titleMatch[0].trim();
} else {
result.metadata.name = "Converted Script";
}
}
}

/**

- 提取hostname
- @param {Array} loonMITM Loon MITM匹配结果
- @param {Array} qxMITM QX MITM匹配结果
- @param {Object} result 结果对象
  */
  function extractHostname(loonMITM, qxMITM, result) {
  // 优先从Loon格式提取
  if (loonMITM && loonMITM[1]) {
  const hostnameMatch = loonMITM[1].match(/hostname\s*=\s*([^\n]+)/i);
  if (hostnameMatch && hostnameMatch[1]) {
  result.hostname = hostnameMatch[1].trim();
  return;
  }
  }

// 备选从QX格式提取
if (qxMITM && qxMITM[1]) {
const hostnameMatch = qxMITM[1].match(/hostname\s*=\s*([^\n]+)/i);
if (hostnameMatch && hostnameMatch[1]) {
result.hostname = hostnameMatch[1].trim();
return;
}
}
}

/**

- 解析带注释的节点
- @param {string} sectionContent 节点内容
- @param {Array} targetArray 目标数组
  */
  function parseSectionWithComments(sectionContent, targetArray) {
  const lines = sectionContent.split(’\n’);
  let currentComment = "";

for (let line of lines) {
line = line.trim();
if (!line) continue;

```
if (line.startsWith('#')) {
  // 收集注释
  currentComment = line;
} else {
  // 处理内容行
  targetArray.push({
    content: line,
    comment: currentComment
  });
  
  // 重置注释
  currentComment = "";
}
```

}
}

/**

- 解析QX规则
- @param {string} sectionContent 节点内容
- @param {Object} result 结果对象
  */
  function parseQXRules(sectionContent, result) {
  const lines = sectionContent.split(’\n’);
  let currentComment = "";

for (let line of lines) {
line = line.trim();
if (!line) continue;

```
if (line.startsWith('#')) {
  // 收集注释
  currentComment = line;
} else {
  // 转换格式
  let convertedLine = line;
  
  // 转换QX特定规则格式为通用格式
  if (line.startsWith('host,')) {
    convertedLine = line.replace(/^host,/i, 'DOMAIN,');
  } else if (line.startsWith('host-suffix,')) {
    convertedLine = line.replace(/^host-suffix,/i, 'DOMAIN-SUFFIX,');
  } else if (line.startsWith('host-keyword,')) {
    convertedLine = line.replace(/^host-keyword,/i, 'DOMAIN-KEYWORD,');
  } else if (line.startsWith('user-agent,')) {
    convertedLine = line.replace(/^user-agent,/i, 'USER-AGENT,');
  }
  
  // 添加到规则列表
  result.rules.push({
    content: convertedLine,
    comment: currentComment
  });
  
  // 重置注释
  currentComment = "";
}
```

}
}

/**

- 解析QX重写
- @param {string} sectionContent 节点内容
- @param {Object} result 结果对象
  */
  function parseQXRewrites(sectionContent, result) {
  const lines = sectionContent.split(’\n’);
  let currentComment = "";

for (let line of lines) {
line = line.trim();
if (!line) continue;

```
if (line.startsWith('#')) {
  // 收集注释
  currentComment = line;
} else if (line.includes(' - ')) {
  // 处理常规重写（例如 reject）
  result.rewrites.push({
    content: line,
    comment: currentComment
  });
  
  // 重置注释
  currentComment = "";
} else if (line.includes(' url ')) {
  // 处理脚本重写
  const parts = line.split(' url ');
  if (parts.length === 2) {
    const pattern = parts[0].trim();
    const action = parts[1].trim();
    
    if (action.startsWith('reject')) {
      // reject规则
      result.rewrites.push({
        content: `${pattern} - ${action}`,
        comment: currentComment
      });
    } else if (action.startsWith('script-')) {
      // 脚本规则
      const scriptType = action.split(' ')[0];
      let scriptPath = action.split(' ')[1] || '';
      
      // 确定HTTP类型
      const httpType = scriptType.includes('response') ? 'http-response' : 'http-request';
      const requiresBody = scriptType.includes('body') ? 'true' : 'false';
      
      // 提取脚本名称作为tag
      let tag = "script";
      if (scriptPath && scriptPath.includes('/')) {
        const scriptName = scriptPath.split('/').pop().split('.')[0];
        if (scriptName) tag = scriptName;
      }
      
      // 构建Loon格式脚本规则
      result.scripts.push({
        content: `${httpType} ${pattern} script-path=${scriptPath}, requires-body=${requiresBody}, timeout=60, tag=${tag}`,
        comment: currentComment
      });
    }
  }
  
  // 重置注释
  currentComment = "";
}
```

}
}

/**

- 转换为Surge格式
- @param {Object} scriptInfo 脚本信息
- @returns {string} Surge格式的脚本内容
  */
  function convertToSurge(input) {
  // 如果输入是字符串，先处理它
  let scriptInfo;
  if (typeof input === ‘string’) {
  const extractedContent = extractScriptContent(input);
  scriptInfo = parseScript(extractedContent);
  } else {
  scriptInfo = input;
  }

// 使用元数据
const name = scriptInfo.metadata.name || "Converted Script";
const desc = scriptInfo.metadata.desc || scriptInfo.metadata.description || "配置信息";
const author = scriptInfo.metadata.author || "Converter";

let config = `#!name=${name} #!desc=${desc}`;

// 添加category字段（如果存在）
if (scriptInfo.metadata.category) {
config += `\n#!category=${scriptInfo.metadata.category}`;
}

config += `\n#!author=${author}`;

if (scriptInfo.metadata.homepage) {
config += `\n#!homepage=${scriptInfo.metadata.homepage}`;
}

if (scriptInfo.metadata.icon) {
config += `\n#!icon=${scriptInfo.metadata.icon}`;
}

// 处理Rule部分 - 修复格式
if (scriptInfo.rules && scriptInfo.rules.length > 0) {
config += "\n\n[Rule]";

```
let lastComment = "";
for (const rule of scriptInfo.rules) {
  // 如果有新注释，添加它
  if (rule.comment && rule.comment !== lastComment) {
    config += `\n${rule.comment}`;
    lastComment = rule.comment;
  }
  
  // 转换规则格式为Surge格式
  let surgeRule = rule.content;
  
  // 修复规则格式: 移除逗号后的额外空格，并将策略名转为大写
  surgeRule = surgeRule.replace(/\s*,\s*/g, ','); // 移除逗号周围的空格
  surgeRule = surgeRule.replace(/,([^,]+)$/g, function(match, policy) {
    // 将最后一个逗号后的策略名转为大写
    return ',' + policy.trim().toUpperCase();
  });
  
  config += `\n${surgeRule}`;
}

config += "\n";
```

}

// 处理Map Local部分 - 用于reject规则
const rejectRules = scriptInfo.rewrites.filter(r =>
r.content.includes(’ - reject’) || r.content.includes(’ - reject-dict’) || r.content.includes(’ - reject-img’)
);

if (rejectRules.length > 0) {
config += "\n[Map Local]";

```
let lastComment = "";
for (const rule of rejectRules) {
  // 如果有新注释，添加它
  if (rule.comment && rule.comment !== lastComment) {
    config += `\n${rule.comment}`;
    lastComment = rule.comment;
  }
  
  // 提取URL模式和reject类型
  const parts = rule.content.split(' - ');
  const pattern = parts[0].trim();
  let rejectType = parts[1].trim().toLowerCase(); // 转小写以统一处理
  
  // 设置数据类型和内容
  let dataType = "text/plain";
  let data = "HTTP/1.1 200 OK";
  
  if (rejectType === 'reject-img' || rejectType === 'reject-200') {
    data = "HTTP/1.1 200 OK\r\nContent-Type: image/png\r\nContent-Length: 0";
  } else if (rejectType === 'reject-dict' || rejectType === 'reject-json') {
    dataType = "application/json";
    data = "{}";
  } else if (rejectType === 'reject-array') {
    dataType = "application/json";
    data = "[]";
  }
  
  // 添加 status-code=200 参数
  config += `\n${pattern} data-type=text data="${data}" status-code=200`;
}

config += "\n";
```

}

// 处理URL Rewrite部分 - 用于非reject的URL重写规则
const urlRewriteRules = scriptInfo.rewrites.filter(r =>
!r.content.includes(’ - reject’) && !r.content.includes(’ - reject-dict’) && !r.content.includes(’ - reject-img’)
);

if (urlRewriteRules.length > 0) {
config += "\n[URL Rewrite]";

```
let lastComment = "";
for (const rule of urlRewriteRules) {
  // 如果有新注释，添加它
  if (rule.comment && rule.comment !== lastComment) {
    config += `\n${rule.comment}`;
    lastComment = rule.comment;
  }
  
  // 转换为大写REJECT
  let surgeRewrite = rule.content;
  surgeRewrite = surgeRewrite.replace(/ - reject($| )/g, ' - REJECT$1');
  surgeRewrite = surgeRewrite.replace(/ - reject-dict($| )/g, ' - REJECT-DICT$1');
  surgeRewrite = surgeRewrite.replace(/ - reject-img($| )/g, ' - REJECT-IMG$1');
  
  config += `\n${surgeRewrite}`;
}

config += "\n";
```

}

// 处理Script部分
if (scriptInfo.scripts && scriptInfo.scripts.length > 0) {
config += "\n\n[Script]";

```
let lastComment = "";
let ruleCounter = 0;

for (const rule of scriptInfo.scripts) {
  // 如果有新注释，添加它
  if (rule.comment && rule.comment !== lastComment) {
    config += `\n${rule.comment}`;
    lastComment = rule.comment;
  }
  
  // 解析Loon脚本规则或直接使用原始内容
  let surgeScript = "";
  
  // 尝试解析Loon格式
  const match = rule.content.match(/(http-(?:response|request))\s+([^\s]+)\s+script-path=([^,]+)/);
  if (match) {
    const httpType = match[1];
    const pattern = match[2];
    const scriptPath = match[3];
    
    // 确定requires-body
    const requiresBody = rule.content.includes('requires-body=true') ? '1' : '0';
    
    // 提取tag作为名称
    let scriptName = "";
    const tagMatch = rule.content.match(/tag=([^,\s]+)/);
    if (tagMatch) {
      scriptName = tagMatch[1];
    } else {
      scriptName = ruleCounter === 0 ? name : `${name}_${ruleCounter+1}`;
    }
    
    // 构建Surge脚本规则
    surgeScript = `${scriptName} = type=${httpType}, pattern=${pattern}, requires-body=${requiresBody}, script-path=${scriptPath}, timeout=60`;
  } else {
    // 使用原始内容（可能已经是Surge格式）
    surgeScript = rule.content;
  }
  
  config += `\n${surgeScript}`;
  ruleCounter++;
}

config += "\n";
```

}

// MITM部分
if (scriptInfo.hostname) {
config += "\n[MITM]\n";
config += `hostname = %APPEND% ${scriptInfo.hostname}\n`;
}

return config;
}