const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const core = require('@actions/core');
const converter = require('./script-converter');

// 固定输入目录
const INPUT_DIR = 'quantumultx';
const OUTPUT_FORMATS = (process.env.OUTPUT_FORMAT || 'loon,surge').split(',').map(f => f.trim().toLowerCase());
const DEBUG = process.env.DEBUG === 'true';

const SUPPORTED_EXTENSIONS = ['.js', '.conf', '.txt', '.sgmodule', '.plugin'];
const FORMAT_EXTENSIONS = {
  'loon': '.plugin',
  'surge': '.sgmodule',
  'quantumultx': '.conf'
};

function debug(message, ...args) {
  if (DEBUG) console.log(`[DEBUG] ${message}`, ...args);
}

function isSupportedScript(filename) {
  return SUPPORTED_EXTENSIONS.includes(path.extname(filename).toLowerCase());
}

// ✅ 获取这次提交变动的 quantumultx 文件
function getChangedFiles() {
  try {
    const output = execSync('git diff --name-only HEAD^ HEAD').toString();
    return output
      .split('\n')
      .filter(f => f.startsWith(`${INPUT_DIR}/`) && isSupportedScript(f));
  } catch (error) {
    console.error('获取变更文件失败:', error);
    return [];
  }
}

async function ensureOutputDir(outputPath) {
  try {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    return true;
  } catch (err) {
    console.error(`创建目录失败 ${outputPath}:`, err);
    return false;
  }
}

async function cleanDirectory(dir) {
  try {
    await fs.access(dir);
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await cleanDirectory(fullPath);
        await fs.rmdir(fullPath);
      } else {
        await fs.unlink(fullPath);
      }
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(dir, { recursive: true });
    } else {
      console.error(`清空目录失败: ${dir}`, err);
    }
  }
}

async function main() {
  try {
    console.log('========== 启动脚本转换 ==========');
    console.log(`输出格式: ${OUTPUT_FORMATS.join(', ')}`);

    // 获取本次 push 的变动脚本
    const changedFilePaths = getChangedFiles();
    if (changedFilePaths.length === 0) {
      console.log('❗ 本次提交中无变动的脚本文件，结束转换');
      return;
    }

    console.log(`✅ 本次检测到 ${changedFilePaths.length} 个变动文件`);

    // 初始化输出目录
    for (const format of OUTPUT_FORMATS) {
      await cleanDirectory(format);
    }

    let successCount = 0;

    for (const relPath of changedFilePaths) {
      const inputPath = relPath;
      const relativePath = path.relative(INPUT_DIR, inputPath);
      const name = path.basename(inputPath);

      console.log(`\n📝 处理: ${relativePath}`);

      try {
        const content = await fs.readFile(inputPath, 'utf8');
        debug('原始内容:', content.substring(0, 150));

        for (const format of OUTPUT_FORMATS) {
          const baseName = path.parse(name).name;
          const ext = FORMAT_EXTENSIONS[format] || `.${format}`;
          const outputRelPath = path.join(path.dirname(relativePath), `${baseName}${ext}`);
          const outputPath = path.join(format, outputRelPath);

          if (!(await ensureOutputDir(outputPath))) continue;

          let convertedContent = '';

          try {
            if (typeof converter.convertScript === 'function') {
              convertedContent = converter.convertScript(content, format);
            } else {
              const extracted = converter.extractScriptContent(content);
              const type = converter.detectScriptType?.(extracted) || 'unknown';
              const parsed = converter.parseScript(extracted, type);

              if (format === 'loon') {
                convertedContent = converter.convertToLoon(parsed);
              } else if (format === 'surge') {
                convertedContent = converter.convertToSurge(parsed);
              } else if (format === 'quantumultx') {
                convertedContent = converter.convertToQuantumultX(parsed);
              } else {
                throw new Error(`不支持的格式: ${format}`);
              }
            }

            await fs.writeFile(outputPath, convertedContent);
            console.log(`✅ 成功输出 ${format}: ${outputPath}`);
            successCount++;

          } catch (err) {
            console.error(`❌ 转换 ${format} 格式失败:`, err);
          }
        }

      } catch (readErr) {
        console.error(`❌ 读取文件失败: ${name}`, readErr);
      }
    }

    console.log('\n========== 转换完成 ==========');
    console.log(`共成功转换 ${successCount} 个文件`);

    if (core?.setOutput) core.setOutput('success_count', successCount);

  } catch (err) {
    console.error('❌ 主流程失败:', err);
    if (core?.setFailed) core.setFailed(err.message);
    else process.exit(1);
  }
}

main();