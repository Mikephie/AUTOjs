const fs = require('fs').promises;
const path = require('path');
const core = require('@actions/core');

// 确保使用正确的相对路径
const converter = require('./script-converter');

// 从环境变量获取配置
const INPUT_DIR = process.env.INPUT_DIR || 'input';
const OUTPUT_DIR = process.env.OUTPUT_DIR || 'output';
const OUTPUT_FORMAT = process.env.OUTPUT_FORMAT || 'loon';

// 启用详细日志
const DEBUG = process.env.DEBUG === 'true';

function debug(message, ...args) {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
}

async function main() {
  try {
    console.log('======================================');
    console.log(`脚本转换开始`);
    console.log(`配置: 输入目录=${INPUT_DIR}, 输出目录=${OUTPUT_DIR}, 输出格式=${OUTPUT_FORMAT}`);
    console.log('======================================');
    
    // 输出转换器中可用的方法
    console.log('可用的转换方法:', Object.keys(converter).join(', '));
    
    // 确保输出目录存在
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    // 获取输入目录中的所有文件
    let files;
    try {
      files = await fs.readdir(INPUT_DIR);
      console.log(`找到 ${files.length} 个文件需要处理`);
    } catch (err) {
      console.error(`读取输入目录(${INPUT_DIR})失败:`, err);
      throw new Error(`无法读取输入目录: ${err.message}`);
    }
    
    // 处理每个文件
    for (const file of files) {
      const inputPath = path.join(INPUT_DIR, file);
      const outputPath = path.join(OUTPUT_DIR, `${path.parse(file).name}.${OUTPUT_FORMAT}.conf`);
      
      console.log('\n------------------------------');
      console.log(`处理文件: ${file}`);
      console.log(`输入路径: ${inputPath}`);
      console.log(`输出路径: ${outputPath}`);
      
      // 检查文件状态
      let stats;
      try {
        stats = await fs.stat(inputPath);
        if (!stats.isFile()) {
          console.log(`跳过非文件项目: ${file}`);
          continue;
        }
      } catch (err) {
        console.error(`获取文件状态失败: ${inputPath}`, err);
        continue;
      }
      
      try {
        // 读取文件内容
        const content = await fs.readFile(inputPath, 'utf8');
        console.log(`成功读取文件: ${file} (${content.length} 字节)`);
        debug('文件内容预览:', content.substring(0, 150) + '...');
        
        // 尝试使用封装好的转换函数
        if (typeof converter.convertScript === 'function') {
          console.log('使用封装的convertScript函数');
          const convertedContent = converter.convertScript(content, OUTPUT_FORMAT);
          await fs.writeFile(outputPath, convertedContent);
          console.log(`成功转换并保存: ${outputPath}`);
          continue;
        }
        
        // 如果没有封装函数，则使用逐步转换流程
        console.log('使用逐步转换流程');
        
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
        console.log(`成功解析脚本，元数据:`, Object.keys(scriptInfo.metadata).join(', '));
        debug('解析的元数据:', JSON.stringify(scriptInfo.metadata, null, 2));
        
        // 转换脚本
        let convertedContent;
        if (OUTPUT_FORMAT === 'loon') {
          convertedContent = converter.convertToLoon(scriptInfo);
        } else if (OUTPUT_FORMAT === 'surge') {
          convertedContent = converter.convertToSurge(scriptInfo);
        } else if (OUTPUT_FORMAT === 'quantumultx') {
          convertedContent = converter.convertToQuantumultX(scriptInfo);
        } else {
          throw new Error(`不支持的输出格式: ${OUTPUT_FORMAT}`);
        }
        
        debug('转换后的内容预览:', convertedContent.substring(0, 150) + '...');
        
        // 写入转换后的内容
        await fs.writeFile(outputPath, convertedContent);
        console.log(`成功转换并保存: ${outputPath}`);
      } catch (fileError) {
        console.error(`处理文件 ${file} 时出错:`, fileError);
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
