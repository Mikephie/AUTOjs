var WidgetMetadata = {
  id: "tv_live",
  title: "热门电视台",
  description: "电视直播频道",
  author: "Mikephie",
  site: "https://raw.githubusercontent.com/Mikephie/AUTOjs/main/LiveTV/widget.js",
  version: "1.1.7",
  requiredVersion: "0.0.8",
  modules: [
    {
      title: "电视频道",
      description: "热门电视频道",
      requiresWebView: false,
      functionName: "getLiveTv",
      params: [
        {
          name: "group_filter",
          title: "按组关键字过滤(选填)，如 央视 / 香港 / 体育",
          type: "input",
          description: "支持正则。示例：^中国大陆  或  (香港|台湾)",
          placeholders: [
            { title: "全部频道", value: "" },
            { title: "央视频道", value: "cctv" },
            { title: "卫视频道", value: "stv" },
            { title: "地方频道", value: "ltv" },
            { title: "中国大陆(全部)", value: "^中国大陆" },
            { title: "香港(全部)",     value: "^香港" },
            { title: "台湾(全部)",     value: "^台湾" },
            { title: "日本(全部)",     value: "^日本" },
            { title: "韩国(全部)",     value: "^韩国" },
            { title: "美国(全部)",     value: "^美国" },
            { title: "英国(全部)",     value: "^英国" },
            { title: "港澳台(合并)",   value: "^(香港|澳门|台湾)" },
            { title: "综合",         value: "综合$" },
            { title: "新闻",         value: "新闻$" },
            { title: "体育",         value: "体育$" },
            { title: "电影",         value: "电影$" },
            { title: "剧集",         value: "剧集$|电视剧$|戏剧$" },
            { title: "纪录片",       value: "纪录片$|纪实$" },
            { title: "少儿/动漫",     value: "少儿$|儿童$|动漫$|卡通$" },
            { title: "音乐",         value: "音乐$" },
            { title: "综艺娱乐",     value: "综艺$|娱乐$|生活$" },
            { title: "央视频道(关键词)", value: "央视|CCTV" },
            { title: "卫视频道(关键词)", value: "卫视" },
            { title: "中国大陆 · 新闻", value: "^中国大陆/.+新闻$" },
            { title: "中国大陆 · 体育", value: "^中国大陆/.+体育$" },
            { title: "香港 · 综合",     value: "^香港/综合$" },
            { title: "台湾 · 新闻",     value: "^台湾/.+新闻$" },
            { title: "日本 · 动漫",     value: "^日本/.+(少儿|动漫)$" }
          ]
        },
        {
          name: "url",
          title: "用户订阅",
          type: "input",
          description: "输入M3U格式订阅链接",
          // 默认直接填好 AKTV.m3u
          value: "https://raw.githubusercontent.com/Mikephie/AUTOjs/main/LiveTV/AKTV.m3u"
        },
        {
          name: "bg_color",
          title: "台标背景色",
          type: "input",
          description: "支持RGB颜色，如DCDCDC",
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

async function getLiveTv(params = {}) {
  try {
    const response = await Widget.http.get("https://raw.githubusercontent.com/2kuai/ForwardWidgets/refs/heads/main/data/iptv-data.json");
    
    if (!response?.data) {
      throw new Error("响应数据为空或格式不正确");
    }

    const modifiedData = { ...response.data };
    let addedSourcesCount = 0;
    const usedUserUrls = new Set();
    
    // 无论是否清空，都会兜底用 AKTV.m3u
    const url = (params.url && String(params.url).trim()) 
             || "https://raw.githubusercontent.com/Mikephie/AUTOjs/main/LiveTV/AKTV.m3u";

    if (url) {
      try {
        const userResponse = await Widget.http.get(url);
        if (userResponse?.data) {
          const userChannels = parseM3U(userResponse.data);
          console.log(`[用户订阅] 从用户订阅中解析出 ${userChannels.length} 个频道`);
          
          const allPotentialMatches = [];
          
          for (const category in modifiedData) {
            if (Array.isArray(modifiedData[category])) {
              modifiedData[category].forEach(baseChannel => {
                userChannels.forEach(userChannel => {
                  if (!usedUserUrls.has(userChannel.url)) {
                    const score = calculateMatchScore(userChannel.name, baseChannel.name);
                    if (score > 0.7) {
                      allPotentialMatches.push({
                        baseChannel,
                        userChannel,
                        score
                      });
                    }
                  }
                });
              });
            }
          }
          
          allPotentialMatches.sort((a, b) => b.score - a.score);
          
          const channelStats = {};
          allPotentialMatches.forEach(({ baseChannel, userChannel }) => {
            if (!usedUserUrls.has(userChannel.url)) {
              const targetChannel = findChannelInData(modifiedData, baseChannel.name);
              if (targetChannel) {
                targetChannel.childItems = [
                  ...(targetChannel.childItems || []),
                  userChannel.url
                ].filter(Boolean);
                usedUserUrls.add(userChannel.url);
                addedSourcesCount++;
                
                if (!channelStats[baseChannel.name]) {
                  channelStats[baseChannel.name] = {
                    count: 0,
                    urls: []
                  };
                }
                channelStats[baseChannel.name].count++;
                channelStats[baseChannel.name].urls.push(userChannel.url);
              }
            }
          });
          
          console.log(`[用户订阅] 共添加了 ${addedSourcesCount} 个有效源`);
        }
      } catch (userError) {
        console.error("[用户订阅] 处理用户订阅失败:", userError.message);
      }
    }

    modifiedData["all"] = Object.values(modifiedData)
      .filter(Array.isArray)
      .flat();

    if (!params.sort_by || !modifiedData[params.sort_by]) {
      throw new Error(`不支持的类型: ${params.sort_by}`);
    }
    
    return modifiedData[params.sort_by]
      .map(item => {
        const validUrls = (item.childItems || [])
          .filter(url => typeof url === 'string' && url.trim());
        
        if (validUrls.length === 0) return null;

        const createItem = (url, title, isMain = false) => ({
          id: url,
          type: "url",
          title: isMain ? item.name : title,
          backdropPath: item.backdrop_path.replace(/bg-\w{6}/g, params.bg_color ? `bg-${params.bg_color}` : '$&'),
          description: item.description,
          videoUrl: url,
          customHeaders: {"user-agent": "AptvPlayer/1.4.10"}
        });

        const mainItem = createItem(validUrls[0], item.name, true);
        
        if (validUrls.length > 1) {
          mainItem.childItems = validUrls.slice(1).map((url, i) => 
            createItem(url, `${item.name} - (${i+1})`)
          );
        }
        
        return mainItem;
      })
      .filter(Boolean);
      
  } catch (error) {
    console.error("获取直播频道失败:", error.message);
    throw error;
  }
}

function calculateMatchScore(userName, baseName) {
  const normalize = (name) => {
    return (name || '')
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/-/g, '')
      .replace(/[^\w\u4e00-\u9fa5]/g, '');
  };

  const userNorm = normalize(userName);
  const baseNorm = normalize(baseName);

  if (userNorm === baseNorm) return 1.0;

  const cctvPattern = /cctv(\d+)/;
  const userMatch = userNorm.match(cctvPattern);
  const baseMatch = baseNorm.match(cctvPattern);
  
  if (userMatch && baseMatch) {
    return userMatch[1] === baseMatch[1] ? 0.9 : 0;
  }

  return calculateSimilarity(userNorm, baseNorm);
}

function calculateSimilarity(a, b) {
  const matrix = [];
  for (let i = 0; i <= a.length; i++) matrix[i] = [i];
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i-1] === b[j-1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i-1][j] + 1,
        matrix[i][j-1] + 1,
        matrix[i-1][j-1] + cost
      );
    }
  }
  return 1 - matrix[a.length][b.length] / Math.max(a.length, b.length);
}

function findChannelInData(data, channelName) {
  for (const category in data) {
    if (Array.isArray(data[category])) {
      const found = data[category].find(item => item.name === channelName);
      if (found) return found;
    }
  }
  return null;
}

function parseM3U(content) {
  const channels = [];
  let current = {};
  let lineIndex = 0;

  content.split('\n').forEach(line => {
    line = line.trim();
    if (!line) return;

    if (line.includes(',http') && !line.startsWith('#')) {
      const [name, url] = line.split(',http');
      channels.push({
        name: name.trim(),
        url: 'http' + url.trim()
      });
      return;
    }

    if (line.startsWith('#EXTINF')) {
      current.name = line.match(/tvg-name="([^"]+)"/)?.[1] || 
                   line.match(/,([^,]+)$/)?.[1]?.trim() || '';
      lineIndex = 1;
    } else if (lineIndex === 1) {
      current.url = line;
      channels.push(current);
      current = {};
      lineIndex = 0;
    }
  });

  return channels;
}