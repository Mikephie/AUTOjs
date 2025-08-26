/* =========================
 * MissAV – 女优检索 (含5个固定收藏位示例)
 * 文件：LiveTV/missav.js
 * ========================= */

var WidgetMetadata = {
  id: "missav",
  title: "MissAV 检索",
  description: "女优影片搜索（支持5个固定收藏位）",
  author: "Mikephie",
  site: "https://missav.com",
  version: "1.0.2",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "搜索女优",
      description: "输入女优名称，或直接点选收藏的女优",
      requiresWebView: true,
      functionName: "searchByActress",
      params: [
        {
          name: "keyword",
          title: "女优名称",
          type: "input",
          description: "支持中文/日文/英文",
          placeholders: [
            { title: "示例：三上悠亜", value: "" }
          ]
        },
        // ===== 固定收藏位 (示例已填好 5 位) =====
        { name: "fav1", title: "收藏 1", type: "preset", value: "三上悠亜" },
        { name: "fav2", title: "收藏 2", type: "preset", value: "安齋らら" },
        { name: "fav3", title: "收藏 3", type: "preset", value: "深田えいみ" },
        { name: "fav4", title: "收藏 4", type: "preset", value: "河南实里" },
        { name: "fav5", title: "收藏 5", type: "preset", value: "高桥圣子" }
      ]
    }
  ]
};

/* ===== 工具函数 ===== */
function buildSearchUrl(keyword) {
  return "https://missav.com/search?keyword=" + encodeURIComponent(keyword.trim());
}

/* ===== 核心功能 ===== */
async function searchByActress(params) {
  let keyword =
    (params.keyword || "").trim() ||
    (params.fav1 || "").trim() ||
    (params.fav2 || "").trim() ||
    (params.fav3 || "").trim() ||
    (params.fav4 || "").trim() ||
    (params.fav5 || "").trim();

  if (!keyword) {
    return { redirect: "https://missav.com" };
  }
  return { redirect: buildSearchUrl(keyword) };
}

/* ===== 导出 ===== */
if (typeof module !== "undefined") {
  module.exports = { WidgetMetadata, searchByActress };
} else {
  self.WidgetMetadata = WidgetMetadata;
  self.searchByActress = searchByActress;
}