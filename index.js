
const fs = require('fs').promises;
const path = require('path');
const core = require('@actions/core');
const exec = require('child_process').execSync;

const INPUT_DIR = 'quantumultx';
const OUTPUT_FORMATS = (process.env.OUTPUT_FORMAT || 'loon,surge').split(',').map(f => f.trim().toLowerCase());
const FORMAT_EXTENSIONS = { 'loon': '.plugin', 'surge': '.sgmodule', 'quantumultx': '.conf' };

function isSupportedScript(filename) {
  return ['.js', '.conf', '.txt', '.sgmodule', '.plugin'].includes(path.extname(filename).toLowerCase());
}

function getChangedFiles() {
  try {
    const output = exec('git diff --name-only HEAD^ HEAD', { encoding: 'utf8' }).trim();
    return output ? output.split('\n').filter(p => p.startsWith(INPUT_DIR + '/')) : [];
  } catch (error) {
    console.error('获取变更文件失败:', error);
    return [];
  }
}

async function ensureOutputDir(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function convertFile(filePath, converter) {
  const content = await fs.readFile(filePath, 'utf8');
  const name = path.basename(filePath);
  const relPath = path.relative(INPUT_DIR, filePath);
  const baseName = path.parse(name).name;

  for (const format of OUTPUT_FORMATS) {
    const ext = FORMAT_EXTENSIONS[format] || `.${format}`;
    const outputPath = path.join(format, path.dirname(relPath), baseName + ext);
    await ensureOutputDir(outputPath);
    const converted = converter.convertScript(content, format);
    await fs.writeFile(outputPath, converted);
    console.log(`✅ 转换完成: ${outputPath}`);
  }
}

async function main() {
  console.log('========== 启动脚本转换 ==========');
  console.log('输出格式:', OUTPUT_FORMATS.join(', '));
  const changed = getChangedFiles();

  if (changed.length === 0) {
    console.log('❗ 本次提交中无变动的脚本文件，结束转换');
    return;
  }

  const converter = require('./script-converter');
  for (const file of changed) {
    if (!isSupportedScript(file)) continue;
    console.log(`处理: ${file}`);
    await convertFile(file, converter);
  }
}

main().catch(err => {
  console.error('转换失败:', err);
  process.exit(1);
});
