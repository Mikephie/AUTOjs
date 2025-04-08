# 脚本格式转换器使用指南

本指南将帮助你设置和使用脚本格式转换器，将QX/Loon脚本转换为Surge/Loon格式。

## 一、设置仓库

### 1. 创建新仓库

1. 访问GitHub并登录你的账户
2. 点击"New repository"创建新仓库
3. 填写仓库名称，例如"script-converter"
4. 选择"Public"或"Private"权限
5. 点击"Create repository"

### 2. 上传文件

可以使用以下方法上传文件：

**方法1：通过GitHub网页界面**

1. 在仓库页面，点击"Add file" > "Upload files"
2. 拖拽或选择要上传的文件
3. 添加提交信息
4. 点击"Commit changes"

**方法2：通过Git命令行**

```bash
# 克隆仓库
git clone https://github.com/你的用户名/script-converter.git
cd script-converter

# 复制所有文件到仓库目录

# 提交并推送
git add .
git commit -m "初始化仓库"
git push origin main
```

### 3. 目录结构确认

确保你的仓库有以下基本结构：

```
script-converter/
├── .github/workflows/script-conversion-workflow.yml
├── input/
├── script-converter.js
├── index.js
├── package.json
├── action.yml
└── README.md
```

## 二、准备仓库

### 1. 配置GitHub Actions权限

1. 在仓库页面，点击"Settings"
2. 在左侧菜单中选择"Actions" > "General"
3. 在"Workflow permissions"部分，选择"Read and write permissions"
4. 点击"Save"保存设置

### 2. 安装依赖并构建

```bash
# 在本地仓库目录中
npm install
npm run build
```

构建后会生成dist目录，包含打包后的代码。将这个目录也提交到仓库中。

```bash
git add dist/
git commit -m "添加构建文件"
git push origin main
```

## 三、使用转换器

### 1. 添加要转换的脚本

将QX或Loon格式的脚本放入`input`目录：

- 通过GitHub网页界面：
  1. 进入`input`目录
  2. 点击"Add file" > "Upload files"
  3. 上传脚本文件
  4. 提交更改

- 通过Git命令行：
  ```bash
  # 将脚本复制到input目录
  cp 你的脚本.js script-converter/input/
  
  # 提交并推送
  cd script-converter
  git add input/
  git commit -m "添加需要转换的脚本"
  git push origin main
  ```

### 2. 触发转换工作流

有三种方式可以触发转换：

1. **自动触发**：当你向`input`目录添加文件时自动触发
2. **定时触发**：每周日自动运行一次
3. **手动触发**：
   - 访问仓库的"Actions"标签页
   - 选择"Script Conversion Workflow"
   - 点击"Run workflow"
   - 选择输出格式（surge或loon）
   - 点击"Run workflow"按钮

### 3. 查看转换结果

1. 在"Actions"标签页查看工作流运行情况
2. 成功运行后，转换后的脚本会:
   - 自动提交到`output`目录
   - 作为构建产物上传（可下载）

## 四、高级用法

### 1. 自定义转换参数

修改`.github/workflows/script-conversion-workflow.yml`文件中的环境变量：

```yaml
env:
  INPUT_DIR: 'input'      # 修改输入目录
  OUTPUT_DIR: 'output'    # 修改输出目录
  OUTPUT_FORMAT: 'loon'   # 默认输出格式
```

### 2. 本地运行转换

不使用GitHub Actions时，可在本地运行：

```bash
# 单个文件转换
node script-converter.js input/脚本文件.js output/转换后.plugin loon

# 或
node script-converter.js input/脚本文件.js output/转换后.sgmodule surge
```

### 3. 批量处理

```bash
# 设置环境变量并运行
export INPUT_DIR=input
export OUTPUT_DIR=output
export OUTPUT_FORMAT=surge
node index.js
```

## 五、疑难解答

### 常见问题

1. **工作流运行失败**
   - 检查Actions日志了解详细错误
   - 确认脚本格式是否正确
   - 验证GitHub Actions权限设置

2. **脚本格式问题**
   - 确保脚本中包含正确的节点标记
   - 检查QX格式是否使用`[rewrite_local]`, `[filter_local]`等节点
   - 检查Loon格式是否使用`[Rule]`, `[Rewrite]`等节点

3. **输出不符合预期**
   - 检查原脚本是否包含必要的元数据
   - 查看是否有不支持的特殊格式

如有其他问题，请查看Actions日志或提交Issue。
