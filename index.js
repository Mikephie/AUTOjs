const fs = require('fs').promises;
const path = require('path');
const core = require('@actions/core');

// 确保使用正确的相对路径
const converter = require('./script-converter');

// 从环境变量获取配置
const INPUT_DIR = process.env.INPUT_DIR || 'input';
const OUTPUT_DIR = process.env.OUTPUT_DIR || 'output';
// 支持同时转换多种格式（默认同时转换loon和surge）
const OUTPUT_FORMATS = (process.env.OUTPUT_FORMAT || 'loon,surge').split(',').map(f => f.trim().toLowerCase());

// 启用详细日志
const DEBUG = process.env.DEBUG === 'true';

// 定义支持的脚本文件扩展名
const SUPPORTED_EXTENSIONS = ['.js', '.conf', '.txt', '.sgmodule', '.plugin'];

// 定义输出文件扩展名映射
const FORMAT_EXTENSIONS = {
  'loon': '.plugin',
  'surge': '.sgmodule',
  'quantumultx': '.conf'
};

function debug(message, ...args) {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
}

/**
 * 检查文件是否为支持的脚本类型
 * @param {string} filename 文件名
 * @returns {boolean} 是否为支持的脚本类型
 */
function isSupportedScript(filename) {
  const ext = path.extname(filename).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

/**
 * 递归获取目录中的所有文件
 * @param {string} dir 目录路径
 * @returns {Promise<Array>} 文件信息列表
 */
async function getAllFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  // 处理所有项目的Promise数组
  const filePromises = entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // 递归处理子目录
      return getAllFiles(fullPath);
    } else if (entry.isFile()) {
      // 返回文件信息
      return [{
        path: fullPath,
        relativePath: path.relative(INPUT_DIR, fullPath),
        name: entry.name
      }];
    }
    
    return [];
  });
  
  // 等待所有Promise完成并扁平化结果
  const nestedFiles = await Promise.all(filePromises);
  return nestedFiles.flat();
}

/**
 * 确保输出目录存在
 * @param {string} outputPath 完整的输出路径
 */
async function ensureOutputDir(outputPath) {
  const dir = path.dirname(outputPath);
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  try {
    console.log('======================================');
    console.log(`脚本转换开始`);
    console.log(`配置: 输入目录=${INPUT_DIR}, 输出目录=${OUTPUT_DIR}, 输出格式=${OUTPUT_FORMATS.join(', ')}`);
    console.log('======================================');
    
    // 输出转换器中可用的方法
    console.log('可用的转换方法:', Object.keys(converter).join(', '));
    
    // 确保输出目录存在
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    // 获取输入目录中的所有文件（包括子目录）
    let files;
    try {
      files = await getAllFiles(INPUT_DIR);
      console.log(`找到 ${files.length} 个文件需要处理`);
    } catch (err) {
      console.error(`读取输入目录(${INPUT_DIR})失败:`, err);
      throw new Error(`无法读取输入目录: ${err.message}`);
    }
    
    // 处理每个文件
    for (const fileInfo of files) {
      const { path: inputPath, relativePath, name } = fileInfo;
      
      // 跳过不支持的文件类型
      if (!isSupportedScript(name)) {
        console.log(`跳过不支持的文件类型: ${name}`);
        continue;
      }
      
      console.log('\n------------------------------');
      console.log(`处理文件: ${relativePath}`);
      console.log(`输入路径: ${inputPath}`);
      
      try {
        // 读取文件内容
        const content = await fs.readFile(inputPath, 'utf8');
        console.log(`成功读取文件: ${relativePath} (${content.length} 字节)`);
        debug('文件内容预览:', content.substring(0, 150) + '...');
        
        // 对每种输出格式进行转换
        for (const format of OUTPUT_FORMATS) {
          // 创建保持目录结构的输出路径，使用正确的扩展名
          const fileBaseName = path.parse(name).name;
          const outputExt = FORMAT_EXTENSIONS[format] || `.${format}`;
          const outputRelPath = path.join(path.dirname(relativePath), `${fileBaseName}${outputExt}`);
          const outputPath = path.join(OUTPUT_DIR, outputRelPath);
          
          console.log(`转换为 ${format} 格式，输出路径: ${outputPath}`);
          
          // 确保输出目录存在（包括嵌套目录）
          await ensureOutputDir(outputPath);
          
          // 转换内容
          let convertedContent;
          if (typeof converter.convertScript === 'function') {
            console.log(`使用封装的convertScript函数转换为 ${format} 格式`);
            convertedContent = converter.convertScript(content, format);
          } else {
            // 如果没有封装函数，则使用逐步转换流程
            console.log(`使用逐步转换流程转换为 ${format} 格式`);
            
            // 提取脚本内容
            const extractedContent = converter.extractScriptContent(content);
            debug('提取的内容长度:', extractedContent.length);
            
            // 检测脚本类型
            const scriptType = converter.detectScriptType ? 
                              converter.detectScriptType(extractedContent) : 
                              'unknown';
            console.log(`检测到脚本类型: ${scriptType}`);
            
            // 解析脚本
            const scriptInfo = converter.parseScript(extractedContent, scriptType);
            console.log(`成功解析脚本，元数据:`, Object.keys(scriptInfo.metadata || {}).join(', '));
            debug('解析的元数据:', JSON.stringify(scriptInfo.metadata || {}, null, 2));
            
            // 转换脚本
            if (format === 'loon') {
              convertedContent = converter.convertToLoon(scriptInfo);
            } else if (format === 'surge') {
              convertedContent = converter.convertToSurge(scriptInfo);
            } else if (format === 'quantumultx') {
              convertedContent = converter.convertToQuantumultX(scriptInfo);
            } else {
              throw new Error(`不支持的输出格式: ${format}`);
            }
          }
          
          debug('转换后的内容预览:', convertedContent.substring(0, 150) + '...');
          
          // 写入转换后的内容
          await fs.writeFile(outputPath, convertedContent);
          console.log(`成功转换并保存 ${format} 格式: ${outputPath}`);
        }
      } catch (fileError) {
        console.error(`处理文件 ${relativePath} 时出错:`, fileError);
        console.error('错误堆栈:', fileError.stack);
        // 继续处理下一个文件
      }
    }
    
    console.log('\n======================================');
    console.log('所有文件处理完成');
    console.log('======================================');
  } catch (error) {
    console.error('转换过程失败:', error);
    console.error('错误堆栈:', error.stack);
    
    if (core && typeof core.setFailed === 'function') {
      core.setFailed(`转换过程失败: ${error.message}`);
    } else {
      process.exit(1);
    }
  }
}

main();
