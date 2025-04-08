/**
 * 脚本转换器模块 - 改进版
 */

/**
 * 从文件内容中提取脚本内容
 * @param {string} content 文件内容
 * @returns {string} 提取的脚本内容
 */
function extractScriptContent(content) {
  // 直接返回原始内容，保留所有信息以便更好地解析
  return content;
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
  
  // 尝试提取更多可能的元数据格式
  for (const line of lines) {
    // 检测多种元数据格式
    // 格式1: // @name MyScript
    const metaMatch1 = line.match(/\/\/\s*@(\w+)\s+(.*)/);
    // 格式2: // name: MyScript
    const metaMatch2 = line.match(/\/\/\s*(\w+):\s*(.*)/);
    // 格式3: /* name: MyScript */
    const metaMatch3 = line.match(/\/\*\s*(\w+):\s*(.*)\s*\*\//);
    // 格式4: // #!name MyScript
    const metaMatch4 = line.match(/\/\/\s*#!(\w+)\s+(.*)/);
    
    if (metaMatch1) {
      const [, key, value] = metaMatch1;
      metadata[key] = value.trim();
    } else if (metaMatch2) {
      const [, key, value] = metaMatch2;
      metadata[key] = value.trim();
    } else if (metaMatch3) {
      const [, key, value] = metaMatch3;
      metadata[key] = value.trim();
    } else if (metaMatch4) {
      const [, key, value] = metaMatch4;
      metadata[key] = value.trim();
    } else if (!line.trim().startsWith('//') && !line.trim().startsWith('/*')) {
      // 如果不是注释行，认为是脚本主体
      scriptBody.push(line);
    }
  }
  
  // 尝试从文件内容自动分析脚本名称（如果元数据未提供）
  if (!metadata.name) {
    // 寻找可能的脚本名称模式
    for (const line of lines) {
      // 查找明显的名称定义，如变量赋值
      const nameMatch = line.match(/(const|let|var)\s+(\w+Name|scriptName|NAME|SCRIPT_NAME)\s*=\s*['"](.*)['"]/);
      if (nameMatch) {
        metadata.name = nameMatch[3].trim();
        break;
      }
      
      // 查找函数名称，可能是脚本的主函数
      const funcMatch = line.match(/function\s+(\w+)\s*\(\)/);
      if (funcMatch && !['main', 'init', 'start', 'run'].includes(funcMatch[1].toLowerCase())) {
        metadata.name = funcMatch[1].trim();
        break;
      }
    }
  }
  
  // 如果脚本内有日期相关内容，可能是定时任务
  if (!metadata.cron) {
    const cronContent = content.match(/每日|每天|定时|cron|scheduler|timer/i);
    if (cronContent) {
      metadata.cron = "0 9 * * *"; // 默认为每天早上9点
    }
  }
  
  // 检测是否需要MITM
  if (!metadata.mitm) {
    const mitmContent = content.match(/request|http|fetch|url|api|\.com|\.net|\.org|\.cn/i);
    if (mitmContent) {
      // 尝试从内容中提取域名
      const domainMatch = content.match(/['"]https?:\/\/([^\/'"]+)/);
      if (domainMatch) {
        metadata.mitm = domainMatch[1];
      }
    }
  }
  
  // 尝试分析脚本可能的描述
  if (!metadata.desc && !metadata.description) {
    // 查找文件顶部可能的描述注释
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim();
      if (line.startsWith('//') && line.length > 3 && !line.match(/[@#!](\w+)/)) {
        const desc = line.replace(/^\/\/\s*/, '').trim();
        if (desc.length > 5 && desc.length < 100) {
          metadata.desc = desc;
          break;
        }
      }
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
  
  // 如果没有名称，从文件名中提取
  const scriptName = metadata.name || '脚本';
  
  let result = `#!name=${scriptName}\n`;
  result += `#!desc=${metadata.desc || metadata.description || scriptName + '自动转换'}\n`;
  result += `#!author=${metadata.author || '未知作者'}\n`;
  result += `#!homepage=${metadata.homepage || ''}\n`;
  result += `#!icon=${metadata.icon || ''}\n\n`;
  
  // 添加脚本主体
  result += `[Script]\n`;
  
  // 如果有cron定义，添加定时任务
  if (metadata.cron) {
    result += `cron "${metadata.cron}" script-path=${scriptName}.js, tag=${scriptName}\n`;
  }
  
  // 如果有HTTP请求脚本
  if (metadata.http || metadata.mitm) {
    const pattern = metadata.pattern || '*';
    result += `http-response ${pattern} script-path=${scriptName}.js, requires-body=true, tag=${scriptName}\n`;
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
  
  // 如果没有名称，从文件名中提取
  const scriptName = metadata.name || '脚本';
  
  let result = `#!name=${scriptName}\n`;
  result += `#!desc=${metadata.desc || metadata.description || scriptName + '自动转换'}\n`;
  result += `#!author=${metadata.author || '未知作者'}\n`;
  result += `#!homepage=${metadata.homepage || ''}\n`;
  result += `#!icon=${metadata.icon || ''}\n\n`;
  
  // 添加脚本主体
  result += `[Script]\n`;
  
  // 如果有cron定义，添加定时任务
  if (metadata.cron) {
    result += `${scriptName} = type=cron,cronexp="${metadata.cron}",script-path=${scriptName}.js\n`;
  }
  
  // 如果有HTTP请求脚本
  if (metadata.http || metadata.mitm) {
    const pattern = metadata.pattern || '*';
    result += `${scriptName} = type=http-response,pattern=${pattern},requires-body=1,script-path=${scriptName}.js\n`;
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
