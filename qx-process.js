#!/usr/bin/env node

/**

- QuantumultX URL 处理 CLI 工具
- 用于单独处理 QuantumultX 脚本中的 URL
  */

const fs = require(‘fs’).promises;
const path = require(‘path’);
const qxProcessor = require(’./qx-url-processor’);

async function main() {
// 获取命令行参数
const args = process.argv.slice(2);

if (args.length === 0 || args.includes(’–help’) || args.includes(’-h’)) {
console.log(`
QuantumultX URL 处理工具
用法: node qx-process.js <文件路径或目录> [选项]

选项:
–old-url=URL     旧的基础URL (默认: https://raw.githubusercontent.com/Mikephie/Script/main/qx)
–new-url=URL     新的基础URL (默认: https://raw.githubusercontent.com/Mikephie/AUTOjs/refs/heads/main/quantumultx)
–local           使用本地路径替换URL (默认: true)
–no-local        不使用本地路径，只替换为新的远程URL
–output=DIR      输出目录 (默认: ./quantumultx)
–debug           启用调试模式
–help, -h        显示帮助信息

示例:
node qx-process.js my-script.conf –old-url=https://old.com –new-url=https://new.com
node qx-process.js input-dir/ –output=output-dir –no-local
`);
return;
}

// 解析第一个参数为文件路径或目录
const inputPath = args[0];

// 解析选项
const options = {
oldBaseUrl: ‘https://raw.githubusercontent.com/Mikephie/Script/main/qx’,
newBaseUrl: ‘https://raw.githubusercontent.com/Mikephie/AUTOjs/refs/heads/main/quantumultx’,
useLocalPaths: true,
downloadDir: ‘./quantumultx’,
debug: false
};

for (let i = 1; i < args.length; i++) {
const arg = args[i];

```
if (arg.startsWith('--old-url=')) {
  options.oldBaseUrl = arg.split('=')[1];
} else if (arg.startsWith('--new-url=')) {
  options.newBaseUrl = arg.split('=')[1];
} else if (arg === '--local') {
  options.useLocalPaths = true;
} else if (arg === '--no-local') {
  options.useLocalPaths = false;
} else if (arg.startsWith('--output=')) {
  options.downloadDir = arg.split('=')[1];
} else if (arg === '--debug') {
  options.debug = true;
}
```

}

console.log(’====================================’);
console.log(‘QuantumultX URL 处理工具’);
console.log(’====================================’);
console.log(`配置: 输入路径: ${inputPath} 旧的基础URL: ${options.oldBaseUrl} 新的基础URL: ${options.newBaseUrl} 使用本地路径: ${options.useLocalPaths} 输出目录: ${options.downloadDir} 调试模式: ${options.debug} `);

try {
// 检查输入路径是文件还是目录
const stats = await fs.stat(inputPath);

```
if (stats.isFile()) {
  // 处理单个文件
  console.log(`处理文件: ${inputPath}`);
  const result = await qxProcessor.processQXUrl(inputPath, options);
  
  if (result.success) {
    console.log(`处理成功: ${result.message}`);
    console.log(`输出文件: ${result.filePath}`);
  } else {
    console.log(`处理跳过: ${result.message}`);
  }
} else if (stats.isDirectory()) {
  // 处理目录中的所有文件
  console.log(`处理目录: ${inputPath}`);
  
  // 获取目录中的所有文件
  const files = await getFilesRecursive(inputPath);
  console.log(`找到 ${files.length} 个文件`);
  
  let successCount = 0;
  let skipCount = 0;
  
  for (const file of files) {
    // 只处理 .conf 和 .js 文件
    if (!['.conf', '.js'].includes(path.extname(file).toLowerCase())) {
      console.log(`跳过非脚本文件: ${file}`);
      continue;
    }
    
    console.log(`\n处理文件: ${file}`);
    
    try {
      const result = await qxProcessor.processQXUrl(file, options);
      
      if (result.success) {
        console.log(`处理成功: ${result.message}`);
        console.log(`输出文件: ${result.filePath}`);
        successCount++;
      } else {
        console.log(`处理跳过: ${result.message}`);
        skipCount++;
      }
    } catch (error) {
      console.error(`处理文件 ${file} 时出错: ${error.message}`);
      skipCount++;
    }
  }
  
  console.log(`\n处理完成: ${successCount} 个文件成功, ${skipCount} 个文件跳过`);
} else {
  console.error(`不支持的输入路径类型: ${inputPath}`);
}
```

} catch (error) {
console.error(`处理过程失败: ${error.message}`);
console.error(error.stack);
process.exit(1);
}
}

/**

- 递归获取目录中的所有文件
- @param {string} dir 目录路径
- @returns {Promise<string[]>} 文件路径列表
  */
  async function getFilesRecursive(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

const files = await Promise.all(entries.map(async (entry) => {
const fullPath = path.join(dir, entry.name);
return entry.isDirectory() ? getFilesRecursive(fullPath) : [fullPath];
}));

return files.flat();
}

main().catch(console.error);