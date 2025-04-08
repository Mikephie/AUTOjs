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
