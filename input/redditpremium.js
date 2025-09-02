/*
#!name= ✨ Reddit Premium ✨
#!desc=Reddit Premium 解锁 & 去广告（首屏兼容，广谱过滤，带兜底）
#!category=🚫广告
#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ
#!icon=https://raw.githubusercontent.com/Mikephie/icons/main/icon/reddit.png
𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹
[rewrite_local]
# 同时覆盖 gql / gql-fed / gateway，根路径与带查询都能命中
^https?:\/\/(?:gql(?:-fed)?|gateway)\.reddit\.com\/?.* url script-request-body https://raw.githubusercontent.com/Mikephie/Script/main/qx/redditpremium.js
^https?:\/\/(?:gql(?:-fed)?|gateway)\.reddit\.com\/?.* url script-response-body https://raw.githubusercontent.com/Mikephie/Script/main/qx/redditpremium.js

[MITM]
hostname = gql.reddit.com, gql-fed.reddit.com, gateway.reddit.com
*/

//////////////////// 以下为实际脚本（与上方 URL 指向的远程版保持一致） ////////////////////

// ===== 轻量通知 + 冷却 =====
const APP_NAME = "✨ Reddit ✨";   // 仅展示名
const ID = "reddit";               // 键名（只用字母数字）

const EN = "n:"+ID+":e";           // 开关
const TS = "n:"+ID+":t";           // 时间戳
const CD = 600000;                 // 冷却：10 分钟（毫秒！）← 之前写了 60000000

function notify(t,s,b){
  if (typeof $notify === "function") $notify(t,s,b);
  else if ($notification?.post) $notification.post(t,s,b);
  else console.log("[Notify]", t, s, b);
}

// 默认开启；可自行写个"开/关"脚本改 EN 的值
let enabled = (($persistentStore.read(EN) || "1") === "1");
if (enabled) {
  const now  = Date.now();
  const last = parseInt($persistentStore.read(TS) || "0", 10) || 0;
  if (last === 0 || now - last > CD) {
    notify(APP_NAME, "💖永久解锁 🆚 ⓿❽-⓿❽-❷⓿❽❽💗");
    $persistentStore.write(String(now), TS);
  }
}

// == Reddit Cleaner (Full, Stable) ==
// 标记保留，避免清理器误删：
;var encode_version = 'jsjiami.com.v7';
const VERSION = '1.2.0-20250902';
const ARG = (typeof $argument === 'string' && $argument)
  ? Object.fromEntries($argument.split('&').map(kv => kv.split('=').map(decodeURIComponent)))
  : {};
const DEBUG = ARG.debug === '1';
const MODE  = (ARG.mode || 'auto'); // auto / wide / strict
function log(...a){ if (DEBUG) console.log('[reddit-cleaner]', ...a); }

(function main() {
  try {
    if (typeof $response !== 'undefined' && $response) return handleResponse();
    // 请求阶段不做拦截，避免首屏空白
    $done({});
  } catch (e) {
    log('fatal', e && (e.stack || e));
    if (typeof $response !== 'undefined' && $response?.body) return $done({ body: $response.body });
    $done({});
  }
})();

/*** 工具 ***/
const S = {
  parse(s){ try{ return JSON.parse(s) }catch{ return null } },
  str(o){ try{ return JSON.stringify(o) }catch{ return '' } },

  isAdStrict(obj){
    if (!obj || typeof obj !== 'object') return false;
    const t = String(obj.__typename || '');
    if (/^Ad([A-Z0-9_]+)?$/i.test(t)) return true;
    if (obj.adPayload) return true;
    if (obj.isSponsored === true) return true;
    if (obj.promoted === true) return true;
    if (obj.ad_metadata || obj.adServing || obj.promo || obj.promotedBy) return true;
    return false;
  },
  isAdWide(obj){
    if (!obj || typeof obj !== 'object') return false;
    const t = String(obj.__typename || '');
    if (/Ad/i.test(t)) return true;
    if (obj.adPayload) return true;
    if (Array.isArray(obj.cells) && obj.cells.some(c => /Ad/i.test(String(c?.__typename || '')))) return true;
    if (obj.isSponsored || obj.promoted) return true;
    if (obj.ad_metadata || obj.adServing || obj.promo || obj.promotedBy) return true;
    return false;
  },

  fixFields(k, obj){
    switch (k){
      case 'isObfuscated': obj[k] = false; break;
      case 'obfuscatedPath': obj[k] = null; break;

      case 'isNsfw':
      case 'isNsfwMediaBlocked':
      case 'isNsfwContentShown':
        obj[k] = false; break;

      case 'isAdPersonalizationAllowed':
      case 'isThirdPartyInfoAdPersonalizationAllowed':
        obj[k] = false; break;

      case 'isPremiumMember':
      case 'isEmployee':
        obj[k] = true; break;
    }
  },

  deepFix(x){
    if (Array.isArray(x)){
      const a0 = x.map(S.deepFix);
      const looksLikeList = a0.length && (a0[0]?.node !== undefined || typeof a0[0] === 'object');
      if (!looksLikeList) return a0;

      const strict = it => !S.isAdStrict(it?.node ?? it);
      const wide   = it => !S.isAdWide(it?.node ?? it);

      let filtered;
      if (MODE === 'strict') {
        filtered = a0.filter(strict);
      } else if (MODE === 'wide') {
        filtered = a0.filter(wide);
        if (filtered.length === 0 && a0.length > 0) filtered = a0.filter(strict);
        if (filtered.length === 0) filtered = a0;
      } else { // auto
        filtered = a0.filter(wide);
        if (filtered.length === 0 && a0.length > 0) filtered = a0.filter(strict);
        if (filtered.length === 0) filtered = a0;
      }
      return filtered;
    }

    if (x && typeof x === 'object'){
      for (const k of Object.keys(x)){
        S.fixFields(k, x);
        x[k] = S.deepFix(x[k]);
      }
      return x;
    }
    return x;
  }
};

/*** 响应处理 ***/
function handleResponse(){
  let raw = $response.body || '';

  try{
    raw = raw
      .replace(/"isObfuscated":\s*true/g, '"isObfuscated":false')
      .replace(/"obfuscatedPath":"[^"]*"/g, '"obfuscatedPath":null')
      .replace(/"isNsfw":\s*true/g, '"isNsfw":false')
      .replace(/"isNsfwMediaBlocked":\s*true/g, '"isNsfwMediaBlocked":false')
      .replace(/"isNsfwContentShown":\s*true/g, '"isNsfwContentShown":false')
      .replace(/"isAdPersonalizationAllowed":\s*true/g, '"isAdPersonalizationAllowed":false')
      .replace(/"isThirdPartyInfoAdPersonalizationAllowed":\s*true/g, '"isThirdPartyInfoAdPersonalizationAllowed":false')
      .replace(/"isPremiumMember":\s*false/g, '"isPremiumMember":true')
      .replace(/"isEmployee":\s*false/g, '"isEmployee":true');
  }catch(_){}

  const obj = S.parse(raw);
  if (!obj){
    log('non-json or parse fail; passthrough');
    return $done({ body: raw });
  }

  const fixed = S.deepFix(obj);
  const out = S.str(fixed) || raw;
  $done({ body: out });
}

// 二次标记（兼容某些清理器）
var version_ = 'jsjiami.com.v7';