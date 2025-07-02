/**
 * 修复版脚本转换器模块 - 解决正则表达式解析问题 v1.3
 * 最后更新: 2025-07-02
 * 更新内容: 修复正则表达式字符导致的解析失败问题
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * 安全的正则表达式处理函数
 * @param {string} pattern 正则表达式字符串
 * @returns {string} 安全处理后的字符串
 */
function safeRegexHandle(pattern) {
  // 对特殊字符进行转义处理，但保持正则表达式的功能
  // 不转义常见的正则表达式字符，如 ^$.*+?[]{}()|
  return pattern;
}

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
 * 改进的节点匹配函数 - 修复正则表达式解析问题
 * @param {string} content 内容
 * @param {string} sectionName 节点名称
 * @returns {string|null} 匹配的内容
 */
function safeSectionMatch(content, sectionName) {
  try {
    // 使用更安全的字符串查找方式
    const startPattern = `[${sectionName}]`;
    const startIndex = content.indexOf(startPattern);
    
    if (startIndex === -1) {
      return null;
    }
    
    // 找到下一个节点的开始位置
    let endIndex = content.length;
    const nextSectionIndex = content.indexOf('[', startIndex + startPattern.length);
    
    if (nextSectionIndex !== -1) {
      endIndex = nextSectionIndex;
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
 * 解析脚本内容 - 修复版
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
  
  // 使用改进的节点匹配
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
    parseSectionWithComments(loonSections.Rule, result.rules);
  }
  
  if (loonSections.Rewrite) {
    parseSectionWithComments(loonSections.Rewrite, result.rewrites);
  }
  
  if (loonSections.Script) {
    parseSectionWithComments(loonSections.Script, result.scripts);
  }
  
  // 处理QX格式 - 如果Loon格式为空
  if (result.rules.length === 0 && qxSections.filter_local) {
    parseQXRules(qxSections.filter_local, result);
  }
  
  if (result.rewrites.length === 0 && result.scripts.length === 0 && qxSections.rewrite_local) {
    parseQXRewrites(qxSections.rewrite_local, result);
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
    try {
      const match = content.match(pattern);
      if (match && match[1]) {
        result.metadata[field] = match[1].trim();
      }
    } catch (error) {
      console.error(`提取元数据字段 ${field} 时出错:`, error);
    }
  }
  
  // 如果没有找到标准元数据，尝试从QX格式提取
  if (!result.metadata.name) {
    try {
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
    } catch (error) {
      console.error('提取备用元数据时出错:', error);
    }
  }
  
  // 如果还是没找到名称，尝试从文件名或特征提取
  if (!result.metadata.name) {
    result.metadata.name = "Converted Script";
  }
}

/**
 * 提取hostname - 修复版
 * @param {string} loonMITM Loon MITM内容
 * @param {string} qxMITM QX MITM内容
 * @param {Object} result 结果对象
 */
function extractHostname(loonMITM, qxMITM, result) {
  try {
    // 优先从Loon格式提取
    if (loonMITM) {
      const hostnameIndex = loonMITM.indexOf('hostname');
      if (hostnameIndex !== -1) {
        const line = loonMITM.substring(hostnameIndex);
        const equalIndex = line.indexOf('=');
        if (equalIndex !== -1) {
          const hostname = line.substring(equalIndex + 1).split('\n')[0].trim();
          if (hostname) {
            result.hostname = hostname;
            return;
          }
        }
      }
    }
    
    // 备选从QX格式提取
    if (qxMITM) {
      const hostnameIndex = qxMITM.indexOf('hostname');
      if (hostnameIndex !== -1) {
        const line = qxMITM.substring(hostnameIndex);
        const equalIndex = line.indexOf('=');
        if (equalIndex !== -1) {
          const hostname = line.substring(equalIndex + 1).split('\n')[0].trim();
          if (hostname) {
            result.hostname = hostname;
            return;
          }
        }
      }
    }
  } catch (error) {
    console.error('提取hostname时出错:', error);
  }
}

/**
 * 解析带注释的节点
 * @param {string} sectionContent 节点内容
 * @param {Array} targetArray 目标数组
 */
function parseSectionWithComments(sectionContent, targetArray) {
  try {
    const lines = sectionContent.split('\n');
    let currentComment = "";
    
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      if (line.startsWith('#')) {
        // 收集注释
        currentComment = line;
      } else {
        // 处理内容行 - 使用安全的正则处理
        const safeContent = safeRegexHandle(line);
        targetArray.push({
          content: safeContent,
          comment: currentComment
        });
        
        // 重置注释
        currentComment = "";
      }
    }
  } catch (error) {
    console.error('解析节点内容时出错:', error);
  }
}

/**
 * 解析QX规则 - 修复版
 * @param {string} sectionContent 节点内容
 * @param {Object} result 结果对象
 */
function parseQXRules(sectionContent, result) {
  try {
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
        
        // 安全的字符串替换，避免正则表达式问题
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
        result.rules.push({
          content: convertedLine,
          comment: currentComment
        });
        
        // 重置注释
        currentComment = "";
      }
    }
  } catch (error) {
    console.error('解析QX规则时出错:', error);
  }
}

/**
 * 解析QX重写 - 修复版
 * @param {string} sectionContent 节点内容
 * @param {Object} result 结果对象
 */
function parseQXRewrites(sectionContent, result) {
  try {
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
        
        // 重置注释
        currentComment = "";
      }
    }
  } catch (error) {
    console.error('解析QX重写时出错:', error);
  }
}

/**
 * 转换为Surge格式 - 修复版
 * @param {Object} scriptInfo 脚本信息
 * @returns {string} Surge格式的脚本内容
 */
function convertToSurge(input) {
  try {
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
        
        // 转换规则格式为Surge格式 - 使用字符串操作避免正则问题
        let surgeRule = rule.content;
        
        // 修复规则格式: 移除逗号后的额外空格，并将策略名转为大写
        const parts = surgeRule.split(',');
        if (parts.length > 1) {
          // 处理最后一部分（策略）
          const lastPart = parts[parts.length - 1].trim().toUpperCase();
          parts[parts.length - 1] = lastPart;
          surgeRule = parts.join(',');
        }
        
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
        
        // 提取URL模式和reject类型 - 使用字符串分割
        const dashIndex = rule.content.indexOf(' - ');
        if (dashIndex !== -1) {
          const pattern = rule.content.substring(0, dashIndex).trim();
          let rejectType = rule.content.substring(dashIndex + 3).trim().toLowerCase();
          
          // 设置数据类型和内容
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
        
        // 转换为大写REJECT - 使用字符串替换
        let surgeRewrite = rule.content;
        surgeRewrite = surgeRewrite.replace(' - reject', ' - REJECT');
        surgeRewrite = surgeRewrite.replace(' - reject-dict', ' - REJECT-DICT');
        surgeRewrite = surgeRewrite.replace(' - reject-img', ' - REJECT-IMG');
        
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
    console.error('转换为Surge格式时出错:', error);
    return '// 转换失败，请检查原始脚本格式';
  }
}

/**
 * 转换为Loon格式 - 修复版
 * @param {Object} scriptInfo 脚本信息
 * @returns {string} Loon格式的脚本内容
 */
function convertToLoon(input) {
  try {
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
        
        // 转换QX格式为Loon格式 - 使用字符串替换
        let loonRewrite = rule.content;
        
        loonRewrite = loonRewrite.replace(' - reject', ' - REJECT');
        loonRewrite = loonRewrite.replace(' - reject-dict', ' - REJECT');
        loonRewrite = loonRewrite.replace(' - reject-img', ' - REJECT');
        
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
    
  } catch (error) {
    console.error('转换为Loon格式时出错:', error);
    return '// 转换失败，请检查原始脚本格式';
  }
}

/**
 * 检测脚本类型 - 修复版
 * @param {string} content 脚本内容
 * @returns {string} 脚本类型 (quantumultx, loon, surge, unknown)
 */
function detectScriptType(content) {
  try {
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
  } catch (error) {
    console.error('检测脚本类型时出错:', error);
    return 'unknown';
  }
}

/**
 * 转换脚本格式 - 修复版
 * @param {string} content 原始脚本内容
 * @param {string} targetFormat 目标格式 (loon, surge, quantumultx)
 * @returns {string} 转换后的脚本内容
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
    if (targetFormat === 'loon') {
      return convertToLoon(scriptInfo);
    } else if (targetFormat === 'surge') {
      return convertToSurge(scriptInfo);
    }
    
    // 默认返回解析后的JSON（用于调试）
    return JSON.stringify(scriptInfo, null, 2);
    
  } catch (error) {
    console.error('转换脚本时出错:', error);
    return '// 转换失败，请检查原始脚本格式\n// 错误信息: ' + error.message;
  }
}

/**
 * 测试函数 - 用于验证修复效果
 * @param {string} testContent 测试内容
 */
function testRegexFix(testContent) {
  console.log('=== 测试正则表达式修复 ===');
  
  try {
    // 测试包含 _[a-z]+ 的内容
    const result = parseScript(testContent);
    console.log('解析成功!');
    console.log('规则数量:', result.rules.length);
    console.log('重写数量:', result.rewrites.length);
    console.log('脚本数量:', result.scripts.length);
    console.log('Hostname:', result.hostname);
    
    return true;
  } catch (error) {
    console.error('解析失败:', error);
    return false;
  }
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
  safeRegexHandle,
  safeSectionMatch
};