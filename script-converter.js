/**
 * 脚本转换器模块 - 支持QuantumultX、Loon和Surge格式互转
 */

/**
 * 从文件内容中提取脚本内容
 * @param {string} content 文件内容
 * @returns {string} 提取的脚本内容
 */
function extractScriptContent(content) {
  // 移除多余的空行，但保留基本结构
  return content.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * 解析脚本内容，提取元数据和主体
 * @param {string} content 脚本内容
 * @param {string} type 脚本类型 (quantumultx, loon, surge)
 * @returns {Object} 解析后的脚本信息
 */
function parseScript(content, type = 'unknown') {
  const metadata = {};
  let scriptBody = [];
  
  // 根据不同类型脚本使用不同的解析策略
  if (type === 'quantumultx' || type === 'unknown') {
    return parseQuantumultXScript(content);
  } else if (type === 'loon') {
    return parseLoonScript(content);
  } else if (type === 'surge') {
    return parseSurgeScript(content);
  }
  
  // 如果无法识别类型，尝试通用解析方法
  return parseGenericScript(content);
}

/**
 * 解析QuantumultX格式脚本
 * @param {string} content 脚本内容
 * @returns {Object} 解析后的脚本信息
 */
function parseQuantumultXScript(content) {
  const lines = content.split('\n');
  const metadata = {};
  const scriptBody = [];
  let inMetadata = true;
  let scriptType = 'normal';
  
  // QuantumultX通常的元数据格式
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 检测常见的QuantumultX元数据格式
    // 例如: // @name MyScript 或 # name=MyScript
    const metaMatch1 = trimmedLine.match(/\/\/\s*@(\w+)\s+(.*)/);
    const metaMatch2 = trimmedLine.match(/[#;]\s*(\w+)\s*=\s*(.*)/);
    
    if (metaMatch1) {
      const [, key, value] = metaMatch1;
      metadata[key] = value.trim();
      continue;
    } else if (metaMatch2) {
      const [, key, value] = metaMatch2;
      metadata[key] = value.trim();
      continue;
    }
    
    // 检测HTTP任务或cron任务的定义
    if (trimmedLine.includes('type=http-') || trimmedLine.includes('url-and-header')) {
      scriptType = 'http';
      // 提取pattern信息
      const patternMatch = trimmedLine.match(/pattern=([^,]+)/);
      if (patternMatch) {
        metadata.pattern = patternMatch[1];
      }
      
      // 提取MITM信息
      if (trimmedLine.includes('requires-body=1') || trimmedLine.includes('requires-body=true')) {
        metadata.requiresBody = true;
      }
      continue;
    } else if (trimmedLine.includes('type=cron') || trimmedLine.includes('cronexp=')) {
      scriptType = 'cron';
      // 提取cron表达式
      const cronMatch = trimmedLine.match(/cronexp="([^"]+)"/);
      if (cronMatch) {
        metadata.cron = cronMatch[1];
      }
      continue;
    }
    
    // 检测MITM部分
    if (trimmedLine.startsWith('[MITM]') || trimmedLine.toLowerCase().includes('hostname')) {
      const hostMatch = trimmedLine.match(/hostname\s*=\s*(.*)/);
      if (hostMatch) {
        metadata.mitm = hostMatch[1].replace(/%APPEND%/g, '').trim();
      }
      continue;
    }
    
    // 识别脚本主体开始
    if (inMetadata && (trimmedLine.startsWith('function') || trimmedLine.includes('{') || 
        trimmedLine.startsWith('var') || trimmedLine.startsWith('let') || 
        trimmedLine.startsWith('const'))) {
      inMetadata = false;
    }
    
    // 收集脚本主体
    if (!inMetadata && trimmedLine && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('//')) {
      scriptBody.push(line);
    } else if (trimmedLine.startsWith('/*') || trimmedLine.endsWith('*/')) {
      // 处理多行注释
      if (inMetadata) {
        // 尝试从多行注释中提取元数据
        const nameMatch = line.match(/name[:\s]+([^\n]+)/i);
        const descMatch = line.match(/desc(?:ription)?[:\s]+([^\n]+)/i);
        const authorMatch = line.match(/author[:\s]+([^\n]+)/i);
        
        if (nameMatch) metadata.name = nameMatch[1].trim();
        if (descMatch) metadata.desc = descMatch[1].trim();
        if (authorMatch) metadata.author = authorMatch[1].trim();
      }
    }
  }
  
  // 设置脚本类型
  metadata.scriptType = scriptType;
  
  return {
    metadata,
    body: scriptBody.join('\n')
  };
}

/**
 * 解析Loon格式脚本
 * @param {string} content 脚本内容
 * @returns {Object} 解析后的脚本信息
 */
function parseLoonScript(content) {
  const lines = content.split('\n');
  const metadata = {};
  const scriptBody = [];
  let inScript = false;
  
  for (const line of lines) {
    // 解析Loon特定的元数据格式
    // 例如: #!name=MyScript
    const metaMatch = line.match(/#!(\w+)=(.+)/);
    if (metaMatch) {
      const [, key, value] = metaMatch;
      metadata[key] = value.trim();
      continue;
    }
    
    // 检测cron任务
    if (line.includes('cron "') || line.includes('script-path=')) {
      const cronMatch = line.match(/cron "([^"]+)"/);
      if (cronMatch) {
        metadata.cron = cronMatch[1].trim();
      }
      
      const scriptPathMatch = line.match(/script-path=([^,\s]+)/);
      if (scriptPathMatch) {
        metadata.scriptPath = scriptPathMatch[1].trim();
      }
      
      continue;
    }
    
    // 检测HTTP任务
    if (line.includes('http-response') || line.includes('http-request')) {
      const patternMatch = line.match(/http-(?:response|request) ([^ ]+)/);
      if (patternMatch) {
        metadata.pattern = patternMatch[1].trim();
      }
      
      if (line.includes('requires-body=true')) {
        metadata.requiresBody = true;
      }
      
      continue;
    }
    
    // 检测MITM部分
    if (line.startsWith('[MITM]') || line.toLowerCase().includes('hostname')) {
      const hostMatch = line.match(/hostname\s*=\s*(.*)/);
      if (hostMatch) {
        metadata.mitm = hostMatch[1].trim();
      }
      continue;
    }
    
    // 收集脚本主体
    if (inScript || (line.trim() && !line.startsWith('#') && !line.startsWith('['))) {
      inScript = true;
      scriptBody.push(line);
    }
  }
  
  return {
    metadata,
    body: scriptBody.join('\n')
  };
}

/**
 * 解析Surge格式脚本
 * @param {string} content 脚本内容
 * @returns {Object} 解析后的脚本信息
 */
function parseSurgeScript(content) {
  const lines = content.split('\n');
  const metadata = {};
  const scriptBody = [];
  let inScript = false;
  
  for (const line of lines) {
    // 解析Surge特定的元数据格式
    const metaMatch = line.match(/#!(\w+)=(.+)/);
    if (metaMatch) {
      const [, key, value] = metaMatch;
      metadata[key] = value.trim();
      continue;
    }
    
    // 检测脚本配置
    if (line.includes('type=cron') || line.includes('cronexp=')) {
      const cronMatch = line.match(/cronexp="([^"]+)"/);
      if (cronMatch) {
        metadata.cron = cronMatch[1].trim();
      }
      continue;
    }
    
    // 检测HTTP任务
    if (line.includes('type=http-response') || line.includes('type=http-request')) {
      const patternMatch = line.match(/pattern=([^,]+)/);
      if (patternMatch) {
        metadata.pattern = patternMatch[1].trim();
      }
      
      if (line.includes('requires-body=1')) {
        metadata.requiresBody = true;
      }
      
      continue;
    }
    
    // 检测MITM部分
    if (line.startsWith('[MITM]') || line.toLowerCase().includes('hostname')) {
      const hostMatch = line.match(/hostname\s*=\s*(?:%APPEND%\s*)?(.*)/);
      if (hostMatch) {
        metadata.mitm = hostMatch[1].trim();
      }
      continue;
    }
    
    // 收集脚本主体
    if (inScript || (line.trim() && !line.startsWith('#') && !line.startsWith('['))) {
      inScript = true;
      scriptBody.push(line);
    }
  }
  
  return {
    metadata,
    body: scriptBody.join('\n')
  };
}

/**
 * 通用脚本解析方法（尝试自动检测脚本类型）
 * @param {string} content 脚本内容
 * @returns {Object} 解析后的脚本信息
 */
function parseGenericScript(content) {
  // 尝试检测脚本类型
  if (content.includes('#!name=') || content.includes('#!desc=')) {
    // 可能是Loon或Surge格式
    if (content.includes('script-path=') && (content.includes('http-response') || content.includes('cron "'))) {
      return parseLoonScript(content);
    } else if (content.includes('type=') && (content.includes('type=http-response') || content.includes('type=cron'))) {
      return parseSurgeScript(content);
    }
  }
  
  // 默认尝试作为QuantumultX脚本解析
  return parseQuantumultXScript(content);
}

/**
 * 转换为Loon格式
 * @param {Object} scriptInfo 脚本信息
 * @returns {string} Loon格式的脚本内容
 */
function convertToLoon(scriptInfo) {
  const { metadata, body } = scriptInfo;
  
  let result = `#!name=${metadata.name || 'Unknown Script'}\n`;
  result += `#!desc=${metadata.desc || metadata.description || '脚本描述未提供'}\n`;
  result += `#!author=${metadata.author || '未知作者'}\n`;
  result += `#!homepage=${metadata.homepage || ''}\n`;
  result += `#!icon=${metadata.icon || ''}\n\n`;
  
  // 添加脚本主体设置
  result += `[Script]\n`;
  
  // 如果有cron定义，添加定时任务
  if (metadata.cron) {
    result += `cron "${metadata.cron}" script-path=${metadata.name || 'script'}.js, tag=${metadata.name || 'script'}\n`;
  }
  
  // 如果有HTTP请求脚本
  if (metadata.pattern || metadata.scriptType === 'http') {
    const pattern = metadata.pattern || '*';
    const requiresBody = metadata.requiresBody ? 'true' : 'false';
    result += `http-response ${pattern} script-path=${metadata.name || 'script'}.js, requires-body=${requiresBody}, tag=${metadata.name || 'http-script'}\n`;
  }
  
  // 如果需要MITM
  if (metadata.mitm) {
    result += `\n[MITM]\n`;
    result += `hostname = ${metadata.mitm}\n`;
  }
  
  // 添加脚本主体
  result += `\n${body}\n`;
  
  return result;
}

/**
 * 转换为Surge格式
 * @param {Object} scriptInfo 脚本信息
 * @returns {string} Surge格式的脚本内容
 */
function convertToSurge(scriptInfo) {
  const { metadata, body } = scriptInfo;
  
  let result = `#!name=${metadata.name || 'Unknown Script'}\n`;
  result += `#!desc=${metadata.desc || metadata.description || '脚本描述未提供'}\n`;
  result += `#!author=${metadata.author || '未知作者'}\n`;
  result += `#!homepage=${metadata.homepage || ''}\n`;
  result += `#!icon=${metadata.icon || ''}\n\n`;
  
  // 添加脚本主体设置
  result += `[Script]\n`;
  
  // 如果有cron定义，添加定时任务
  if (metadata.cron) {
    result += `${metadata.name || 'script'} = type=cron,cronexp="${metadata.cron}",script-path=${metadata.name || 'script'}.js\n`;
  }
  
  // 如果有HTTP请求脚本
  if (metadata.pattern || metadata.scriptType === 'http') {
    const pattern = metadata.pattern || '*';
    const requiresBody = metadata.requiresBody ? '1' : '0';
    result += `${metadata.name || 'http-script'} = type=http-response,pattern=${pattern},requires-body=${requiresBody},script-path=${metadata.name || 'script'}.js\n`;
  }
  
  // 如果需要MITM
  if (metadata.mitm) {
    result += `\n[MITM]\n`;
    result += `hostname = %APPEND% ${metadata.mitm}\n`;
  }
  
  // 添加脚本主体
  result += `\n${body}\n`;
  
  return result;
}

/**
 * 转换为QuantumultX格式
 * @param {Object} scriptInfo 脚本信息
 * @returns {string} QuantumultX格式的脚本内容
 */
function convertToQuantumultX(scriptInfo) {
  const { metadata, body } = scriptInfo;
  
  let result = '';
  
  // 添加元数据注释
  result += `/**\n`;
  result += ` * 名称: ${metadata.name || 'Unknown Script'}\n`;
  result += ` * 描述: ${metadata.desc || metadata.description || '脚本描述未提供'}\n`;
  result += ` * 作者: ${metadata.author || '未知作者'}\n`;
  if (metadata.homepage) result += ` * 主页: ${metadata.homepage}\n`;
  result += ` */\n\n`;
  
  // 添加QuantumultX常见元数据格式
  result += `// @name ${metadata.name || 'Unknown Script'}\n`;
  result += `// @desc ${metadata.desc || metadata.description || '脚本描述未提供'}\n`;
  result += `// @author ${metadata.author || '未知作者'}\n`;
  if (metadata.homepage) result += `// @homepage ${metadata.homepage}\n`;
  if (metadata.icon) result += `// @icon ${metadata.icon}\n`;
  
  // 添加配置信息（供复制使用）
  result += `\n/**\n * QuantumultX配置:\n`;
  
  // 如果有cron定义，添加定时任务配置
  if (metadata.cron) {
    result += ` * [task_local]\n`;
    result += ` * "${metadata.cron}" script-path=${metadata.name || 'script'}.js, tag=${metadata.name || 'script'}\n`;
  }
  
  // 如果有HTTP请求脚本
  if (metadata.pattern || metadata.scriptType === 'http') {
    const pattern = metadata.pattern || '*';
    const requiresBody = metadata.requiresBody ? 'requires-body=1' : '';
    result += ` * [rewrite_local]\n`;
    result += ` * ${pattern} url script-response-body ${metadata.name || 'script'}.js\n`;
  }
  
  // 如果需要MITM
  if (metadata.mitm) {
    result += ` * [mitm]\n`;
    result += ` * hostname = ${metadata.mitm}\n`;
  }
  
  result += ` */\n\n`;
  
  // 添加脚本主体
  result += body;
  
  return result;
}

/**
 * 检测脚本类型
 * @param {string} content 脚本内容
 * @returns {string} 脚本类型 (quantumultx, loon, surge, unknown)
 */
function detectScriptType(content) {
  // 检测QuantumultX特有标记
  if (content.includes('url script-response-body') || 
      content.includes('url script-request-body') ||
      content.includes('// @author') ||
      content.includes('// @name')) {
    return 'quantumultx';
  }
  
  // 检测Loon特有标记
  if (content.includes('#!name=') && 
      (content.includes('http-response') || content.includes('cron "')) &&
      content.includes('script-path=')) {
    return 'loon';
  }
  
  // 检测Surge特有标记
  if (content.includes('#!name=') && 
      (content.includes('type=http-response') || content.includes('type=cron')) &&
      content.includes('pattern=')) {
    return 'surge';
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
  
  // 解析脚本
  const scriptInfo = parseScript(extractedContent, sourceType);
  
  // 根据目标格式转换
  if (targetFormat === 'loon') {
    return convertToLoon(scriptInfo);
  } else if (targetFormat === 'surge') {
    return convertToSurge(scriptInfo);
  } else if (targetFormat === 'quantumultx') {
    return convertToQuantumultX(scriptInfo);
  }
  
  // 默认返回解析后但未转换的内容
  return JSON.stringify(scriptInfo, null, 2);
}

module.exports = {
  extractScriptContent,
  parseScript,
  convertToLoon,
  convertToSurge,
  convertToQuantumultX,
  convertScript,
  detectScriptType
};
