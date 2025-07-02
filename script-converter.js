/**

- 脚本转换器 v2.1 - 干净版本
- 最后更新: 2025-07-02
- 修复内容: 解决正则表达式特殊字符导致的解析失败问题
- 移除特殊字符: 确保在所有Node.js环境中正常运行
  */

const fs = require(‘fs’).promises;
const path = require(‘path’);

/**

- 从文件内容中提取脚本内容
  */
  function extractScriptContent(content) {
  const commentMatch = content.match(//*([\s\S]*)*//);
  if (commentMatch && commentMatch[1]) {
  return commentMatch[1].trim();
  }
  return content.replace(/\n{3,}/g, "\n\n").trim();
  }

/**

- 智能节点匹配函数 - 修复正则表达式解析问题
  */
  function safeSectionMatch(content, sectionName) {
  try {
  const startPattern = `[${sectionName}]`;
  const startIndex = content.indexOf(startPattern);
  
  if (startIndex === -1) {
  return null;
  }
  
  let endIndex = content.length;
  let searchIndex = startIndex + startPattern.length;
  
  while (searchIndex < content.length) {
  const nextBracketIndex = content.indexOf(’[’, searchIndex);
  if (nextBracketIndex === -1) break;
  
  const lineStart = content.lastIndexOf(’\n’, nextBracketIndex);
  const beforeBracket = content.substring(lineStart + 1, nextBracketIndex).trim();
  
  if (beforeBracket === ‘’) {
  const closeBracketIndex = content.indexOf(’]’, nextBracketIndex);
  if (closeBracketIndex !== -1) {
  const sectionNameCandidate = content.substring(nextBracketIndex + 1, closeBracketIndex);
  if (/^[a-zA-Z_-]+$/.test(sectionNameCandidate)) {
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
console.error(‘解析节点时出错:’, error);
return null;
}
}

/**

- 提取元数据
  */
  function extractMetadata(content) {
  const metadata = {};

const metadataFields = {
name: /#!name\s*=\s*(.+?)($|\n)/i,
desc: /#!desc\s*=\s*(.+?)($|\n)/i,
category: /#!category\s*=\s*(.+?)($|\n)/i,
author: /#!author\s*=\s*(.+?)($|\n)/i,
icon: /#!icon\s*=\s*(.+?)($|\n)/i
};

for (const [field, pattern] of Object.entries(metadataFields)) {
try {
const match = content.match(pattern);
if (match && match[1]) {
metadata[field] = match[1].trim();
}
} catch (error) {
console.error(‘提取元数据字段时出错:’, error);
}
}

if (!metadata.name) {
try {
const nameMatch = content.match(///\s*@name\s+(.+?)(?:\n|$)/i);
if (nameMatch) {
metadata.name = nameMatch[1].trim();
}

```
  const descMatch = content.match(/\/\/\s*@desc(?:ription)?\s+(.+?)(?:\n|$)/i);
  if (descMatch) {
    metadata.desc = descMatch[1].trim();
  }
  
  const authorMatch = content.match(/\/\/\s*@author\s+(.+?)(?:\n|$)/i);
  if (authorMatch) {
    metadata.author = authorMatch[1].trim();
  }
} catch (error) {
  console.error('提取备用元数据时出错:', error);
}
```

}

if (!metadata.name) {
metadata.name = "Converted Script";
}

return metadata;
}

/**

- 解析QX重写规则
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
    currentComment = line;
  } else if (line.includes(' - ')) {
    result.rewrites.push({
      content: line,
      comment: currentComment
    });
    currentComment = "";
  } else if (line.includes(' url ')) {
    const urlIndex = line.indexOf(' url ');
    if (urlIndex !== -1) {
      const pattern = line.substring(0, urlIndex).trim();
      const action = line.substring(urlIndex + 5).trim();
      
      if (action.startsWith('reject')) {
        result.rewrites.push({
          content: `${pattern} - ${action}`,
          comment: currentComment
        });
      } else if (action.startsWith('script-')) {
        const actionParts = action.split(' ');
        const scriptType = actionParts[0];
        let scriptPath = actionParts[1] || '';
        
        const httpType = scriptType.includes('response') ? 'http-response' : 'http-request';
        const requiresBody = scriptType.includes('body') ? 'true' : 'false';
        
        let tag = "script";
        if (scriptPath && scriptPath.includes('/')) {
          const pathParts = scriptPath.split('/');
          const fileName = pathParts[pathParts.length - 1];
          if (fileName) {
            const scriptName = fileName.split('.')[0];
            if (scriptName) tag = scriptName;
          }
        }
        
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

- 解析QX规则
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
    currentComment = line;
  } else {
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
result.metadata = extractMetadata(content);

```
const loonSections = {
  "Rule": safeSectionMatch(content, "Rule"),
  "Rewrite": safeSectionMatch(content, "Rewrite"),
  "Script": safeSectionMatch(content, "Script"),
  "MITM": safeSectionMatch(content, "MITM")
};

const qxSections = {
  "filter_local": safeSectionMatch(content, "filter_local"),
  "rewrite_local": safeSectionMatch(content, "rewrite_local"),
  "mitm": safeSectionMatch(content, "mitm")
};

if (loonSections.Rule) {
  result.rules = parseQXRules(loonSections.Rule);
}

if (loonSections.Rewrite) {
  const rewriteResult = parseQXRewrites(loonSections.Rewrite);
  result.rewrites = rewriteResult.rewrites;
  result.scripts = result.scripts.concat(rewriteResult.scripts);
}

if (result.rules.length === 0 && qxSections.filter_local) {
  result.rules = parseQXRules(qxSections.filter_local);
}

if (result.rewrites.length === 0 && result.scripts.length === 0 && qxSections.rewrite_local) {
  const rewriteResult = parseQXRewrites(qxSections.rewrite_local);
  result.rewrites = rewriteResult.rewrites;
  result.scripts = result.scripts.concat(rewriteResult.scripts);
}

result.hostname = extractHostname(loonSections.MITM || qxSections.mitm);
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
  
  const name = scriptInfo.metadata.name || "Converted Script";
  const desc = scriptInfo.metadata.desc || "配置信息";
  const author = scriptInfo.metadata.author || "Converter";
  
  let config = `#!name=${name}\n#!desc=${desc}`;
  
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
  
  if (scriptInfo.rules && scriptInfo.rules.length > 0) {
  config += "\n\n[Rule]";
  
  let lastComment = "";
  for (const rule of scriptInfo.rules) {
  if (rule.comment && rule.comment !== lastComment) {
  config += `\n${rule.comment}`;
  lastComment = rule.comment;
  }
  
  ```
   let loonRule = rule.content;
   
   const parts = loonRule.split(',');
   if (parts.length > 1) {
     const lastPart = parts[parts.length - 1].trim().toUpperCase();
     parts[parts.length - 1] = lastPart;
     loonRule = parts.join(',');
   }
   
   config += `\n${loonRule}`;
  ```
  
  }
  
  config += "\n";
  }
  
  if (scriptInfo.rewrites && scriptInfo.rewrites.length > 0) {
  config += "\n[Rewrite]";
  
  let lastComment = "";
  for (const rule of scriptInfo.rewrites) {
  if (rule.comment && rule.comment !== lastComment) {
  config += `\n${rule.comment}`;
  lastComment = rule.comment;
  }
  
  ```
   let loonRewrite = rule.content;
   
   loonRewrite = loonRewrite.replace(' - reject', ' - REJECT');
   loonRewrite = loonRewrite.replace(' - reject-dict', ' - REJECT');
   loonRewrite = loonRewrite.replace(' - reject-img', ' - REJECT');
   
   config += `\n${loonRewrite}`;
  ```
  
  }
  
  config += "\n";
  }
  
  if (scriptInfo.scripts && scriptInfo.scripts.length > 0) {
  config += "\n\n[Script]";
  
  let lastComment = "";
  for (const rule of scriptInfo.scripts) {
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
  
  const name = scriptInfo.metadata.name || "Converted Script";
  const desc = scriptInfo.metadata.desc || "配置信息";
  const author = scriptInfo.metadata.author || "Converter";
  
  let config = `#!name=${name}\n#!desc=${desc}`;
  
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
  
  if (scriptInfo.rules && scriptInfo.rules.length > 0) {
  config += "\n\n[Rule]";
  
  let lastComment = "";
  for (const rule of scriptInfo.rules) {
  if (rule.comment && rule.comment !== lastComment) {
  config += `\n${rule.comment}`;
  lastComment = rule.comment;
  }
  
  ```
   let surgeRule = rule.content;
   
   const parts = surgeRule.split(',');
   if (parts.length > 1) {
     const lastPart = parts[parts.length - 1].trim().toUpperCase();
     parts[parts.length - 1] = lastPart;
     surgeRule = parts.join(',');
   }
   
   config += `\n${surgeRule}`;
  ```
  
  }
  
  config += "\n";
  }
  
  const rejectRules = scriptInfo.rewrites ? scriptInfo.rewrites.filter(r =>
  r.content.includes(’ - reject’) || r.content.includes(’ - reject-dict’) || r.content.includes(’ - reject-img’)
  ) : [];
  
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
     let rejectType = rule.content.substring(dashIndex + 3).trim().toLowerCase();
     
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
  
  const urlRewriteRules = scriptInfo.rewrites ? scriptInfo.rewrites.filter(r =>
  !r.content.includes(’ - reject’) && !r.content.includes(’ - reject-dict’) && !r.content.includes(’ - reject-img’)
  ) : [];
  
  if (urlRewriteRules.length > 0) {
  config += "\n[URL Rewrite]";
  
  let lastComment = "";
  for (const rule of urlRewriteRules) {
  if (rule.comment && rule.comment !== lastComment) {
  config += `\n${rule.comment}`;
  lastComment = rule.comment;
  }
  
  ```
   let surgeRewrite = rule.content;
   surgeRewrite = surgeRewrite.replace(' - reject', ' - REJECT');
   surgeRewrite = surgeRewrite.replace(' - reject-dict', ' - REJECT-DICT');
   surgeRewrite = surgeRewrite.replace(' - reject-img', ' - REJECT-IMG');
   
   config += `\n${surgeRewrite}`;
  ```
  
  }
  
  config += "\n";
  }
  
  if (scriptInfo.scripts && scriptInfo.scripts.length > 0) {
  config += "\n\n[Script]";
  
  let lastComment = "";
  let ruleCounter = 0;
  
  for (const rule of scriptInfo.scripts) {
  if (rule.comment && rule.comment !== lastComment) {
  config += `\n${rule.comment}`;
  lastComment = rule.comment;
  }
  
  ```
   let surgeScript = "";
   
   const httpTypeMatch = rule.content.match(/(http-(?:response|request))/);
   const scriptPathMatch = rule.content.match(/script-path=([^,\s]+)/);
   
   if (httpTypeMatch && scriptPathMatch) {
     const httpType = httpTypeMatch[1];
     const scriptPath = scriptPathMatch[1];
     
     const httpTypeIndex = rule.content.indexOf(httpType);
     const scriptPathIndex = rule.content.indexOf('script-path=');
     let pattern = "";
     
     if (httpTypeIndex !== -1 && scriptPathIndex !== -1) {
       pattern = rule.content.substring(httpTypeIndex + httpType.length, scriptPathIndex).trim();
     }
     
     const requiresBody = rule.content.includes('requires-body=true') ? '1' : '0';
     
     let scriptName = "";
     const tagMatch = rule.content.match(/tag=([^,\s]+)/);
     if (tagMatch) {
       scriptName = tagMatch[1];
     } else {
       scriptName = ruleCounter === 0 ? name : `${name}_${ruleCounter+1}`;
     }
     
     surgeScript = `${scriptName} = type=${httpType}, pattern=${pattern}, requires-body=${requiresBody}, script-path=${scriptPath}, timeout=60`;
   } else {
     surgeScript = rule.content;
   }
   
   config += `\n${surgeScript}`;
   ruleCounter++;
  ```
  
  }
  
  config += "\n";
  }
  
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
  */
  function detectScriptType(content) {
  try {
  if (content.includes(’#!name=’) &&
  (content.includes(’[Rewrite]’) || content.includes(’[Script]’))) {
  return ‘loon’;
  }
  
  if (content.includes(’#!name=’) &&
  (content.includes(’[Script]’) || content.includes(’[Rule]’)) &&
  (content.includes(‘type=http-response’) || content.includes(‘type=cron’))) {
  return ‘surge’;
  }
  
  if ((content.includes(’[rewrite_local]’) || content.includes(’[filter_local]’)) ||
  content.includes(‘url script-’) ||
  content.includes(’// @author’) ||
  content.includes(’// @name’)) {
  return ‘quantumultx’;
  }
  
  return ‘unknown’;
  } catch (error) {
  console.error(‘检测脚本类型时出错:’, error);
  return ‘unknown’;
  }
  }

/**

- 转换脚本格式 - 主函数
  */
  function convertScript(content, targetFormat) {
  try {
  const extractedContent = extractScriptContent(content);
  const sourceType = detectScriptType(extractedContent);
  console.log(‘检测到脚本类型:’, sourceType);
  
  const scriptInfo = parseScript(extractedContent);
  
  if (targetFormat === ‘loon’) {
  return convertToLoon(scriptInfo);
  } else if (targetFormat === ‘surge’) {
  return convertToSurge(scriptInfo);
  }
  
  return JSON.stringify(scriptInfo, null, 2);

} catch (error) {
console.error(‘转换脚本时出错:’, error);
return ’// 转换失败，请检查原始脚本格式\n// 错误信息: ’ + error.message;
}
}

/**

- 测试函数
  */
  function testRegexFix(testContent) {
  console.log(’=== 测试正则表达式修复 ===’);

try {
const extractedContent = extractScriptContent(testContent);
const result = parseScript(extractedContent);

```
console.log('解析成功!');
console.log('规则数量:', result.rules.length);
console.log('重写数量:', result.rewrites.length);
console.log('脚本数量:', result.scripts.length);
console.log('Hostname:', result.hostname);

return true;
```

} catch (error) {
console.error(‘解析失败:’, error);
return false;
}
}

/**

- 运行测试
  */
  function runTests() {
  const testContent = `
  /*
  #!name=Bizhi壁纸
  #!desc=图像壁纸
  #!category=APP
  #!author=Author
  #!icon=https://example.com/icon.png
  [rewrite_local]
  ^https://leancloud.emotionwp.com/1.1/classes/wpf_[a-z]+ url script-response-body https://example.com/script.js

[MITM]
hostname = leancloud.emotionwp.com
*/
`;

console.log(‘开始测试…’);
const success = testRegexFix(testContent);

if (success) {
console.log(’\n转换为Loon格式:’);
const loonResult = convertToLoon(testContent);
console.log(loonResult);

```
console.log('\n转换为Surge格式:');
const surgeResult = convertToSurge(testContent);
console.log(surgeResult);
```

}

return success;
}

// 导出所有函数
module.exports = {
extractScriptContent,
parseScript,
convertToLoon,
convertToSurge,
convertScript,
detectScriptType,
testRegexFix,
runTests,
safeSectionMatch,
extractMetadata,
parseQXRewrites,
parseQXRules,
extractHostname
};

// 如果直接运行此文件，执行测试
if (require.main === module) {
runTests();
}