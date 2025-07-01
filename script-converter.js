/**

- 更健壮的节内容提取方法
- 解决装饰字符和格式问题
  */

/**

- 提取所有节的内容
- @param {string} content 配置内容
- @returns {Object} 包含所有节内容的对象
  */
  function extractAllSections(content) {
  const sections = {};

// 所有可能的节名（支持大小写）
const sectionNames = [
‘Rule’, ‘Rewrite’, ‘Script’, ‘MITM’,  // Loon
‘filter_local’, ‘rewrite_local’, ‘mitm’, ‘MITM’  // QX
];

// 方法1：使用 split 分割内容
// 找出所有节的位置
const sectionPositions = [];
sectionNames.forEach(name => {
const regex = new RegExp(`\\[${name}\\]`, ‘gi’);
let match;
while ((match = regex.exec(content)) !== null) {
sectionPositions.push({
name: name,
position: match.index,
fullMatch: match[0]
});
}
});

// 按位置排序
sectionPositions.sort((a, b) => a.position - b.position);

// 提取每个节的内容
for (let i = 0; i < sectionPositions.length; i++) {
const current = sectionPositions[i];
const next = sectionPositions[i + 1];

```
const startPos = current.position + current.fullMatch.length;
const endPos = next ? next.position : content.length;

let sectionContent = content.substring(startPos, endPos);

// 清理内容：移除末尾的 */ 如果存在
sectionContent = sectionContent.replace(/\*\/\s*$/, '');

// 保存到对应的键（统一为小写）
const key = current.name.toLowerCase();
sections[key] = sectionContent.trim();
```

}

return sections;
}

/**

- 改进的 parseScript 函数
  */
  function improvedParseScript(content) {
  const result = {
  metadata: {},
  rules: [],
  rewrites: [],
  scripts: [],
  hostname: "",
  originalCode: ‘’,
  hasCode: false
  };

// 首先提取配置和代码
const extracted = extractScriptContent(content);
result.originalCode = extracted.code;
result.hasCode = extracted.code && extracted.code.length > 0;

// 使用配置部分进行解析
const configContent = extracted.config || content;

// 提取元数据
extractMetadata(configContent, result);

// 使用新方法提取所有节
const sections = extractAllSections(configContent);

console.log(‘提取到的节:’, Object.keys(sections));

// 解析各个节
if (sections.rule) {
parseSectionWithComments(sections.rule, result.rules);
}

if (sections.rewrite) {
parseSectionWithComments(sections.rewrite, result.rewrites);
}

if (sections.script) {
parseSectionWithComments(sections.script, result.scripts);
}

if (sections.filter_local) {
parseQXRules(sections.filter_local, result);
}

if (sections.rewrite_local) {
console.log(‘解析 rewrite_local 内容:’, sections.rewrite_local);
parseQXRewrites(sections.rewrite_local, result);
}

// 提取 hostname
const mitmContent = sections.mitm || sections.MITM;
if (mitmContent) {
const hostnameMatch = mitmContent.match(/hostname\s*=\s*([^\n]+)/i);
if (hostnameMatch && hostnameMatch[1]) {
result.hostname = hostnameMatch[1].trim();
}
}

return result;
}

/**

- 辅助函数：提取脚本内容
  */
  function extractScriptContent(content) {
  const result = {
  config: ‘’,
  code: ‘’,
  fullContent: content
  };

const commentMatch = content.match(//*([\s\S]*?)*//);
if (commentMatch) {
result.config = commentMatch[1].trim();
const configEnd = commentMatch.index + commentMatch[0].length;
result.code = content.substring(configEnd).trim();
} else {
result.config = content.trim();
}

return result;
}

/**

- 辅助函数：提取元数据
  */
  function extractMetadata(content, result) {
  const metadataFields = {
  name: /#!name\s*=\s*(.+?)($|\n)/i,
  desc: /#!desc\s*=\s*(.+?)($|\n)/i,
  category: /#!category\s*=\s*(.+?)($|\n)/i,
  author: /#!author\s*=\s*(.+?)($|\n)/i,
  icon: /#!icon\s*=\s*(.+?)($|\n)/i
  };

for (const [field, pattern] of Object.entries(metadataFields)) {
const match = content.match(pattern);
if (match && match[1]) {
result.metadata[field] = match[1].trim();
}
}

if (!result.metadata.name) {
result.metadata.name = "Converted Script";
}
}

/**

- 辅助函数：解析带注释的节
  */
  function parseSectionWithComments(sectionContent, targetArray) {
  const lines = sectionContent.split(’\n’);
  let currentComment = "";

for (let line of lines) {
line = line.trim();
if (!line) continue;

```
if (line.startsWith('#')) {
  currentComment = line;
} else {
  targetArray.push({
    content: line,
    comment: currentComment
  });
  currentComment = "";
}
```

}
}

/**

- 辅助函数：解析QX规则
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
  
  if (line.startsWith('url-regex,')) {
    const parts = line.split(',');
    if (parts.length >= 3) {
      const pattern = parts[1];
      const action = parts[2];
      convertedLine = `URL-REGEX,${pattern},${action.toUpperCase()}`;
    }
  } else if (line.startsWith('host,')) {
    convertedLine = line.replace(/^host,/i, 'DOMAIN,');
  } else if (line.startsWith('host-suffix,')) {
    convertedLine = line.replace(/^host-suffix,/i, 'DOMAIN-SUFFIX,');
  }
  
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

- 辅助函数：解析QX重写
  */
  function parseQXRewrites(sectionContent, result) {
  const lines = sectionContent.split(’\n’);
  let currentComment = "";

console.log(‘parseQXRewrites - 行数:’, lines.length);

for (let line of lines) {
line = line.trim();
if (!line) continue;

```
console.log('处理行:', line);

if (line.startsWith('#')) {
  currentComment = line;
} else if (line.includes(' url ')) {
  const parts = line.split(' url ');
  if (parts.length === 2) {
    const pattern = parts[0].trim();
    const action = parts[1].trim();
    
    if (action.startsWith('reject')) {
      result.rewrites.push({
        content: `${pattern} - ${action}`,
        comment: currentComment
      });
    } else if (action.startsWith('script-')) {
      const scriptType = action.split(' ')[0];
      let scriptPath = action.split(' ')[1] || '';
      
      const httpType = scriptType.includes('response') ? 'http-response' : 'http-request';
      const requiresBody = scriptType.includes('body') ? 'true' : 'false';
      
      let tag = "script";
      if (scriptPath && scriptPath.includes('/')) {
        const scriptName = scriptPath.split('/').pop().split('.')[0];
        if (scriptName) tag = scriptName;
      }
      
      const scriptRule = {
        content: `${httpType} ${pattern} script-path=${scriptPath}, requires-body=${requiresBody}, timeout=60, tag=${tag}`,
        comment: currentComment,
        scriptUrl: scriptPath
      };
      
      result.scripts.push(scriptRule);
      console.log('添加脚本规则:', scriptRule);
    }
  }
  
  currentComment = "";
}
```

}
}

// 测试新方法
console.log(’=== 测试新的提取方法 ===’);

const testBizhi = `/*
#!name= ✨ Bizhi壁纸 ✨
#!desc=图像壁纸
#!category=🔐APP
#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘⓮
#!icon=https://raw.githubusercontent.com/Mikephie/icons/main/icon/bizhi.png
𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹
[rewrite_local]
^https://leancloud.emotionwp.com/1.1/classes/wpf_[a-z]+ url script-response-body https://raw.githubusercontent.com/Mikephie/Script/main/qx/bizhi.js

[MITM]
hostname = leancloud.emotionwp.com

*/`;

const testAxs = `/*
#!name= ✨ AXS Payment ✨
#!desc=缴费账单
#!category=🚫广告
#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘⓮
#!icon=https://raw.githubusercontent.com/Mikephie/icons/main/icon/axs.png
𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹
[filter_local]
url-regex,^https://m-station2.axs.com.sg/AXSMobile/WebView/MarketPlace,reject
url-regex,^https://m-station2.axs.com.sg/AXSMobile/highlight,reject

[rewrite_local]
^https?://m-station2.axs.com.sg/AXSMobile/InfoPage/.*$ url script-response-body https://raw.githubusercontent.com/Mikephie/Script/main/qx/axs.js

[mitm]
hostname = m-station2.axs.com.sg

*/`;

console.log(’\n测试 Bizhi:’);
const bizhiResult = improvedParseScript(testBizhi);
console.log(‘脚本数量:’, bizhiResult.scripts.length);
console.log(‘脚本内容:’, bizhiResult.scripts);

console.log(’\n测试 AXS:’);
const axsResult = improvedParseScript(testAxs);
console.log(‘脚本数量:’, axsResult.scripts.length);
console.log(‘脚本内容:’, axsResult.scripts);