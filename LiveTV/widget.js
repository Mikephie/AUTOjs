/* ========== LiveTV Widget (render_mode + group_filter | ES5) ========== */
var WidgetMetadata = {
  id: "tv_live",
  title: "MIKE热门电视台",
  description: "MIKE电视直播频道",
  author: "Mikephie",
  site: "https://raw.githubusercontent.com/Mikephie/AUTOjs/main/LiveTV/widget.js",
  version: "1.2.8-mike-es5",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "电视频道",
      description: "热门电视频道",
      requiresWebView: false,
      functionName: "getLiveTv",
      params: [
        {
          name: "group_filter",
          title: "按组关键字过滤(选填)，如 日本 / 香港 / 体育",
          type: "input",
          description: "支持正则。例：^日本 或 (香港|台湾)；留空=全部",
          placeholders: [
            { title: "全部频道", value: "" },
            { title: "央视频道", value: "cctv" },
            { title: "卫视频道", value: "中国大陆/卫视" },
            { title: "地方频道", value: "地方" },
            { title: "中国大陆(全部)", value: "^中国大陆" },
            { title: "香港(全部)",     value: "^香港" },
            { title: "台湾(全部)",     value: "^台湾" },
            { title: "日本(全部)",     value: "^日本" },
            { title: "韩国(全部)",     value: "^韩国" },
            { title: "美国(全部)",     value: "^美国" },
            { title: "英国(全部)",     value: "^英国" },
            { title: "港澳台(合并)",   value: "^(香港|澳门|台湾)" },
            { title: "综合",           value: "综合$" },
            { title: "新闻",           value: "新闻$" },
            { title: "体育",           value: "体育$" },
            { title: "电影",           value: "电影$" },
            { title: "剧集",           value: "剧集$|电视剧$|戏剧$" },
            { title: "纪录片",         value: "纪录片$|纪实$" },
            { title: "少儿/动漫",       value: "少儿$|儿童$|动漫$|卡通$" },
            { title: "音乐",           value: "音乐$" },
            { title: "综艺娱乐",       value: "综艺$|娱乐$|生活$" },
            { title: "央视频道(关键词)", value: "央视|CCTV" },
            { title: "卫视频道(关键词)", value: "卫视" },
            { title: "中国大陆 · 新闻", value: "^中国大陆/.+新闻$" },
            { title: "中国大陆 · 体育", value: "^中国大陆/.+体育$" },
            { title: "香港 · 综合",     value: "^香港/综合$" },
            { title: "台湾 · 新闻",     value: "^台湾/.+新闻$" },
            { title: "日本 · 动漫",     value: "^日本/.+(少儿|动漫)$" },
            { title: "马来西亚 · 综合", value: "^马来西亚/综合$" },
            { title: "新加坡 · 综合",   value: "^新加坡/综合$" }
          ]
        },
        {
          name: "url",
          title: "用户订阅",
          type: "input",
          description: "M3U 订阅（留空则使用默认 AKTV.m3u）",
          value: "https://raw.githubusercontent.com/Mikephie/AUTOjs/main/LiveTV/AKTV.m3u"
        },
        {
          name: "render_mode",
          title: "渲染模式",
          type: "enumeration",
          enumOptions: [
            { title: "仅用户订阅", value: "user_only" },
            { title: "内置+用户订阅", value: "base_plus_user" }
          ],
          value: "user_only"
        },
        {
          name: "bg_color",
          title: "台标背景色",
          type: "input",
          description: "RGB色，如 DCDCDC",
          placeholders: [
            { title: "雾霾灰", value: "90A4AE" },
            { title: "暖灰色", value: "424242" },
            { title: "深灰色", value: "1C1C1E" }
          ]
        }
      ]
    }
  ]
};

/* ====== 工具函数 ====== */
function __fallbackBackdrop(params) {
  var c = (params && params.bg_color) ? ("bg-" + params.bg_color) : "bg-1C1C1E";
  return c; // 前端只要一个非空字符串即可
}
function splitGroups(g) {
  return String(g || "")
    .split(/[\/·|，,]/)
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
}
function calculateMatchScore(userName, baseName) {
  function normalize(name) {
    return String(name || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/-/g, "")
      .replace(/[^\w\u4e00-\u9fa5]/g, "");
  }
  var a = normalize(userName), b = normalize(baseName);
  if (a === b) return 1.0;
  var cctv = /cctv(\d+)/, um = a.match(cctv), bm = b.match(cctv);
  if (um && bm) return um[1] === bm[1] ? 0.9 : 0;
  return calculateSimilarity(a, b);
}
function calculateSimilarity(a, b) {
  var i, j, matrix = [];
  for (i = 0; i <= a.length; i++) matrix[i] = [i];
  for (j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      var cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
      var del = matrix[i - 1][j] + 1;
      var ins = matrix[i][j - 1] + 1;
      var sub = matrix[i - 1][j - 1] + cost;
      matrix[i][j] = Math.min(del, ins, sub);
    }
  }
  return 1 - matrix[a.length][b.length] / Math.max(a.length, b.length || 1);
}
function findChannelInData(data, channelName) {
  for (var category in data) {
    if (Object.prototype.toString.call(data[category]) === "[object Array]") {
      var arr = data[category];
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] && arr[i].name === channelName) return arr[i];
      }
    }
  }
  return null;
}
function parseM3U(content) {
  var channels = [];
  var cur = null;

  // 判断是否是 URL 行（支持 http/https/rtmp…）
  function isUrlLine(s) {
    return /^([a-zA-Z][a-zA-Z0-9+\-.]*):\/\//.test(s);
  }
  // 取组别（合并 group-title / tvg-group / EXTGRP）
  function extractGroupFromExtinf(line) {
    var m1 = line.match(/group-title="([^"]+)"/i);
    var m2 = line.match(/tvg-group="([^"]+)"/i);
    return (m1 && m1[1]) || (m2 && m2[1]) || null;
  }
  function extractNameFromExtinf(line) {
    var mName = line.match(/tvg-name="([^"]+)"/);
    var mTail = line.match(/,([^,]+)$/);
    return (mName && mName[1]) || (mTail && String(mTail[1]).trim()) || "";
  }

  String(content).split("\n").forEach(function(raw) {
    var line = String(raw || "").trim();
    if (!line) return;

    // 兼容 "频道名,http..." 一行式
    if (!/^#/.test(line) && line.indexOf(',http') > -1) {
      var p = line.split(',http');
      var nm = p[0];
      var url = 'http' + p.slice(1).join(',http');
      channels.push({ name: String(nm||'').trim(), url: String(url||'').trim() });
      cur = null;
      return;
    }

    // 起始：#EXTINF
    if (/^#EXTINF/i.test(line)) {
      cur = {
        name: extractNameFromExtinf(line),
        group: extractGroupFromExtinf(line),
        provider: null,
        tvg_id: null,
        url: null
      };
      var mProv = line.match(/provider="([^"]+)"/i);
      var mTid1 = line.match(/tvg-id="([^"]+)"/i);
      var mTid2 = line.match(/tvg-id=([^, ]+)/i);
      cur.provider = mProv ? mProv[1] : null;
      cur.tvg_id = mTid1 ? mTid1[1] : (mTid2 ? mTid2[1] : null);
      return;
    }

    // 途中元数据：#EXTGRP / #EXTVLCOPT 等 ---- 不结束当前条目
    if (/^#EXTGRP/i.test(line)) {
      var grp = line.replace(/^#EXTGRP\s*:/i, '').trim();
      if (cur) cur.group = cur.group || grp;     // 优先 group-title，退而用 EXTGRP
      return;
    }
    if (/^#EXTVLCOPT/i.test(line) || /^#KODIPROP/i.test(line) || /^#EDM/i.test(line)) {
      // 忽略，但保留 cur 状态，等待真正的 URL
      return;
    }

    // 真正的地址行（可能在若干元数据行之后）
    if (!/^#/.test(line) && isUrlLine(line)) {
      if (!cur) {
        // 偶发：没有 EXTINF，只有 URL ---- 尝试用 URL 当名称
        channels.push({ name: line, url: line });
      } else {
        cur.url = line;
        channels.push(cur);
        cur = null;
      }
      return;
    }

    // 其它注释行忽略
  });

  return channels;
}

/* ====== 主函数 ====== */
async function getLiveTv(params) {
  params = params || {};
  var renderMode = params.render_mode || "user_only";

  // 1) 拉取内置清单（在 user_only 模式可以失败也不影响）
  var modifiedData = {};
  try {
    var baseResp = await Widget.http.get("https://raw.githubusercontent.com/2kuai/ForwardWidgets/refs/heads/main/data/iptv-data.json");
    if (baseResp && baseResp.data) {
      for (var k in baseResp.data) modifiedData[k] = baseResp.data[k];
    }
  } catch (_) {}

  // 2) 拉取用户订阅（多源兜底）
  var userM3USources = [
    (params.url && String(params.url).trim()) || "https://raw.githubusercontent.com/Mikephie/AUTOjs/main/LiveTV/AKTV.m3u",
    "https://fastly.jsdelivr.net/gh/Mikephie/AUTOjs@main/LiveTV/AKTV.m3u",
    "https://cdn.jsdelivr.net/gh/Mikephie/AUTOjs@main/LiveTV/AKTV.m3u"
  ];
  var userData = null;
  for (var i = 0; i < userM3USources.length; i++) {
    try {
      var ur = await Widget.http.get(userM3USources[i]);
      if (ur && ur.data) { userData = ur.data; break; }
    } catch (e) {}
  }
  if (!userData) throw new Error("用户订阅拉取失败");

  var userChannels = parseM3U(userData);

  // 3) 组装 all（无论是否有内置）
  var allArr = [];
  Object.keys(modifiedData).forEach(function (c) {
    if (Object.prototype.toString.call(modifiedData[c]) === "[object Array]") {
      allArr = allArr.concat(modifiedData[c]);
    }
  });
  modifiedData["all"] = allArr;

  // 4) 两种渲染模式
  if (renderMode === "user_only") {
    // 直接把订阅渲染为列表（支持筛选）
    return renderFromUserOnly(userChannels, params);
  } else {
    // 原逻辑：与内置匹配、合并源，再输出
    return renderFromBasePlusUser(modifiedData, userChannels, params);
  }
}

/* ====== 渲染：仅用户订阅 ====== */
function renderFromUserOnly(parsed, params) {
  var filter = params.group_filter || "";
  var regex = null, isRegex = false;
  if (filter) { try { regex = new RegExp(filter, "i"); isRegex = true; } catch (_) {} }

  var filtered = parsed.filter(function (it) {
    if (!filter) return true;
    var fields = [
      String(it.name || ""),
      String(it.group || ""),
      String(it.provider || ""),
      String(it.tvg_id || "")
    ];
    fields = fields.concat(splitGroups(it.group));
    if (isRegex && regex) return fields.some(function (f) { return regex.test(f); });
    var kw = filter.toLowerCase();
    return fields.some(function (f) { return String(f).toLowerCase().indexOf(kw) > -1; });
  });

  return filtered.map(function (ch) {
    if (!ch.url) return null;
    return {
      id: ch.url,
      type: "url",
      title: ch.name || (ch.group ? ch.group : "频道"),
      backdropPath: __fallbackBackdrop(params),
      description: ch.group || "",
      videoUrl: ch.url,
      customHeaders: { "user-agent": "AptvPlayer/1.4.10" }
    };
  }).filter(Boolean);
}

/* ====== 渲染：内置 + 用户订阅（名称匹配合并） ====== */
function renderFromBasePlusUser(modifiedData, userChannels, params) {
  var usedUserUrls = new Set();
  var allPotentialMatches = [];
  for (var category in modifiedData) {
    if (Object.prototype.toString.call(modifiedData[category]) === "[object Array]") {
      modifiedData[category].forEach(function (baseChannel) {
        userChannels.forEach(function (userChannel) {
          if (!usedUserUrls.has(userChannel.url)) {
            var score = calculateMatchScore(userChannel.name, baseChannel.name);
            if (score > 0.7) {
              allPotentialMatches.push({ baseChannel: baseChannel, userChannel: userChannel, score: score });
            }
          }
        });
      });
    }
  }
  allPotentialMatches.sort(function (a, b) { return b.score - a.score; });
  allPotentialMatches.forEach(function (pair) {
    var baseChannel = pair.baseChannel;
    var userChannel = pair.userChannel;
    if (!usedUserUrls.has(userChannel.url)) {
      var target = findChannelInData(modifiedData, baseChannel.name);
      if (target) {
        target.childItems = (target.childItems || []).concat([userChannel.url]).filter(Boolean);
        if (userChannel.group) {
          if (!target._groups) target._groups = [];
          if (target._groups.indexOf(userChannel.group) === -1) target._groups.push(userChannel.group);
          if (!target.group) target.group = userChannel.group;
        }
        usedUserUrls.add(userChannel.url);
      }
    }
  });

  // 汇总 all
  var allArr = [];
  Object.keys(modifiedData).forEach(function (c) {
    if (Object.prototype.toString.call(modifiedData[c]) === "[object Array]") {
      allArr = allArr.concat(modifiedData[c]);
    }
  });
  modifiedData["all"] = allArr;

  // 组别/国家筛选
  function buildMetaForItem(it) {
    var groups = [];
    if (it._groups && it._groups.length) {
      it._groups.forEach(function (g) { groups = groups.concat(splitGroups(g)); });
    } else if (it.group) {
      groups = splitGroups(it.group);
    }
    if (String(it.name || "").indexOf("/") > -1) {
      groups = groups.concat(splitGroups(it.name));
    }
    var uniq = [];
    groups.forEach(function (g) { if (uniq.indexOf(g) === -1) uniq.push(g); });
    it._groupParts = uniq;
    it._country = uniq.length ? uniq[0] : "";
  }

  var filter = params.group_filter || "";
  var regex = null, isRegex = false;
  if (filter) { try { regex = new RegExp(filter, "i"); isRegex = true; } catch (_) {} }

  var source = modifiedData["all"];
  source.forEach(buildMetaForItem);

  var filtered = source.filter(function (item) {
    if (!filter) return true;
    var fields = [
      String(item.name || ""),
      String(item.group || ""),
      String(item.provider || ""),
      String(item.tvg_id || item["tvg-id"] || ""),
      String(item.description || "")
    ];
    if (item._groupParts && item._groupParts.length) {
      fields = fields.concat(item._groupParts);
      if (item._country) fields.push(item._country);
    }
    if (isRegex && regex) return fields.some(function (f) { return regex.test(f); });
    var kw = filter.toLowerCase();
    return fields.some(function (f) { return String(f).toLowerCase().indexOf(kw) > -1; });
  });

  // 生成条目
  return filtered.map(function (item) {
    var validUrls = (item.childItems || []).filter(function (u) {
      return typeof u === "string" && String(u).trim();
    });
    if (validUrls.length === 0) return null;

    var bp = String(item.backdrop_path || "") || __fallbackBackdrop(params);
    if (params.bg_color) bp = bp.replace(/bg-\w{6}/g, "bg-" + params.bg_color);

    function createItem(u, title, isMain) {
      return {
        id: u,
        type: "url",
        title: isMain ? item.name : title,
        backdropPath: bp,
        description: item.description || (item.group || ""),
        videoUrl: u,
        customHeaders: { "user-agent": "AptvPlayer/1.4.10" }
      };
    }

    var mainItem = createItem(validUrls[0], item.name, true);
    if (validUrls.length > 1) {
      mainItem.childItems = validUrls.slice(1).map(function (u, i) {
        return createItem(u, item.name + " - (" + (i + 1) + ")", false);
      });
    }
    return mainItem;
  }).filter(Boolean);
}