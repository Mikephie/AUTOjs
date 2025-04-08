/**
 * 标准格式转换器
 * 版本: 1.0
 * 特点: 严格遵守Loon/Surge格式规范
 * 移植: 从Scriptable移植至Node.js
 */
const fs = require('fs');
const path = require('path');

// 解析脚本内容
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
  
  // 提取hostname
  extractHostname(loonSections.MITM, qxSections.mitm, result);
  
  return result;
}

// 提取元数据
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
  
  // 如果没有找到name，尝试从内容猜测
  if (!result.metadata.name) {
    const titleMatch = content.match(/彩云天气|caiyun|AXS Payment|([^\n]+脚本)/i);
    if (titleMatch) {
      result.metadata.name = titleMatch[0].trim();
    } else {
      result.metadata.name = "custom_script";
    }
  }
}

// 提取hostname
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

// 解析带注释的节点
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

// 解析QX规则
function parseQXRules(sectionContent, result) {
  parseSectionWithComments(sectionContent, result.rules);
  
  // 转换QX规则为Loon格式
  for (let i = 0; i < result.rules.length; i++) {
    const rule = result.rules[i];
    
    // 转换格式
    if (rule.content.startsWith('host,')) {
      const parts = rule.content.split(',');
      if (parts.length >= 3) {
        rule.content = `DOMAIN,${parts[1]},${parts[2]}`;
      }
    } else if (rule.content.startsWith('url-regex,')) {
      const parts = rule.content.split(',');
      if (parts.length >= 3) {
        rule.content = `URL-REGEX,${parts[1]},${parts[2]}`;
      }
    }
  }
}

// 解析QX重写
function parseQXRewrites(sectionContent, result) {
  const lines = sectionContent.split('\n');
  let currentComment = "";
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    if (line.startsWith('#')) {
      // 收集注释
      currentComment = line;
    } else if (line.includes(' url ')) {
      const parts = line.split(' url ');
      const pattern = parts[0].trim();
      const action = parts[1].trim();
      
      if (action.startsWith('reject')) {
        // reject规则 -> Rewrite
        result.rewrites.push({
          content: `${pattern} - ${action}`,
          comment: currentComment
        });
      } else if (action.startsWith('script-')) {
        // 脚本规则 -> Script
        const scriptParts = action.split(' ');
        const scriptType = scriptParts[0];
        const scriptPath = scriptParts[1];
        
        // 确定类型
        const httpType = scriptType.includes('response') ? 'http-response' : 'http-request';
        const requiresBody = scriptType.includes('body') ? 'true' : 'false';
        
        // 提取脚本名称作为tag
        let tag = "caiyun";
        if (scriptPath && scriptPath.includes('/')) {
          const scriptName = scriptPath.split('/').pop().split('.')[0];
          if (scriptName) tag = scriptName;
        }
        
        result.scripts.push({
          content: `${httpType} ${pattern} script-path=${scriptPath}, requires-body=${requiresBody}, timeout=60, tag=${tag}`,
          comment: currentComment
        });
      }
      
      // 重置注释
      currentComment = "";
    }
  }
}

// 转换为Surge格式
function convertToSurge(scriptInfo) {
  // 使用元数据
  const name = scriptInfo.metadata.name || "custom_script";
  const desc = scriptInfo.metadata.desc || "配置信息";
  const category = scriptInfo.metadata.category || "🔐APP";
  const author = scriptInfo.metadata.author || "Converter";
  
  let config = `#!name = ${name}
#!desc = ${desc}
#!category = ${category}
#!author = ${author}`;

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
      
      config += `\n${rule.content}`;
    }
  }

  // 处理Map Local部分 - 用于reject规则
  const rejectRules = scriptInfo.rewrites.filter(r => 
    r.content.includes(' - reject')
  );
  
  if (rejectRules.length > 0) {
    config += "\n\n[Map Local]";
    
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
      const rejectType = parts[1].trim();
      
      // 设置数据类型
      let dataType = "text";
      let data = "{}";
      
      if (rejectType.includes('img')) {
        dataType = "img";
      } else if (rejectType.includes('array')) {
        data = "[]";
      }
      
      config += `\n${pattern} data-type=${dataType} data="${data}" status-code=200`;
    }
  }

  // 处理Script部分
  if (scriptInfo.scripts.length > 0) {
    config += "\n\n[Script]";
    
    let lastComment = "";
    let ruleCounter = 0;
    
    for (const rule of scriptInfo.scripts) {
      // 如果有新注释，添加它
      if (rule.comment && rule.comment !== lastComment) {
        config += `\n${rule.comment}`;
        lastComment = rule.comment;
      }
      
      // 解析Loon脚本规则
      const match = rule.content.match(/(http-(?:response|request))\s+([^\s]+)\s+script-path=([^,]+)/);
      if (!match) continue;
      
      const httpType = match[1].includes('response') ? 'response' : 'request';
      const pattern = match[2];
      const scriptPath = match[3];
      
      // 确定requires-body
      const requiresBody = rule.content.includes('requires-body=true') ? 'true' : 'false';
      
      // 构建Surge脚本规则
      const ruleName = ruleCounter === 0 ? name : `${name}_${ruleCounter+1}`;
      config += `\n${ruleName} = type=http-${httpType}, pattern=${pattern}, script-path=${scriptPath}, requires-body=${requiresBody}, max-size=-1, timeout=60`;
      
      ruleCounter++;
    }
  }
  
  // MITM部分
  if (scriptInfo.hostname) {
    config += `\n\n[MITM]\nhostname = %APPEND% ${scriptInfo.hostname}`;
  }
  
  return config;
}

// 转换为Loon格式
function convertToLoon(scriptInfo) {
  // 使用元数据
  const name = scriptInfo.metadata.name || "custom_script";
  const desc = scriptInfo.metadata.desc || "配置信息";
  const category = scriptInfo.metadata.category || "🔐APP";
  const author = scriptInfo.metadata.author || "Converter";
  const icon = scriptInfo.metadata.icon || `https://raw.githubusercontent.com/Mikephie/icons/main/icon/${name.toLowerCase()}.png`;
  
  let config = `#!name = ${name}
#!desc = ${desc}
#!category = ${category}
#!author = ${author}
#!icon = ${icon}`;

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
      
      config += `\n${rule.content}`;
    }
  }

  // 处理Rewrite部分
  if (scriptInfo.rewrites.length > 0) {
    config += "\n\n[Rewrite]";
    
    let lastComment = "";
    for (const rule of scriptInfo.rewrites) {
      // 如果有新注释，添加它
      if (rule.comment && rule.comment !== lastComment) {
        config += `\n${rule.comment}`;
        lastComment = rule.comment;
      }
      
      config += `\n${rule.content}`;
    }
  }

  // 处理Script部分
  if (scriptInfo.scripts.length > 0) {
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
  }
  
  // MITM部分
  if (scriptInfo.hostname) {
    config += `\n\n[MITM]\nhostname = ${scriptInfo.hostname}`;
  }
  
  return config;
}

// 提取注释块内容
function extractScriptContent(content) {
  // 检查是否是被 /* */ 包裹的内容
  const commentMatch = content.match(/\/\*([\s\S]*)\*\//);
  if (commentMatch && commentMatch[1]) {
    return commentMatch[1].trim();
  }
  
  return content;
}

// 主函数 - 处理单个文件
function processScript(inputContent, outputFormat) {
  try {
    // 提取真正的脚本内容
    const scriptContent = extractScriptContent(inputContent);
    
    // 解析脚本
    const scriptInfo = parseScript(scriptContent);
    
    // 根据格式生成配置
    if (outputFormat.toLowerCase() === 'surge') {
      return convertToSurge(scriptInfo);
    } else {
      return convertToLoon(scriptInfo);
    }
  } catch (error) {
    console.error(`处理脚本时出错: ${error.message}`);
    throw error;
  }
}

// 批量处理目录中的所有脚本
function batchProcessDirectory(inputDir, outputDir, outputFormat) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const files = fs.readdirSync(inputDir);
  const results = [];
  
  for (const file of files) {
    if (file.endsWith('.js') || file.endsWith('.conf')) {
      try {
        const inputPath = path.join(inputDir, file);
        const outputFileName = file.replace(/\.(js|conf)$/, outputFormat.toLowerCase() === 'surge' ? '.sgmodule' : '.plugin');
        const outputPath = path.join(outputDir, outputFileName);
        
        // 读取
        const content = fs.readFileSync(inputPath, 'utf8');
        
        // 处理
        const result = processScript(content, outputFormat);
        
        // 保存
        fs.writeFileSync(outputPath, result, 'utf8');
        
        results.push({
          file,
          success: true,
          outputFile: outputFileName
        });
      } catch (error) {
        results.push({
          file,
          success: false,
          error: error.message
        });
      }
    }
  }
  
  return results;
}

// 处理GitHub Action Workflow中的脚本
function processFromGitHub() {
  // 从环境变量中获取参数
  const inputDir = process.env.INPUT_DIR || 'input';
  const outputDir = process.env.OUTPUT_DIR || 'output';
  const outputFormat = process.env.OUTPUT_FORMAT || 'loon';
  
  console.log(`开始处理脚本，输入目录: ${inputDir}，输出目录: ${outputDir}，输出格式: ${outputFormat}`);
  
  try {
    // 批量处理目录中的所有文件
    const results = batchProcessDirectory(inputDir, outputDir, outputFormat);
    
    // 输出处理结果摘要
    console.log('处理结果:');
    for (const result of results) {
      if (result.success) {
        console.log(`✅ ${result.file} -> ${result.outputFile}`);
      } else {
        console.log(`❌ ${result.file} 失败: ${result.error}`);
      }
    }
    
    // 设置GitHub Actions输出
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`::set-output name=success_count::${successCount}`);
    console.log(`::set-output name=fail_count::${failCount}`);
    console.log(`::set-output name=total_count::${results.length}`);
    
    // 如果有失败项，设置错误代码
    if (failCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error(`处理过程中发生错误: ${error.message}`);
    process.exit(1);
  }
}

// 处理单个文件的命令行模式
function processSingleFile() {
  // 命令行参数
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('用法: node script-converter.js <input-file> <output-file> <format>');
    console.log('格式: surge 或 loon');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputFile = args[1];
  const format = args[2].toLowerCase();
  
  if (format !== 'surge' && format !== 'loon') {
    console.error('格式必须是 "surge" 或 "loon"');
    process.exit(1);
  }
  
  try {
    // 读取
    const content = fs.readFileSync(inputFile, 'utf8');
    
    // 处理
    const result = processScript(content, format);
    
    // 保存
    fs.writeFileSync(outputFile, result, 'utf8');
    
    console.log(`✅ 转换成功: ${inputFile} -> ${outputFile}`);
  } catch (error) {
    console.error(`❌ 转换失败: ${error.message}`);
    process.exit(1);
  }
}

// 根据运行环境选择入口点
if (process.env.GITHUB_ACTIONS) {
  // GitHub Actions环境
  processFromGitHub();
} else {
  // 命令行环境
  processSingleFile();
}

// 导出函数供测试使用
module.exports = {
  parseScript,
  convertToSurge,
  convertToLoon,
  processScript
};
