/*
#!name= ✨ Owlfiles ✨
#!desc=FTP
#!category=🔐APP
#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ
#!icon=https://raw.githubusercontent.com/Mikephie/icons/main/icon/owlfiles.png
𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹
[rewrite_local]
^https:\/\/www\.skyjos\.com:58080\/ws\/(validate|loadaccountinfo|app_store\/[a-z_]+) url script-response-body https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx/owlfiles.js

[MITM]
hostname = skyjos.com:58080

*/

// ===== 轻量通知 + 冷却 =====
const APP_NAME = "✨ Owlfiles ✨";   // ← 只改这个显示名
const ID = "owlfiles";              // ← 对应键名，保持纯字母数字（无 emoji）

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
try {
  let obj = JSON.parse($response.body);

  obj.memberLevel = 3;
  obj.expireAt = 2754094349450;

  $done({ body: JSON.stringify(obj) });
} catch (err) {
  console.log("Skyjos 解锁失败: " + err);
  $done({});
}
// 主脚本函数...
