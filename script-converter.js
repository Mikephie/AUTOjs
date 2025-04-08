/**
 * 脚本转换器模块
 */

/**
 * 从文件内容中提取脚本内容
 * @param {string} content 文件内容
 * @returns {string} 提取的脚本内容
 */
function extractScriptContent(content) {
  // 移除注释和空行，保留核心脚本内容
  // 这是一个简单实现，可能需要根据实际脚本格式进行调整
  return content.trim();
}

/**
 * 解析脚本内容，提取元数据和主体
 * @param {string} content 脚本内容
 * @returns {Object} 解析后的脚本信息
 */
function parseScript(content) {
  // 基本的脚本信息提取
  const lines = content.split('\n');
  const metadata = {};
  const scriptBody = [];
  let inMetadata = false;
  
  // 尝试提取元数据（通常在注释中）
  for (const line of lines) {
    // 检测元数据格式，例如: // @name MyScript
    const metaMatch = line.match(/\/\/\s*@(\w+)\s+(.*)/);
    if (metaMatch) {
      const [, key, value] = metaMatch;
      metadata[key] = value.trim();
    } else if (!line.trim().startsWith('//')) {
      // 如果不是注释行，认为是脚本主体
      scriptBody.push(line);
    }
  }
  
  return {
    metadata,
    body: scriptBody.join('\n')
  };
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
  
  // 添加脚本主体
  result += `[Script]\n`;
  
  // 如果有cron定义，添加定时任务
  if (metadata.cron) {
    result += `cron "${metadata.cron}" script-path=${metadata.name || 'script'}.js, tag=${metadata.name || 'script'}\n`;
  }
  
  // 如果有HTTP请求脚本
  if (metadata.http || metadata.mitm) {
    const pattern = metadata.pattern || '*';
    result += `http-response ${pattern} script-path=${metadata.name || 'script'}.js, requires-body=true, tag=${metadata.name || 'http-script'}\n`;
  }
  
  // 如果需要MITM
  if (metadata.mitm) {
    result += `\n[MITM]\n`;
    result += `hostname = ${metadata.mitm}\n`;
  }
  
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
  
  // 添加脚本主体
  result += `[Script]\n`;
  
  // 如果有cron定义，添加定时任务
  if (metadata.cron) {
    result += `${metadata.name || 'script'} = type=cron,cronexp="${metadata.cron}",script-path=${metadata.name || 'script'}.js\n`;
  }
  
  // 如果有HTTP请求脚本
  if (metadata.http || metadata.mitm) {
    const pattern = metadata.pattern || '*';
    result += `${metadata.name || 'http-script'} = type=http-response,pattern=${pattern},requires-body=1,script-path=${metadata.name || 'script'}.js\n`;
  }
  
  // 如果需要MITM
  if (metadata.mitm) {
    result += `\n[MITM]\n`;
    result += `hostname = %APPEND% ${metadata.mitm}\n`;
  }
  
  return result;
}

module.exports = {
  extractScriptContent,
  parseScript,
  convertToLoon,
  convertToSurge
};
