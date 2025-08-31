/*
#!name= ✨ 彩云天气 ✨
#!desc=天气预测
#!category=🔐APP
#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ
#!icon=https://raw.githubusercontent.com/Mikephie/icons/main/icon/caiyun.png
𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹
大于>7.20.2版本不可以mitm  需要使用最新版,比如7.22.0,可以通过登录旧版解锁，在线升级到新版版即可
如果出现广告无法消除，请卸载重装，或者巨魔用户使用  轻松签+👉应用👉已安装👉彩云天气(Pro)👉清除数据👉仅清空数据(这样清除广告缓存且不需要重新登录)

====================================
[filter_local]
# 上传信息
host, gather.colorfulclouds.net ,reject

[rewrite_local]
# 普通版开屏广告(此广告不定时出现)
^https:\/\/ad\.cyapi\.cn\/v2\/req\?app_name=weather url reject-dict
# 7.1.9 限时福利Svip
^https:\/\/biz\.cyapi\.cn\/p\/v1\/trial_card\/info url reject-dict
# 7.2.0普通版修改VIP后提示账号迁移
^https:\/\/biz\.cyapi\.cn\/api\/v1\/token\/device$ url reject-dict

# 亲友卡
^https:\/\/biz\.cyapi\.cn\/p\/v1\/entries url reject-dict
# 左上角+进去推荐
^https:\/\/starplucker\.cyapi\.cn\/v3\/config$ url reject-dict

# 通知
^https:\/\/starplucker\.cyapi\.cn\/v3\/notification\/message_center url reject-dict
# 会员限时弹窗
^https:\/\/starplucker\.cyapi\.cn\/v3\/config\/cypage\/home\/conditions\/local$ url reject-dict
^https:\/\/starplucker\.cyapi\.cn\/v3\/config\/cypage\/home_activity\/conditions$ url reject-dict
^https:\/\/starplucker\.cyapi\.cn\/v3\/config\/cypage\/40day\/conditions\/local$ url reject-dict

# 赏叶赏花模块
^https:\/\/wrapper\.cyapi\.cn\/v1\/activity\?app_name=weather url script-response-body https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx/caiyun.js
# 解锁旧版vip(7.20.0之前)
^https:\/\/biz\.cyapi\.cn\/v2\/user url script-response-body https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx/caiyun.js
# 卫星云图 48小时预报
^https:\/\/wrapper\.cyapi\.cn\/v1\/(satellite|nafp\/origin_images) url script-request-header https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx/caiyun.js
# 7.20.0版本显示VIP
^https?:\/\/biz\.cyapi\.cn\/api\/v1\/user_detail$ url script-response-body https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx/caiyun.js
# 7.22.0版本 40天趋势/60天潮汐/风 等等有时候无法加载
^https:\/\/starplucker\.cyapi\.cn\/v3\/ url script-request-body https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx/caiyun.js

# 发现-轮播
^https:\/\/starplucker\.cyapi\.cn\/v3\/operation\/banners\?user_type= url script-response-body https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx/caiyun.js
# 发现-宫格
^https:\/\/starplucker\.cyapi\.cn\/v3\/operation\/features\?user_type= url script-response-body https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx/caiyun.js
# 发现-官方活动
^https:\/\/starplucker\.cyapi\.cn\/v3\/campaigns$ url script-response-body https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx/caiyun.js
# 发现-瀑布流
^https:\/\/starplucker\.cyapi\.cn\/v3\/operation\/feeds url script-response-body https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx/caiyun.js

[mitm]
hostname = *.cyapi.cn
====================================
 */

// ===== 轻量通知 + 冷却 =====
const APP_NAME = "✨ 彩云天气 ✨";   // ← 只改这个显示名
const ID = "彩云天气";              // ← 对应键名，保持纯字母数字（无 emoji）

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
var huihui = {}, url = $request.url, headers = ObjectKeys2LowerCase($request.headers);
const token = 'eyJhbGciOiJFUzI1NiIsImtpZCI6Ind0ZmI4NmQ5IiwidHlwIjoiSldUIn0.eyJhdWQiOlsid2VhdGhlciJdLCJleHAiOjE3NTcyNzkxODAsImlhdCI6MTc1NjY3NDM4MCwic2lkIjoiNjcwYjI4MzQ2M2QxM2VlM2ViOTVjYzkwIiwidXNlcl9pZCI6IjY1NDBkMWVjYTRmODE0MDAxODNlODU5NSIsImRldmljZV9pZCI6IkZENzVEREY3LThFMjEtNDRENS1BNTdCLTA1MjU3OTFGODBEOC0xNjk2ODM5MTg1IiwidXNlcl90eXBlIjoxLCJ2ZXJzaW9uIjozfQ.LeAaSB2_bp99FH-gs7zPqblb7fueoFAFmKwRpgs-7MDYlRhTh-3kWf0jGfUdFpe5Pq5iKJJlVIpXStSIxgCQdQ';
if (url.includes("/v2/user")) {
    let obj = JSON.parse($response.body);
    Object.assign(obj.result, {is_vip: true, svip_expired_at: 3742732800, vip_type: "s"});
    huihui.body = JSON.stringify(obj)
} else if (/v1\/(satellite|nafp\/origin_images)/.test(url)) {
    huihui.headers = {...headers, 'device-token': token};
    if (compareVersions(headers['app-version'], '7.19.0') > 0) {
        huihui.headers['authorization'] = `Bearer ${token}`;
    }
} else if (url.includes('v1/activity')) {
    const body = compareVersions(headers['app-version'], '7.20.0') < 0 ? '{"status":"ok","activities":[{"items":[{}]}]}' : '{"status":"ok","activities":[]}';
    huihui.body = body;
} else if (url.includes('/user_detail')) {
    const obj = JSON.parse($response.body);
    Object.assign(obj.vip_info.svip, {is_auto_renewal: true, expires_time: '3742732800'});
    huihui.body = JSON.stringify(obj)
} else if (url.includes('starplucker.cyapi.cn/v3/')) {
    if (!url.includes('starplucker.cyapi.cn/v3/favorite_places')) {
        headers['authorization'] = `Bearer ${token}`;
        huihui.headers = headers;
    }
}

// 轮播
if (url.includes('/operation/banners')) {
    huihui.body = `{"data": [{"avatar": "https://cdn-w.caiyunapp.com/p/app/operation/prod/banner/668502d5c3a2362582a2a5da/d9f198473e7f387d13ea892719959ddb.jpg","url": "https://cdn-w.caiyunapp.com/p/app/operation/prod/article/66850143c3a2362582a2a5d9/index.html","title": "暴雨来袭，这些避险"秘籍"你学会了吗？","banner_type": "article"}],"interval": 5000}`
}
// 宫格
if (url.includes('/operation/features')) {
    //const obj = JSON.parse($response.body);
    //obj.data = obj?.data.filter(item => item?.title !== '水汽之旅' && item?.title !== '生活指数');
    huihui.body = `{"data":[{"avatar":"https://cdn-w.caiyunapp.com/p/app/operation/prod/feature/66a881fbd428d25287131ed0/7c0bc08d8bde602523220d05c3a1f148.png","url":"https://h5.caiyunapp.com/calender","title":"万年历","feature_type":"","badge_type":""},{"avatar":"https://cdn-w.caiyunapp.com/p/app/operation/prod/feature/665579a9a16f650e019e41b0/37f5cb7e2e4bd46fe5162e8adf8cd9ff.png","url":"cy://page_driving_weather","title":"驾驶天气","feature_type":"","badge_type":""},{"avatar":"https://cdn-w.caiyunapp.com/p/app/operation/prod/feature/6556d0853aad9a16ec615563/f3d65d4e56a01de218d51bd57f236a03.png","url":"cy://page_cycling_weather","title":"骑行天气","feature_type":"","badge_type":""},{"avatar":"https://cdn-w.caiyunapp.com/p/app/operation/prod/feature/64100001aa27c7a808e3d3fd/f0377e1e49e60a2dd4d19a095c3273be.png","url":"cy://page_index_fish","title":"钓鱼指数","feature_type":"","badge_type":""},{"avatar":"https://cdn-w.caiyunapp.com/p/app/operation/prod/feature/642555ed55a01b072a6db687/ee2c1efe31ba36445779ae940c5c6901.png","url":"cy://page_index_clothing","title":"穿衣指数","feature_type":"","badge_type":""},{"avatar":"https://cdn-w.caiyunapp.com/p/app/operation/prod/feature/668cf839367625ff6748e635/3e2f27c8642a8e1a49f9619878194845.png","url":"cy://page_earthquake_view","title":"地震地图","feature_type":"","badge_type":""},{"avatar":"https://cdn-w.caiyunapp.com/p/app/operation/prod/feature/66f50b56908a75e646cf76df/1de5a65fc905b2a26c260a377bfa24c2.png","url":"https://h5.caiyunapp.com/mountain-view/list","title":"登山天气","feature_type":"","badge_type":"","badge":""},{"avatar":"https://cdn-w.caiyunapp.com/p/app/operation/prod/feature/66f50fdb908a75e646cf76e1/a57e9c6400ab6c407d565e354d3347a8.png","url":"cy://page_tide_view","title":"60天潮汐","feature_type":"","badge_type":""}]}`
}
// 官方活动
if (url.includes('starplucker.cyapi.cn/v3/campaigns')) {
    huihui.body = `{"campaigns": []}`
}
//瀑布流
if (url.includes('/operation/feeds')) {
    const obj = JSON.parse($response.body);
    obj.data = obj?.data.filter(item => item?.category_name == '文章');
    huihui.body = JSON.stringify(obj)
}
$done(huihui);

function compareVersions(t,r){"string"!=typeof t&&(t="0"),"string"!=typeof r&&(r="0");const e=t.split(".").map(Number),n=r.split(".").map(Number);for(let t=0;t<Math.max(e.length,n.length);t++){const r=e[t]||0,i=n[t]||0;if(r>i)return 1;if(r<i)return-1}return 0}
function ObjectKeys2LowerCase(obj){return Object.fromEntries(Object.entries(obj).map(([k,v])=>[k.toLowerCase(),v]))};

//eyJhbGciOiJFUzI1NiIsImtpZCI6Ind0ZmI4NmQ5IiwidHlwIjoiSldUIn0.eyJhdWQiOlsid2VhdGhlciJdLCJleHAiOjE3NTcyNzkxODAsImlhdCI6MTc1NjY3NDM4MCwic2lkIjoiNjcwYjI4MzQ2M2QxM2VlM2ViOTVjYzkwIiwidXNlcl9pZCI6IjY1NDBkMWVjYTRmODE0MDAxODNlODU5NSIsImRldmljZV9pZCI6IkZENzVEREY3LThFMjEtNDRENS1BNTdCLTA1MjU3OTFGODBEOC0xNjk2ODM5MTg1IiwidXNlcl90eXBlIjoxLCJ2ZXJzaW9uIjozfQ.LeAaSB2_bp99FH-gs7zPqblb7fueoFAFmKwRpgs-7MDYlRhTh-3kWf0jGfUdFpe5Pq5iKJJlVIpXStSIxgCQdQ