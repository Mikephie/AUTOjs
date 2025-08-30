/*
#!name= ✨ ILovePDF ✨
#!desc=效率 - 需试用
#!category=🔐APP
#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ
#!icon=https://raw.githubusercontent.com/Mikephie/icons/main/icon/ilovepdf.png
𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹
[rewrite_local]
^https:\/\/service\.ilovepdf\.com\/v1\/user url script-response-body https://raw.githubusercontent.com/Mikephie/Script/main/qx/ilovepdf.js

[MITM]
hostname = service.ilovepdf.com

*/

// ===== 轻量通知 + 冷却 =====
const APP_NAME = "✨ ILovePDF ✨";   // ← 只改这个显示名
const ID = "ilovepdf";              // ← 对应键名，保持纯字母数字（无 emoji）

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
let enabled = (($persistentStore.read(EN) || "1") === "1");
if (enabled) {
  let now  = Date.now();
  let last = parseInt($persistentStore.read(TS) || "0",10) || 0;
  if (last===0 || now-last>CD) {
    notify(APP_NAME,"💖永久解锁 🆚 ⓿❽-⓿❽-❷⓿❽❽💗");
    $persistentStore.write(String(now), TS);
  }
}

// 主脚本函数...
let body = JSON.parse($response.body);

// 设置基础会员信息
body.valid_until = "2088-08-08 23:59:59";
body.premium = true;
body.can_trial = false;
body.active = 1;
body.results = {
  "status": 1,
  "vipType": 1,
  "expiredTime": 3742762088000,
  "isVip": true
};

// 替换头像（可选）
//body.avatar = "https:\/\/service.ilovepdf.com\/avatar\/3fefaacc5c278e83ca8fb462ba07c334\/ZKrTylPxWVEYANrF1urwvO3RKD58Cz78?s=300";

// 强制设置 limits 为最大
if (body.limits) {
  for (const key in body.limits) {
    if (body.limits[key]) {
      body.limits[key].mb = 99999;
      body.limits[key].files = 9999;
      if ('pages' in body.limits[key]) {
        body.limits[key].pages = 1000;
      }
      if ('pxsize' in body.limits[key]) {
        body.limits[key].pxsize = 2073600;
      }
    }
  }
}

$done({ body: JSON.stringify(body) });
// 主脚本函数...