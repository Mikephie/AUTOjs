/**

- 已测试验证的脚本转换器 v2.0
- 最后更新: 2025-07-02
- 修复内容: 解决正则表达式 _[a-z]+ 等特殊字符导致的解析失败问题
- 测试验证: 已通过包含复杂正则表达式的脚本测试
  */

const fs = require(‘fs’).promises;
const path = require(‘path’);

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

- 智能节点匹配函数 - 修复正则表达式解析问题
- @param {string} content 内容
- @param {string} sectionName 节点名称
- @returns {string|null} 匹配的内容
  */
  function safeSectionMatch(content, sectionName) {
  try {
  const startPattern = `[${sectionName}]`;
  const startIndex = content.indexOf(startPattern);
  
  if (startIndex === -1) {
  return null;
  }
  
  // 寻找下一个真正的节点，而不是正则表达式中的括号
  let endIndex = content.length;
  let searchIndex = startIndex + startPattern.length;
  
  while (searchIndex < content.length) {
  const nextBracketIndex = content.indexOf(’[’, searchIndex);
  if (nextBracketIndex === -1) break;
  
  // 检查这个 [ 是否是行首的节点标记
  const lineStart = content.lastIndexOf(’\n’, nextBracketIndex);
  const beforeBracket = content.substring(lineStart + 1, nextBracketIndex).trim();
  
  // 如果 [ 前面是空的（即在行首），并且后面跟着的看起来像节点名
  if (beforeBracket === ‘’) {
  const closeBracketIndex = content.indexOf(’]’, nextBracketIndex);
  if (closeBracketIndex !== -1) {
  const sectionNameCandidate = content.substring(nextBracketIndex + 1, closeBracketIndex);
  // 检查是否是有效的节点名（只包含字母、数字、下划线、连字符）
  if (/^[a-zA-Z_-]+$/.test(sectionNameCandidate)) {
  endIndex = nextBracketIndex;
  break;
  }
  }
  }
  
  searchIndex = nextBracketIndex + 1;
  }
  
  // 提取节点内容
  const sectionContent = content.substring(startIndex + startPattern.length, endIndex).trim();
  return sectionContent;

} catch (error) {
console.error(`解析节点 ${sectionName} 时出错:`, error);
return null;
}
}

/**

- 提取元数据
- @param {string} content 脚本内容
- @returns {Object} 元数据对象
  */
  function extractMetadata(content) {
  const metadata = {};

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
try {
const match = content.match(pattern);
if (match && match[1]) {
metadata[field] = match[1].trim();
}
} catch (error) {
console.error(`提取元数据字段 ${field} 时出错:`, error);
}
}

// 如果没有找到标准元数据，尝试从QX格式提取
if (!metadata.name) {
try {
// 尝试从@name属性提取
const nameMatch = content.match(///\s*@name\s+(.+?)(?:\n|$)/i);
if (nameMatch) {
metadata.name = nameMatch[1].trim();
}

```
  // 尝试从@desc属性提取
  const descMatch = content.match(/\/\/\s*@desc(?:ription)?\s+(.+?)(?:\n|$)/i);
  if (descMatch) {
    metadata.desc = descMatch[1].trim();
  }
  
  // 尝试从@author属性提取
  const authorMatch = content.match(/\/\/\s*@author\s+(.+?)(?:\n|$)/i);
  if (authorMatch) {
    metadata.author = authorMatch[1].trim();
  }
} catch (error) {
  console.error('提取备用元数据时出错:', error);
}
```

}

// 如果还是没找到名称，设置默认值
if (!metadata.name) {
metadata.name = "Converted Script";
}

return metadata;
}

/**

- 解析QX重写规则 - 修复版
- @param {string} sectionContent 节点内容
- @returns {Object} 解析结果
  */
  function parseQXRewrites(sectionContent) {
  const result = {
  scripts: [],
  rewrites: []
  };

if (!sectionContent) return result;

try {
const lines = sectionContent.split(’\n’);
let currentComment = "";

```
for (let line of lines) {
  line = line.trim();
  if (!line) continue;
  
  if (line.startsWith('#')) {
    // 收集注释
    currentComment = line;
  } else if (line.includes(' - ')) {
    // 处理常规重写（例如 reject）
    result.rewrites.push({
      content: line,
      comment: currentComment
    });
    currentComment = "";
  } else if (line.includes(' url ')) {
    // 处理脚本重写 - 使用字符串分割而非正则
    const urlIndex = line.indexOf(' url ');
    if (urlIndex !== -1) {
      const pattern = line.substring(0, urlIndex).trim();
      const action = line.substring(urlIndex + 5).trim();
      
      if (action.startsWith('reject')) {
        // reject规则
        result.rewrites.push({
          content: `${pattern} - ${action}`,
          comment: currentComment
        });
      } else if (action.startsWith('script-')) {
        // 脚本规则
        const actionParts = action.split(' ');
        const scriptType = actionParts[0];
        let scriptPath = actionParts[1] || '';
        
        // 确定HTTP类型
        const httpType = scriptType.includes('response') ? 'http-response' : 'http-request';
        const requiresBody = scriptType.includes('body') ? 'true' : 'false';
        
        // 提取脚本名称作为tag
        let tag = "script";
        if (scriptPath && scriptPath.includes('/')) {
          const pathParts = scriptPath.split('/');
          const fileName = pathParts[pathParts.length - 1];
          if (fileName) {
            const scriptName = fileName.split('.')[0];
            if (scriptName) tag = scriptName;
          }
        }
        
        // 构建Loon格式脚本规则
        result.scripts.push({
          content: `${httpType} ${pattern} script-path=${scriptPath}, requires-body=${requiresBody}, timeout=60, tag=${tag}`,
          comment: currentComment
        });
      }
    }
    currentComment = "";
  }
}
```

} catch (error) {
console.error(‘解析QX重写时出错:’, error);
}

return result;
}

/**

- 解析QX规则 - 修复版
- @param {string} sectionContent 节点内容
- @returns {Array} 规则数组
  */
  function parseQXRules(sectionContent) {
  const rules = [];

if (!sectionContent) return rules;

try {
const lines = sectionContent.split(’\n’);
let currentComment = "";

```
for (let line of lines) {
  line = line.trim();
  if (!line) continue;
  
  if (line.startsWith('#')) {
    // 收集注释
    currentComment = line;
  } else {
    // 转换格式 - 使用字符串替换避免正则问题
    let convertedLine = line;
    
    if (line.startsWith('host,')) {
      convertedLine = 'DOMAIN,' + line.substring(5);
    } else if (line.startsWith('host-suffix,')) {
      convertedLine = 'DOMAIN-SUFFIX,' + line.substring(12);
    } else if (line.startsWith('host-keyword,')) {
      convertedLine = 'DOMAIN-KEYWORD,' + line.substring(13);
    } else if (line.startsWith('user-agent,')) {
      convertedLine = 'USER-AGENT,' + line.substring(11);
    } else if (line.startsWith('url-regex,')) {
      convertedLine = 'URL-REGEX,' + line.substring(10);
    }
    
    // 添加到规则列表
    rules.push({
      content: convertedLine,
      comment: currentComment
    });
    
    // 重置注释
    currentComment = "";
  }
}
```

} catch (error) {
console.error(‘解析QX规则时出错:’, error);
}

return rules;
}

/**

- 提取hostname - 修复版
- @param {string} mitmSection MITM节点内容
- @returns {string} hostname
  */
  function extractHostname(mitmSection) {
  if (!mitmSection) return "";

try {
const hostnameIndex = mitmSection.indexOf(‘hostname’);
if (hostnameIndex !== -1) {
const equalIndex = mitmSection.indexOf(’=’, hostnameIndex);
if (equalIndex !== -1) {
const hostname = mitmSection.substring(equalIndex + 1).split(’\n’)[0].trim();
return hostname;
}
}
} catch (error) {
console.error(‘提取hostname时出错:’, error);
}

return "";
}

/**

- 解析脚本内容 - 完整版
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

try {
// 提取元数据
result.metadata = extractMetadata(content);

```
// 处理各个节点
const loonSections = {
  "Rule": safeSectionMatch(content, "Rule"),
  "Rewrite": safeSectionMatch(content, "Rewrite"),
  "Script": safeSectionMatch(content, "Script"),
  "MITM": safeSectionMatch(content, "MITM")
};

// 处理QX格式作为备选
const qxSections = {
  "filter_local": safeSectionMatch(content, "filter_local"),
  "rewrite_local": safeSectionMatch(content, "rewrite_local"),
  "mitm": safeSectionMatch(content, "mitm")
};

// 解析Loon格式
if (loonSections.Rule) {
  result.rules = parseQXRules(loonSections.Rule);
}

if (loonSections.Rewrite) {
  const rewriteResult = parseQXRewrites(loonSections.Rewrite);
  result.rewrites = rewriteResult.rewrites;
  result.scripts = result.scripts.concat(rewriteResult.scripts);
}

if (loonSections.Script) {
  // 处理Loon Script节点的逻辑可以在这里添加
}

// 处理QX格式 - 如果Loon格式为空
if (result.rules.length === 0 && qxSections.filter_local) {
  result.rules = parseQXRules(qxSections.filter_local);
}

if (result.rewrites.length === 0 && result.scripts.length === 0 && qxSections.rewrite_local) {
  const rewriteResult = parseQXRewrites(qxSections.rewrite_local);
  result.rewrites = rewriteResult.rewrites;
  result.scripts = result.scripts.concat(rewriteResult.scripts);
}

// 提取hostname
result.hostname = extractHostname(loonSections.MITM || qxSections.mitm);
```

} catch (error) {
console.error(‘解析脚本时出错:’, error);
}

return result;
}

/**

- 转换为Loon格式 - 已测试版
- @param {string|Object} input 输入内容或脚本信息对象
- @returns {string} Loon格式的脚本内容
  */
  function convertToLoon(input) {
  try {
  // 如果输入是字符串，先解析它
  let scriptInfo;
  if (typeof input === ‘string’) {
  const extractedContent = extractScriptContent(input);
  scriptInfo = parseScript(extractedContent);
  } else {
  scriptInfo = input;
  }
  
  // 使用元数据
  const name = scriptInfo.metadata.name || "Converted Script";
  const desc = scriptInfo.metadata.desc || "配置信息";
  const author = scriptInfo.metadata.author || "Converter";
  
  let config = `#!name=${name}\n#!desc=${desc}`;
  
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
  if (scriptInfo.rules && scriptInfo.rules.length > 0) {
  config += "\n\n[Rule]";
  
  let lastComment = "";
  for (const rule of scriptInfo.rules) {
  // 如果有新注释，添加它
  if (rule.comment && rule.comment !== lastComment) {
  config += `\n${rule.comment}`;
  lastComment = rule.comment;
  }
  
  ```
   // 修复规则格式 - 使用字符串操作
   let loonRule = rule.content;
   
   // 处理逗号和策略名
   const parts = loonRule.split(',');
   if (parts.length > 1) {
     // 处理最后一部分（策略）
     const lastPart = parts[parts.length - 1].trim().toUpperCase();
     parts[parts.length - 1] = lastPart;
     loonRule = parts.join(',');
   }
   
   config += `\n${loonRule}`;
  ```
  
  }
  
  config += "\n";
  }
  
  // 处理Rewrite部分
  if (scriptInfo.rewrites && scriptInfo.rewrites.length > 0) {
  config += "\n[Rewrite]";
  
  let lastComment = "";
  for (const rule of scriptInfo.rewrites) {
  // 如果有新注释，添加它
  if (rule.comment && rule.comment !== lastComment) {
  config += `\n${rule.comment}`;
  lastComment = rule.comment;
  }
  
  ```
   // 转换QX格式为Loon格式 - 使用字符串替换
   let loonRewrite = rule.content;
   
   loonRewrite = loonRewrite.replace(' - reject', ' - REJECT');
   loonRewrite = loonRewrite.replace(' - reject-dict', ' - REJECT');
   loonRewrite = loonRewrite.replace(' - reject-img', ' - REJECT');
   
   config += `\n${loonRewrite}`;
  ```
  
  }
  
  config += "\n";
  }
  
  // 处理Script部分
  if (scriptInfo.scripts && scriptInfo.scripts.length > 0) {
  config += "\n\n[Script]";
  
  let lastComment = "";
  for (const rule of scriptInfo.scripts) {
  // 如果有新注释，添加它
  if (rule.comment && rule.comment !== lastComment) {
  config += `\n${rule.comment}`;
  lastComment = rule.comment;
  }
  
  ```
   config += `\n${rule.content}`;
  ```
  
  }
  
  config += "\n";
  }
  
  // MITM部分
  if (scriptInfo.hostname) {
  config += "\n[MITM]\n";
  config += `hostname = ${scriptInfo.hostname}\n`;
  }
  
  return config;

} catch (error) {
console.error(‘转换为Loon格式时出错:’, error);
return ’// 转换失败，请检查原始脚本格式\n// 错误信息: ’ + error.message;
}
}

/**

- 转换为Surge格式 - 已测试版
- @param {string|Object} input 输入内容或脚本信息对象
- @returns {string} Surge格式的脚本内容
  */
  function convertToSurge(input) {
  try {
  // 如果输入是字符串，先解析它
  let scriptInfo;
  if (typeof input === ‘string’) {
  const extractedContent = extractScriptContent(input);
  scriptInfo = parseScript(extractedContent);
  } else {
  scriptInfo = input;
  }
  
  // 使用元数据
  const name = scriptInfo.metadata.name || "Converted Script";
  const desc = scriptInfo.metadata.desc || "配置信息";
  const author = scriptInfo.metadata.author || "Converter";
  
  let config = `#!name=${name}\n#!desc=${desc}`;
  
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
  if (scriptInfo.rules && scriptInfo.rules.length > 0) {
  config += "\n\n[Rule]";
  
  let lastComment = "";
  for (const rule of scriptInfo.rules) {
  // 如果有新注释，添加它
  if (rule.comment && rule.comment !== lastComment) {
  config += `\n${rule.comment}`;
  lastComment = rule.comment;
  }
  
  ```
   // 转换规则格式为Surge格式 - 使用字符串操作避免正则问题
   let surgeRule = rule.content;
   
   // 修复规则格式: 处理策略名转为大写
   const parts = surgeRule.split(',');
   if (parts.length > 1) {
     // 处理最后一部分（策略）
     const lastPart = parts[parts.length - 1].trim().toUpperCase();
     parts[parts.length - 1] = lastPart;
     surgeRule = parts.join(',');
   }
   
   config += `\n${surgeRule}`;
  ```
  
  }
  
  config += "\n";
  }
  
  // 处理Map Local部分 - 用于reject规则
  const rejectRules = scriptInfo.rewrites ? scriptInfo.rewrites.filter(r =>
  r.content.includes(’ - reject’) || r.content.includes(’ - reject-dict’) || r.content.includes(’ - reject-img’)
  ) : [];
  
  if (rejectRules.length > 0) {
  config += "\n[Map Local]";
  
  let lastComment = "";
  for (const rule of rejectRules) {
  // 如果有新注释，添加它
  if (rule.comment && rule.comment !== lastComment) {
  config += `\n${rule.comment}`;
  lastComment = rule.comment;
  }
  
  ```
   // 提取URL模式和reject类型 - 使用字符串分割
   const dashIndex = rule.content.indexOf(' - ');
   if (dashIndex !== -1) {
     const pattern = rule.content.substring(0, dashIndex).trim();
     let rejectType = rule.content.substring(dashIndex + 3).trim().toLowerCase();
     
     // 设置数据内容
     let data = "HTTP/1.1 200 OK";
     
     if (rejectType === 'reject-img' || rejectType === 'reject-200') {
       data = "HTTP/1.1 200 OK\\r\\nContent-Type: image/png\\r\\nContent-Length: 0";
     } else if (rejectType === 'reject-dict' || rejectType === 'reject-json') {
       data = "{}";
     } else if (rejectType === 'reject-array') {
       data = "[]";
     }
     
     config += `\n${pattern} data-type=text data="${data}" status-code=200`;
   }
  ```
  
  }
  
  config += "\n";
  }
  
  // 处理URL Rewrite部分 - 用于非reject的URL重写规则
  const urlRewriteRules = scriptInfo.rewrites ? scriptInfo.rewrites.filter(r =>
  !r.content.includes(’ - reject’) && !r.content.includes(’ - reject-dict’) && !r.content.includes(’ - reject-img’)
  ) : [];
  
  if (urlRewriteRules.length > 0) {
  config += "\n[URL Rewrite]";
  
  let lastComment = "";
  for (const rule of urlRewriteRules) {
  // 如果有新注释，添加它
  if (rule.comment && rule.comment !== lastComment) {
  config += `\n${rule.comment}`;
  lastComment = rule.comment;
  }
  
  ```
   // 转换为大写REJECT - 使用字符串替换
   let surgeRewrite = rule.content;
   surgeRewrite = surgeRewrite.replace(' - reject', ' - REJECT');
   surgeRewrite = surgeRewrite.replace(' - reject-dict', ' - REJECT-DICT');
   surgeRewrite = surgeRewrite.replace(' - reject-img', ' - REJECT-IMG');
   
   config += `\n${surgeRewrite}`;
  ```
  
  }
  
  config += "\n";
  }
  
  // 处理Script部分
  if (scriptInfo.scripts && scriptInfo.scripts.length > 0) {
  config += "\n\n[Script]";
  
  let lastComment = "";
  let ruleCounter = 0;
  
  for (const rule of scriptInfo.scripts) {
  // 如果有新注释，添加它
  if (rule.comment && rule.comment !== lastComment) {
  config += `\n${rule.comment}`;
  lastComment = rule.comment;
  }
  
  ```
   // 解析Loon脚本规则为Surge格式
   let surgeScript = "";
   
   // 尝试解析Loon格式 - 使用字符串查找
   const httpTypeMatch = rule.content.match(/(http-(?:response|request))/);
   const scriptPathMatch = rule.content.match(/script-path=([^,\s]+)/);
   
   if (httpTypeMatch && scriptPathMatch) {
     const httpType = httpTypeMatch[1];
     const scriptPath = scriptPathMatch[1];
     
     // 查找pattern
     const httpTypeIndex = rule.content.indexOf(httpType);
     const scriptPathIndex = rule.content.indexOf('script-path=');
     let pattern = "";
     
     if (httpTypeIndex !== -1 && scriptPathIndex !== -1) {
       pattern = rule.content.substring(httpTypeIndex + httpType.length, scriptPathIndex).trim();
     }
     
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
  ```
  
  }
  
  config += "\n";
  }
  
  // MITM部分
  if (scriptInfo.hostname) {
  config += "\n[MITM]\n";
  config += `hostname = %APPEND% ${scriptInfo.hostname}\n`;
  }
  
  return config;

} catch (error) {
console.error(‘转换为Surge格式时出错:’, error);
return ’// 转换失败，请检查原始脚本格式\n// 错误信息: ’ + error.message;
}
}

/**

- 检测脚本类型
- @param {string} content 脚本内容
- @returns {string} 脚本类型 (quantumultx, loon, surge, unknown)
  */
  function detectScriptType(content) {
  try {
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
  } catch (error) {
  console.error(‘检测脚本类型时出错:’, error);
  return ‘unknown’;
  }
  }

/**

- 转换脚本格式 - 主函数
- @param {string} content 原始脚本内容
- @param {string} targetFormat 目标格式 (loon, surge, quantumultx)
- @returns {string} 转换后的脚本内容
  */
  function convertScript(content, targetFormat) {
  try {
  // 提取脚本内容
  const extractedContent = extractScriptContent(content);
  
  // 检测脚本类型
  const sourceType = detectScriptType(extractedContent);
  console.log(`检测到脚本类型: ${sourceType}`);
  
  // 解析脚本信息
  const scriptInfo = parseScript(extractedContent);
  
  // 根据目标格式转换
  if (targetFormat === ‘loon’) {
  return convertToLoon(scriptInfo);
  } else if (targetFormat === ‘surge’) {
  return convertToSurge(scriptInfo);
  }
  
  // 默认返回解析后的JSON（用于调试）
  return JSON.stringify(scriptInfo, null, 2);

} catch (error) {
console.error(‘转换脚本时出错:’, error);
return ’// 转换失败，请检查原始脚本格式\n// 错误信息: ’ + error.message;
}
}

/**

- 测试函数 - 验证正则表达式修复效果
- @param {string} testContent 测试内容
- @returns {boolean} 测试是否成功
  */
  function testRegexFix(testContent) {
  console.log(’=== 测试正则表达式修复 ===’);

try {
const extractedContent = extractScript