#!/usr/bin/env node

/**
 * QuantumultX URL 处理工具
 * 基于原始脚本开发，保持相同的风格和兼容性
 * 修复了连接地址问题
 */

// 使用原始脚本的导入风格
const fs = require('fs').promises;
const path = require('path');
const http = require('http');
const https = require('https');

// 导入原始脚本转换器模块
const converter = require('./script-converter');

// 默认参数
const DEFAULT_OPTIONS = {
  oldBaseUrl: 'https://raw.githubusercontent.com/Mikephie/Script/main/qx',
  newBaseUrl: 'https://raw.githubusercontent.com/Mikephie/AUTOjs/refs/heads/main/quantumultx',
  useLocalPaths: true,
  outputDir: 'quantumultx',
  debug: false
};

/**
 * HTTP/HTTPS GET请求
 * @param {string} url - 请求的URL
 * @returns {Promise<string>} - 响应内容
 */
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (response) => {
      // 处理重定向
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          console.log(`重定向到: ${redirectUrl}`);
          return httpGet(redirectUrl).then(resolve).catch(reject);
        }
      }
      
      if (response.statusCode !== 200) {
        return reject(new Error(`HTTP请求失败，状态码: ${response.statusCode}`));
      }
      
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * 处理QuantumultX脚本URL
 * @param {string} filePath - 脚本文件路径
 * @param {Object} options - 处理选项
 * @returns {Promise<Object>} - 处理结果
 */
async function processQXScriptUrl(filePath, options = {}) {
  // 合并选项
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { oldBaseUrl, newBaseUrl, useLocalPaths, outputDir, debug } = opts;
  
  try {
    // 读取文件内容
    console.log(`读取文件: ${filePath}`);
    const content = await fs.readFile(filePath, 'utf-8');
    
    // 提取脚本内容
    const extractedContent = converter.extractScriptContent(content);
    
    // 检查脚本类型
    const scriptType = converter.detectScriptType(extractedContent);
    if (scriptType !== 'quantumultx') {
      console.log(`不是QuantumultX脚本，跳过处理: ${filePath}`);
      return {
        success: false,
        message: '不是QuantumultX脚本',
        filePath
      };
    }
    
    console.log(`检测到QuantumultX脚本: ${filePath}`);
    
    // 查找rewrite_local部分
    const rewriteSection = extractedContent.match(/\[rewrite_local\]([\s\S]*?)(?=\[|$)/i);
    if (!rewriteSection || !rewriteSection[1]) {
      console.log(`没有找到[rewrite_local]部分，跳过处理: ${filePath}`);
      return {
        success: false,
        message: '没有找到[rewrite_local]部分',
        filePath
      };
    }
    
    // 确保输出目录存在
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`确保输出目录存在: ${outputDir}`);
    
    // 处理rewrite_local部分
    const lines = rewriteSection[1].split('\n');
    let updatedLines = [];
    const downloadPromises = [];
    let processedCount = 0;
    
    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('#')) {
        // 保留空行和注释
        updatedLines.push(line);
        continue;
      }
      
      // 检查是否包含脚本URL
      if (line.includes(' url script-')) {
        // 首先检查是否包含旧的基础URL
        if (line.includes(oldBaseUrl)) {
          const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
          if (urlMatch && urlMatch[1]) {
            const scriptUrl = urlMatch[1];
            const scriptName = scriptUrl.split('/').pop();
            
            console.log(`发现脚本URL: ${scriptUrl}`);
            processedCount++;
            
            if (useLocalPaths) {
              // 下载脚本并替换URL为本地路径
              const downloadPromise = (async () => {
                try {
                  console.log(`下载脚本: ${scriptUrl}`);
                  const scriptContent = await httpGet(scriptUrl);
                  
                  // 保存到本地
                  const localPath = path.join(outputDir, scriptName);
                  await fs.writeFile(localPath, scriptContent);
                  console.log(`脚本已保存到: ${localPath}`);
                  
                  // 替换URL为本地相对路径 - 修复格式问题
                  // 使用完整路径格式 ./quantumultx/scriptname.js
                  return line.replace(scriptUrl, `./${outputDir}/${scriptName}`);
                } catch (err) {
                  console.error(`下载脚本失败 ${scriptUrl}: ${err.message}`);
                  
                  // 下载失败时使用新的远程URL
                  if (newBaseUrl) {
                    const newUrl = `${newBaseUrl}/${scriptName}`;
                    console.log(`替换为新的远程URL: ${newUrl}`);
                    return line.replace(scriptUrl, newUrl);
                  }
                  
                  return line; // 保持原始URL
                }
              })();
              
              downloadPromises.push(downloadPromise);
              updatedLines.push(downloadPromise);
            } else {
              // 直接替换为新的远程URL
              const newUrl = `${newBaseUrl}/${scriptName}`;
              console.log(`替换URL: ${scriptUrl} -> ${newUrl}`);
              updatedLines.push(line.replace(scriptUrl, newUrl));
            }
          } else {
            updatedLines.push(line);
          }
        } else if (useLocalPaths) {
          // 处理可能已经是本地路径或其他URL的情况
          // 检查是否包含 script-response-body 或 script-request-body 后跟一个URL或路径
          const scriptPathMatch = line.match(/script-(?:response|request)-body\s+([^\s]+)/);
          if (scriptPathMatch && scriptPathMatch[1]) {
            const scriptPath = scriptPathMatch[1];
            
            // 如果不是本地路径（以./或/开头），且是远程URL，则下载
            if (!scriptPath.startsWith('./') && !scriptPath.startsWith('/') && scriptPath.match(/^https?:\/\//)) {
              const scriptUrl = scriptPath;
              const scriptName = scriptUrl.split('/').pop();
              
              console.log(`发现其他脚本URL: ${scriptUrl}`);
              processedCount++;
              
              const downloadPromise = (async () => {
                try {
                  console.log(`下载脚本: ${scriptUrl}`);
                  const scriptContent = await httpGet(scriptUrl);
                  
                  // 保存到本地
                  const localPath = path.join(outputDir, scriptName);
                  await fs.writeFile(localPath, scriptContent);
                  console.log(`脚本已保存到: ${localPath}`);
                  
                  // 替换URL为本地相对路径
                  return line.replace(scriptUrl, `./${outputDir}/${scriptName}`);
                } catch (err) {
                  console.error(`下载脚本失败 ${scriptUrl}: ${err.message}`);
                  return line; // 保持原始URL
                }
              })();
              
              downloadPromises.push(downloadPromise);
              updatedLines.push(downloadPromise);
            } else {
              updatedLines.push(line);
            }
          } else {
            updatedLines.push(line);
          }
        } else {
          updatedLines.push(line);
        }
      } else {
        updatedLines.push(line);
      }
    }
    
    // 等待所有下载完成
    if (downloadPromises.length > 0) {
      console.log(`等待 ${downloadPromises.length} 个下载任务完成...`);
      await Promise.all(downloadPromises);
      
      // 解析所有promise结果
      for (let i = 0; i < updatedLines.length; i++) {
        if (updatedLines[i] instanceof Promise) {
          updatedLines[i] = await updatedLines[i];
        }
      }
    }
    
    // 更新rewrite_local部分
    let updatedContent = extractedContent.replace(
      rewriteSection[1],
      updatedLines.join('\n')
    );
    
    // 如果原始内容是被注释包裹的，恢复注释包裹
    if (content.trim().startsWith('/*') && content.trim().endsWith('*/')) {
      updatedContent = `/*${updatedContent}*/`;
    }
    
    // 保存处理后的脚本
    const fileName = path.basename(filePath);
    const outputPath = path.join(outputDir, fileName);
    await fs.writeFile(outputPath, updatedContent);
    console.log(`脚本已保存到: ${outputPath}`);
    
    return {
      success: true,
      message: `处理了 ${processedCount} 个URL`,
      filePath: outputPath,
      processedCount
    };
  } catch (err) {
    console.error(`处理文件出错 ${filePath}: ${err.message}`);
    console.error(err.stack);
    return {
      success: false,
      message: `处理出错: ${err.message}`,
      error: err,
      filePath
    };
  }
}

/**
 * 处理目录中的所有QuantumultX脚本
 * @param {string} inputDir - 输入目录
 * @param {Object} options - 处理选项
 * @returns {Promise<Object>} - 处理结果
 */
async function processQXDirectory(inputDir, options = {}) {
  try {
    // 检查目录是否存在
    try {
      await fs.access(inputDir);
    } catch (err) {
      console.error(`输入目录不存在: ${inputDir}`);
      return {
        success: false,
        message: `输入目录不存在: ${inputDir}`,
        processedCount: 0,
        totalCount: 0
      };
    }
    
    // 获取目录中的所有文件
    const files = await getAllFiles(inputDir);
    console.log(`在 ${inputDir} 目录中找到 ${files.length} 个文件`);
    
    if (files.length === 0) {
      return {
        success: true,
        message: '没有找到文件',
        processedCount: 0,
        totalCount: 0
      };
    }
    
    // 处理每个文件
    let successCount = 0;
    let processedCount = 0;
    let totalCount = 0;
    
    for (const file of files) {
      // 跳过不支持的文件类型
      if (!['.js', '.conf', '.txt'].includes(path.extname(file).toLowerCase())) {
        console.log(`跳过不支持的文件类型: ${file}`);
        continue;
      }
      
      totalCount++;
      
      // 处理文件
      console.log(`\n处理文件: ${file}`);
      const result = await processQXScriptUrl(file, options);
      
      if (result.success) {
        successCount++;
        processedCount += result.processedCount || 0;
      }
    }
    
    console.log(`\n处理完成: ${successCount}/${totalCount} 个文件成功，共处理 ${processedCount} 个URL`);
    
    return {
      success: true,
      message: `处理完成: ${successCount}/${totalCount} 个文件`,
      successCount,
      totalCount,
      processedCount
    };
  } catch (err) {
    console.error(`处理目录出错 ${inputDir}: ${err.message}`);
    console.error(err.stack);
    return {
      success: false,
      message: `处理目录出错: ${err.message}`,
      error: err
    };
  }
}

/**
 * 递归获取目录中的所有文件
 * @param {string} dir - 目录路径
 * @returns {Promise<Array<string>>} - 文件路径数组
 */
async function getAllFiles(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getAllFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

/**
 * 转义正则表达式特殊字符
 * @param {string} string - 要转义的字符串
 * @returns {string} - 转义后的字符串
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 命令行主函数
 */
async function main() {
  // 解析命令行参数
  const args = process.argv.slice(2);
  
  // 显示帮助信息
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
QuantumultX URL 处理工具
用法: node qx-processor.js <文件路径或目录> [选项]

选项:
  --old-url=URL     旧的基础URL (默认: ${DEFAULT_OPTIONS.oldBaseUrl})
  --new-url=URL     新的基础URL (默认: ${DEFAULT_OPTIONS.newBaseUrl})
  --local           使用本地路径 (默认: ${DEFAULT_OPTIONS.useLocalPaths})
  --no-local        不使用本地路径
  --output=DIR      输出目录 (默认: ${DEFAULT_OPTIONS.outputDir})
  --debug           启用调试模式
  --help, -h        显示帮助信息

示例:
  node qx-processor.js my-script.conf
  node qx-processor.js input-dir/ --old-url=https://old.com --new-url=https://new.com
  node qx-processor.js input-dir/ --output=my-output --no-local
`);
    return;
  }
  
  // 获取输入路径
  const inputPath = args[0];
  
  // 解析选项
  const options = { ...DEFAULT_OPTIONS };
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--old-url=')) {
      options.oldBaseUrl = arg.substring('--old-url='.length);
    } else if (arg.startsWith('--new-url=')) {
      options.newBaseUrl = arg.substring('--new-url='.length);
    } else if (arg === '--local') {
      options.useLocalPaths = true;
    } else if (arg === '--no-local') {
      options.useLocalPaths = false;
    } else if (arg.startsWith('--output=')) {
      options.outputDir = arg.substring('--output='.length);
    } else if (arg === '--debug') {
      options.debug = true;
    }
  }
  
  console.log('===== QuantumultX URL 处理工具 =====');
  console.log(`输入: ${inputPath}`);
  console.log(`旧URL: ${options.oldBaseUrl}`);
  console.log(`新URL: ${options.newBaseUrl}`);
  console.log(`使用本地路径: ${options.useLocalPaths}`);
  console.log(`输出目录: ${options.outputDir}`);
  console.log('====================================');
  
  try {
    // 检查路径是文件还是目录
    const stats = await fs.stat(inputPath);
    
    let result;
    if (stats.isFile()) {
      // 处理单个文件
      result = await processQXScriptUrl(inputPath, options);
    } else if (stats.isDirectory()) {
      // 处理整个目录
      result = await processQXDirectory(inputPath, options);
    } else {
      console.error(`不支持的路径类型: ${inputPath}`);
      process.exit(1);
    }
    
    if (result.success) {
      console.log(`处理成功: ${result.message}`);
      process.exit(0);
    } else {
      console.error(`处理失败: ${result.message}`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`程序错误: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

// 如果直接运行此脚本，执行main函数
if (require.main === module) {
  main().catch(err => {
    console.error('未处理的错误:', err);
    process.exit(1);
  });
}

// 导出函数以便其他模块使用
module.exports = {
  processQXScriptUrl,
  processQXDirectory
};