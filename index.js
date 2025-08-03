
const fs = require('fs').promises;
const path = require('path');
const core = require('@actions/core');
const { execSync } = require('child_process');
const converter = require('./script-converter');

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
  const ext = path.extname(filename).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

async function ensureOutputDir(outputPath) {
  try {
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    return true;
  } catch (error) {
    console.error(`创建目录失败 ${path.dirname(outputPath)}:`, error);
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
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dir, { recursive: true });
    } else {
      console.error(`清空目录 ${dir} 失败:`, error);
    }
  }
}

function getChangedFiles() {
  try {
    const output = execSync('git diff --name-only HEAD^ HEAD', { encoding: 'utf8' });
    return output.split('
').filter(f => f.startsWith(`${INPUT_DIR}/`) && isSupportedScript(f));
  } catch (e) {
    console.error('检测变更文件失败:', e);
    return [];
  }
}

async function main() {
  console.log('
========== 启动脚本转换 ==========');
  console.log(`输出格式: ${OUTPUT_FORMATS.join(', ')}`);

  const changedFiles = getChangedFiles();
  if (changedFiles.length === 0) {
    console.log('❗ 本次提交中无变动的脚本文件，结束转换');
    return;
  }

  for (const format of OUTPUT_FORMATS) {
    await cleanDirectory(format);
  }

  let successCount = 0;
  for (const file of changedFiles) {
    console.log(`
➡️ 处理文件: ${file}`);
    try {
      const content = await fs.readFile(file, 'utf8');
      for (const format of OUTPUT_FORMATS) {
        const fileBaseName = path.parse(file).name;
        const outputExt = FORMAT_EXTENSIONS[format] || `.${format}`;
        const outputRelPath = path.join(path.dirname(file.replace(`${INPUT_DIR}/`, '')), `${fileBaseName}${outputExt}`);
        const outputPath = path.join(format, outputRelPath);

        if (!(await ensureOutputDir(outputPath))) continue;

        let convertedContent = '';
        if (typeof converter.convertScript === 'function') {
          convertedContent = converter.convertScript(content, format);
        } else {
          const extracted = converter.extractScriptContent(content);
          const scriptType = converter.detectScriptType ? converter.detectScriptType(extracted) : 'unknown';
          const parsed = converter.parseScript(extracted, scriptType);
          if (format === 'loon') {
            convertedContent = converter.convertToLoon(parsed);
          } else if (format === 'surge') {
            convertedContent = converter.convertToSurge(parsed);
          } else if (format === 'quantumultx') {
            convertedContent = converter.convertToQuantumultX(parsed);
          }
        }
        await fs.writeFile(outputPath, convertedContent);
        console.log(`✅ 转换成功: ${outputPath}`);
        successCount++;
      }
    } catch (e) {
      console.error(`❌ 处理失败 ${file}:`, e);
    }
  }

  console.log(`
✅ 所有处理完成，转换成功: ${successCount} 个文件`);
  core.setOutput('success_count', successCount);
}

main();
