/*
#!name= ✨ RevenueCat ✨
#!desc=RevenueCat合集解锁
#!category=通杀脚本
#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ
#!icon = https://raw.githubusercontent.com/Mikephie/icons/main/icon/revenuecat.png
𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹
[rewrite_local]
^https:\/\/api\.(revenuecat|rc-backup)\.com\/.+\/(receipts$|subscribers\/?(.*?)*$) url script-response-body https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx/RevenueCatNew.js
^https:\/\/api\.(revenuecat|rc-backup)\.com\/.+\/(receipts$|subscribers\/?(.*?)*$) url script-request-header https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx/RevenueCatNew.js

[mitm]
hostname = api.revenuecat.com, api.rc-backup.com

*/
