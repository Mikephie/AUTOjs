#!name= ✨ AXS Payment ✨
#!desc=缴费账单
#!category=🚫广告
#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ
#!icon=https://raw.githubusercontent.com/Mikephie/icons/main/icon/axs.png
𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹
[filter_local]
url-regex,^https:\/\/m-station2\.axs\.com\.sg\/AXSMobile\/WebView\/MarketPlace,reject
url-regex,^https:\/\/m-station2\.axs\.com\.sg\/AXSMobile\/highlight,reject

[rewrite_local]
^https?:\/\/m-station2\.axs\.com\.sg\/AXSMobile\/InfoPage\/.*$ url script-response-body ./quantumultx/axs.js

[mitm]
hostname = m-station2.axs.com.sg