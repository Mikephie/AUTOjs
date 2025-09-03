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

// =====================================
// 请求阶段：提取 GraphQL 的 operationName
const opName = $request?.body?.operationName || '';

// =====================================
// 主逻辑
let body;

if (/Ads/i.test(opName)) {
  // 如果是 Ads 相关请求，直接返回空 JSON
  $done({ body: '{}' });
} else {
  try {
    // step1: 把 response body 转换为 JSON 并替换一些字段
    body = JSON.parse(
      $response.body
        .replace(/"isObfuscated":true/g, '"isObfuscated":false')
        .replace(/"obfuscatedPath":"[^"]*"/g, '"obfuscatedPath":null')
        .replace(/"isNsfw":true/g, '"isNsfw":false')
        .replace(/"isAdPersonalizationAllowed":true/g, '"isAdPersonalizationAllowed":false')
        .replace(/"isThirdPartyInfoAdPersonalizationAllowed":true/g, '"isThirdPartyInfoAdPersonalizationAllowed":false')
        .replace(/"isNsfwMediaBlocked":true/g, '"isNsfwMediaBlocked":false')
        .replace(/"isNsfwContentShown":true/g, '"isNsfwContentShown":false')
        .replace(/"isPremiumMember":false/g, '"isPremiumMember":true')
        .replace(/"isEmployee":false/g, '"isEmployee":true')
    );

    // step2: 遍历 data，处理 timeline/edges
    const data = body.data ?? {};
    Object.keys(data).forEach(key => {
      const edges = data[key]?.timeline?.edges;
      if (!Array.isArray(edges)) return;

      // 过滤掉广告相关的节点
      data[key].timeline.edges = edges.filter(({ node }) => {
        if (!node) return true;

        // __typename === "Ad" → 过滤
        if (node.__typename === 'Ad') return false;

        // 有 adPayload → 过滤
        if (node.adPayload) return false;

        // cells 里存在广告 → 过滤
        if (Array.isArray(node.cells)) {
          return !node.cells.some(c => c?.__typename === 'Ad');
        }

        return true;
      });
    });

    // step3: 再转回字符串
    body = JSON.stringify(body);
  } catch (err) {
    console.log('[RedditCleaner][Error]', err);
  } finally {
    $done(body ? { body } : {});
  }
}
