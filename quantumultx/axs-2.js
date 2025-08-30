/*
#!name= ✨ AXS Payment ✨
#!desc=缴费账单
#!category=🚫广告
#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ
#!icon=https://raw.githubusercontent.com/Mikephie/icons/main/icon/axs.png
𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹
[rewrite_local]
^https?:\/\/m-station2\.axs\.com\.sg\/AXSMobile\/InfoPage\/.+\/whatsnew\.php(?:\?.*)?$ url 302 closebutton://

# 如需顺便屏蔽 Marketplace 和 highlight（可选）
# ^https?:\/\/m-station2\.axs\.com\.sg\/AXSMobile\/WebView\/MarketPlace.* url reject
# ^https?:\/\/m-station2\.axs\.com\.sg\/AXSMobile\/highlight.* url reject

[mitm]
hostname = m-station2.axs.com.sg

*/

// ===== AXS Payment | 通知+冷却（分钟配置；1=开, 0=关）=====
// 兼容：Loon / Surge / Quantumult X
// 功能：只做通知+冷却（不改包体）

(function () {
  var APP_NAME = "✨ AXS Payment ✨";
  var ID = "axspayment";              // 仅字母数字，避免空格
  var EN = "n:" + ID + ":e";          // 开关：1=开, 0=关
  var TS = "n:" + ID + ":t";          // 上次通知时间

  // ===== 冷却时间（单位：分钟）=====
  var CD_MINUTES = 10;                // ← 直接改这里（例：5、15、30）
  var CD = CD_MINUTES * 60 * 1000;    // 转毫秒

  // 读开关（默认 1=开启）
  var enVal = ($persistentStore.read(EN) || "1");
  var ENABLED = (enVal === "1");

  // 统一通知
  function notify(t, s, b) {
    if (typeof $notify === "function") {
      $notify(t, s, b);
    } else if (typeof $notification !== "undefined" && $notification.post) {
      $notification.post(t, s, b);
    } else {
      console.log("[Notify]", t + " | " + s + " | " + b);
    }
  }

  // 关闭 → 安全返回
  if (!ENABLED) {
    try { $done({}); } catch (e) {}
    return;
  }

  // 冷却判定
  var now = Date.now();
  var last = parseInt($persistentStore.read(TS) || "0", 10) || 0;

  if (last === 0 || (now - last) > CD) {
    notify(APP_NAME, "💖永久解锁 🆚 ⓿❽-⓿❽-❷⓿❽❽💗://（冷却 " + CD_MINUTES + " 分钟）");
    $persistentStore.write(String(now), TS);
  }

  try { $done({}); } catch (e) {}
})();