/* =========================
 * MissAV – 女优检索（ForwardWidgets 规范版）
 * 写死 5 个收藏位：把下方数组里的空字符串替换成你的常用女优名
 * ========================= */

// ▼▼ 在这里填你收藏的 1~5 位女优（留空的不显示） ▼▼
const FAVORITE_STARS = [
  "", // 例如："三上悠亜"
  "", // 例如："安齋らら"
  "",
  "",
  ""
];
// ▲▲ 修改到此为止 ▲▲

/** MissAV 基础域名（如需改备用域名，可改这里） */
const BASE_DOMAIN = "https://missav.com";

/** 生成搜索 URL（MissAV 支持 /search?keyword=） */
function buildSearchUrl(q) {
  return `${BASE_DOMAIN}/search?keyword=${encodeURIComponent(q.trim())}`;
}

/** 将收藏数组转为 ForwardWidgets 的枚举选项 */
const FAVORITE_ENUM = FAVORITE_STARS
  .map(s => (s || "").trim())
  .filter(Boolean)
  .map(name => ({ title: name, value: name }));

/* ========== ForwardWidgets 必需元数据 ========== */
var WidgetMetadata = {
  id: "missav.star",
  title: "MissAV 女优检索",
  description: "输入或选择收藏的女优进行搜索（5 个收藏位写死）",
  author: "custom",
  site: "https://missav.com",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "搜索女优",
      description: "手动输入或从收藏中选择一位进行检索",
      requiresWebView: true,
      functionName: "searchMissAV",
      // 注：ForwardWidgets 支持的参数类型：input / constant / enumeration / count / page / offset
      // 我们用 input + enumeration（收藏下拉）
      params: [
        {
          name: "keyword",
          title: "关键字",
          type: "input",
          description: "女优名 / 关键词（支持中日文）",
          placeholders: [{ title: "例如：三上悠亜 / 河北彩花", value: "" }]
        },
        // 收藏下拉（若全留空，该下拉会显示为空，但不影响使用）
        {
          name: "favorite",
          title: "收藏",
          type: "enumeration",
          description: "从预设 5 位里选一个",
          enumOptions: FAVORITE_ENUM
        }
      ]
    }
  ]
};

/* ========== 模块函数（与 functionName 一致） ========== */
async function searchMissAV(params = {}) {
  const keyword = (params.keyword || "").trim() || (params.favorite || "").trim();
  const url = keyword ? buildSearchUrl(keyword) : BASE_DOMAIN;

  // ForwardWidgets 期望返回数组项，常用 type: "url" + link
  // （参见数据模型说明，需要返回对象数组，包含 id/type/title/link 等） 
  return [
    {
      id: url,
      type: "url",
      title: keyword ? `MissAV：${keyword}` : "MissAV 首页",
      link: url
    }
  ];
}

/* ========== 导出（兼容多运行环境） ========== */
if (typeof module !== "undefined") {
  module.exports = { WidgetMetadata, searchMissAV };
} else {
  self.WidgetMetadata = WidgetMetadata;
  self.searchMissAV = searchMissAV;
}