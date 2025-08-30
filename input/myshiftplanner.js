/*
#!name= ✨ MyShiftPlanner ✨
#!desc=工作排期 - 需试用
#!category=🔐APP
#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ
#!icon=https://raw.githubusercontent.com/Mikephie/icons/main/icon/myshiftplanner.png
𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹
[rewrite_local]
^https:\/\/myshiftplannercloud-live\.azurewebsites\.net\/api\/Purchase\/(validatereceipt|Get)\/?.* url script-response-body https://raw.githubusercontent.com/Mikephie/Script/main/qx/myshiftplanner.js

[MITM]
hostname = myshiftplannercloud-live.azurewebsites.net

*/

// ===== 轻量通知 + 冷却 =====
const APP_NAME = "✨ MyShiftPlanner ✨";   // ← 只改这个显示名
const ID = "myshiftplanner";              // ← 对应键名，保持纯字母数字（无 emoji）

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
let body = JSON.parse($response.body);

// 统一配置值
const fakeDateStr = "2088-08-08 08:08:08";
const fakeDateIso = "2088-08-08T08:08:08";
const fakeDateMs = 3742762088000;

// 尝试处理 Purchases 数组
if (body?.Purchases?.length > 0) {
  for (let item of body.Purchases) {
    // 通用字段修改
    item.expires_date = `${fakeDateStr} Etc/GMT`;
    item.expires_date_pst = `${fakeDateStr} America/Los_Angeles`;
    item.expires_date_ms = String(fakeDateMs);

    // 针对 Get 接口的字段
    item.ExpiryDate = fakeDateIso;
    item.LastExtendDate = fakeDateIso;

    // 统一试用标记为 false
    item.is_trial_period = "false";
    item.IsInTrial = false;
  }
}

$done({ body: JSON.stringify(body) });
// 主脚本函数...