const fs = require('fs');
const path = require('path');

// 配置目录
const CONFIG = {
  inputDir: 'input',
  loonDir: 'loon',
  surgeDir: 'surge',
  outputFile: process.env.GITHUB_PAGES_PATH ? 
    path.join(process.env.GITHUB_PAGES_PATH, 'scripts.json') : 
    'scripts.json'
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
    
    // 检查对应的 Loon 和 Surge 脚本是否存在
    const loonPath = `${CONFIG.loonDir}/${scriptName}`;
    const surgePath = `${CONFIG.surgeDir}/${scriptName}`;
    
    const hasLoon = fs.existsSync(loonPath);
    const hasSurge = fs.existsSync(surgePath);
    
    return {
      name: scriptNameWithoutExt,
      filename: scriptName,
      updateTime: script.updateTime,
      formats: {
        quantumultx: `${CONFIG.inputDir}/${scriptName}`,
        loon: hasLoon ? `${CONFIG.loonDir}/${scriptName}` : null,
        surge: hasSurge ? `${CONFIG.surgeDir}/${scriptName}` : null
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
