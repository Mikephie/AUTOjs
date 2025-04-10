/**
 * 优化版脚本转换器模块 - 浏览器兼容版 v1.3
 * 最后更新: 2025-04-11
 * 更新内容: 修复window对象绑定问题，确保convertToSurge函数可用
 */

// 立即执行函数，确保变量不会污染全局作用域
(function(window) {
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
   * 提取元数据信息
   * @param {string} content 脚本内容
   * @param {Object} result 结果对象
   */
  function extractMetadata(content, result) {
    // 提取#!name和#!desc
    const nameMatch = content.match(/#!name=(.*?)(?:\n|$)/);
    const descMatch = content.match(/#!desc=(.*?)(?:\n|$)/);
    
    if (nameMatch && nameMatch[1]) {
      result.metadata.name = nameMatch[1].trim();
    }
    
    if (descMatch && descMatch[1]) {
      result.metadata.desc = descMatch[1].trim();
    }
    
    // 提取QX格式元数据
    const authorMatch = content.match(/\/\/ @author\s+(.*?)(?:\n|$)/);
    const versionMatch = content.match(/\/\/ @version\s+(.*?)(?:\n|$)/);
    
    if (authorMatch && authorMatch[1] && !result.metadata.name) {
      result.metadata.name = authorMatch[1].trim();
    }
    
    if (versionMatch && versionMatch[1] && !result.metadata.desc) {
      result.metadata.desc = versionMatch[1].trim();
    }
    
    // 尝试提取hostname
    const mitmMatch = content.match(/\[MITM\]\s*\n\s*hostname\s*=\s*(.*?)(?:\n|$)/i);
    const qxMitmMatch = content.match(/\[mitm\]\s*\n\s*hostname\s*=\s*(.*?)(?:\n|$)/i);
    
    if (mitmMatch && mitmMatch[1]) {
      result.hostname = mitmMatch[1].trim();
    } else if (qxMitmMatch && qxMitmMatch[1]) {
      result.hostname = qxMitmMatch[1].trim();
    }
  }

  /**
   * 解析带注释的部分
   * @param {string} section 部分内容
   * @param {Array} target 目标数组
   */
  function parseSectionWithComments(section, target) {
    const lines = section.split('\n');
    let currentComment = "";
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      if (trimmedLine.startsWith('#')) {
        currentComment = trimmedLine;
      } else {
        target.push({
          content: trimmedLine,
          comment: currentComment
        });
        currentComment = "";
      }
    }
  }

  /**
   * 解析QX规则
   * @param {string} section 部分内容
   * @param {Object} result 结果对象
   */
  function parseQXRules(section, result) {
    const lines = section.split('\n');
    let currentComment = "";
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      if (trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) {
        currentComment = trimmedLine;
      } else {
        // 尝试转换QX规则到Loon格式
        let loonRule = trimmedLine;
        
        // 处理host规则
        if (trimmedLine.includes(',host,')) {
          loonRule = trimmedLine.replace(',host,', ',DOMAIN,');
        }
        
        // 处理host-suffix规则
        if (trimmedLine.includes(',host-suffix,')) {
          loonRule = trimmedLine.replace(',host-suffix,', ',DOMAIN-SUFFIX,');
        }
        
        // 处理host-keyword规则
        if (trimmedLine.includes(',host-keyword,')) {
          loonRule = trimmedLine.replace(',host-keyword,', ',DOMAIN-KEYWORD,');
        }
        
        // 处理url-regex规则
        if (trimmedLine.includes(',url-regex,')) {
          loonRule = trimmedLine.replace(',url-regex,', ',URL-REGEX,');
        }
        
        result.rules.push({
          content: loonRule,
          comment: currentComment
        });
        
        currentComment = "";
      }
    }
  }

  /**
   * 解析QX重写规则
   * @param {string} section 部分内容
   * @param {Object} result 结果对象
   */
  function parseQXRewrites(section, result) {
    const lines = section.split('\n');
    let currentComment = "";
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      if (trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) {
        currentComment = trimmedLine;
      } else {
        // 判断是否是脚本重写
        if (trimmedLine.includes('url script-')) {
          // 脚本类型的重写
          let scriptType = '';
          let scriptPath = '';
          
          if (trimmedLine.includes('url script-response-body')) {
            scriptType = 'http-response';
            const parts = trimmedLine.split('url script-response-body');
            if (parts.length >= 2) {
              scriptPath = parts[1].trim();
            }
          } else if (trimmedLine.includes('url script-request-body')) {
            scriptType = 'http-request';
            const parts = trimmedLine.split('url script-request-body');
            if (parts.length >= 2) {
              scriptPath = parts[1].trim();
            }
          } else if (trimmedLine.includes('url script-response-header')) {
            scriptType = 'http-response';
            const parts = trimmedLine.split('url script-response-header');
            if (parts.length >= 2) {
              scriptPath = parts[1].trim();
            }
          } else if (trimmedLine.includes('url script-request-header')) {
            scriptType = 'http-request';
            const parts = trimmedLine.split('url script-request-header');
            if (parts.length >= 2) {
              scriptPath = parts[1].trim();
            }
          }
          
          if (scriptType && scriptPath) {
            const pattern = trimmedLine.split('url script-')[0].trim();
            const loonScript = `${scriptType} ${pattern} script-path=${scriptPath}, tag=${scriptPath.split('/').pop().split('.')[0]}`;
            
            result.scripts.push({
              content: loonScript,
              comment: currentComment
            });
          }
        } else {
          // 普通URL重写
          result.rewrites.push({
            content: trimmedLine,
            comment: currentComment
          });
        }
        
        currentComment = "";
      }
    }
  }

  /**
   * 转换为Loon配置
   * @param {Object} scriptInfo 脚本信息
   * @returns {string} 转换后的Loon配置
   */
  function convertToLoon(scriptInfo) {
    let config = "";
    
    // 添加元数据
    if (scriptInfo.metadata.name) {
      config += `#!name=${scriptInfo.metadata.name}\n`;
    } else {
      config += `#!name=转换后的Loon配置\n`;
    }
    
    if (scriptInfo.metadata.desc) {
      config += `#!desc=${scriptInfo.metadata.desc}\n`;
    } else {
      config += `#!desc=由脚本转换器生成的Loon配置\n`;
    }
    
    // 处理Rule部分
    if (scriptInfo.rules.length > 0) {
      config += "\n[Rule]";
      
      let lastComment = "";
      for (const rule of scriptInfo.rules) {
        // 如果有新注释，添加它
        if (rule.comment && rule.comment !== lastComment) {
          config += `\n${rule.comment}`;
          lastComment = rule.comment;
        }
        
        config += `\n${rule.content}`;
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
        loonRewrite = loonRewrite.replace(/ - reject($| )/ig, ' - REJECT$1');
        loonRewrite = loonRewrite.replace(/ - reject-dict($| )/ig, ' - REJECT$1');
        loonRewrite = loonRewrite.replace(/ - reject-img($| )/ig, ' - REJECT$1');
        loonRewrite = loonRewrite.replace(/ - reject-200($| )/ig, ' - REJECT-200$1');
        loonRewrite = loonRewrite.replace(/ - reject-array($| )/ig, ' - REJECT$1');
        
        config += `\n${loonRewrite}`;
      }
      
      config += "\n";
    }
    
    // 处理Script部分
    if (scriptInfo.scripts.length > 0) {
      config += "\n[Script]";
      
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
   * 转换为Surge配置
   * @param {Object} scriptInfo 脚本信息
   * @returns {string} 转换后的Surge配置
   */
  function convertToSurge(scriptInfo) {
    let config = "";
    
    // 添加元数据
    if (scriptInfo.metadata.name) {
      config += `#!name=${scriptInfo.metadata.name}\n`;
    } else {
      config += `#!name=转换后的Surge配置\n`;
    }
    
    if (scriptInfo.metadata.desc) {
      config += `#!desc=${scriptInfo.metadata.desc}\n`;
    } else {
      config += `#!desc=由脚本转换器生成的Surge配置\n`;
    }
    
    // 处理Rule部分
    if (scriptInfo.rules.length > 0) {
      config += "\n[Rule]";
      
      let lastComment = "";
      for (const rule of scriptInfo.rules) {
        // 如果有新注释，添加它
        if (rule.comment && rule.comment !== lastComment) {
          config += `\n${rule.comment}`;
          lastComment = rule.comment;
        }
        
        // 转换为Surge格式规则
        let surgeRule = rule.content;
        
        config += `\n${surgeRule}`;
      }
      
      config += "\n";
    }
    
    // 处理URL重写部分
    if (scriptInfo.rewrites.length > 0) {
      config += "\n[URL Rewrite]";
      
      let lastComment = "";
      for (const rule of scriptInfo.rewrites) {
        // 如果有新注释，添加它
        if (rule.comment && rule.comment !== lastComment) {
          config += `\n${rule.comment}`;
          lastComment = rule.comment;
        }
        
        // 转换为Surge格式重写
        let surgeRewrite = rule.content;
        
        config += `\n${surgeRewrite}`;
      }
      
      config += "\n";
    }
    
    // 处理Script部分
    if (scriptInfo.scripts.length > 0) {
      config += "\n[Script]";
      
      let lastComment = "";
      for (const rule of scriptInfo.scripts) {
        // 如果有新注释，添加它
        if (rule.comment && rule.comment !== lastComment) {
          config += `\n${rule.comment}`;
          lastComment = rule.comment;
        }
        
        // 转换为Surge格式脚本
        let surgeScript = rule.content;
        
        // 将Loon格式的http-response script-path=xxx 转为 Surge格式
        if (surgeScript.includes('http-response') && surgeScript.includes('script-path=')) {
          surgeScript = surgeScript.replace('http-response', 'type=http-response');
          surgeScript = surgeScript.replace('script-path=', 'script-path=');
        }
        
        // 将Loon格式的http-request script-path=xxx 转为 Surge格式
        if (surgeScript.includes('http-request') && surgeScript.includes('script-path=')) {
          surgeScript = surgeScript.replace('http-request', 'type=http-request');
          surgeScript = surgeScript.replace('script-path=', 'script-path=');
        }
        
        config += `\n${surgeScript}`;
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
    
    // 检测是否只是单行规则
    if (!content.includes('\n') && 
        (content.includes('http') || content.includes('data-') || 
        content.includes('reject') || content.includes('REJECT'))) {
      // 尝试识别格式
      if (content.includes(' - REJECT')) {
        return 'loon';
      } else if (content.includes(' - reject')) {
        return 'quantumultx';
      }
    }
    
    // 如果无法确定，返回unknown
    return 'unknown';
  }

  /**
   * 处理单个URL或规则
   * @param {string} content 原始内容
   * @param {string} targetFormat 目标格式 (loon, surge)
   * @returns {string} 转换后的格式
   */
  function handleSingleRule(content, targetFormat) {
    // 检查是否是URL链接类型
    if (content.trim().startsWith('http') && !content.includes('\n')) {
      if (targetFormat === 'loon') {
        return `http-request ${content} script-path=${content}`;
      } else if (targetFormat === 'surge') {
        return `type=http-request,pattern=${content},script-path=${content}`;
      }
      return content;
    }
    
    // 检查是否是重写规则
    if (content.includes(' data-') || content.includes(' - reject') || content.includes(' - REJECT')) {
      // 转换为目标格式
      if (targetFormat === 'loon') {
        // 将reject转为REJECT (大写)
        return content.replace(/ - reject(-\w+)?/ig, ' - REJECT$1').replace(/ data-/g, ' data-');
      } else if (targetFormat === 'surge') {
        // 保持原格式，Surge兼容QX格式
        return content;
      }
    }
    
    return content;
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
    
    // 处理节点 - 优先考虑标准Loon格式
    const loonSections = {
      "Rule": content.match(/\[Rule\]([\s\S]*?)(?=\[|$)/i),
      "Rewrite": content.match(/\[Rewrite\]([\s\S]*?)(?=\[|$)/i),
      "Script": content.match(/\[Script\]([\s\S]*?)(?=\[|$)/i),
      "MITM": content.match(/\[MITM\]([\s\S]*?)(?=\[|$|$)/i)
    };
    
    // 处理QX格式作为备选
    const qxSections = {
      "filter_local": content.match(/\[filter_local\]([\s\S]*?)(?=\[|$)/i),
      "rewrite_local": content.match(/\[rewrite_local\]([\s\S]*?)(?=\[|$)/i),
      "mitm": content.match(/\[mitm\]([\s\S]*?)(?=\[|$|$)/i)
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
    
    // 特殊处理 - 如果内容是单行规则
    if (result.rules.length === 0 && result.rewrites.length === 0 && result.scripts.length === 0) {
      // 尝试判断单行内容
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) continue;
        
        // 判断规则类型
        if (trimmedLine.includes('reject') || trimmedLine.includes('REJECT') || 
            trimmedLine.includes('data-type=') || trimmedLine.includes('data=')) {
          result.rewrites.push({
            content: trimmedLine,
            comment: ""
          });
        } else if (trimmedLine.includes('DOMAIN') || trimmedLine.includes('IP-CIDR') || 
                  trimmedLine.includes('USER-AGENT')) {
          result.rules.push({
            content: trimmedLine,
            comment: ""
          });
        } else if (trimmedLine.includes('script-path=') || trimmedLine.includes('url script-')) {
          result.scripts.push({
            content: trimmedLine,
            comment: ""
          });
        }
      }
    }
    
    return result;
  }

  /**
   * 转换脚本格式
   * @param {string} content 原始脚本内容
   * @param {string} targetFormat 目标格式 (loon, surge)
   * @returns {string} 转换后的脚本内容
   */
  function convertScript(content, targetFormat) {
    console.log("开始转换脚本，目标格式:", targetFormat);
    
    // 检查内容是否为空
    if (!content || content.trim() === '') {
      return '未提供有效内容';
    }
    
    // 检查是否是单行规则/URL
    if (!content.includes('\n')) {
      return handleSingleRule(content, targetFormat);
    }
    
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
    
    // 默认返回原内容
    return content;
  }

  // 直接转换单行规则
  function convertSingleRule(rule, format) {
    if (!rule || rule.trim() === '') {
      return '请输入有效规则';
    }
    
    // 去除多余空格
    rule = rule.trim();
    
    // 检查是否包含数据返回指令
    const hasDataInstruction = rule.includes('data-type=') || rule.includes('data=');
    
    if (format === 'loon') {
      // 如果是拒绝规则，将reject转为REJECT (大写)
      if (rule.includes(' - reject')) {
        return rule.replace(/ - reject(-\w+)?/ig, ' - REJECT$1');
      }
      
      // 如果包含数据返回指令，保持原样
      if (hasDataInstruction) {
        return rule;
      }
    } else if (format === 'surge') {
      // Surge格式与QX兼容，保持原样
      return rule;
    }
    
    return rule;
  }

  // 将转换函数绑定到window对象
  window.scriptConverter = {
    // 转换为Loon格式
    convertToLoon: function(content) {
      console.log("调用convertToLoon");
      // 处理单行规则的特殊情况
      if (!content.includes('\n') && 
          (content.includes('http') || content.includes('data-')) &&
          !content.includes('[') && !content.includes('#!name=')) {
        return convertSingleRule(content, 'loon');
      }
      return convertScript(content, 'loon');
    },
    
    // 转换为Surge格式
    convertToSurge: function(content) {
      console.log("调用convertToSurge");
      // 处理单行规则的特殊情况
      if (!content.includes('\n') && 
          (content.includes('http') || content.includes('data-')) &&
          !content.includes('[') && !content.includes('#!name=')) {
        return convertSingleRule(content, 'surge');
      }
      return convertScript(content, 'surge');
    },
    
    // 检测脚本类型
    detectScriptType: detectScriptType,
    
    // 测试用版本，直接处理单行规则
    convertRule: function(rule, format) {
      return convertSingleRule(rule, format);
    }
  };

  // 打印调试信息，确认脚本已加载
  console.log("脚本转换器已加载，版本1.3");
  
})(window); // 将window对象传入

// 添加一个全局测试函数，方便在控制台调用
function testConverter(rule, format) {
  console.log("测试转换: ", rule, "目标格式:", format);
  if (window.scriptConverter) {
    return window.scriptConverter.convertRule(rule, format);
  } else {
    return "scriptConverter未加载";
  }
}

// 确保页面加载完成后scriptConverter可用
document.addEventListener('DOMContentLoaded', function() {
  console.log("页面加载完成，scriptConverter状态:", window.scriptConverter ? "已加载" : "未加载");
});
