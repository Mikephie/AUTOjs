#!name=✨ iGV (Auto-close) ✨
#!desc=GV 广告页秒关 + 广告图拦截（无脚本）
#!category=🚫广告
#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ
#!icon=https://raw.githubusercontent.com/Mikephie/icons/main/icon/igv.png

[rewrite_local]
# 命中 iGV 广告页 → 直接关闭 WebView
^https?:\/\/m\.gv\.com\.sg\/iGV2\/general\/advpage\.html(?:\?.*)?$ url 302 closebutton://

# 拦截广告图片
#^https:\/\/media\.gv\.com\.sg\/cms\/images\/ads\/.*\.(?:jpg|png|gif)$ url reject-img

[mitm]
hostname = m.gv.com.sg, media.gv.com.sg