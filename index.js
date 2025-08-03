
const fs = require('fs').promises;
const path = require('path');

// 转换器模块
const converter = require('./script-converter');

// 设置固定输入目录
const INPUT_DIR = 'quantumultx';
// 输出格式列表
const OUTPUT_FORMATS = ['loon', 'surge'];
// 支持的扩展名
const SUPPORTED_EXTENSIONS = ['.js', '.conf', '.txt', '.sgmodule', '.plugin'];
// 格式对应的扩展名
const FORMAT_EXTENSIONS = {
  'loon': '.plugin',
  'surge': '.sgmodule'
};

// 递归获取文件
async function getAllFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(entry => {
    const res = path.resolve(dir, entry.name);
    return entry.isDirectory() ? getAllFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

// 检查扩展名
function isSupported(filePath) {
  return SUPPORTED_EXTENSIONS.includes(path.extname(filePath).toLowerCase());
}

// 确保目录存在
async function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

(async () => {
  console.log('========== 启动脚本转换 ==========');
  console.log('输出格式:', OUTPUT_FORMATS.join(', '));

  let files = [];
  try {
    files = await getAllFiles(INPUT_DIR);
  } catch (e) {
    console.error('读取目录失败:', e);
    process.exit(1);
  }

  let converted = 0;

  for (const file of files) {
    const relPath = path.relative(INPUT_DIR, file);
    if (!isSupported(file)) {
      console.log('跳过不支持:', relPath);
      continue;
    }

    let content = '';
    try {
      content = await fs.readFile(file, 'utf8');
    } catch (e) {
      console.error('读取失败:', file, e);
      continue;
    }

    for (const format of OUTPUT_FORMATS) {
      try {
        const fileBase = path.parse(relPath).name;
        const outputExt = FORMAT_EXTENSIONS[format] || `.${format}`;
        const outputPath = path.join(format, path.dirname(relPath), fileBase + outputExt);
        const parsed = converter.parseScript(content);
        const output =
          format === 'loon' ? converter.convertToLoon(parsed)
          : format === 'surge' ? converter.convertToSurge(parsed)
          : '';

        await ensureDir(outputPath);
        await fs.writeFile(outputPath, output);
        console.log(`✅ 转换成功: ${relPath} → ${outputPath}`);
        converted++;
      } catch (e) {
        console.error(`❌ 转换失败: ${relPath} → ${format}`, e.message);
      }
    }
  }

  if (converted === 0) {
    console.log('❗ 无需转换的脚本文件');
  } else {
    console.log(`🎉 完成转换: ${converted} 个输出文件`);
  }
})();
