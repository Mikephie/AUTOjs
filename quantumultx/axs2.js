/*
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
^https?:\/\/m-station2\.axs\.com\.sg\/AXSMobile\/InfoPage\/.*$ url script-response-body https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx/axs2.js

[mitm]
hostname = m-station2.axs.com.sg

*/

// -------- 通知（带冷却）逻辑开始 --------
const cooldownMs = 10 * 60 * 1000; // 10分钟冷却
const notifyKey = "AXS_notify_key";
const now = Date.now();
let lastNotifyTime = $persistentStore.read(notifyKey) ? parseInt($persistentStore.read(notifyKey)) : 0;

if (now - lastNotifyTime > cooldownMs) {
    $notification.post("✨AXS✨", "🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ", "永久解锁或 ⓿❽-⓿❽-❷⓿❽❽");
    $persistentStore.write(now.toString(), notifyKey);
}
// -------- 通知（带冷却）逻辑结束 --------

// 主脚本函数...
// 广告关闭专用脚本
let url = $request.url;

// 检测URL是否是广告页面
if (url.includes("/InfoPage/") && url.includes("whatsnew.php")) {
  // 当广告页面加载时，立即替换为包含自动关闭逻辑的极简HTML
  const immediateClosePage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Closing Ad</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: transparent; /* 确保背景透明，减少闪烁 */
      overflow: hidden; /* 隐藏滚动条 */
    }
  </style>
</head>
<body>
  <script>
    // 尝试直接通过 location 改变来关闭，通常更快
    // 如果直接关闭不生效，再通过 form 提交方式作为备用
    window.location.href = "closebutton://";

    // 确保在页面加载后立即执行关闭操作
    // 即使页面内容可能还没有完全渲染，脚本也会尝试执行
    document.addEventListener('DOMContentLoaded', function() {
        // 如果 window.location.href 没有立即关闭，尝试表单提交
        setTimeout(() => {
            const form = document.createElement('form');
            form.id = "formWhatsNewClose";
            form.name = "formWhatsNewClose";
            form.action = "closebutton://";
            form.method = "POST";
            document.body.appendChild(form);
            form.submit();
        }, 50); // 极小的延迟，确保DOM有时间解析，然后立即提交
    });
  </script>
</body>
</html>`;
  
  $done({
    response: {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-store" // 确保不缓存，每次都执行
      },
      body: immediateClosePage
    }
  });
} else {
  $done({});
}
// 主脚本函数...
