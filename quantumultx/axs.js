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
^https?:\/\/m-station2\.axs\.com\.sg\/AXSMobile\/InfoPage\/.*$ url script-response-body https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx/axs.js

[mitm]
hostname = m-station2.axs.com.sg

*/

// -------- 通知（带冷却）逻辑开始 --------
const cooldownMs = 10 * 60 * 1000;
const notifyKey = "AXS_notify_key";
const now = Date.now();
let lastNotifyTime = $persistentStore.read(notifyKey) ? parseInt($persistentStore.read(notifyKey)) : 0;
if (now - lastNotifyTime > cooldownMs) {
    $notification.post("✨AXS✨", "🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ", "永久解锁或 ⓿❽-⓿❽-❷⓿❽❽");
    $persistentStore.write(now.toString(), notifyKey);
}
// -------- 通知（带冷却）逻辑结束 --------

// 主脚本函数...
// 广告关闭专用脚本 - 平衡版
let url = $request.url;

// 检测URL是否是广告页面
if (url.includes("/InfoPage/") && url.includes("whatsnew.php")) {
// 创建一个快速但稳定关闭的页面
const closeButtonPage = `

<!DOCTYPE html>

<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: rgba(0,0,0,0.85);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    .close-button {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background-color: rgba(255,255,255,0.95);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #000;
      font-size: 36px;
      font-weight: normal;
      line-height: 1;
      text-decoration: none;
      z-index: 9999;
      box-shadow: 0 2px 15px rgba(0,0,0,0.5);
      cursor: pointer;
      transition: transform 0.1s;
    }
    .close-button:active {
      transform: scale(0.9);
    }
    .auto-close-timer {
      position: fixed;
      top: 90px;
      right: 20px;
      color: white;
      font-size: 14px;
      background-color: rgba(0,0,0,0.7);
      padding: 8px 15px;
      border-radius: 20px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .loading {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 16px;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <form id="formWhatsNewClose" name="formWhatsNewClose" action="closebutton://" method="POST"></form>
  <a href="javascript:void(0);" onclick="closeNow();" class="close-button">×</a>
  <div class="auto-close-timer" id="timer">2秒后自动关闭</div>
  <div class="loading">正在加载...</div>

  <script>
    let attempts = 0;
    let closed = false;
    
    function closeNow() {
      if (closed) return;
      
      attempts++;
      console.log('尝试关闭，第' + attempts + '次');
      
      try {
        // 尝试多种关闭方式
        if (document.formWhatsNewClose && document.formWhatsNewClose.submit) {
          document.formWhatsNewClose.submit();
          closed = true;
        } else {
          // 如果表单还没准备好，稍后再试
          if (attempts < 10) {
            setTimeout(closeNow, 200);
          }
        }
      } catch(e) {
        console.error('关闭失败:', e);
        if (attempts < 10) {
          setTimeout(closeNow, 200);
        }
      }
    }
    
    // 倒计时显示
    let countdown = 2;
    const timerEl = document.getElementById('timer');
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        timerEl.textContent = countdown + '秒后自动关闭';
      } else {
        timerEl.textContent = '正在关闭...';
        clearInterval(countdownInterval);
      }
    }, 1000);
    
    // 确保DOM完全加载后再开始
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        // DOM加载完成后1秒开始尝试关闭
        setTimeout(closeNow, 1000);
      });
    } else {
      // 如果DOM已经加载完成
      setTimeout(closeNow, 1000);
    }
    
    // 2秒后强制关闭（主要关闭时机）
    setTimeout(() => {
      if (!closed) {
        closeNow();
      }
    }, 2000);
    
    // 备用：3秒后再试一次
    setTimeout(() => {
      if (!closed) {
        closeNow();
      }
    }, 3000);
    
    // 手动点击立即关闭
    window.closeNow = function() {
      closed = false; // 重置状态允许手动关闭
      closeNow();
    };
  </script>

</body>
</html>`;

$done({
response: {
status: 200,
headers: {
"Content-Type": "text/html; charset=UTF-8",
"Cache-Control": "no-cache, no-store, must-revalidate",
"Pragma": "no-cache",
"Expires": "0"
},
body: closeButtonPage
}
});
} else {
$done({});
}
// 主脚本函数...
