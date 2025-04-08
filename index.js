const fs = require('fs').promises;
const path = require('path');
const core = require('@actions/core');
const converter = require('./script-converter'); // 引入您的转换器模块

// 从环境变量获取配置
const INPUT_DIR = process.env.INPUT_DIR || 'input';
const OUTPUT_DIR = process.env.OUTPUT_DIR || 'output';
const OUTPUT_FORMAT = process.env.OUTPUT_FORMAT || 'loon';

async function main() {
  try {
    console.log(`开始处理。输入目录: ${INPUT_DIR}, 输出目录: ${OUTPUT_DIR}, 输出格式: ${OUTPUT_FORMAT}`);
    
    // 确保输出目录存在
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    // 获取输入目录中的所有文件
    const files = await fs.readdir(INPUT_DIR);
    console.log(`找到 ${files.length} 个文件需要处理`);
    
    // 处理每个文件
    for (const file of files) {
      const inputPath = path.join(INPUT_DIR, file);
      const outputPath = path.join(OUTPUT_DIR, `${path.parse(file).name}.${OUTPUT_FORMAT}.conf`);
      
      // 检查文件状态
      const stats = await fs.stat(inputPath);
      if (!stats.isFile()) {
        console.log(`跳过非文件项目: ${file}`);
        continue;
      }
      
      console.log(`处理文件: ${file}`);
      
      try {
        // 读取文件内容
        const content = await fs.readFile(inputPath, 'utf8');
        console.log(`成功读取文件: ${file} (${content.length} 字节)`);
        
        // 提取脚本内容
        const extractedContent = converter.extractScriptContent(content);
        
        // 检测脚本类型
        const scriptType = converter.detectScriptType(extractedContent);
        console.log(`检测到脚本类型: ${scriptType}`);
        
        // 解析脚本
        const scriptInfo = converter.parseScript(extractedContent, scriptType);
        console.log(`成功解析脚本，元数据: ${Object.keys(scriptInfo.metadata).join(', ')}`);
        
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
        
        // 写入转换后的内容
        await fs.writeFile(outputPath, convertedContent);
        console.log(`成功转换并保存: ${outputPath}`);
      } catch (fileError) {
        console.error(`处理文件 ${file} 时出错:`, fileError);
        // 继续处理下一个文件
      }
    }
    
    console.log('所有文件处理完成');
  } catch (error) {
    core.setFailed(`转换过程失败: ${error.message}`);
    console.error('详细错误:', error);
  }
}

main();
