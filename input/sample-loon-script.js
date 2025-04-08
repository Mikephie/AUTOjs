/*
#!name = 彩云天气SVIP
#!desc = 解锁彩云天气SVIP
#!author = MikePhie
#!category = 🔐APP
#!icon = https://raw.githubusercontent.com/Mikephie/icons/main/icon/caiyun.png

[Script]
# 彩云天气SVIP
http-response ^https:\/\/biz\.cyapi\.cn\/(v1\/user|v2\/user\/account|membership_rights|v3\/user) script-path=https://raw.githubusercontent.com/Mikephie/app/main/scripts/caiyun.js, requires-body=true, timeout=60, tag=caiyun

[MITM]
hostname = biz.cyapi.cn, wrapper.cyapi.cn
*/
