#!/usr/bin/env node

/**
 * 批量处理所有 QuantumultX 脚本 URL
 * 将本地路径替换为远程 URL
 */

const fs = require('fs').promises;
const path = require('path');

// 配置
const CONFIG = {
  // 输入/输出目录
  inputDir: 'quantumultx',
  outputDir: 'quantumultx',
  
  // 远程基础 URL
  remoteBaseUrl: 'https://raw.githubusercontent.com/Mikephie/AUTOjs/refs/heads/main/quantumultx',
  
  // 文件模式
  filePatterns: ['.conf', '.txt', '.js'],
  
  // 是否备份原文件
  backup: true
};

/**
 * 主函数
 */
async function main() {
  console.log('===== 批量处理 QuantumultX 脚本 URL =====');
  console.log(`输入目录: ${CONFIG.inputDir}`);
  console.log(`输出目录: ${CONFIG.outputDir}`);
  console.log(`远程基础URL: ${CONFIG.remoteBaseUrl}`);
  
  try {
    // 确保输出目录存在
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    
    // 获取所有配置文件
    const files = await findFiles(CONFIG.inputDir, CONFIG.filePatterns);
    console.log(`找到 ${files.length} 个文件需要处理`);
    
    if (files.length === 0) {
      console.log('没有找到匹配的文件');
      return;
    }
    
    // 处理每个文件
    let successCount = 0;
    let modifiedCount = 0;
    
    for (const file of files) {
      console.log(`\n处理文件: ${file}`);
      
      try {
        const result = await processFile(file);
        
        if (result.success) {
          successCount++;
          if (result.modified) {
            modifiedCount++;
          }
        }
      } catch (err) {
        console.error(`处理文件 ${file} 失败: ${err.message}`);
      }
    }
    
    console.log(`\n处理完成: ${successCount}/${files.length} 个文件成功，${modifiedCount} 个文件被修改`);
  } catch (err) {
    console.error('处理过程出错:', err);
    process.exit(1);
  }
}

/**
 * 查找匹配的文件
 * @param {string} dir - 目录
 * @param {string[]} patterns - 文件模式
 * @returns {Promise<string[]>} - 文件路径数组
 */
async function findFiles(dir, patterns) {
  const result = [];
  
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        // 递归处理子目录
        const subFiles = await findFiles(fullPath, patterns);
        result.push(...subFiles);
      } else if (item.isFile()) {
        // 检查文件扩展名
        if (patterns.some(ext => item.name.endsWith(ext))) {
          result.push(fullPath);
        }
      }
    }
  } catch (err) {
    console.error(`读取目录 ${dir} 失败:`, err);
  }
  
  return result;
}

/**
 * 处理单个文件
 * @param {string} filePath - 文件路径
 * @returns {Promise<Object>} - 处理结果
 */
async function processFile(filePath) {
  // 读取文件内容
  const content = await fs.readFile(filePath, 'utf-8');
  
  // 查找和替换 script-response-body 或 script-request-body 后面的本地路径
  const pattern = /(script-(?:response|request)-body\s+)\.\/[^\s\n]+/g;
  
  // 检查是否包含需要替换的模式
  if (!pattern.test(content)) {
    console.log(`文件不包含需要替换的本地路径`);
    return { success: true, modified: false };
  }
  
  // 重置正则表达式状态
  pattern.lastIndex = 0;
  
  // 替换本地路径为远程URL
  let modifiedContent = content.replace(pattern, (match, prefix) => {
    // 提取脚本文件名
    const scriptPath = match.substring(prefix.length);
    const scriptName = scriptPath.split('/').pop();
    
    // 构建远程URL
    const remoteUrl = `${CONFIG.remoteBaseUrl}/${scriptName}`;
    
    console.log(`替换: ${scriptPath} -> ${remoteUrl}`);
    
    return `${prefix}${remoteUrl}`;
  });
  
  // 检查内容是否有变化
  if (content === modifiedContent) {
    console.log(`文件内容没有变化`);
    return { success: true, modified: false };
  }
  
  // 备份原文件
  if (CONFIG.backup) {
    const backupPath = `${filePath}.bak`;
    await fs.writeFile(backupPath, content);
    console.log(`已备份原文件: ${backupPath}`);
  }
  
  // 写入修改后的内容
  await fs.writeFile(filePath, modifiedContent);
  console.log(`已写入修改后的内容: ${filePath}`);
  
  return { success: true, modified: true };
}

// 运行主函数
main().catch(err => {
  console.error('未处理的错误:', err);
  process.exit(1);
});