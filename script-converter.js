/**

- 优化版脚本转换器模块 - 完整版 v2.0
- 修复：支持完整脚本文件的动态提取和转换
  */

const fs = require(‘fs’).promises;
const path = require(‘path’);

/**

- 从文件内容中提取脚本内容 - 增强版
- @param {string} content 文件内容
- @returns {Object} 提取的脚本内容
  */
  function extractScriptContent(content) {
  const result = {
  config: ‘’,
  code: ‘’,
  fullContent: content
  };

// 检查是否是被 /* */ 包裹的内容
const commentMatch = content.match(//*([\s\S]*?)*//);
if (commentMatch) {
result.config = commentMatch[1].trim();

```
// 提取配置之后的代码部分
const configEnd = commentMatch.index + commentMatch[0].length;
result.code = content.substring(configEnd).trim();

return result;
```

}

// 如果不是被注释包裹，整个内容都是配置
result.config = content.trim();
return result;
}

/**

- 解析脚本内容 - 增强版
- @param {string} content 脚本内容
- @returns {Object} 解析结果
  */
  function parseScript(content) {
  // 首先提取配置和代码
  const extracted = typeof content === ‘object’ ? content : extractScriptContent(content);

const result = {
metadata: {},
rules: [],
rewrites: [],
scripts: [],
hostname: "",
originalCode: extracted.code,  // 保存原始JavaScript代码
hasCode: extracted.code && extracted.code.length > 0
};

// 使用配置部分进行解析
const configContent = extracted.config || extracted.fullContent || content;

// 提取元数据
extractMetadata(configContent, result);

// 处理节点 - 支持大小写
const sections = {
// Loon格式
"Rule": configContent.match(/[Rule]([\s\S]*?)(?=[|$)/i),
"Rewrite": configContent.match(/[Rewrite]([\s\S]*?)(?=[|$)/i),
"Script": configContent.match(/[Script]([\s\S]*?)(?=[|$)/i),
"MITM": configContent.match(/[MITM]([\s\S]*?)(?=[|$)/i),

```
// QX格式
"filter_local": configContent.match(/\[filter_local\]([\s\S]*?)(?=\[|$)/i),
"rewrite_local": configContent.match(/\[rewrite_local\]([\s\S]*?)(?=\[|$)/i),
"mitm": configContent.match(/\[(mitm|MITM)\]([\s\S]*?)(?=\[|$)/i)
```

};

// 修正QX mitm匹配（支持大小写）
if (sections.mitm && sections.mitm[2]) {
sections.mitm[1] = sections.mitm[2];
}

// 解析Loon格式
if (sections.Rule && sections.Rule[1]) {
parseSectionWithComments(sections.Rule[1], result.rules);
}

if (sections.Rewrite && sections.Rewrite[1]) {
parseSectionWithComments(sections.Rewrite[1], result.rewrites);
}

if (sections.Script && sections.Script[1]) {
parseSectionWithComments(sections.Script[1], result.scripts);
}

// 处理QX格式
if (sections.filter_local && sections.filter_local[1]) {
parseQXRules(sections.filter_local[1], result);
}

if (sections.rewrite_local && sections.rewrite_local[1]) {
parseQXRewrites(sections.rewrite_local[1], result);
}

// 提取hostname - 优先Loon格式，然后QX格式
if (sections.MITM && sections.MITM[1]) {
const hostnameMatch = sections.MITM[1].match(/hostname\s*=\s*([^\n]+)/i);
if (hostnameMatch && hostnameMatch[1]) {
result.hostname = hostnameMatch[1].trim();
}
} else if (sections.mitm && sections.mitm[1]) {
const hostnameMatch = sections.mitm[1].match(/hostname\s*=\s*([^\n]+)/i);
if (hostnameMatch && hostnameMatch[1]) {
result.hostname = hostnameMatch[1].trim();
}
}

// 分析JavaScript代码特征
if (result.hasCode) {
result.codeFeatures = analyzeCode(result.originalCode);
}

return result;
}

/**

- 分析JavaScript代码特征
  */
  function analyzeCode(code) {
  return {
  hasNotification: code.includes(’$notification.post’),
  usesPersistentStore: code.includes(’$persistentStore’),
  usesPrefs: code.includes(’$prefs’),
  modifiesResponse: code.includes(’$response’),
  modifiesRequest: code.includes(’$request’),
  hasTimerLogic: code.includes(‘setTimeout’) || code.includes(‘setInterval’)
  };
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
  icon: /#!icon\s*=\s*(.+?)($|\n)/i,
  homepage: /#!homepage\s*=\s*(.+?)($|\n)/i
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
const nameMatch = content.match(///\s*@name\s+(.+?)(?:\n|$)/i);
if (nameMatch) {
result.metadata.name = nameMatch[1].trim();
}
}

// 默认值
if (!result.metadata.name) {
result.metadata.name = "Converted Script";
}
if (!result.metadata.author) {
result.metadata.author = "Unknown";
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

- 解析QX规则 - 增强版
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
  currentComment = line;
} else {
  let convertedLine = line;
  
  // 处理 url-regex 格式
  if (line.startsWith('url-regex,')) {
    const parts = line.split(',');
    if (parts.length >= 3) {
      const pattern = parts[1];
      const action = parts[2];
      convertedLine = `URL-REGEX,${pattern},${action.toUpperCase()}`;
    }
  }
  // 处理其他QX特定规则格式
  else if (line.startsWith('host,')) {
    convertedLine = line.replace(/^host,/i, 'DOMAIN,');
  } else if (line.startsWith('host-suffix,')) {
    convertedLine = line.replace(/^host-suffix,/i, 'DOMAIN-SUFFIX,');
  } else if (line.startsWith('host-keyword,')) {
    convertedLine = line.replace(/^host-keyword,/i, 'DOMAIN-KEYWORD,');
  } else if (line.startsWith('user-agent,')) {
    convertedLine = line.replace(/^user-agent,/i, 'USER-AGENT,');
  }
  
  // 确保策略名称大写
  convertedLine = convertedLine.replace(/,([^,]+)$/g, (match, policy) => {
    return ',' + policy.trim().toUpperCase();
  });
  
  result.rules.push({
    content: convertedLine,
    comment: currentComment
  });
  
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
  currentComment = line;
} else if (line.includes(' - ')) {
  // 处理常规重写（例如 reject）
  result.rewrites.push({
    content: line,
    comment: currentComment
  });
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
        comment: currentComment,
        scriptUrl: scriptPath  // 保存脚本URL
      });
    }
  }
  
  currentComment = "";
}
```

}
}

/**

- 转换为Surge格式 - 支持完整脚本
- @param {Object|string} input 脚本信息或原始内容
- @returns {string} Surge格式的脚本内容
  */
  function convertToSurge(input) {
  let scriptInfo;
  if (typeof input === ‘string’) {
  scriptInfo = parseScript(input);
  } else {
  scriptInfo = input;
  }

// 生成配置
let config = generateSurgeConfig(scriptInfo);

// 添加代码相关信息
if (scriptInfo.hasCode) {
config += "\n\n# ⚠️ 此模块需要配合JavaScript脚本使用";

```
// 列出所有需要的脚本文件
const scriptUrls = new Set();
scriptInfo.scripts.forEach(script => {
  if (script.scriptUrl) {
    scriptUrls.add(script.scriptUrl);
  }
});

if (scriptUrls.size > 0) {
  config += "\n# 脚本文件:";
  scriptUrls.forEach(url => {
    config += `\n# ${url}`;
  });
}

// 添加代码特征说明
if (scriptInfo.codeFeatures) {
  const features = scriptInfo.codeFeatures;
  if (features.hasNotification) {
    config += "\n# ✓ 包含通知功能";
  }
  if (features.usesPersistentStore) {
    config += "\n# ✓ 使用持久化存储";
  }
}
```

}

return config;
}

/**

- 生成Surge配置
  */
  function generateSurgeConfig(scriptInfo) {
  const name = scriptInfo.metadata.name || "Converted Script";
  const desc = scriptInfo.metadata.desc || scriptInfo.metadata.description || "配置信息";
  const author = scriptInfo.metadata.author || "Converter";

let config = `#!name=${name} #!desc=${desc}`;

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

```
let lastComment = "";
for (const rule of scriptInfo.rules) {
  if (rule.comment && rule.comment !== lastComment) {
    config += `\n${rule.comment}`;
    lastComment = rule.comment;
  }
  
  let surgeRule = rule.content;
  surgeRule = surgeRule.replace(/\s*,\s*/g, ',');
  
  config += `\n${surgeRule}`;
}
```

}

// 处理Map Local部分
const rejectRules = scriptInfo.rewrites.filter(r =>
r.content.includes(’ - reject’)
);

if (rejectRules.length > 0) {
config += "\n\n[Map Local]";

```
let lastComment = "";
for (const rule of rejectRules) {
  if (rule.comment && rule.comment !== lastComment) {
    config += `\n${rule.comment}`;
    lastComment = rule.comment;
  }
  
  const parts = rule.content.split(' - ');
  const pattern = parts[0].trim();
  let rejectType = parts[1].trim().toLowerCase();
  
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

// 处理URL Rewrite部分
const urlRewriteRules = scriptInfo.rewrites.filter(r =>
!r.content.includes(’ - reject’)
);

if (urlRewriteRules.length > 0) {
config += "\n\n[URL Rewrite]";

```
let lastComment = "";
for (const rule of urlRewriteRules) {
  if (rule.comment && rule.comment !== lastComment) {
    config += `\n${rule.comment}`;
    lastComment = rule.comment;
  }
  
  let surgeRewrite = rule.content;
  surgeRewrite = surgeRewrite.replace(/ - reject($| )/g, ' - REJECT$1');
  
  config += `\n${surgeRewrite}`;
}
```

}

// 处理Script部分
if (scriptInfo.scripts && scriptInfo.scripts.length > 0) {
config += "\n\n[Script]";

```
let lastComment = "";
let ruleCounter = 0;

for (const rule of scriptInfo.scripts) {
  if (rule.comment && rule.comment !== lastComment) {
    config += `\n${rule.comment}`;
    lastComment = rule.comment;
  }
  
  const match = rule.content.match(/(http-(?:response|request))\s+([^\s]+)\s+script-path=([^,]+)/);
  if (match) {
    const httpType = match[1];
    const pattern = match[2];
    const scriptPath = match[3];
    
    const requiresBody = rule.content.includes('requires-body=true') ? '1' : '0';
    
    let scriptName = "";
    const tagMatch = rule.content.match(/tag=([^,\s]+)/);
    if (tagMatch) {
      scriptName = tagMatch[1];
    } else {
      scriptName = scriptPath.split('/').pop().split('.')[0] || `script_${ruleCounter}`;
    }
    
    config += `\n${scriptName} = type=${httpType}, pattern=${pattern}, requires-body=${requiresBody}, script-path=${scriptPath}, timeout=60`;
  }
  
  ruleCounter++;
}
```

}

// MITM部分
if (scriptInfo.hostname) {
config += "\n\n[MITM]";
config += `\nhostname = %APPEND% ${scriptInfo.hostname}`;
}

return config;
}

/**

- 转换为Loon格式 - 支持完整脚本
- @param {Object|string} input 脚本信息或原始内容
- @returns {string} Loon格式的脚本内容
  */
  function convertToLoon(input) {
  let scriptInfo;
  if (typeof input === ‘string’) {
  scriptInfo = parseScript(input);
  } else {
  scriptInfo = input;
  }

// 生成配置
let config = generateLoonConfig(scriptInfo);

// 添加代码相关信息（与Surge类似）
if (scriptInfo.hasCode) {
config += "\n\n# ⚠️ 此模块需要配合JavaScript脚本使用";

```
const scriptUrls = new Set();
scriptInfo.scripts.forEach(script => {
  if (script.scriptUrl) {
    scriptUrls.add(script.scriptUrl);
  }
});

if (scriptUrls.size > 0) {
  config += "\n# 脚本文件:";
  scriptUrls.forEach(url => {
    config += `\n# ${url}`;
  });
}
```

}

return config;
}

/**

- 生成Loon配置
  */
  function generateLoonConfig(scriptInfo) {
  const name = scriptInfo.metadata.name || "Converted Script";
  const desc = scriptInfo.metadata.desc || scriptInfo.metadata.description || "配置信息";
  const author = scriptInfo.metadata.author || "Converter";

let config = `#!name=${name} #!desc=${desc}`;

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
  if (rule.comment && rule.comment !== lastComment) {
    config += `\n${rule.comment}`;
    lastComment = rule.comment;
  }
  
  let loonRule = rule.content;
  loonRule = loonRule.replace(/\s*,\s*/g, ',');
  
  config += `\n${loonRule}`;
}
```

}

// 处理Rewrite部分
if (scriptInfo.rewrites.length > 0) {
config += "\n\n[Rewrite]";

```
let lastComment = "";
for (const rule of scriptInfo.rewrites) {
  if (rule.comment && rule.comment !== lastComment) {
    config += `\n${rule.comment}`;
    lastComment = rule.comment;
  }
  
  let loonRewrite = rule.content;
  loonRewrite = loonRewrite.replace(/ - reject($| )/g, ' - REJECT$1');
  
  config += `\n${loonRewrite}`;
}
```

}

// 处理Script部分
if (scriptInfo.scripts.length > 0) {
config += "\n\n[Script]";

```
let lastComment = "";
for (const rule of scriptInfo.scripts) {
  if (rule.comment && rule.comment !== lastComment) {
    config += `\n${rule.comment}`;
    lastComment = rule.comment;
  }
  
  config += `\n${rule.content}`;
}
```

}

// MITM部分
if (scriptInfo.hostname) {
config += "\n\n[MITM]";
config += `\nhostname = ${scriptInfo.hostname}`;
}

return config;
}

/**

- 检测脚本类型
- @param {string} content 脚本内容
- @returns {string} 脚本类型
  */
  function detectScriptType(content) {
  // 先提取配置部分
  const extracted = extractScriptContent(content);
  const configContent = extracted.config || content;

// 检测Loon特有标记
if (configContent.includes(’#!name=’) &&
(configContent.includes(’[Rewrite]’) || configContent.includes(’[Script]’))) {
return ‘loon’;
}

// 检测Surge特有标记
if (configContent.includes(’#!name=’) &&
(configContent.includes(’[Script]’) || configContent.includes(’[Rule]’)) &&
(configContent.includes(‘type=http-response’) || configContent.includes(‘type=cron’))) {
return ‘surge’;
}

// 检测QuantumultX特有标记
if ((configContent.includes(’[rewrite_local]’) || configContent.includes(’[filter_local]’)) ||
configContent.includes(‘url script-’) ||
configContent.includes(‘url-regex,’)) {
return ‘quantumultx’;
}

return ‘unknown’;
}

/**

- 转换脚本格式
- @param {string} content 原始脚本内容
- @param {string} targetFormat 目标格式
- @returns {string} 转换后的脚本内容
  */
  function convertScript(content, targetFormat) {
  // 检测脚本类型
  const sourceType = detectScriptType(content);
  console.log(`检测到脚本类型: ${sourceType}`);

// 解析脚本信息
const scriptInfo = parseScript(content);

// 根据目标格式转换
if (targetFormat === ‘loon’) {
return convertToLoon(scriptInfo);
} else if (targetFormat === ‘surge’) {
return convertToSurge(scriptInfo);
}

// 默认返回解析后的JSON（用于调试）
return JSON.stringify(scriptInfo, null, 2);
}

module.exports = {
extractScriptContent,
parseScript,
convertToLoon,
convertToSurge,
convertScript,
detectScriptType
};