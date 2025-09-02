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
hostname = gql.reddit.com, gql-fed.reddit.com

 */


// ===== 取 operationName（保持原逻辑）=====
const opName = $request?.body?.operationName || '';

let body;

// 1) Ads 请求直接空体（保持原逻辑）
if (/Ads/i.test(opName)) {
  $done({ body: '{}' });
} else {
  try {
    // 2) 文本层替换（保持原逻辑，逐条等效）
    const raw = $response.body
      .replace(/"isObfuscated":true/g, '"isObfuscated":false')
      .replace(/"obfuscatedPath":"[^"]*"/g, '"obfuscatedPath":null')
      .replace(/"isNsfw":true/g, '"isNsfw":false')
      .replace(/"isAdPersonalizationAllowed":true/g, '"isAdPersonalizationAllowed":false')
      .replace(/"isThirdPartyInfoAdPersonalizationAllowed":true/g, '"isThirdPartyInfoAdPersonalizationAllowed":false')
      .replace(/"isNsfwMediaBlocked":true/g, '"isNsfwMediaBlocked":false')
      .replace(/"isNsfwContentShown":true/g, '"isNsfwContentShown":false')
      .replace(/"isPremiumMember":false/g, '"isPremiumMember":true')
      .replace(/"isEmployee":false/g, '"isEmployee":true');

    body = JSON.parse(raw);

    // 3) data.* 下"动态键名的数组"过滤 ---- 不再假设是 timeline/edges
    const data = body?.data ?? {};
    Object.keys(data).forEach(k => {
      const bucket = data[k];
      if (!bucket || typeof bucket !== 'object') return;

      // 寻找形如 data[k][X][Y] 为数组的那一层（原脚本就是这样取的）
      // 约束：Y 是数组，元素形如 { node: {...} } 或 {...}（与原版同）
      let parentObj = null;
      let arrKey = null;

      outer:
      for (const X of Object.keys(bucket)) {
        const maybeObj = bucket[X];
        if (!maybeObj || typeof maybeObj !== 'object') continue;
        for (const Y of Object.keys(maybeObj)) {
          const maybeArr = maybeObj[Y];
          if (Array.isArray(maybeArr)) {
            const first = maybeArr[0];
            if (first && (typeof first === 'object')) {
              // 具备 edges-like 结构：元素是对象，且可能有 node 字段
              parentObj = maybeObj;
              arrKey = Y;
              break outer;
            }
          }
        }
      }

      if (!parentObj || !arrKey) return; // 找不到则跳过

      const list = parentObj[arrKey];
      if (!Array.isArray(list)) return;

      // === 过滤条件：与原脚本一致 ===
      const filtered = list.filter(item => {
        const node = item?.node ?? item;
        if (!node) return true;

        // 原脚本等效判断：
        // 1) __typename 命中指定广告类型（混淆里常量）
        // 2) 有 adPayload
        // 3) cells 内含广告类型
        const type = String(node.__typename || '');
        if (/^Ad\b/i.test(type) || type === 'Ad') return false;
        if (node.adPayload) return false;
        if (Array.isArray(node.cells)) {
          if (node.cells.some(c => String(c?.__typename || '') === 'Ad' || /^Ad\b/i.test(String(c?.__typename || '')))) {
            return false;
          }
        }
        return true;
      });

      parentObj[arrKey] = filtered; // 写回原来的 data[k][X][Y]
    });

    body = JSON.stringify(body);
  } catch (err) {
    console.log('[reddit-cleaner:error]', err);
  } finally {
    $done(body ? { body } : {});
  }
}