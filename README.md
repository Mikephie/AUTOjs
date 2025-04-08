# AUTOjs - 脚本格式自动转换工具

![GitHub Actions](https://github.com/yourusername/AUTOjs/actions/workflows/script-conversion-workflow.yml/badge.svg)
[![GitHub Stars](https://img.shields.io/github/stars/yourusername/AUTOjs.svg)](https://github.com/yourusername/AUTOjs/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/yourusername/AUTOjs.svg)](https://github.com/yourusername/AUTOjs/network/members)

## 项目简介

AUTOjs 是一个自动脚本转换工具，可以将 QuantumultX 格式的脚本自动转换为 Loon 和 Surge 格式。本工具使用 GitHub Actions 自动化处理，无需本地环境，只需将原始脚本放入 `input` 目录，即可自动生成对应的 Loon 插件和 Surge 模块。

## 功能特点

- 🚀 **全自动转换**：使用 GitHub Actions 自动触发转换流程
- 🔄 **多格式支持**：从 QuantumultX 格式转换到 Loon 和 Surge 格式
- 📂 **保持目录结构**：转换后的文件保持原始的目录组织
- 📝 **保留注释和元数据**：保留原始脚本中的注释和元数据信息
- 📦 **自动打包**：自动生成转换结果的压缩包方便下载

## 使用方法

### 获取转换后的脚本

已转换的脚本位于以下目录：

- **Loon 格式**：[loon 目录](./loon)
- **Surge 格式**：[surge 目录](./surge)

您也可以下载打包好的文件：

- [loon-scripts.tar.gz](./loon-scripts.tar.gz) - Loon 格式脚本集合
- [surge-scripts.tar.gz](./surge-scripts.tar.gz) - Surge 格式脚本集合

### 提交新脚本

如果您想要添加或更新脚本：

1. Fork 本仓库
2. 将 QuantumultX 格式的脚本添加到 `input` 目录
3. 提交 Pull Request
4. GitHub Actions 将自动处理转换并更新结果

或者直接创建 Issue，附上脚本内容或链接，我们会处理并添加。

## 转换说明

转换过程会自动处理以下内容：

- **元数据**：名称、描述、作者等信息
- **重写规则**：包括普通重写和脚本重写
- **过滤规则**：各类过滤和屏蔽规则
- **脚本设置**：响应处理、定时任务等
- **MITM 设置**：中间人解密所需的域名配置

### 支持的文件类型

支持的输入文件扩展名：`.js`、`.conf`、`.txt`、`.sgmodule`、`.plugin`

### 输出格式

- Loon 格式：`.plugin` 文件
- Surge 格式：`.sgmodule` 文件

## 自动更新机制

本工具设置了多种自动触发机制：

- 当有新文件推送到 `input` 目录时
- 当 Pull Request 修改了 `input` 目录中的文件时
- 每周日自动执行一次完整转换
- 可以手动触发工作流执行转换

## 使用示例

QuantumultX 原始脚本：
```javascript
/*
#!name=样例QX脚本
#!desc=用于测试转换功能的样例脚本
#!author=Converter
#!category=示例

[rewrite_local]
# 广告拦截
^https?:\/\/api\.example\.com\/ads - reject-dict
^https?:\/\/api\.example\.com\/banner - reject-img

# 脚本处理
^https?:\/\/api\.example\.com\/user\/profile url script-response-body https://example.com/scripts/profile.js
^https?:\/\/api\.example\.com\/check_in url script-request-header https://example.com/scripts/checkin.js

[filter_local]
# 规则设置
host, ad.example.com, reject
host-suffix, stats.example.com, reject
host-keyword, tracker, reject
ip-cidr, 10.10.10.10/24, direct
user-agent, Example App*, direct

[mitm]
hostname = api.example.com, *.example.net, stats.example.org
*/
```

转换后的 Loon 格式：
```ini
#!name=样例QX脚本
#!desc=用于测试转换功能的样例脚本
#!author=Converter
#!category=示例

[Rewrite]
# 广告拦截
^https?:\/\/api\.example\.com\/ads - reject
^https?:\/\/api\.example\.com\/banner - reject-img

[Script]
# 脚本处理
http-response ^https?:\/\/api\.example\.com\/user\/profile script-path=https://example.com/scripts/profile.js, requires-body=true, tag=profile
http-request ^https?:\/\/api\.example\.com\/check_in script-path=https://example.com/scripts/checkin.js, tag=checkin

[Rule]
# 规则设置
DOMAIN,ad.example.com,REJECT
DOMAIN-SUFFIX,stats.example.com,REJECT
DOMAIN-KEYWORD,tracker,REJECT
IP-CIDR,10.10.10.10/24,DIRECT
USER-AGENT,Example App*,DIRECT

[MITM]
hostname = api.example.com, *.example.net, stats.example.org
```

转换后的 Surge 格式：
```ini
#!name=样例QX脚本
#!desc=用于测试转换功能的样例脚本
#!author=Converter
#!category=示例

[Rule]
# 规则设置
DOMAIN,ad.example.com,REJECT
DOMAIN-SUFFIX,stats.example.com,REJECT
DOMAIN-KEYWORD,tracker,REJECT
IP-CIDR,10.10.10.10/24,DIRECT
USER-AGENT,Example App*,DIRECT

[Map Local]
# 广告拦截
^https?:\/\/api\.example\.com\/ads data="HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 2

{}"
^https?:\/\/api\.example\.com\/banner data="HTTP/1.1 200 OK
Content-Type: image/png
Content-Length: 0"

[Script]
# 脚本处理
profile = type=http-response, pattern=^https?:\/\/api\.example\.com\/user\/profile, requires-body=1, script-path=https://example.com/scripts/profile.js, timeout=60
checkin = type=http-request, pattern=^https?:\/\/api\.example\.com\/check_in, requires-body=0, script-path=https://example.com/scripts/checkin.js, timeout=60

[MITM]
hostname = %APPEND% api.example.com, *.example.net, stats.example.org
```

## 技术架构

- **脚本解析**：使用正则表达式和字符串处理函数解析原始脚本
- **格式转换**：根据目标格式构建正确的配置结构
- **自动化流程**：通过 GitHub Actions 实现完全自动化处理
- **多平台支持**：统一的转换核心，支持扩展更多格式

## 贡献指南

欢迎贡献代码或提出建议！您可以通过以下方式参与：

1. 提交 Bug 报告或功能请求
2. 改进现有的转换逻辑
3. 添加对新格式的支持
4. 优化代码和文档

## 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 鸣谢

- 感谢所有脚本作者和分享者
- 感谢 GitHub Actions 提供的自动化服务
- 感谢社区中所有提供反馈和建议的用户

---

**免责声明**：本工具仅供学习和参考，所有转换后的脚本版权归原作者所有。请遵守相关法律法规和服务条款使用脚本。
