const fs = require('fs');
const converter = require('./script-converter');

// 定义测试样例
const sampleScript = `
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
`;

console.log('开始测试脚本转换...');

try {
  // 测试导出的所有方法
  console.log('可用方法:', Object.keys(converter).join(', '));
  
  // 使用convertScript方法
  if (typeof converter.convertScript === 'function') {
    console.log('\n测试 convertScript 方法:');
    const loonResult = converter.convertScript(sampleScript, 'loon');
    console.log('Loon 格式转换结果:\n', loonResult);
    
    const surgeResult = converter.convertScript(sampleScript, 'surge');
    console.log('Surge 格式转换结果:\n', surgeResult);
  } else {
    console.log('convertScript 方法不可用，使用单独的方法');
    
    // 提取脚本内容
    const extractedContent = converter.extractScriptContent(sampleScript);
    console.log('提取脚本内容长度:', extractedContent.length);
    
    // 检测脚本类型
    let scriptType = 'unknown';
    if (typeof converter.detectScriptType === 'function') {
      scriptType = converter.detectScriptType(extractedContent);
      console.log('检测到脚本类型:', scriptType);
    }
    
    // 解析脚本
    const scriptInfo = converter.parseScript(extractedContent, scriptType);
    console.log('解析的元数据:', Object.keys(scriptInfo.metadata).join(', '));
    
    // 转换为Loon格式
    const loonResult = converter.convertToLoon(scriptInfo);
    console.log('Loon 格式转换结果:\n', loonResult);
    
    // 转换为Surge格式
    const surgeResult = converter.convertToSurge(scriptInfo);
    console.log('Surge 格式转换结果:\n', surgeResult);
  }
  
  console.log('测试完成');
} catch (error) {
  console.error('测试失败:', error);
  console.error('错误堆栈:', error.stack);
}
