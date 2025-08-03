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
  if (DEBUG) {
    console.log('[DEBUG]', message, ...args);
  }
}

function isSupportedScript(filename) {
  const ext = path.extname(filename).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

async function getChangedQuantumultxFiles() {
  try {
    const output = execSync('git diff --name-only HEAD^ HEAD').toString().trim();
    const changed = output
      .split('\n')
      .filter(name => name.startsWith('quantumultx/') && isSupportedScript(name));

    if (changed.length === 0) {
      console.log('❗ 本次提交中无 quantumultx 变更文件，跳过转换');
      return [];
    }

    console.log(`✅ 本次有 ${changed.length} 个变动文件：\n` + changed.join('\n'));
    return changed.map(f => ({
      path: f,
      relativePath: path.relative(INPUT_DIR, f),
      name: path.basename(f)
    }));
  } catch (err) {
    console.warn('⚠️ 获取变更文件失败，回退为全量处理');
    return await getAllFiles(INPUT_DIR);
  }
}

async function getAllFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const filePromises = entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return getAllFiles(fullPath);
      } else if (entry.isFile()) {
        return [{
          path: fullPath,
          relativePath: path.relative(INPUT_DIR, fullPath),
          name: entry.name
        }];
      }
      return [];
    });
    const nestedFiles = await Promise.all(filePromises);
    return nestedFiles.flat();
  } catch (error) {
    console.error(`获取目录 ${dir} 内文件失败:`, error);
    return [];
  }
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
    console.log(`目录 ${dir} 已清空`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dir, { recursive: true });
      console.log(`目录 ${dir} 已创建`);
    } else {
      console.error(`清空目录 ${dir} 失败:`, error);
    }
  }
}

async function main() {
  try {
    console.log('========== 启动脚本转换 ==========');
    console.log(`输出格式: ${OUTPUT_FORMATS.join(', ')}`);

    try {
      await fs.access(INPUT_DIR);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(INPUT_DIR, { recursive: true });
        console.log(`创建输入目录: ${INPUT_DIR}`);
      }
    }

    for (const format of OUTPUT_FORMATS) {
      await cleanDirectory(format);
    }

    const files = await getChangedQuantumultxFiles();
    if (files.length === 0) return;

    let successCount = 0;
    for (const fileInfo of files) {
      const { path: inputPath, relativePath, name } = fileInfo;

      if (!isSupportedScript(name)) {
        console.log(`跳过不支持的文件类型: ${name}`);
        continue;
      }

      console.log(`\n------------------------------`);
      console.log(`处理文件: ${relativePath}`);
      console.log(`输入路径: ${inputPath}`);

      try {
        const content = await fs.readFile(inputPath, 'utf8');
        console.log(`成功读取文件: ${relativePath} (${content.length} 字节)`);

        for (const format of OUTPUT_FORMATS) {
          const fileBaseName = path.parse(name).name;
          const outputExt = FORMAT_EXTENSIONS[format] || `.${format}`;
          const outputRelPath = path.join(path.dirname(relativePath), \`\${fileBaseName}\${outputExt}\`);
          const outputPath = path.join(format, outputRelPath);

          if (!(await ensureOutputDir(outputPath))) continue;

          try {
            let convertedContent;
            if (typeof converter.convertScript === 'function') {
              convertedContent = converter.convertScript(content, format);
            } else {
              const extractedContent = converter.extractScriptContent(content);
              const scriptType = converter.detectScriptType ?
                                 converter.detectScriptType(extractedContent) : 'unknown';
              const scriptInfo = converter.parseScript(extractedContent, scriptType);

              if (format === 'loon') {
                convertedContent = converter.convertToLoon(scriptInfo);
              } else if (format === 'surge') {
                convertedContent = converter.convertToSurge(scriptInfo);
              } else if (format === 'quantumultx') {
                convertedContent = converter.convertToQuantumultX(scriptInfo);
              } else {
                throw new Error(`不支持的输出格式: ${format}`);
              }
            }
            await fs.writeFile(outputPath, convertedContent);
            console.log(`✅ 保存 ${format} 格式: ${outputPath}`);
            successCount++;
          } catch (convError) {
            console.error(`转换文件 ${relativePath} 到 ${format} 格式时出错:`, convError);
          }
        }
      } catch (fileError) {
        console.error(`处理文件 ${relativePath} 时出错:`, fileError);
      }
    }

    console.log(`\n✅ 所有文件转换完成，共转换: ${successCount} 个`);
    if (core && typeof core.setOutput === 'function') {
      core.setOutput('success_count', successCount);
    }
  } catch (error) {
    console.error('❌ 脚本转换失败:', error);
    if (core && typeof core.setFailed === 'function') {
      core.setFailed(`转换失败: ${error.message}`);
    } else {
      process.exit(1);
    }
  }
}

main();
