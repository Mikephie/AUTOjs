/**

- Robust脚本转换器 - 专门处理包含特殊字符的脚本文件
- 版本: 2.2
- 更新时间: 2025-07-02
- 特点: 能处理包含各种特殊Unicode字符的脚本文件
  */

const fs = require(‘fs’).promises;
const path = require(‘path’);

/**

- 安全读取文件内容 - 处理特殊字符
  */
  async function safeReadFile(filePath) {
  try {
  // 尝试以UTF-8编码读取
  const content = await fs.readFile(filePath, ‘utf8’);
  return content;
  } catch (error) {
  console.error(‘UTF-8读取失败，尝试其他编码:’, error.message);
  try {
  // 如果UTF-8失败，尝试以binary方式读取然后转换
  const buffer = await fs.readFile(filePath);
  return buffer.toString(‘utf8’);
  } catch (secondError) {
  console.error(‘文件读取完全失败:’, secondError.message);
  throw secondError;
  }
  }
  }

/**

- 清理特殊字符 - 保留脚本功能的同时移除问题字符
  */
  function sanitizeContent(content) {
  // 移除可能导致解析问题的特殊Unicode字符，但保留基本的脚本结构
  let cleaned = content
  // 移除零宽字符
  .replace(/[\u200B-\u200D\uFEFF]/g, ‘’)
  // 移除控制字符（保留换行和制表符）
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, ‘’)
  // 移除一些可能有问题的Unicode字符，但保留常见的表情符号范围
  .replace(/[\u2000-\u206F]/g, ’ ’) // 通用标点
  // 保留基本的表情符号，但移除一些可能有问题的符号
  .replace(/[\u2190-\u21FF]/g, ‘’) // 箭头
  .replace(/[\u2600-\u26FF]/g, ‘’) // 杂项符号
  .replace(/[\u2700-\u27BF]/g, ‘’) // 装饰符号
  // 移除楔形文字等古老字符（这些经常出现在脚本装饰中）
  .replace(/[\u12000-\u123FF]/g, ‘’); // 楔形文字

return cleaned;
}

/**

- 从文件内容中提取脚本内容
  */
  function extractScriptContent(content) {
  // 先清理内容
  const cleanContent = sanitizeContent(content);

// 检查是否是被 /* */ 包裹的内容
const commentMatch = cleanContent.match(//*([\s\S]*)*//);
if (commentMatch && commentMatch[1]) {
return commentMatch[1].trim();
}

// 如果不是被注释包裹，则直接返回，但去掉多余的空行
return cleanContent.replace(/\n{3,}/g, "\n\n").trim();
}

/**

- 智能节点匹配函数 - 处理正则表达式边界问题
  */
  function safeSectionMatch(content, sectionName) {
  try {
  const startPattern = `[${sectionName}]`;
  const startIndex = content.indexOf(startPattern);
  
  if (startIndex === -1) {
  return null;
  }
  
  // 寻找下一个真正的节点标记
  let endIndex = content.length;
  let searchIndex = startIndex + startPattern.length;
  
  while (searchIndex < content.length) {
  const nextBracketIndex = content.indexOf(’[’, searchIndex);
  if (nextBracketIndex === -1) break;
  
  // 检查这个 [ 是否是行首的节点标记
  const lineStart = content.lastIndexOf(’\n’, nextBracketIndex);
  const beforeBracket = content.substring(lineStart + 1, nextBracketIndex).trim();
  
  // 如果 [ 前面是空的（即在行首）
  if (beforeBracket === ‘’) {
  const closeBracketIndex = content.indexOf(’]’, nextBracketIndex);
  if (closeBracketIndex !== -1) {
  const candidateName = content.substring(nextBracketIndex + 1, closeBracketIndex);
  // 检查是否是有效的节点名
  if (/^[a-zA-Z]*$/.test(candidateName)) {
  endIndex = nextBracketIndex;
  break;
  }
  }
  }
  
  searchIndex = nextBracketIndex + 1;
  }
  
  const sectionContent = content.substring(startIndex + startPattern.length, endIndex).trim();
  return sectionContent;

} catch (error) {
console.error(`解析节点 ${sectionName} 时出错:`, error);
return null;
}
}

/**

- 提取元数据
  */
  function extractMetadata(content) {
  const metadata = {};

// 基本元数据提取
const patterns = {
name: /#!name\s*=\s*(.+?)(?:\r?\n|$)/i,
desc: /#!desc\s*=\s*(.+?)(?:\r?\n|$)/i,
category: /#!category\s*=\s*(.+?)(?:\r?\n|$)/i,
author: /#!author\s*=\s*(.+?)(?:\r?\n|$)/i,
icon: /#!icon\s*=\s*(.+?)(?:\r?\n|$)/i
};

for (const [field, pattern] of Object.entries(patterns)) {
try {
const match = content.match(pattern);
if (match && match[1]) {
// 清理提取的值
metadata[field] = sanitizeContent(match[1]).trim();
}
} catch (error) {
console.error(`提取 ${field} 时出错:`, error);
}
}

// 备用提取方式
if (!metadata.name) {
const fallbackPatterns = [
///\s*@name\s+(.+?)(?:\r?\n|$)/i,
///\s*名称[:\s]+(.+?)(?:\r?\n|$)/i,
//**\s**\s*(.+?)(?:\r?\n|*)/i
];

```
for (const pattern of fallbackPatterns) {
  const match = content.match(pattern);
  if (match && match[1]) {
    metadata.name = sanitizeContent(match[1]).trim();
    break;
  }
}
```

}

// 设置默认值
if (!metadata.name) {
metadata.name = "Converted Script";
}
if (!metadata.desc) {
metadata.desc = "Converted configuration";
}
if (!metadata.author) {
metadata.author = "Script Converter";
}

return metadata;
}

/**

- 解析QX重写规则
  */
  function parseQXRewrites(sectionContent) {
  const result = { scripts: [], rewrites: [] };

if (!sectionContent) return result;

try {
const lines = sectionContent.split(/\r?\n/);
let currentComment = "";

```
for (let line of lines) {
  line = line.trim();
  if (!line) continue;
  
  if (line.startsWith('#')) {
    currentComment = line;
  } else if (line.includes(' - ')) {
    // 普通重写规则
    result.rewrites.push({
      content: line,
      comment: currentComment
    });
    currentComment = "";
  } else if (line.includes(' url ')) {
    // 脚本重写规则
    const urlIndex = line.indexOf(' url ');
    const pattern = line.substring(0, urlIndex).trim();
    const action = line.substring(urlIndex + 5).trim();
    
    if (action.startsWith('reject')) {
      result.rewrites.push({
        content: `${pattern} - ${action}`,
        comment: currentComment
      });
    } else if (action.startsWith('script-')) {
      const parts = action.split(/\s+/);
      const scriptType = parts[0];
      const scriptPath = parts[1] || '';
      
      const httpType = scriptType.includes('response') ? 'http-response' : 'http-request';
      const requiresBody = scriptType.includes('body') ? 'true' : 'false';
      
      let tag = "script";
      if (scriptPath.includes('/')) {
        const fileName = scriptPath.split('/').pop();
        const scriptName = fileName ? fileName.split('.')[0] : '';
        if (scriptName) tag = scriptName;
      }
      
      result.scripts.push({
        content: `${httpType} ${pattern} script-path=${scriptPath}, requires-body=${requiresBody}, timeout=60, tag=${tag}`,
        comment: currentComment
      });
    }
    currentComment = "";
  }
}
```

} catch (error) {
console.error(‘解析QX重写规则时出错:’, error);
}

return result;
}

/**

- 解析QX过滤规则
  */
  function parseQXRules(sectionContent) {
  const rules = [];

if (!sectionContent) return rules;

try {
const lines = sectionContent.split(/\r?\n/);
let currentComment = "";

```
for (let line of lines) {
  line = line.trim();
  if (!line) continue;
  
  if (line.startsWith('#')) {
    currentComment = line;
  } else {
    let convertedLine = line;
    
    // 转换QX规则格式
    const conversions = [
      ['host,', 'DOMAIN,'],
      ['host-suffix,', 'DOMAIN-SUFFIX,'],
      ['host-keyword,', 'DOMAIN-KEYWORD,'],
      ['user-agent,', 'USER-AGENT,'],
      ['url-regex,', 'URL-REGEX,']
    ];
    
    for (const [from, to] of conversions) {
      if (line.startsWith(from)) {
        convertedLine = to + line.substring(from.length);
        break;
      }
    }
    
    rules.push({
      content: convertedLine,
      comment: currentComment
    });
    
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

- 提取hostname
  */
  function extractHostname(mitmSection) {
  if (!mitmSection) return "";

try {
const hostnamePattern = /hostname\s*=\s*([^\r\n]+)/i;
const match = mitmSection.match(hostnamePattern);
if (match && match[1]) {
return match[1].trim();
}
} catch (error) {
console.error(‘提取hostname时出错:’, error);
}

return "";
}

/**

- 解析脚本内容
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
// 解析各个节点
const sections = {
  // Loon格式
  Rule: safeSectionMatch(content, "Rule"),
  Rewrite: safeSectionMatch(content, "Rewrite"),
  Script: safeSectionMatch(content, "Script"),
  MITM: safeSectionMatch(content, "MITM"),
  // QX格式
  filter_local: safeSectionMatch(content, "filter_local"),
  rewrite_local: safeSectionMatch(content, "rewrite_local"),
  mitm: safeSectionMatch(content, "mitm")
};

// 优先解析Loon格式
if (sections.Rule) {
  result.rules = parseQXRules(sections.Rule);
} else if (sections.filter_local) {
  result.rules = parseQXRules(sections.filter_local);
}

if (sections.Rewrite) {
  const rewriteResult = parseQXRewrites(sections.Rewrite);
  result.rewrites = rewriteResult.rewrites;
  result.scripts = result.scripts.concat(rewriteResult.scripts);
} else if (sections.rewrite_local) {
  const rewriteResult = parseQXRewrites(sections.rewrite_local);
  result.rewrites = rewriteResult.rewrites;
  result.scripts = result.scripts.concat(rewriteResult.scripts);
}

// 提取hostname
result.hostname = extractHostname(sections.MITM || sections.mitm);
```

} catch (error) {
console.error(‘解析脚本时出错:’, error);
}

return result;
}

/**

- 转换为Loon格式
  */
  function convertToLoon(input) {
  try {
  let scriptInfo;
  if (typeof input === ‘string’) {
  const extractedContent = extractScriptContent(input);
  scriptInfo = parseScript(extractedContent);
  } else {
  scriptInfo = input;
  }
  
  const { name, desc, category, author, icon } = scriptInfo.metadata;
  
  let config = `#!name=${name}\n#!desc=${desc}`;
  
  if (category) config += `\n#!category=${category}`;
  config += `\n#!author=${author}`;
  if (icon) config += `\n#!icon=${icon}`;
  
  // Rules
  if (scriptInfo.rules.length > 0) {
  config += "\n\n[Rule]";
  let lastComment = "";
  
  for (const rule of scriptInfo.rules) {
  if (rule.comment && rule.comment !== lastComment) {
  config += `\n${rule.comment}`;
  lastComment = rule.comment;
  }
  
  ```
   let ruleContent = rule.content;
   // 确保策略名为大写
   const parts = ruleContent.split(',');
   if (parts.length > 1) {
     parts[parts.length - 1] = parts[parts.length - 1].trim().toUpperCase();
     ruleContent = parts.join(',');
   }
   
   config += `\n${ruleContent}`;
  ```
  
  }
  config += "\n";
  }
  
  // Rewrites
  if (scriptInfo.rewrites.length > 0) {
  config += "\n[Rewrite]";
  let lastComment = "";
  
  for (const rule of scriptInfo.rewrites) {
  if (rule.comment && rule.comment !== lastComment) {
  config += `\n${rule.comment}`;
  lastComment = rule.comment;
  }
  
  ```
   let rewriteContent = rule.content
     .replace(' - reject', ' - REJECT')
     .replace(' - reject-dict', ' - REJECT')
     .replace(' - reject-img', ' - REJECT');
   
   config += `\n${rewriteContent}`;
  ```
  
  }
  config += "\n";
  }
  
  // Scripts
  if (scriptInfo.scripts.length > 0) {
  config += "\n\n[Script]";
  let lastComment = "";
  
  for (const rule of scriptInfo.scripts) {
  if (rule.comment && rule.comment !== lastComment) {
  config += `\n${rule.comment}`;
  lastComment = rule.comment;
  }
  config += `\n${rule.content}`;
  }
  config += "\n";
  }
  
  // MITM
  if (scriptInfo.hostname) {
  config += "\n[MITM]\n";
  config += `hostname = ${scriptInfo.hostname}\n`;
  }
  
  return config;

} catch (error) {
console.error(‘转换为Loon格式时出错:’, error);
return `// 转换失败: ${error.message}`;
}
}

/**

- 转换为Surge格式
  */
  function convertToSurge(input) {
  try {
  let scriptInfo;
  if (typeof input === ‘string’) {
  const extractedContent = extractScriptContent(input);
  scriptInfo = parseScript(extractedContent);
  } else {
  scriptInfo = input;
  }
  
  const { name, desc, category, author, icon } = scriptInfo.metadata;
  
  let config = `#!name=${name}\n#!desc=${desc}`;
  
  if (category) config += `\n#!category=${category}`;
  config += `\n#!author=${author}`;
  if (icon) config += `\n#!icon=${icon}`;
  
  // Rules
  if (scriptInfo.rules.length > 0) {
  config += "\n\n[Rule]";
  let lastComment = "";
  
  for (const rule of scriptInfo.rules) {
  if (rule.comment && rule.comment !== lastComment) {
  config += `\n${rule.comment}`;
  lastComment = rule.comment;
  }
  
  ```
   let ruleContent = rule.content;
   const parts = ruleContent.split(',');
   if (parts.length > 1) {
     parts[parts.length - 1] = parts[parts.length - 1].trim().toUpperCase();
     ruleContent = parts.join(',');
   }
   
   config += `\n${ruleContent}`;
  ```
  
  }
  config += "\n";
  }
  
  // Map Local (for reject rules)
  const rejectRules = scriptInfo.rewrites.filter(r =>
  r.content.includes(’ - reject’)
  );
  
  if (rejectRules.length > 0) {
  config += "\n[Map Local]";
  let lastComment = "";
  
  for (const rule of rejectRules) {
  if (rule.comment && rule.comment !== lastComment) {
  config += `\n${rule.comment}`;
  lastComment = rule.comment;
  }
  
  ```
   const dashIndex = rule.content.indexOf(' - ');
   if (dashIndex !== -1) {
     const pattern = rule.content.substring(0, dashIndex).trim();
     const rejectType = rule.content.substring(dashIndex + 3).trim().toLowerCase();
     
     let data = "HTTP/1.1 200 OK";
     if (rejectType.includes('img')) {
       data = "HTTP/1.1 200 OK\\r\\nContent-Type: image/png\\r\\nContent-Length: 0";
     } else if (rejectType.includes('dict') || rejectType.includes('json')) {
       data = "{}";
     } else if (rejectType.includes('array')) {
       data = "[]";
     }
     
     config += `\n${pattern} data-type=text data="${data}" status-code=200`;
   }
  ```
  
  }
  config += "\n";
  }
  
  // Scripts
  if (scriptInfo.scripts.length > 0) {
  config += "\n\n[Script]";
  let lastComment = "";
  
  for (const rule of scriptInfo.scripts) {
  if (rule.comment && rule.comment !== lastComment) {
  config += `\n${rule.comment}`;
  lastComment = rule.comment;
  }
  
  ```
   // 转换Loon脚本格式为Surge格式
   const httpMatch = rule.content.match(/(http-(?:request|response))\s+(.+?)\s+script-path=([^,\s]+)/);
   if (httpMatch) {
     const [, httpType, pattern, scriptPath] = httpMatch;
     const requiresBody = rule.content.includes('requires-body=true') ? '1' : '0';
     const tagMatch = rule.content.match(/tag=([^,\s]+)/);
     const scriptName = tagMatch ? tagMatch[1] : name;
     
     config += `\n${scriptName} = type=${httpType}, pattern=${pattern}, requires-body=${requiresBody}, script-path=${scriptPath}, timeout=60`;
   } else {
     config += `\n${rule.content}`;
   }
  ```
  
  }
  config += "\n";
  }
  
  // MITM
  if (scriptInfo.hostname) {
  config += "\n[MITM]\n";
  config += `hostname = %APPEND% ${scriptInfo.hostname}\n`;
  }
  
  return config;

} catch (error) {
console.error(‘转换为Surge格式时出错:’, error);
return `// 转换失败: ${error.message}`;
}
}

/**

- 主转换函数
  */
  function convertScript(content, targetFormat) {
  try {
  const extractedContent = extractScriptContent(content);
  
  if (targetFormat === ‘loon’) {
  return convertToLoon(extractedContent);
  } else if (targetFormat === ‘surge’) {
  return convertToSurge(extractedContent);
  } else {
  return `// 不支持的目标格式: ${targetFormat}`;
  }

} catch (error) {
console.error(‘转换脚本时出错:’, error);
return `// 转换失败: ${error.message}`;
}
}

/**

- 从文件转换
  */
  async function convertScriptFromFile(filePath, targetFormat) {
  try {
  const content = await safeReadFile(filePath);
  return convertScript(content, targetFormat);
  } catch (error) {
  console.error(‘从文件转换时出错:’, error);
  return `// 文件读取失败: ${error.message}`;
  }
  }

module.exports = {
convertScript,
convertScriptFromFile,
convertToLoon,
convertToSurge,
extractScriptContent,
parseScript,
safeReadFile,
sanitizeContent
};