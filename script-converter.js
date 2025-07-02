/**
 * 优化版脚本转换器模块 - 浏览器兼容版 v1.2
 * 最后更新: 2025-04-10
 * 更新内容: 修复规则格式问题，将reject策略转为大写
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * 从文件内容中提取脚本内容
 * @param {string} content 文件内容
 * @returns {string} 提取的脚本内容
 */
function extractScriptContent(content) {
  // 检查是否是被 /* */ 包裹的内容
  const commentMatch = content.match(/\/\*([\s\S]*)\*\//);
  if (commentMatch && commentMatch[1]) {
    return commentMatch[1].trim();
  }
  
  // 如果不是被注释包裹，则直接返回，但去掉多余的空行
  return content.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * 解析脚本内容
 * @param {string} content 脚本内容
 * @returns {Object} 解析结果
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
  
  // 改成字符串查找：
function findSectionContent(content, sectionName) {
  const startTag = `[${sectionName}]`;
  const startIndex = content.indexOf(startTag);
  
  if (startIndex === -1) {
    return null;  // 与原来的 match() 返回 null 保持一致
  }
  
  let endIndex = content.length;
  let searchPos = startIndex + startTag.length;
  
  // 查找下一个在行首的节点标记
  while (searchPos < content.length) {
    const nextBracket = content.indexOf('\n[', searchPos);
    if (nextBracket === -1) break;
    
    const closeBracket = content.indexOf(']', nextBracket + 2);
    if (closeBracket !== -1) {
      const nodeName = content.substring(nextBracket + 2, closeBracket);
      if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(nodeName)) {
        endIndex = nextBracket;
        break;
      }
    }
    
    searchPos = nextBracket + 1;
  }
  
  const sectionContent = content.substring(startIndex + startTag.length, endIndex).trim();
  // 重要：返回与 match() 相同的格式 [完整匹配, 捕获组1]
  return [startTag + sectionContent, sectionContent];
}

const loonSections = {
  "Rule": findSectionContent(content, "Rule"),
  "Rewrite": findSectionContent(content, "Rewrite"),
  "Script": findSectionContent(content, "Script"),
  "MITM": findSectionContent(content, "MITM")
};

const qxSections = {
  "filter_local": findSectionContent(content, "filter_local"),
  "rewrite_local": findSectionContent(content, "rewrite_local"),
  "mitm": findSectionContent(content, "mitm")
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
 * 提取元数据
 * @param {string} content 脚本内容
 * @param {Object} result 结果对象
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
    const titleMatch = content.match(/^\/\/\s*(.+?)(?:\n|$)/);
    if (titleMatch) {
      result.metadata.name = titleMatch[1].trim();
    }
    
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
 * 提取hostname
 * @param {Array} loonMITM Loon MITM匹配结果
 * @param {Array} qxMITM QX MITM匹配结果
 * @param {Object} result 结果对象
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
 * 解析带注释的节点
 * @param {string} sectionContent 节点内容
 * @param {Array} targetArray 目标数组
 */
function parseSectionWithComments(sectionContent, targetArray) {
  const lines = sectionContent.split('\n');
  let currentComment = "";
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
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
  }
}

/**
 * 解析QX规则
 * @param {string} sectionContent 节点内容
 * @param {Object} result 结果对象
 */
function parseQXRules(sectionContent, result) {
  const lines = sectionContent.split('\n');
  let currentComment = "";
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
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
  }
}

/**
 * 解析QX重写
 * @param {string} sectionContent 节点内容
 * @param {Object} result 结果对象
 */
function parseQXRewrites(sectionContent, result) {
  const lines = sectionContent.split('\n');
  let currentComment = "";
  
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
  }
}

/**
 * 转换为Surge格式
 * @param {Object} scriptInfo 脚本信息
 * @returns {string} Surge格式的脚本内容
 */
function convertToSurge(input) {
  // 如果输入是字符串，先处理它
  let scriptInfo;
  if (typeof input === 'string') {
    const extractedContent = extractScriptContent(input);
    scriptInfo = parseScript(extractedContent);
  } else {
    scriptInfo = input;
  }
  
  // 使用元数据
  const name = scriptInfo.metadata.name || "Converted Script";
  const desc = scriptInfo.metadata.desc || scriptInfo.metadata.description || "配置信息";
  const author = scriptInfo.metadata.author || "Converter";
  
  let config = `#!name=${name}
#!desc=${desc}`;

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
  }

  // 处理Map Local部分 - 用于reject规则
  const rejectRules = scriptInfo.rewrites.filter(r => 
    r.content.includes(' - reject') || r.content.includes(' - reject-dict') || r.content.includes(' - reject-img')
  );
  
  if (rejectRules.length > 0) {
    config += "\n[Map Local]";
    
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
      console.log('处理 reject 规则:', pattern, rejectType);
      config += `\n${pattern} data-type=text data="${data}" status-code=200`;
      console.log('生成的配置行:', `${pattern} data-type=text data="${data}" status-code=200`);
    }
    
    config += "\n";
  }

  // 处理URL Rewrite部分 - 用于非reject的URL重写规则
  const urlRewriteRules = scriptInfo.rewrites.filter(r => 
    !r.content.includes(' - reject') && !r.content.includes(' - reject-dict') && !r.content.includes(' - reject-img')
  );
  
  if (urlRewriteRules.length > 0) {
    config += "\n[URL Rewrite]";
    
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
  }
  
  // MITM部分
  if (scriptInfo.hostname) {
    config += "\n[MITM]\n";
    config += `hostname = %APPEND% ${scriptInfo.hostname}\n`;
  }
  
  return config;
}

/**
 * 转换为Loon格式
 * @param {Object} scriptInfo 脚本信息
 * @returns {string} Loon格式的脚本内容
 */
function convertToLoon(input) {
  // 如果输入是字符串，先处理它
  let scriptInfo;
  if (typeof input === 'string') {
    const extractedContent = extractScriptContent(input);
    scriptInfo = parseScript(extractedContent);
  } else {
    scriptInfo = input;
  }
  
  // 使用元数据
  const name = scriptInfo.metadata.name || "Converted Script";
  const desc = scriptInfo.metadata.desc || scriptInfo.metadata.description || "配置信息";
  const author = scriptInfo.metadata.author || "Converter";
  
  let config = `#!name=${name}
#!desc=${desc}`;

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
  }

  // 处理Rewrite部分
  if (scriptInfo.rewrites.length > 0) {
    config += "\n[Rewrite]";
    
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
  }

  // 处理Script部分
  if (scriptInfo.scripts.length > 0) {
    // 添加一个空行在[Script]之前
    config += "\n\n[Script]";
    
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
  }
  
  // MITM部分
  if (scriptInfo.hostname) {
    config += "\n[MITM]\n";
    config += `hostname = ${scriptInfo.hostname}\n`;
  }
  
  return config;
}

/**
 * 检测脚本类型
 * @param {string} content 脚本内容
 * @returns {string} 脚本类型 (quantumultx, loon, surge, unknown)
 */
function detectScriptType(content) {
  // 检测Loon特有标记
  if (content.includes('#!name=') && 
      (content.includes('[Rewrite]') || content.includes('[Script]'))) {
    return 'loon';
  }
  
  // 检测Surge特有标记
  if (content.includes('#!name=') && 
      (content.includes('[Script]') || content.includes('[Rule]')) &&
      (content.includes('type=http-response') || content.includes('type=cron'))) {
    return 'surge';
  }
  
  // 检测QuantumultX特有标记
  if ((content.includes('[rewrite_local]') || content.includes('[filter_local]')) ||
      content.includes('url script-') || 
      content.includes('// @author') ||
      content.includes('// @name')) {
    return 'quantumultx';
  }
  
  // 如果无法确定，返回unknown
  return 'unknown';
}

/**
 * 转换脚本格式
 * @param {string} content 原始脚本内容
 * @param {string} targetFormat 目标格式 (loon, surge, quantumultx)
 * @returns {string} 转换后的脚本内容
 */
function convertScript(content, targetFormat) {
  // 提取脚本内容
  const extractedContent = extractScriptContent(content);
  
  // 检测脚本类型
  const sourceType = detectScriptType(extractedContent);
  console.log(`检测到脚本类型: ${sourceType}`);
  
  // 解析脚本信息
  const scriptInfo = parseScript(extractedContent);
  
  // 根据目标格式转换
  if (targetFormat === 'loon') {
    return convertToLoon(scriptInfo);
  } else if (targetFormat === 'surge') {
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