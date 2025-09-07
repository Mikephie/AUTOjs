/*
#!name= ✨ QQ阅读 ✨
#!desc=效率
#!category=🔐APP
#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ
#!icon=https://raw.githubusercontent.com/Mikephie/icons/main/icon/qqyd.png
𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹
[rewrite_local]
^https?:\/\/(detailadr|commontgw).reader.qq.com\/(book\/queryDetailPage|.+nativepage\/personal|.+vip\/viptxt) url script-response-body https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx/qqyd.js
^https?:\/\/newminerva-tgw.reader.qq.com\/ChapBatAuthWithPD url script-request-header https://raw.githubusercontent.com/Mikephie/Script/main/qx/qqyd.js

[mitm] 
hostname = *.reader.qq.com,newminerva-tgw.reader.qq.com,detailadr.reader.qq.com,commontgw.reader.qq.com
 
*/

// ===== 轻量通知 + 冷却 =====
const APP_NAME = "✨ QQ阅读 ✨";   // ← 只改这个显示名
const ID = "QQ阅读";              // ← 对应键名，保持纯字母数字（无 emoji）

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
if ($request.url.indexOf("ChapBatAuthWithPD") != -1) {
  let _0x39a195 = {
    "Accept": "*/*",
    "uid": "855104184376",
    "qrtm": "1755667041",
    "trustedid": "cc499a87513a7e422edb7d93fa76953c1",
    "ua": "iPhone 14 Pro Max-iOS16.6",
    "qrem": "0",
    "Accept-Encoding": "gzip",
    "net_type": "1",
    "platform": "ioswp",
    "rcmd": "1",
    "youngerMode": "0",
    "mldt": "e6adcbb59b681e6de4826a89b4937fce99b7f5e8c4e696ed",
    "sid": "",
    "usid": "ykWXgTClWTNp",
    "text_type": "1",
    "csigs": "$2a$04$PMpmckgTeY9sKc7rI1wg/uKaWYs4FEpkwXGqDL7acmZj/nX6AD9zK",
    "loginType": "50",
    "ywtoken": "145d2e8d52880742ff2f97a67404d308",
    "version": "qqreader_8.3.01.0671_iphone",
    "QVisible": "0",
    "Accept-Language": "zh-CN,zh-Hans;q=0.9",
    "User-Agent": "QQReaderUI/51517 CFNetwork/1410.0.3 Darwin/22.6.0",
    "Range": "bytes=0-",
    "qrsy": "bd3249b9f89671bdf5894910db2cd748",
    "ywkey": "",
    "ttime": "1755667041768",
    "safkey": "59935295922cf6f7510ab2bbaaccd9b6",
    "sex": "0",
    "ibex": "FCOaA2gQ_okKj4LnFS5nkxbddlBscguu80SM7WKU_6VYDLFk9TxR5nCaF3_OuKJs14XSt_mgZLeNorXHHyS-_9_UBaYSGyVja5e7H04xrVTdWyWGRxw6YiVrL4oikgreZsuoQ1t4TllZfRC0IL5XBPMpLM56tl_VQVqGMbpI1WH2OeDdvB6cfUR5TEVQGDz5EefyTcVrGdv9DML8tFkWnH8I-BCL50cU7K14DN-h0_wzNGI4MGY0YWI5OTZiYmI0NDA5ZGRkYWQ2YmMyODM5Yg==",
    "ssign": "7c77131ce7ac9ddc23bead8009d334c5",
    "osvn": "49e513e1a56c8b00",
    "dene": "7bb7b3e5516e8abc",
    "auditStatus": "1",
    "Host": "newminerva-tgw.reader.qq.com",
    "ywguid": "",
    "sift": "4bd5dc0dac2f3b56a250bd32482ff26afaaa74428bb256fd220c68d3bb6b4bdfd37e835e31bec80f5b4a906edd4938c3",
    "qrsn": "5f6204fb00e820b59200d985000013f19610",
    "server_sex": "1",
    "dete": "47f73415b4bcc5d9e1673f41cb850b3f",
    "themeid": "0",
    "Connection": "keep-alive",
    "stat_params": "{\"bid\":\"54568016\",\"tabtype\":\"1\",\"qaDay\":\"0\",\"userdegree\":\"0\",\"islogin\":\"1\"}",
    "IFDA": "MDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAw",
    "nosid": "1",
    "gselect": "0",
    "qrsn_new": "5f6204fb00e820b59200d985000013f19610",
    "jailbreak": "0"
  };
  $done({
    "headers": _0x39a195
  });
} else if ($request.url.indexOf("/nativepage/personal") != -1) {
  var obj = JSON.parse($response.body);
  obj.personal.monthUser.paidVipStatus = 2;
  obj.personal.monthUser.monthStatus = 1;
  obj.personal.monthUser.smsVip = 1;
  obj.personal.monthUser.mVipType = 1;
  obj.personal.accountInfo.balance = 88888888;
  obj.personal.accountInfo.bookTicket = 88888888;
  obj.personal.monthUser.title = "年卡会员";
  obj.personal.monthUser.label = "2088-8-08到期";
  obj.personal.userInfo.vipLevel = 1;
  obj.personal.userInfo.nick = "MIKEPHIE";
  obj.personal.userInfo.icon = "https://zhongdu.oss-cn-beijing.aliyuncs.com/app/20250723/17532551159065978.jpg";
  delete obj.personal.confList;
  var _0x46628c = JSON.stringify(obj);
  $done({
    "body": _0x46628c
  });
} else if ($request.url.indexOf("/book/queryDetailPage") != -1) {
  var _0x531bbb = JSON.parse($response.body);
  _0x531bbb.vipStatus = 1;
  _0x531bbb.introinfo.detailmsg.equityTxt = "本书已解锁";
  _0x531bbb.introinfo.detailmsg.txtStyle = 2;
  _0x531bbb.introinfo.detailmsg.equityDisplay = true;
  var _0x25aefe = JSON.stringify(_0x531bbb);
  $done({
    "body": _0x25aefe
  });
} else if ($request.url.indexOf("/vip/viptxt") != -1) {
  var _0x5bfe6f = JSON.parse($response.body);
  _0x5bfe6f.allowMonthlyPay = 2;
  var _0x1e45ec = JSON.stringify(_0x5bfe6f);
  $done({
    "body": _0x1e45ec
  });
} else {
  $done({});
}
