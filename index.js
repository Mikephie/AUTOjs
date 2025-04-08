name: Script Conversion Workflow
on:
  workflow_dispatch:
    inputs:
      output_format:
        description: '转换输出格式'
        required: true
        default: 'loon,surge'
        type: choice
        options:
          - loon,surge
          - loon
          - surge
  push:
    paths:
      - 'input/**'
  pull_request:
    paths:
      - 'input/**'
  schedule:
    - cron: '0 0 * * 0'
jobs:
  convert:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
          
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: 准备环境
        run: |
          mkdir -p input
          mkdir -p loon
          mkdir -p surge
          npm install @actions/core
          
      - name: 运行转换
        run: node index.js
        env:
          INPUT_DIR: 'input'
          OUTPUT_FORMAT: ${{ github.event.inputs.output_format || 'loon,surge' }}
          
      - name: 打包转换结果
        run: |
          # 为每种格式创建单独的压缩包
          if [ -d "loon" ]; then
            tar -czvf loon-scripts.tar.gz loon/
            echo "Loon脚本已打包为 loon-scripts.tar.gz"
          fi
          
          if [ -d "surge" ]; then
            tar -czvf surge-scripts.tar.gz surge/
            echo "Surge脚本已打包为 surge-scripts.tar.gz"
          fi
          
      - name: 提交并推送结果
        run: |
          git config --local user.email "actions@github.com"
          git config --local user.name "GitHub Actions"
          
          # 暂存所有更改
          git add -A
          
          # 尝试提交当前更改
          git commit -m "准备自动转换脚本" || echo "没有需要提交的更改"
          
          # 拉取远程更改(不使用rebase)
          git pull --no-rebase || echo "拉取失败，继续执行"
          
          # 再次暂存变更的文件并提交
          git add loon/ surge/ loon-scripts.tar.gz surge-scripts.tar.gz
          git commit -m "自动转换脚本" || echo "没有需要提交的更改"
          
          # 推送更改
          git push || echo "推送失败，可能需要手动解决冲突"
