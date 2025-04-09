/**
 * 优化版脚本转换器模块 - 浏览器兼容版
 * 参考Scriptable实现提炼而成
 */

/**
 * 从文件内容中提取脚本内容
 * @param {string} content 文件内容
 * @returns {string} 提取的脚本内容
 */
function extractScriptContent(content) {
  // 检查是否是被 /* */ 包裹的内容
  const commentMatch = content.match(/\/\*([\s\S]*)\*\//);
  if (commentMatch && commentMatch[1]) {
    return commentMatch[1].trim();
  }
  
  // 如果不是被注释包裹，则直接返回，但去掉多余的空行
  return content.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * 解析脚本内容
 * @param {string} content 脚本内容
 * @returns {Object} 解析结果
 */
function parseScript(content) {
  const result = {
    metadata: {},
    rules: [],
    rewrites: [],
    scripts: [],
    hostname: ""
  };
