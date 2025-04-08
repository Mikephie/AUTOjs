const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const converter = require('./script-converter');

async function run() {
  try {
    // 获取Action输入参数
    const inputDir = core.getInput('INPUT_DIR') || 'input';
    const outputDir = core.getInput('OUTPUT_DIR') || 'output';
    const outputFormat = core.getInput('OUTPUT_FORMAT') || 'loon';
    
    console.log(`开始转换脚本: 输入目录=${inputDir}, 输出目录=${outputDir}, 格式=${outputFormat}`);
    
    // 确保目录存在
    if (!fs.existsSync(inputDir)) {
      fs.mkdirSync(inputDir, { recursive: true });
      console.log(`创建输入目录: ${inputDir}`);
    }
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`创建输出目录: ${outputDir}`);
    }
    
    // 读取输入目录中的所有文件
    const files = fs.readdirSync(inputDir);
    const scriptFiles = files.filter(file => 
      file.endsWith('.js') || file.endsWith('.conf') || file.endsWith('.txt')
    );
    
    console.log(`发现 ${scriptFiles.length} 个脚本文件需要处理`);
    
    // 处理每个脚本文件
    const results = [];
    
    for (const file of scriptFiles) {
      try {
        console.log(`处理文件: ${file}`);
        
        const inputPath = path.join(inputDir, file);
        const outputExt = outputFormat.toLowerCase() === 'surge' ? '.sgmodule' : '.plugin';
        const outputFileName = `${path.basename(file, path.extname(file))}${outputExt}`;
        const outputPath = path.join(outputDir, outputFileName);
        
        // 读取文件内容
        const content = fs.readFileSync(inputPath, 'utf8');
        
        // 提取真正的脚本内容
        const scriptContent = converter.extractScriptContent(content);
        
        // 解析脚本
        const scriptInfo = converter.parseScript(scriptContent);
        
        // 根据目标格式生成配置
        let result;
        if (outputFormat.toLowerCase() === 'surge') {
          result = converter.convertToSurge(scriptInfo);
        } else {
          result = converter.convertToLoon(scriptInfo);
        }
        
        // 写入输出文件
        fs.writeFileSync(outputPath, result, 'utf8');
        
        console.log(`✅ 转换成功: ${file} -> ${outputFileName}`);
        results.push({
          file,
          success: true,
          outputFile: outputFileName
        });
      } catch (error) {
        console.error(`❌ 处理 ${file} 失败: ${error.message}`);
        results.push({
          file,
          success: false,
          error: error.message
        });
      }
    }
    
    // 统计结果
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`处理结果: ${successCount} 成功, ${failCount} 失败, 共 ${results.length} 个文件`);
    
    // 设置Action输出
    core.setOutput('success_count', successCount);
    core.setOutput('fail_count', failCount);
    core.setOutput('total_count', results.length);
    
    // 如果有失败，设置警告
    if (failCount > 0) {
      core.warning(`有 ${failCount} 个脚本转换失败，请检查日志`);
    }
    
  } catch (error) {
    core.setFailed(`执行过程出错: ${error.message}`);
  }
}

run();
