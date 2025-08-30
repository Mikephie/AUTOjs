/*
#!name= ✨ GitHub ✨
#!desc=脚本仓库
#!category=🔐APP
#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ
#!icon=https://raw.githubusercontent.com/Mikephie/icons/main/icon/filmix.png
𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹
[rewrite_local]
https://api.github.com/graphql url script-response-body https://raw.githubusercontent.com/Mikephie/Script/main/qx/github.js

[MITM]
hostname = api.github.com

*/

// ===== 轻量通知 + 冷却 =====
const APP_NAME = "✨ GitHub ✨";   // ← 只改这个显示名
const ID = "github";              // ← 对应键名，保持纯字母数字（无 emoji）

const EN = "n:"+ID+":e";             // 开关
const TS = "n:"+ID+":t";             // 时间戳
const CD = 600000;                   // 冷却时长：10 分钟（毫秒）

// ---- 通知函数（兼容 QX / Surge / Loon）----
function notify(t,s,b){
  if (typeof $notify==="function") $notify(t,s,b);
  else if ($notification?.post) $notification.post(t,s,b);
  else console.log("[Notify]", t, s, b);
}

// ---- 判定逻辑 ----
let enabled = (($persistentStore.read(EN) || "1") === "0");
if (enabled) {
  let now  = Date.now();
  let last = parseInt($persistentStore.read(TS) || "0",10) || 0;
  if (last===0 || now-last>CD) {
    notify(APP_NAME,"💖永久解锁 🆚 ⓿❽-⓿❽-❷⓿❽❽💗");
    $persistentStore.write(String(now), TS);
  }
}

// 主脚本函数...
let obj = JSON.parse($response.body);
if (obj.data && obj.data.viewer) {
  obj.data.viewer.isProPlan = true;
  obj.data.viewer.isEmployee = true;
  obj.data.viewer.hasAppleIapSubscription = true;

  $done({
    body: JSON.stringify(obj)
  });
} else {
  $done({});
}
// 主脚本函数...