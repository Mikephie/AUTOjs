/*
#!name= ✨ Reddit Premium ✨
#!desc=Reddit Premium 解锁&去广告
#!category=🚫广告
#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ
#!icon=https://raw.githubusercontent.com/Mikephie/icons/main/icon/reddit.png
𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹
[rewrite_local]
^https?:\/\/gql(-fed)?\.reddit\.com\/.* url script-response-body https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx/redditpremium.js

[MITM]
hostname = gql.reddit.com, gql-fed.reddit.com


 */

// reddit-premium-and-adtrim.js
// 合并版（稳妥）----会员伪装 + 安全去广告（数组级过滤）
// 注意：把 raw 链接指向此文件，并确保 MITM 包含 gql.reddit.com, gql-fed.reddit.com

(() => {
  'use strict';

  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  const safeParse = s => { try { return JSON.parse(s); } catch { return null; } };
  const safeStringify = o => { try { return JSON.stringify(o); } catch { return null; } };

  // 可选调试：开启后在重写日志里会看到 hook 信息（部署后可注释掉）
  const DEBUG = false;
  function dbg(...args) { if (DEBUG && typeof console !== 'undefined') console.log('[reddit-merge]', ...args); }

  try {
    // 1) 尝试从 $request.body 读取 operationName（仅在存在时判断）
    let reqOp = '';
    try {
      if (typeof $request !== 'undefined' && $request && $request.body) {
        const rb = safeParse($request.body);
        if (rb && typeof rb.operationName === 'string') reqOp = rb.operationName;
      }
    } catch (e) { /* ignore */ }
    if (reqOp && /Ads/i.test(reqOp)) {
      dbg('short-circuit by operationName', reqOp);
      return $done({ body: '{}' }); // 若你不想短路，请把这行注释掉
    }

    // 2) 获取响应文本
    let raw = typeof $response !== 'undefined' && $response && $response.body ? String($response.body) : '';
    if (!raw) {
      dbg('no response body, pass through');
      return $done({});
    }

    // 3) 尝试做安全的字符串替换（用 try/catch 包裹，失败则继续）
    try {
      // 宽松匹配（允许空格）
      raw = raw
        .replace(/"isObfuscated"\s*:\s*true/g, '"isObfuscated":false')
        .replace(/"obfuscatedPath"\s*:\s*"[^"]*"/g, '"obfuscatedPath":null')
        .replace(/"isNsfw"\s*:\s*true/g, '"isNsfw":false')
        .replace(/"isNsfwMediaBlocked"\s*:\s*true/g, '"isNsfwMediaBlocked":false')
        .replace(/"isNsfwContentShown"\s*:\s*false/g, '"isNsfwContentShown":true')
        .replace(/"isAdPersonalizationAllowed"\s*:\s*true/g, '"isAdPersonalizationAllowed":false')
        .replace(/"isThirdPartyInfoAdPersonalizationAllowed"\s*:\s*true/g, '"isThirdPartyInfoAdPersonalizationAllowed":false')
        .replace(/"isPremiumMember"\s*:\s*false/g, '"isPremiumMember":true')
        .replace(/"isEmployee"\s*:\s*false/g, '"isEmployee":true');
    } catch (e) {
      dbg('replace error', String(e));
    }

    // 4) 解析 JSON（失败则放行原响应）
    const bodyObj = safeParse(raw);
    if (!bodyObj) {
      dbg('json parse failed, pass through original');
      return $done({}); // 不修改，放行
    }

    // 5) 伪装会员：遍历并修改已存在字段
    const premiumBoolKeys = new Set([
      'isPremium','isPremiumMember','isPremiumSubscriber','hasPremium','hasGold','isGold',
      'userIsGold','userIsPremium','has_premium','has_gold','is_gold','user_is_premium',
      'user_is_gold','subscriber','isEmployee','userIsSubscriber','goldSubscribed','isAdFree'
    ]);
    const premiumStringKeys = new Set(['goldStatus','premiumStatus','subscriptionStatus','membershipStatus']);

    function walkPatchPremium(node) {
      if (Array.isArray(node)) {
        for (const v of node) if (isObj(v) || Array.isArray(v)) walkPatchPremium(v);
        return;
      }
      if (!isObj(node)) return;
      for (const k of Object.keys(node)) {
        const v = node[k];
        // 先递归
        if (isObj(v) || Array.isArray(v)) walkPatchPremium(v);

        if (typeof v === 'boolean' && premiumBoolKeys.has(k)) node[k] = true;
        if (typeof v === 'boolean' && ['shouldSeeAds','showsAds','shows_ad','shows_ads'].includes(k)) node[k] = false;
        if (k === 'features' && isObj(v)) {
          if (typeof v.adsDisabled === 'boolean') v.adsDisabled = true;
          if (typeof v.adFree === 'boolean') v.adFree = true;
          if (isObj(v.specialMemberships)) {
            for (const s of Object.keys(v.specialMemberships)) {
              if (typeof v.specialMemberships[s] === 'boolean' && v.specialMemberships[s] === false) v.specialMemberships[s] = true;
            }
          }
        }
        if (typeof v === 'string' && premiumStringKeys.has(k)) node[k] = 'active';
      }
    }

    // 6) 安全去广告：数组级别过滤
    function looksLikeAd(el) {
      if (!isObj(el)) return false;
      const t = String(el.__typename || '').toLowerCase();
      if (['ad','adpost','admetadata','adportalpost','promotedpost','feedad'].includes(t)) return true;
      if (el.promoted === true) return true;
      if (el.kind && String(el.kind).toLowerCase() === 'promoted') return true;
      if (isObj(el.adPayload)) return true;
      if (isObj(el.promotedDisplay) || isObj(el.promotedBy)) return true;
      if (isObj(el.node) && looksLikeAd(el.node)) return true;
      if (Array.isArray(el.cells) && el.cells.some(c => isObj(c) && String(c.__typename||'').toLowerCase().includes('ad'))) return true;
      return false;
    }

    function filterArraysSafely(obj) {
      if (Array.isArray(obj)) {
        const out = [];
        for (const it of obj) {
          const target = isObj(it?.node) ? it.node : it;
          if (looksLikeAd(target)) continue;
          out.push(filterArraysSafely(it));
        }
        return out;
      }
      if (!isObj(obj)) return obj;
      const out = {};
      for (const [k, v] of Object.entries(obj)) {
        if (Array.isArray(v) && ['items','edges','cells','children','posts','elements','data'].includes(k)) {
          out[k] = filterArraysSafely(v);
        } else {
          out[k] = filterArraysSafely(v);
        }
      }
      return out;
    }

    // apply patches
    try {
      walkPatchPremium(bodyObj);
      const cleaned = filterArraysSafely(bodyObj);
      const out = safeStringify(cleaned);
      if (out === null) {
        dbg('stringify failed');
        return $done({});
      }
      dbg('modified and returning');
      return $done({ body: out });
    } catch (e) {
      dbg('apply patch error', String(e));
      return $done({});
    }
  } catch (e) {
    // 全局捕获
    try { console.log('[reddit-merge] uncaught error', String(e)); } catch (ee) {}
    return $done({});
  }
})();
