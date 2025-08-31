/*
#!name= ✨ AXS Payment (Auto-close) ✨
#!desc=AXS 广告页自动关闭（无通知、无冷却）
#!category=🚫广告
#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ
#!icon=https://raw.githubusercontent.com/Mikephie/icons/main/icon/axs.png
𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹
[rewrite_local]
# 命中 AXS 广告/公告页 → 直接跳转 closebutton:// 让 App 关闭 WebView
^https?:\/\/m-station2\.axs\.com\.sg\/AXSMobile\/InfoPage\/.+\/whatsnew\.php(?:\?.*)?$ url 302 closebutton://

# （可选）顺带屏蔽 Marketplace 与 highlight，如不需要就删掉下面两行
# ^https?:\/\/m-station2\.axs\.com\.sg\/AXSMobile\/WebView\/MarketPlace.* url reject
# ^https?:\/\/m-station2\.axs\.com\.sg\/AXSMobile\/highlight.* url reject

[mitm]
hostname = m-station2.axs.com.sg
*/