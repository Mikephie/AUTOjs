const fs = require('fs');
const path = require('path');

// 配置目录
const CONFIG = {
  inputDir: 'input',
  quantumultxDir: 'quantumultx',
  loonDir: 'loon',
  surgeDir: 'surge',
  outputFile: 'scripts.json'  // 输出到当前工作目录
};

// 读取目录中的脚本文件
function getScriptFiles(dir) {
  try {
    return fs.readdirSync(dir)
      .filter(file => file.endsWith('.js'))
      .map(file => ({
        name: file,
        path: `${dir}/${file}`,
        updateTime: fs.statSync(`${dir}/${file}`).mtime.toISOString()
      }));
  } catch (error) {
    console.error(`读取 ${dir} 目录失败:`, error);
    return [];
  }
}

// 主函数
function generateScriptList() {
  // 获取原始脚本
  const originalScripts = getScriptFiles(CONFIG.inputDir);
  
  if (originalScripts.length === 0) {
    console.error('没有找到原始脚本文件');
    process.exit(1);
  }
  
  // 创建脚本列表
  const scriptsList = originalScripts.map(script => {
    const scriptName = script.name;
    const scriptNameWithoutExt = scriptName.replace('.js', '');
    
    // 检查对应的 QuantumultX、Loon 和 Surge 脚本是否存在
    const quantumultxPath = `${CONFIG.quantumultxDir}/${scriptName}`;
    const loonPath = `${CONFIG.loonDir}/${scriptNameWithoutExt}.plugin`;      // 改为 .plugin
    const surgePath = `${CONFIG.surgeDir}/${scriptNameWithoutExt}.sgmodule`;  // 改为 .sgmodule
    
    const hasQuantumultx = fs.existsSync(quantumultxPath);
    const hasLoon = fs.existsSync(loonPath);
    const hasSurge = fs.existsSync(surgePath);
    
    return {
      name: scriptNameWithoutExt,
      filename: scriptName,
      updateTime: script.updateTime,
      formats: {
        original: `${CONFIG.inputDir}/${scriptName}`,
        quantumultx: hasQuantumultx ? `${CONFIG.quantumultxDir}/${scriptName}` : null,
        loon: hasLoon ? `${CONFIG.loonDir}/${scriptNameWithoutExt}.plugin` : null,     // 改为 .plugin
        surge: hasSurge ? `${CONFIG.surgeDir}/${scriptNameWithoutExt}.sgmodule` : null  // 改为 .sgmodule
      }
    };
  });
  
  // 保存为 JSON 文件
  fs.writeFileSync(CONFIG.outputFile, JSON.stringify({
    generatedTime: new Date().toISOString(),
    scripts: scriptsList
  }, null, 2));
  
  console.log(`成功生成脚本列表，共 ${scriptsList.length} 个脚本。`);
  console.log(`脚本列表已保存至：${CONFIG.outputFile}`);
}

// 执行
generateScriptList();