/*
#!name= ✨ Reddit Premium ✨
#!desc=Reddit Premium 解锁&去广告
#!category=🚫广告
#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ
#!icon=https://raw.githubusercontent.com/Mikephie/icons/main/icon/reddit.png
𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹
[rewrite_local]
^https?:\/\/gql-fed\.reddit\.com\/$ url script-response-body https://raw.githubusercontent.com/Mikephie/AUTOjs/main/quantumultx/redditpremium.js

[MITM]
hostname = gql-fed.reddit.com

 */


(() => {
  'use strict';

  const get = (o, k) => (o && k in o ? o[k] : undefined);
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);

  try {
    // 1) 早退拦截: operationName 含 "Ads" 的查询直接短路
    const opName = $request?.body ? (() => {
      try { return JSON.parse($request.body)?.operationName || ''; } catch { return ''; }
    })() : '';
    if (/Ads/i.test(opName)) return $done({ body: '{}' });

    // 2) 先对原始文本做"字符串替换"翻转标志，再解析 JSON
    let txt = $response?.body || '';
    if (!txt) return $done({});

    txt = txt
      .replace(/"isObfuscated":true/g, '"isObfuscated":false')
      .replace(/"obfuscatedPath":"[^"]*"/g, '"obfuscatedPath":null')
      .replace(/"isNsfw":true/g, '"isNsfw":false')
      .replace(/"isNsfwMediaBlocked":true/g, '"isNsfwMediaBlocked":false')
      .replace(/"isNsfwContentShown":false/g, '"isNsfwContentShown":true') // 显示 NSFW
      .replace(/"isAdPersonalizationAllowed":true/g, '"isAdPersonalizationAllowed":false')
      .replace(/"isThirdPartyInfoAdPersonalizationAllowed":true/g, '"isThirdPartyInfoAdPersonalizationAllowed":false')
      .replace(/"isPremiumMember":false/g, '"isPremiumMember":true') // 伪装会员
      .replace(/"isEmployee":false/g, '"isEmployee":true');          // 伪装员工（更少广告）

    const body = JSON.parse(txt);

    // 3) 针对 feed 数组做"只过滤广告元素"的安全处理
    //    （为了兼容不同接口，这里找数组更宽松；你原脚本只在某一处命中）
    function looksLikeAd(node) {
      if (!isObj(node)) return false;
      if (node.__typename === 'AdPost') return true;
      if (isObj(node.adPayload)) return true;
      if (Array.isArray(node.cells) && node.cells.some(c => c && c.__typename === 'AdMetadataCell')) return true;
      return false;
    }

    function filterArrays(obj) {
      if (Array.isArray(obj)) {
        return obj
          .filter(item => {
            // 兼容形如 { node: {...} } 的元素
            const n = isObj(item?.node) ? item.node : item;
            return !looksLikeAd(n);
          })
          .map(filterArrays);
      }
      if (!isObj(obj)) return obj;
      const out = {};
      for (const [k, v] of Object.entries(obj)) {
        // 只对常见承载列表的字段进行数组过滤，避免误删父节点
        if (Array.isArray(v) && ['items', 'edges', 'cells', 'children', 'posts', 'elements'].includes(k)) {
          out[k] = filterArrays(v);
        } else {
          out[k] = filterArrays(v);
        }
      }
      return out;
    }

    const cleaned = filterArrays(body);

    return $done({ body: JSON.stringify(cleaned) });
  } catch (e) {
    console.log('[reddit clean] error:', String(e));
    return $done({}); // 失败放行
  }
})();
