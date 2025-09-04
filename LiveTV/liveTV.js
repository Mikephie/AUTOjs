// 电视直播插件
WidgetMetadata = {
    id: "live",
    title: "MIKE直播(电视+网络)",
    detailCacheDuration: 60,
    modules: [
        {
            title: "MIKE直播(电视+网络)",
            requiresWebView: false,
            functionName: "loadLiveItems",
            cacheDuration: 21600,
            params: [
                {
                    name: "url",
                    title: "订阅链接",
                    type: "input",
                    description: "输入直播订阅链接地址",
                    placeholders: [
                        {
                            title: "Sport",
                            value: "https://tv-1.iill.top/m3u/Sport"
                        },
                        {
                            title: "风云TV",
                            value: "http://iptv.4666888.xyz/FYTV.m3u"
                        },
                        {
                            title: "Gather",
                            value: "https://tv-1.iill.top/m3u/Gather"
                        },
                        {
                            title: "Kimentanm",
                            value: "https://raw.githubusercontent.com/Kimentanm/aptv/master/m3u/iptv.m3u"
                        },
                        {
                            title: "网络直播",
                            value: "https://tv.iill.top/m3u/Live"
                        },
                        {
                            title: "smart(港澳台)",
                            value: "https://smart.pendy.dpdns.org/m3u/merged_judy.m3u"
                        },
                        {
                            title: "YanG-Gather1",
                            value: "https://tv.iill.top/m3u/Gather"
                        },
                        {
                            title: "YanG-Gather2",
                            value: "https://raw.githubusercontent.com/YanG-1989/m3u/main/Gather.m3u"
                        },
                        {
                            title: "suxuang",
                            value: "https://bit.ly/suxuang-v4"
                        },
                        {
                            title: "全球",
                            value: "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8"
                        },
                        {
                            title: "IPTV1",
                            value: "https://raw.githubusercontent.com/skddyj/iptv/main/IPTV.m3u"
                        },
                        {
                            title: "IPTV2-CN",
                            value: "https://iptv-org.github.io/iptv/countries/cn.m3u"
                        },
                        {
                            title: "IPTV3",
                            value: "https://cdn.jsdelivr.net/gh/Guovin/iptv-api@gd/output/result.m3u"
                        },
                        {
                            title: "Taobao",
                            value: "http://m3u.sjbox.cc/113.m3u"
                        },
                        {
                            title: "AKTV",
                            value: "https://aktv.space/live.m3u"
                        },
                        {
                            title: "OTT-IPTV",
                            value: "https://sub.ottiptv.cc/iptv.m3u"
                        },
                        {
                            title: "OTT-虎牙清晰",
                            value: "https://sub.ottiptv.cc/huyayqk.m3u"
                        },
                        {
                            title: "OTT-斗鱼清晰",
                            value: "https://sub.ottiptv.cc/douyuyqk.m3u"
                        },
                        {
                            title: "OTT-YY轮播",
                            value: "https://sub.ottiptv.cc/yylunbo.m3u"
                        },
                        {
                            title: "OTT-B站",
                            value: "https://sub.ottiptv.cc/bililive.m3u"
                        }
                    ]
                },
                {
                    name: "group_filter",
                    title: "按组关键字过滤(选填)，如央视，会筛选出所有group-title中包含央视的频道",
                    type: "input",
                    description: "输入组关键字，如央视，会筛选出所有group-title中包含央视的频道",
                    placeholders: [
                        { title: "全部频道", value: "" },
                        { title: "央视频道", value: "央视" },
                        { title: "卫视频道", value: "中国大陆/卫视" },
                        { title: "地方频道", value: "地方" },
                        { title: "咪咕视频", value: "咪咕视频" },
                        { title: "中国大陆(全部)", value: "^中国大陆" },
                        { title: "香港(全部)",     value: "^香港" },
                        { title: "台湾(全部)",     value: "^台湾|台湾频道" },
                        { title: "日本(全部)",     value: "^日本" },
                        { title: "韩国(全部)",     value: "^韩国" },
                        { title: "美国(全部)",     value: "^美国" },
                        { title: "英国(全部)",     value: "^英国" },
                        { title: "港澳台(合并)",   value: "^(香港|澳门|台湾|港澳频道)" },
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
                // 🔄 将原来的 "name_filter" 替换为 UA 选择
                {
                    name: "ua",
                    title: "User-Agent",
                    type: "enumeration",
                    description: "选择请求 User-Agent",
                    value: "okHttp/Mod-1.2.0.1",
                    enumOptions: [
                        { title: "okHttp/Mod-1.2.0.1", value: "okHttp/Mod-1.2.0.1" },
                        { title: "AptvPlayer/1.4.6", value: "AptvPlayer/1.4.6" }
                    ]
                },
                {
                    name: "bg_color",
                    title: "台标背景色(只对源里不自带台标的起作用)",
                    type: "input",
                    description: "支持RGB颜色，如DCDCDC",
                    value: "DCDCDC",
                    placeholders: [
                        { title: "亮灰色", value: "DCDCDC" },
                        { title: "钢蓝", value: "4682B4" },
                        { title: "浅海洋蓝", value: "20B2AA" },
                        { title: "浅粉红", value: "FFB6C1" },
                        { title: "小麦色", value: "F5DEB3" }
                    ]
                },
                {
                    name: "direction",
                    title: "台标优先显示方向",
                    type: "enumeration",
                    description: "台标优先显示方向，默认为竖向",
                    value: "V",
                    enumOptions: [
                        { title: "竖向", value: "V" },
                        { title: "横向", value: "H" }
                    ]
                }
            ]
        }
    ],
    version: "2.3.0",
    requiredVersion: "0.0.1",
    description: "解析直播订阅",
    author: "MIKEPHIE",
    site: "https://raw.githubusercontent.com/Mikephie/AUTOjs/main/LiveTV/widget.js"
};

// ========= 全局 UA（loadLiveItems 选择后保存，其他接口统一使用）=========
let CURRENT_UA = "okHttp/Mod-1.2.0.1";

async function loadLiveItems(params = {}) {
    try {
        const url = params.url || "";
        const groupFilter = params.group_filter || "";
        const ua = params.ua || "okHttp/Mod-1.2.0.1";   // 新增：UA 选择
        const bgColor = params.bg_color || "";
        const direction = params.direction || "";

        // 保存全局 UA
        CURRENT_UA = ua;

        if (!url) {
            throw new Error("必须提供电视直播订阅链接");
        }

        // 从URL获取M3U内容（带 UA）
        const response = await this.fetchM3UContent(url);
        if (!response) return [];

        // 获取台标数据
        const iconList = await this.fetchIconList(url);

        // 解析M3U内容
        const items = parseM3UContent(response, iconList, bgColor, direction);

        // 仅保留组过滤（原 name_filter 已替换为 UA）
        const filteredItems = items.filter(item => {
            // 组过滤（支持正则表达式）
            const groupMatch = !groupFilter || (() => {
                try {
                    const regex = new RegExp(groupFilter, 'i');
                    return regex.test(item.metadata?.group || '');
                } catch (e) {
                    return (item.metadata?.group?.toLowerCase() || '').includes(groupFilter.toLowerCase());
                }
            })();
            return groupMatch;
        });

        const totalCount = filteredItems.length;

        // 为每个频道的标题添加 (x/y)
        return filteredItems.map((item, index) => ({
            ...item,
            title: `${item.title} (${index + 1}/${totalCount})`
        }));
    } catch (error) {
        console.error(`解析电视直播链接时出错: ${error.message}`);
        return [];
    }
}

async function fetchM3UContent(url) {
    try {
        const response = await Widget.http.get(url, {
            headers: {
                'User-Agent': CURRENT_UA, // 使用全局 UA
            }
        });

        console.log("请求结果:", response.data);

        if (response.data && response.data.includes("#EXTINF")) {
            return response.data;
        }

        return null;
    } catch (error) {
        console.error(`获取M3U内容时出错: ${error.message}`);
        return null;
    }
}

async function fetchIconList() {
    try {
        const response = await Widget.http.get("https://api.github.com/repos/fanmingming/live/contents/tv", {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
            }
        });

        console.log("请求结果:", response.data);

        const iconList = response.data.map(item => item.name.replace('.png', ''));

        console.log("iconList:", iconList); // ["4K电影"]

        return iconList;
    } catch (error) {
        console.error(`获取台标数据时出错: ${error.message}`);
        return [];
    }
}

function parseM3UContent(content, iconList, bgColor, direction) {
    if (!content || !content.trim()) return [];

    const lines = content.split(/\r?\n/);
    const items = [];
    let currentItem = null;

    // 正则表达式用于匹配M3U标签和属性
    const extInfRegex = /^#EXTINF:(-?\d+)(.*),(.*)$/;
    const groupRegex = /group-title="([^"]+)"/;
    const tvgNameRegex = /tvg-name="([^"]+)"/;
    const tvgLogoRegex = /tvg-logo="([^"]+)"/;
    const tvgIdRegex = /tvg-id="([^"]+)"/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // 跳过空行和注释行
        if (!line || line.startsWith('#EXTM3U')) continue;

        // 匹配#EXTINF行
        if (line.startsWith('#EXTINF:')) {
            const match = line.match(extInfRegex);
            if (match) {
                const duration = match[1];
                const attributes = match[2];
                const title = match[3].trim();

                // 提取属性
                const groupMatch = attributes.match(groupRegex);
                const tvgNameMatch = attributes.match(tvgNameRegex);
                const tvgLogoMatch = attributes.match(tvgLogoRegex);
                const tvgIdMatch = attributes.match(tvgIdRegex);

                const group = groupMatch ? groupMatch[1] : '未分类';
                const tvgName = tvgNameMatch ? tvgNameMatch[1] : title;
                const cover = tvgLogoMatch ? tvgLogoMatch[1] : '';
                const tvgId = tvgIdMatch ? tvgIdMatch[1] : '';

                // 创建新的直播项目
                currentItem = {
                    duration,
                    title,
                    group,
                    tvgName,
                    tvgId,
                    cover,
                    url: null
                };
            }
        }
        // 匹配直播URL行
        else if (currentItem && line && !line.startsWith('#')) {
            const url = line;
            console.log(currentItem.title);

            if (!bgColor) {
                bgColor = "DCDCDC";
            }
            const posterIcon = iconList.includes(currentItem.title)
                ? `https://ik.imagekit.io/huangxd/tr:l-image,i-transparent.png,w-bw_mul_3.5,h-bh_mul_3,bg-${bgColor},lfo-center,l-image,i-${currentItem.title}.png,lfo-center,l-end,l-end/${currentItem.title}.png`
                : "";
            console.log("posterIcon:", posterIcon);
            const backdropIcon = iconList.includes(currentItem.title)
                ? `https://ik.imagekit.io/huangxd/tr:l-image,i-transparent.png,w-bw_mul_1.5,h-bh_mul_4,bg-${bgColor},lfo-center,l-image,i-${currentItem.title}.png,lfo-center,l-end,l-end/${currentItem.title}.png`
                : "";
            console.log("backdropIcon:", backdropIcon);

            // 构建最终的项目对象
            const item = {
                id: url,
                type: "url",
                title: currentItem.title,
                backdropPath: backdropIcon || currentItem.cover || "https://i.miji.bid/2025/05/17/c4a0703b68a4d2313a27937d82b72b6a.png",
                previewUrl: "",
                link: url,
                playerType: "system",
                metadata: {
                    group: currentItem.group,
                    tvgName: currentItem.tvgName,
                    tvgId: currentItem.tvgId
                }
            };
            if (!direction || direction === "V") {
                item['posterPath'] = posterIcon || currentItem.cover || "https://i.miji.bid/2025/05/17/343e3416757775e312197588340fc0d3.png";
            }

            items.push(item);
            currentItem = null; // 重置当前项目
        }
    }

    return items;
}

async function loadDetail(link) {
    let videoUrl = link;
    let childItems = [];

    const formats = ['m3u8', 'mp4', 'mp3', 'flv', 'avi', 'mov', 'wmv', 'webm', 'ogg', 'mkv', 'ts'];
    if (!formats.some(format => link.includes(format))) {
        // 获取重定向location
        const url = `https://redirect-check.hxd.ip-ddns.com/redirect-check?url=${link}`;

        const response = await Widget.http.get(url, {
            headers: {
                "User-Agent": CURRENT_UA, // 使用全局 UA
            },
        });

        console.log(response.data)

        if (response.data && response.data.location && formats.some(format => response.data.location.includes(format))) {
            videoUrl = response.data.location;
        }

        if (response.data && response.data.error && response.data.error.includes("超时")) {
            const hint_item = {
                id: videoUrl,
                type: "url",
                title: "超时/上面直播不可用",
                posterPath: "https://i.miji.bid/2025/05/17/561121fb0ba6071d4070627d187b668b.png",
                backdropPath: "https://i.miji.bid/2025/05/17/561121fb0ba6071d4070627d187b668b.png",
                link: videoUrl,
                playerType: "system",
            };
            childItems = [hint_item]
        }
    }

    const item = {
        id: link,
        type: "detail",
        videoUrl: videoUrl,
        customHeaders: {
            "Referer": link,
            "User-Agent": CURRENT_UA, // 使用所选 UA
        },
        playerType: "system",
        childItems: childItems,
    };

    return item;
}