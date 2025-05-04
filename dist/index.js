// 简化版构建文件
const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const converter = require('../script-converter');

// 主函数
async function run() {
  try {
    // 获取输入参数
    const inputDir = process.env.INPUT_DIR || 'quantumultx';
    const outputDir = process.env.OUTPUT_DIR || 'output';
    const outputFormat = process.env.OUTPUT_FORMAT || 'loon';
    
    console.log(`处理脚本: 输入=${inputDir}, 输出=${outputDir}, 格式=${outputFormat}`);
    
    // 确保目录存在
    if (!fs.existsSync(inputDir)) {
      fs.mkdirSync(inputDir, { recursive: true });
    }
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 读取输入文件
    const files = fs.readdirSync(inputDir);
    const scriptFiles = files.filter(file => 
      file.endsWith('.js') || file.endsWith('.conf') || file.endsWith('.txt')
    );
    
    console.log(`发现 ${scriptFiles.length} 个脚本文件`);
    
    // 处理每个文件
    const results = [];
    
    for (const file of scriptFiles) {
      try {
        const inputPath = path.join(inputDir, file);
        const outputExt = outputFormat.toLowerCase() === 'surge' ? '.sgmodule' : '.plugin';
        const outputFileName = path.basename(file, path.extname(file)) + outputExt;
        const outputPath = path.join(outputDir, outputFileName);
        
        // 读取并处理
        const content = fs.readFileSync(inputPath, 'utf8');
        const scriptContent = converter.extractScriptContent(content);
        const scriptInfo = converter.parseScript(scriptContent);
        
        // 转换
        let result;
        if (outputFormat.toLowerCase() === 'surge') {
          result = converter.convertToSurge(scriptInfo);
        } else {
          result = converter.convertToLoon(scriptInfo);
        }
        
        // 写入输出
        fs.writeFileSync(outputPath, result, 'utf8');
        
        console.log(`转换成功: ${file} -> ${outputFileName}`);
        results.push({ file, success: true, outputFile: outputFileName });
      } catch (error) {
        console.error(`处理 ${file} 失败: ${error.message}`);
        results.push({ file, success: false, error: error.message });
      }
    }
    
    // 统计结果
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    core.setOutput('success_count', successCount);
    core.setOutput('fail_count', failCount);
    core.setOutput('total_count', results.length);
    
  } catch (error) {
    core.setFailed(`执行过程出错: ${error.message}`);
  }
}

run();
