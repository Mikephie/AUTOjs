/*
📜 统一订阅解锁框架
📅 更新时间：2025-04-03
🔓 功能：自动识别服务类型并解锁永久 VIP

目前支持服务：
- Adapty (adapty.io)
- Apphud (apphud.com)
- SNOW (snow.me)

[rewrite_local]
# Adapty - 更宽的路径匹配（v1/v2/v3）
^https?:\/\/api\.adapty\.io\/api\/v\d+\/sdk\/(?:analytics\/profiles(?:\/.*)?|in-apps\/(?:apple\/receipt\/validate|purchase(?:-containers|\/app-store)(?:\/.*)?)) url script-response-body Scripts/adaptyhub.js requires-body=1

# Apphud - 兼容 api 或 {tenant}.apphud.com
^https?:\/\/(?:api|\w+)\.apphud\.com\/v\d+\/(?:subscriptions|customers)(?:\?.*)?$ url script-response-body Scripts/adaptyhub.js requires-body=1

# SNOW - 末尾可能带更多段或查询
^https?:\/\/[\w\-\.]+\.snow\.me\/v\d+\/purchase\/subscription\/subscriber\/status(?:\/.*)?(?:\?.*)?$ url script-response-body Scripts/adaptyhub.js requires-body=1

[mitm]
hostname = api.adapty.io, *.apphud.com, *.snow.me

*/

// ================ 配置区域 ================
// ==UserScript==
// Unified Adapty/Apphud/SNOW VIP - Hardened
// 2025-08-08
// ==/UserScript==

const SETTINGS = {
  DEBUG_LOG: true,
  NOTIFICATION: { ENABLED: true, INTERVAL: 10 * 60 * 1000, ERROR: true },
  INJECT: {
    DATES: { CURRENT: new Date().toISOString(), FUTURE: "2088-08-08T08:08:08.000Z" },
    TRANSACTION: { ID: `4900012${Math.floor(Math.random() * 10000000)}` }
  }
};

class Env {
  constructor(name) {
    this.name = name;
    this.start = Date.now();
    this.store = (typeof $persistentStore !== 'undefined') ? $persistentStore :
                 (typeof $prefs !== 'undefined') ? $prefs : null;
  }
  log(...a){ if(SETTINGS.DEBUG_LOG) console.log(`[${this.name}]`, ...a); }
  get(k){ try{ return this.store ? (this.store.read ? this.store.read(k) : this.store.valueForKey(k)) : null; }catch{ return null; } }
  set(k,v){ try{ return this.store ? (this.store.write ? this.store.write(v,k) : this.store.setValueForKey(v,k)) : false; }catch{ return false; } }
  notify(t,s="",m="", appId=""){
    if(!SETTINGS.NOTIFICATION.ENABLED){ this.log("[通知关闭]", t,s,m); return; }
    if(appId && !t.includes("错误")){
      const key = `${this.name}_${appId}_lastNotify`; const last=this.get(key);
      if(last && Date.now()-(+last) < SETTINGS.NOTIFICATION.INTERVAL){ this.log(`[通知限流] ${appId}`); return; }
      this.set(key, Date.now().toString());
    }
    if(typeof $notify!=='undefined') $notify(t,s,m);
    else if(typeof $notification!=='undefined') $notification.post(t,s,m);
    else this.log(t,s,m);
  }
  notifyError(err, ctx=""){ if(!SETTINGS.NOTIFICATION.ERROR) return; const msg=(err&&err.message)||String(err); this.notify("🔴 脚本执行错误", ctx?`[${ctx}]`:"", msg); this.log("ERR", ctx, msg); }
  done(obj){ this.log(`完成，用时 ${(Date.now()-this.start)/1000}s`); $done(obj); }
}
const env = new Env("UnifiedVIP+");

function safeParse(body){ try{ return JSON.parse(body||"{}"); }catch(e){ env.notifyError(e,"JSON解析"); return {}; } }
function delLen(h){ if(!h) return; const keys=Object.keys(h); for(const k of keys){ if(k.toLowerCase()==="content-length") delete h[k]; } }

class Detector{
  constructor(req){ this.u=req?.url||""; }
  type(){
    if(this.u.includes("adapty.io")) return "adapty";
    if(/(?:api|\w+)\.apphud\.com/.test(this.u)) return "apphud";
    if(/\.snow\.me/.test(this.u)) return "snow";
    return "unknown";
  }
}

function getUA(headers){ return headers["User-Agent"]||headers["user-agent"]||""; }
function getBundleFromAdapty(resp){
  const a = resp?.data?.attributes?.apple_validation_result;
  return a?.bundleId || a?.receipt?.bundle_id || "com.adapty.app";
}
function getProfileIdFromHeaders(h){
  return h["adapty-sdk-profile-id"] || h["ADAPTY-SDK-PROFILE-ID"] || `profile_${Math.random().toString(36).slice(2,10)}`;
}
function pickProductId(resp){
  const subs = resp?.data?.attributes?.subscriptions;
  if(subs){ const ks=Object.keys(subs); if(ks[0]) return ks[0]; }
  const tx = resp?.data?.attributes?.apple_validation_result?.transactions;
  if(Array.isArray(tx) && tx[0]?.productId) return tx[0].productId;
  const lr = resp?.data?.attributes?.apple_validation_result?.latest_receipt_info;
  if(Array.isArray(lr) && lr[0]?.product_id) return lr[0].product_id;
  return null;
}

function ensure(obj, path, fallback){
  // path: ["data","attributes","subscriptions"]
  let cur=obj;
  for(let i=0;i<path.length;i++){
    const p=path[i];
    if(cur[p]==null) cur[p] = (i===path.length-1 ? fallback : {});
    cur = cur[p];
  }
  return cur;
}

function injectAdapty(originalBody, req, resHeaders){
  const body = safeParse(originalBody);
  const headers = req?.headers||{};
  const ua = headers["User-Agent"]||headers["user-agent"]||"";
  const appName = ua.split("/")[0]||"App";

  // 拿到现有结构
  const attr = ensure(body, ["data","attributes"], {});
  const avr  = ensure(attr, ["apple_validation_result"], {});
  const bundleId = avr.bundleId || avr.receipt?.bundle_id || "com.adapty.app";

  // 选定“统一交易ID”：尽量沿用苹果里现有的 originalTransactionId
  let chosenTxId = SETTINGS.INJECT.TRANSACTION.ID;
  if (Array.isArray(avr.transactions) && avr.transactions[0]?.originalTransactionId) {
    chosenTxId = String(avr.transactions[0].originalTransactionId);
  }

  // 产品 ID：按现有的来，缺则给个默认
  const subsNode = ensure(attr, ["subscriptions"], {});
  let productId = Object.keys(subsNode)[0];
  if (!productId) {
    if (Array.isArray(avr.transactions) && avr.transactions[0]?.productId) {
      productId = avr.transactions[0].productId;
    } else {
      productId = `${bundleId}.yearly.premium`;
    }
  }

  // 1) 统一 & 拉远苹果 transactions 到期时间
  avr.environment = avr.environment || "Production";
  avr.bundleId = bundleId;
  avr.hasMore = false;
  avr.transactions = Array.isArray(avr.transactions) ? avr.transactions : [{
    productId,
    storefront: "SGP",
    originalTransactionId: chosenTxId,
    isUpgraded: false,
    expiresDate: SETTINGS.INJECT.DATES.FUTURE,
    type: "Auto-Renewable Subscription",
    purchaseDate: SETTINGS.INJECT.DATES.CURRENT,
    price: 0,
    transactionId: chosenTxId,
    currency: "USD",
    inAppOwnershipType: "PURCHASED",
    originalPurchaseDate: SETTINGS.INJECT.DATES.CURRENT
  }];
  // 逐个修正
  avr.transactions = avr.transactions.map(t => ({
    ...t,
    productId: t.productId || productId,
    originalTransactionId: chosenTxId,
    transactionId: chosenTxId,
    expiresDate: SETTINGS.INJECT.DATES.FUTURE,
    purchaseDate: t.purchaseDate || SETTINGS.INJECT.DATES.CURRENT,
    inAppOwnershipType: t.inAppOwnershipType || "PURCHASED"
  }));

  // 2) 同步补齐 latest_receipt_info / receipt.in_app（很多 App 读这里）
  const receiptItem = {
    quantity: "1",
    purchase_date_ms: Date.now().toString(),
    expires_date: "2088-08-08 08:08:08 Etc/GMT",
    transaction_id: chosenTxId,
    original_transaction_id: chosenTxId,
    product_id: productId,
    expires_date_ms: "3742762088000"
  };
  avr.latest_receipt_info = Array.isArray(avr.latest_receipt_info) ? avr.latest_receipt_info : [receiptItem];
  avr.receipt = avr.receipt || { receipt_type: "Production", bundle_id: bundleId, in_app: [receiptItem] };

  // 3) subscriptions 节点：用统一交易ID & 2088 到期；去掉“试用中”标志
  subsNode[productId] = {
    vendor_transaction_id: chosenTxId,
    offer_id: null,
    billing_issue_detected_at: null,
    is_lifetime: false,
    store: "app_store",
    vendor_product_id: productId,
    vendor_original_transaction_id: chosenTxId,
    will_renew: true,
    renewed_at: SETTINGS.INJECT.DATES.CURRENT,
    cancellation_reason: null,
    active_promotional_offer_id: null,
    active_promotional_offer_type: null,
    unsubscribed_at: null,
    is_active: true,
    activated_at: SETTINGS.INJECT.DATES.CURRENT,
    is_refund: false,
    is_in_grace_period: false,
    active_introductory_offer_type: null,   // ← 关键：不再标记 free_trial
    expires_at: SETTINGS.INJECT.DATES.FUTURE,
    starts_at: null,
    base_plan_id: null,
    is_sandbox: false
  };

  // 4) paid_access_levels 同步
  const pal = ensure(attr, ["paid_access_levels"], {});
  pal["premium"] = {
    vendor_transaction_id: chosenTxId,
    offer_id: null,
    billing_issue_detected_at: null,
    is_lifetime: false,
    store: "app_store",
    vendor_product_id: productId,
    vendor_original_transaction_id: chosenTxId,
    will_renew: true,
    renewed_at: SETTINGS.INJECT.DATES.CURRENT,
    cancellation_reason: null,
    active_promotional_offer_id: null,
    active_promotional_offer_type: null,
    unsubscribed_at: null,
    id: "premium",
    is_active: true,
    activated_at: SETTINGS.INJECT.DATES.CURRENT,
    is_refund: false,
    is_in_grace_period: false,
    active_introductory_offer_type: null,   // ← 同步去掉试用标记
    expires_at: SETTINGS.INJECT.DATES.FUTURE,
    starts_at: null,
    base_plan_id: null
  };

  // 5) 其它属性补齐
  attr.app_id = attr.app_id || `app_${Math.random().toString(36).slice(2,10)}`;
  attr.profile_id = attr.profile_id || (headers["adapty-sdk-profile-id"] || headers["ADAPTY-SDK-PROFILE-ID"] || `profile_${Math.random().toString(36).slice(2,10)}`);
  attr.is_test_user = false;
  attr.introductory_offer_eligibility = true;
  attr.promotional_offer_eligibility = true;
  attr.total_revenue_usd = attr.total_revenue_usd || 0;

  // 清理长度
  delLen(resHeaders);
  resHeaders["Content-Type"] = "application/json";

  env.log(`[Adapty] ${bundleId} / ${productId} 已统一交易ID=${chosenTxId} 并拉远到期`);
  env.notify("✨ VIP 已激活 ✨", appName, `Adapty 已注入 (${bundleId})`, bundleId);
  return body;
}

function injectApphud(originalBody, req, resHeaders){
  const body = safeParse(originalBody);
  // 确保结构
  const results = ensure(body, ["data","results"], {});
  const now = SETTINGS.INJECT.DATES.CURRENT;
  const future = SETTINGS.INJECT.DATES.FUTURE;
  const txId = SETTINGS.INJECT.TRANSACTION.ID;

  // 构建一个可见订阅列表，尽量沿用原有 paywalls
  let products = [];
  if(Array.isArray(results.paywalls)){
    for(const pw of results.paywalls){
      if(Array.isArray(pw.items)){
        for(const it of pw.items){
          if(it?.product_id) products.push({productId: it.product_id, groupId: it.id||`g_${Math.random().toString(36).slice(2,8)}`, name: it.name||"Premium"});
        }
      }
    }
  }
  if(products.length===0){
    const bundle = (results.application?.bundle_id)||"com.apphud.app";
    products = [{productId:`${bundle}.premium.yearly`, groupId:`g_${Math.random().toString(36).slice(2,8)}`, name:"Premium"}];
  }

  // subscriptions
  results.subscriptions = [];
  for(const p of products){
    results.subscriptions.push({
      status: "trial",
      group_id: p.groupId,
      autorenew_enabled: true,
      id: `sub_${Math.random().toString(36).slice(2,12)}`,
      product_id: p.productId,
      platform: "ios",
      environment: "production",
      started_at: now,
      original_transaction_id: txId,
      expires_at: future
    });
  }

  // permissions（部分 App 会读取）
  results.permissions = results.permissions || {};
  for(const p of products){
    results.permissions[p.name] = {
      id: `perm_${Math.random().toString(36).slice(2,10)}`,
      name: p.name,
      active: true,
      product_ids: [p.productId],
      group_ids: [p.groupId]
    };
  }

  delLen(resHeaders);
  env.log(`[Apphud] 注入 ${products.length} 个产品`);
  env.notify("✨ VIP 已激活 ✨", "Apphud", `已注入 ${products.length} 个订阅`, "apphud");
  return body;
}

function injectSnow(originalBody, req, resHeaders){
  const body = safeParse(originalBody);
  const ua = getUA(req?.headers||{});
  const appKey = /^iphoneapp\.epik/i.test(ua) ? "epik" :
                 /^iphoneapp\.snow/i.test(ua) ? "snow" : "snow";
  const productId = appKey==="epik" ? "com.snowcorp.epik.subscribe.plan.oneyear" : "com.campmobile.snow.subscribe.oneyear";

  const times = Date.now();
  const result = ensure(body, ["result"], {});
  result.products = [{
    managed: true, status: "ACTIVE",
    startDate: times, productId, expireDate: 3742762088000
  }];
  result.tickets = [{
    managed: true, status: "ACTIVE",
    startDate: times, productId, expireDate: 3742762088000
  }];
  result.activated = true;

  delLen(resHeaders);
  env.log(`[SNOW] 注入 ${productId}`);
  env.notify("✨ VIP 已激活 ✨", "SNOW", productId, "snow");
  return body;
}

(function main(){
  try{
    const type = new Detector($request).type();
    env.log("Matched:", type, $request?.url);
    const resHeaders = $response?.headers || {};
    let out;

    if(type==="adapty") out = injectAdapty($response.body, $request, resHeaders);
    else if(type==="apphud") out = injectApphud($response.body, $request, resHeaders);
    else if(type==="snow") out = injectSnow($response.body, $request, resHeaders);
    else { env.log("Unknown service, passthrough."); return env.done({ body: $response.body }); }

    // 统一设置 Content-Type
    resHeaders["Content-Type"] = "application/json";
    delLen(resHeaders);
    env.done({ body: JSON.stringify(out), headers: resHeaders });
  }catch(e){
    env.notifyError(e,"主流程");
    env.done({ body: $response.body });
  }
})();
