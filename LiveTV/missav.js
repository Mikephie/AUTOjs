var WidgetMetadata = {
    id: "missav",
    title: "MissAV",
    description: "获取 MissAV 推荐",
    author: "Mikephie",
    site: "https://widgets-xd.vercel.app",
    version: "2.0.0",
    requiredVersion: "0.0.2",
    detailCacheDuration: 300,
    modules: [
        {
            title: "搜索影片",
            description: "搜索 MissAV 影片内容",
            requiresWebView: false,
            functionName: "searchVideos",
            cacheDuration: 1800,
            params: [
                {
                    name: "keyword",
                    title: "搜索关键词",
                    type: "input",
                    description: "输入搜索关键词（演员名、番号、标题等）",
                    value: ""
                },
                {
                    name: "sort_by",
                    title: "排序",
                    type: "enumeration",
                    description: "排序方式",
                    value: "released_at",
                    enumOptions: [
                        { title: "发行日期", value: "released_at" },
                        { title: "最近更新", value: "published_at" },
                        { title: "收藏数", value: "saved" },
                        { title: "今日浏览数", value: "today_views" },
                        { title: "本周浏览数", value: "weekly_views" },
                        { title: "本月浏览数", value: "monthly_views" },
                        { title: "总浏览数", value: "views" }
                    ]
                },
                { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
            ]
        },
        {
            title: "今日热门",
            description: "今日热门影片",
            requiresWebView: false,
            functionName: "loadTodayHot",
            cacheDuration: 1800,
            params: [
                { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
            ]
        },
        {
            title: "本周热门",
            description: "本周热门影片",
            requiresWebView: false,
            functionName: "loadWeeklyHot",
            cacheDuration: 1800,
            params: [
                { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
            ]
        },
        {
            title: "本月热门",
            description: "本月热门影片",
            requiresWebView: false,
            functionName: "loadMonthlyHot",
            cacheDuration: 1800,
            params: [
                { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
            ]
        },
        {
            title: "新作上市",
            description: "新作上市影片",
            requiresWebView: false,
            functionName: "loadNewRelease",
            cacheDuration: 1800,
            params: [
                { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
            ]
        },
        {
            title: "中文字幕",
            description: "中文字幕影片",
            requiresWebView: false,
            functionName: "loadChineseSubtitle",
            cacheDuration: 1800,
            params: [
                {
                    name: "sort_by",
                    title: "排序",
                    type: "enumeration",
                    description: "排序方式",
                    value: "released_at",
                    enumOptions: [
                        { title: "发行日期", value: "released_at" },
                        { title: "最近更新", value: "published_at" },
                        { title: "收藏数", value: "saved" },
                        { title: "今日浏览数", value: "today_views" },
                        { title: "本周浏览数", value: "weekly_views" },
                        { title: "本月浏览数", value: "monthly_views" },
                        { title: "总浏览数", value: "views" }
                    ]
                },
                { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
            ]
        },
        {
            title: "无码影片库",
            description: "无码影片各分类",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "选择分类",
                    type: "enumeration",
                    description: "选择分类",
                    enumOptions: [
                        { title: "无码流出", value: "https://missav.ai/dm621/cn/uncensored-leak" },
                        { title: "FC2", value: "https://missav.ai/dm99/cn/fc2" },
                        { title: "HEYZO", value: "https://missav.ai/dm319995/cn/heyzo" },
                        { title: "东京热", value: "https://missav.ai/dm29/cn/tokyohot" },
                        { title: "Caribbeancom", value: "https://missav.ai/dm1271239/cn/caribbeancom" },
                        { title: "Gachinco", value: "https://missav.ai/dm135/cn/gachinco" },
                        { title: "XXX-AV", value: "https://missav.ai/dm29/cn/xxxav" },
                        { title: "人妻斩", value: "https://missav.ai/dm24/cn/marriedslash" },
                        { title: "顽皮 4610", value: "https://missav.ai/dm19/cn/naughty4610" },
                        { title: "顽皮 0930", value: "https://missav.ai/dm22/cn/naughty0930" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "排序",
                    type: "enumeration",
                    description: "排序方式",
                    value: "released_at",
                    enumOptions: [
                        { title: "发行日期", value: "released_at" },
                        { title: "最近更新", value: "published_at" },
                        { title: "收藏数", value: "saved" },
                        { title: "今日浏览数", value: "today_views" },
                        { title: "本周浏览数", value: "weekly_views" },
                        { title: "本月浏览数", value: "monthly_views" },
                        { title: "总浏览数", value: "views" }
                    ]
                },
                { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
            ]
        },
        {
            title: "亚洲AV专区",
            description: "亚洲AV各分类",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "选择分类",
                    type: "enumeration",
                    description: "选择分类",
                    enumOptions: [
                        { title: "麻豆传媒", value: "https://missav.ai/dm34/cn/madou" },
                        { title: "韩国直播", value: "https://missav.ai/cn/klive" },
                        { title: "中国直播", value: "https://missav.ai/cn/clive" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "排序",
                    type: "enumeration",
                    description: "排序方式",
                    value: "released_at",
                    enumOptions: [
                        { title: "发行日期", value: "released_at" },
                        { title: "最近更新", value: "published_at" },
                        { title: "收藏数", value: "saved" },
                        { title: "今日浏览数", value: "today_views" },
                        { title: "本周浏览数", value: "weekly_views" },
                        { title: "本月浏览数", value: "monthly_views" },
                        { title: "总浏览数", value: "views" }
                    ]
                },
                { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
            ]
        },
        {
            title: "影片质量类",
            description: "影片质量类 - 12个类型，748,863部影片",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "选择类型",
                    type: "enumeration",
                    description: "选择具体类型",
                    enumOptions: [
                        { title: "高清 (248,852部)", value: "https://missav.ai/dm95/cn/genres/%E9%AB%98%E6%B8%85" },
                        { title: "独家 (220,805部)", value: "https://missav.ai/dm136/cn/genres/%E7%8B%AC%E5%AE%B6" },
                        { title: "单体作品 (185,259部)", value: "https://missav.ai/dm118/cn/genres/%E5%8D%95%E4%BD%93%E4%BD%9C%E5%93%81" },
                        { title: "薄格 (93,610部)", value: "https://missav.ai/dm95/cn/genres/%E8%96%84%E6%A0%BC" },
                        { title: "全高清 (FHD) (11928部)", value: "https://missav.ai/cn/genres/%E5%85%A8%E9%AB%98%E6%B8%85%20(FHD)" },
                        { title: "低成本影片 (70部)", value: "https://missav.ai/cn/genres/%E4%BD%8E%E6%88%90%E6%9C%AC%E5%BD%B1%E7%89%87" },
                        { title: "套装商品 (44部)", value: "https://missav.ai/cn/genres/%E5%A5%97%E8%A3%85%E5%95%86%E5%93%81" },
                        { title: "限时特卖 (37部)", value: "https://missav.ai/cn/genres/%E9%99%90%E6%97%B6%E7%89%B9%E5%8D%96" },
                        { title: "高清 (HD) (36部)", value: "https://missav.ai/cn/genres/%E9%AB%98%E6%B8%85%20%28HD%29" },
                        { title: "协力作品 (32部)", value: "https://missav.ai/cn/genres/%E5%8D%8F%E5%8A%9B%E4%BD%9C%E5%93%81" },
                        { title: "单一作品 (13部)", value: "https://missav.ai/cn/genres/%E5%8D%95%E4%B8%80%E4%BD%9C%E5%93%81" },
                        { title: "仅限分发 (12部)", value: "https://missav.ai/cn/genres/%E4%BB%85%E9%99%90%E5%88%86%E5%8F%91" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "排序",
                    type: "enumeration",
                    description: "排序方式",
                    value: "released_at",
                    enumOptions: [
                        { title: "发行日期", value: "released_at" },
                        { title: "最近更新", value: "published_at" },
                        { title: "收藏数", value: "saved" },
                        { title: "今日浏览数", value: "today_views" },
                        { title: "本周浏览数", value: "weekly_views" },
                        { title: "本月浏览数", value: "monthly_views" },
                        { title: "总浏览数", value: "views" }
                    ]
                },
                { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
            ]
        },
        {
            title: "角色与身份",
            description: "角色与身份 - 23个类型，609,543部影片",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "选择类型",
                    type: "enumeration",
                    description: "选择具体类型",
                    enumOptions: [
                        { title: "人妻 (123,405部)", value: "https://missav.ai/dm67/cn/genres/%E4%BA%BA%E5%A6%BB" },
                        { title: "熟女 (111,004部)", value: "https://missav.ai/dm107/cn/genres/%E7%86%9F%E5%A5%B3" },
                        { title: "素人 (97,868部)", value: "https://missav.ai/dm95/cn/genres/%E7%B4%A0%E4%BA%BA" },
                        { title: "美少女 (89,506部)", value: "https://missav.ai/dm93/cn/genres/%E7%BE%8E%E5%B0%91%E5%A5%B3" },
                        { title: "痴女 (71,969部)", value: "https://missav.ai/dm68/cn/genres/%E7%97%B4%E5%A5%B3" },
                        { title: "女高中生 (62,542部)", value: "https://missav.ai/dm61/cn/genres/%E5%A5%B3%E9%AB%98%E4%B8%AD%E7%94%9F" },
                        { title: "秘书 (997部)", value: "https://missav.ai/dm63/cn/genres/秘书" },
                        { title: "美丽的成熟女人 (135部)", value: "https://missav.ai/cn/genres/美丽的成熟女人" },
                        { title: "妈妈朋友 (98部)", value: "https://missav.ai/cn/genres/%E5%A6%88%E5%A6%88%E6%9C%8B%E5%8F%8B" },
                        { title: "M女人 (77部)", value: "https://missav.ai/dm1/cn/genres/M%E5%A5%B3%E4%BA%BA" },
                        { title: "成熟的女人 (32部)", value: "https://missav.ai/cn/genres/%E6%88%90%E7%86%9F%E7%9A%84%E5%A5%B3%E4%BA%BA" },
                        { title: "家庭主妇 (32部)", value: "https://missav.ai/cn/genres/%E5%AE%B6%E5%BA%AD%E4%B8%BB%E5%A6%87" },
                        { title: "成熟女人 / 已婚女人 (29部)", value: "https://missav.ai/cn/genres/%E6%88%90%E7%86%9F%E5%A5%B3%E4%BA%BA%20/%20%E5%B7%B2%E5%A9%9A%E5%A5%B3%E4%BA%BA" },
                        { title: "其他学生 (21部)", value: "https://missav.ai/cn/genres/%E5%85%B6%E4%BB%96%E5%AD%A6%E7%94%9F" },
                        { title: "大小姐 (19部)", value: "https://missav.ai/dm69/cn/genres/%E5%A4%A7%E5%B0%8F%E5%A7%90" },
                        { title: "公主 (18部)", value: "https://missav.ai/cn/genres/%E5%85%AC%E4%B8%BB" },
                        { title: "美丽的女孩 (12部)", value: "https://missav.ai/dm89/cn/genres/%E7%BE%8E%E4%B8%BD%E7%9A%84%E5%A5%B3%E5%AD%A9" },
                        { title: "新娘 / 年轻的妻子 (10部)", value: "https://missav.ai/cn/genres/%E6%96%B0%E5%A8%98%20/%20%E5%B9%B4%E8%BD%BB%E7%9A%84%E5%A6%BB%E5%AD%90" },
                        { title: "养女 (10部)", value: "https://missav.ai/dm1/cn/genres/%E5%85%BB%E5%A5%B3" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "排序",
                    type: "enumeration",
                    description: "排序方式",
                    value: "released_at",
                    enumOptions: [
                        { title: "发行日期", value: "released_at" },
                        { title: "最近更新", value: "published_at" },
                        { title: "收藏数", value: "saved" },
                        { title: "今日浏览数", value: "today_views" },
                        { title: "本周浏览数", value: "weekly_views" },
                        { title: "本月浏览数", value: "monthly_views" },
                        { title: "总浏览数", value: "views" }
                    ]
                },
                { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
            ]
        },
        {
            title: "性行为类型",
            description: "性行为类型 - 19个类型，759,620部影片",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "选择类型",
                    type: "enumeration",
                    description: "选择具体类型",
                    enumOptions: [
                        { title: "中出 (198,292部)", value: "https://missav.ai/dm127/cn/genres/%E4%B8%AD%E5%87%BA" },
                        { title: "口交 (95,026部)", value: "https://missav.ai/dm93/cn/genres/%E5%8F%A3%E4%BA%A4" },
                        { title: "骑乘 (86,850部)", value: "https://missav.ai/dm82/cn/genres/%E9%AA%91%E4%B9%98" },
                        { title: "潮吹 (73,825部)", value: "https://missav.ai/dm71/cn/genres/%E6%BD%AE%E5%90%B9" },
                        { title: "乳交 (68,569部)", value: "https://missav.ai/dm67/cn/genres/%E4%B9%B3%E4%BA%A4" },
                        { title: "颜射 (63,513部)", value: "https://missav.ai/dm59/cn/genres/%E9%A2%9C%E5%B0%84" },
                        { title: "自慰 (60,648部)", value: "https://missav.ai/dm59/cn/genres/%E8%87%AA%E6%85%B0" },
                        { title: "手淫 (58,635部)", value: "https://missav.ai/dm57/cn/genres/%E6%89%8B%E6%B7%AB" },
                        { title: "内射精 (57部)", value: "https://missav.ai/dm77/cn/genres/%E5%86%85%E5%B0%84%E7%B2%BE" },
                        { title: "极致高潮 (88部)", value: "https://missav.ai/dm19/cn/genres/%E6%9E%81%E8%87%B4%E9%AB%98%E6%BD%AE" },
                        { title: "3P (26部)", value: "https://missav.ai/dm45/cn/genres/3P" },
                        { title: "多人 (26部)", value: "https://missav.ai/cn/genres/%E5%A4%9A%E4%BA%BA" },
                        { title: "狗狗式 (19部)", value: "https://missav.ai/cn/genres/%E7%8B%97%E7%8B%97%E5%BC%8F" },
                        { title: "撒尿 (17部)", value: "https://missav.ai/cn/genres/%E6%92%92%E5%B0%BF" },
                        { title: "盐吹 (16部)", value: "https://missav.ai/cn/genres/%E7%9B%90%E5%90%B9" },
                        { title: "撒尿 (14部)", value: "https://missav.ai/dm12/cn/genres/%E6%92%92%E5%B0%BF" },
                        { title: "3P / 4P (11部)", value: "https://missav.ai/cn/genres/3P%20/%204P" },
                        { title: "洗澡 (26部)", value: "https://missav.ai/cn/genres/%E6%B4%97%E6%BE%A1" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "排序",
                    type: "enumeration",
                    description: "排序方式",
                    value: "released_at",
                    enumOptions: [
                        { title: "发行日期", value: "released_at" },
                        { title: "最近更新", value: "published_at" },
                        { title: "收藏数", value: "saved" },
                        { title: "今日浏览数", value: "today_views" },
                        { title: "本周浏览数", value: "weekly_views" },
                        { title: "本月浏览数", value: "monthly_views" },
                        { title: "总浏览数", value: "views" }
                    ]
                },
                { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
            ]
        },
        {
            title: "情节与主题",
            description: "情节与主题 - 15个类型，363,926部影片",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "选择类型",
                    type: "enumeration",
                    description: "选择具体类型",
                    enumOptions: [
                        { title: "企划 (67,686部)", value: "https://missav.ai/dm67/cn/genres/%E4%BC%81%E5%88%92" },
                        { title: "乱伦 (56,481部)", value: "https://missav.ai/dm55/cn/genres/%E4%B9%B1%E4%BC%A6" },
                        { title: "NTR (51,273部)", value: "https://missav.ai/dm51/cn/genres/NTR" },
                        { title: "搭讪 (48,965部)", value: "https://missav.ai/dm48/cn/genres/%E6%90%AD%E8%AE%AA" },
                        { title: "淫乱 (47,821部)", value: "https://missav.ai/dm47/cn/genres/%E6%B7%AB%E4%B9%B1" },
                        { title: "剧情 (46,573部)", value: "https://missav.ai/dm46/cn/genres/%E5%89%A7%E6%83%85" },
                        { title: "羞辱 (44,892部)", value: "https://missav.ai/dm44/cn/genres/%E7%BE%9E%E8%BE%B1" },
                        { title: "妻子的出轨 / NTR / 戴绿帽子 (74部)", value: "https://missav.ai/cn/genres/%E5%A6%BB%E5%AD%90%E7%9A%84%E5%87%BA%E8%BD%A8%20/%20NTR%20/%20%E6%88%B4%E7%BB%BF%E5%B8%BD%E5%AD%90" },
                        { title: "戴绿帽子 (39部)", value: "https://missav.ai/cn/genres/%E6%88%B4%E7%BB%BF%E5%B8%BD%E5%AD%90" },
                        { title: "告白体验 (30部)", value: "https://missav.ai/cn/genres/%E5%91%8A%E7%99%BD%E4%BD%93%E9%AA%8C" },
                        { title: "外遇妻子 / NTR / 戴绿帽子 (17部)", value: "https://missav.ai/cn/genres/%E5%A4%96%E9%81%87%E5%A6%BB%E5%AD%90%20/%20NTR%20/%20%E6%88%B4%E7%BB%BF%E5%B8%BD%E5%AD%90" },
                        { title: "交往 (13部)", value: "https://missav.ai/cn/genres/%E4%BA%A4%E5%BE%80" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "排序",
                    type: "enumeration",
                    description: "排序方式",
                    value: "released_at",
                    enumOptions: [
                        { title: "发行日期", value: "released_at" },
                        { title: "最近更新", value: "published_at" },
                        { title: "收藏数", value: "saved" },
                        { title: "今日浏览数", value: "today_views" },
                        { title: "本周浏览数", value: "weekly_views" },
                        { title: "本月浏览数", value: "monthly_views" },
                        { title: "总浏览数", value: "views" }
                    ]
                },
                { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
            ]
        },
        {
            title: "特殊玩法类",
            description: "特殊玩法 - 9个类型，85,102部影片",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "选择类型",
                    type: "enumeration",
                    description: "选择具体类型",
                    enumOptions: [
                        { title: "多人运动 (53,962部)", value: "https://missav.ai/dm53/cn/genres/%E5%A4%9A%E4%BA%BA%E8%BF%90%E5%8A%A8" },
                        { title: "拘束 (41,628部)", value: "https://missav.ai/dm41/cn/genres/%E6%8B%98%E6%9D%9F" },
                        { title: "脏话 (63部)", value: "https://missav.ai/cn/genres/%E8%84%8F%E8%AF%9D" },
                        { title: "催眠洗脑 (62部)", value: "https://missav.ai/cn/genres/%E5%82%AC%E7%9C%A0%E6%B4%97%E8%84%91" },
                        { title: "口球 (51部)", value: "https://missav.ai/cn/genres/%E5%8F%A3%E7%90%83" },
                        { title: "放置Play (31部)", value: "https://missav.ai/cn/genres/%E6%94%BE%E7%BD%AEPlay" },
                        { title: "奴隶 (26部)", value: "https://missav.ai/dm6/cn/genres/%E5%A5%B4%E9%9A%B6" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "排序",
                    type: "enumeration",
                    description: "排序方式",
                    value: "released_at",
                    enumOptions: [
                        { title: "发行日期", value: "released_at" },
                        { title: "最近更新", value: "published_at" },
                        { title: "收藏数", value: "saved" },
                        { title: "今日浏览数", value: "today_views" },
                        { title: "本周浏览数", value: "weekly_views" },
                        { title: "本月浏览数", value: "monthly_views" },
                        { title: "总浏览数", value: "views" }
                    ]
                },
                { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
            ]
        },
        {
            title: "身材特征类",
            description: "身材特征 - 14个类型，234,821部影片",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "选择类型",
                    type: "enumeration",
                    description: "选择具体类型",
                    enumOptions: [
                        { title: "巨乳 (165,810部)", value: "https://missav.ai/dm112/cn/genres/%E5%B7%A8%E4%B9%B3" },
                        { title: "苗条 (34,968部)", value: "https://missav.ai/dm34/cn/genres/%E8%8B%97%E6%9D%A1" },
                        { title: "美乳 (33,527部)", value: "https://missav.ai/dm33/cn/genres/%E7%BE%8E%E4%B9%B3" },
                        { title: "D罩杯 (79部)", value: "https://missav.ai/cn/genres/D%E7%BD%A9%E6%9D%AF" },
                        { title: "背部 (73部)", value: "https://missav.ai/dm355/cn/genres/%E8%83%8C%E9%83%A8" },
                        { title: "美丽的屁股 (60部)", value: "https://missav.ai/cn/genres/%E7%BE%8E%E4%B8%BD%E7%9A%84%E5%B1%81%E8%82%A1" },
                        { title: "E罩杯以上的Judai（青少年） (55部)", value: "https://missav.ai/cn/genres/E%E7%BD%A9%E6%9D%AF%E4%BB%A5%E4%B8%8A%E7%9A%84Judai%EF%BC%88%E9%9D%92%E5%B0%91%E5%B9%B4%EF%BC%89" },
                        { title: "甜屁股 (54部)", value: "https://missav.ai/cn/genres/%E7%94%9C%E5%B1%81%E8%82%A1" },
                        { title: "美尻 (46部)", value: "https://missav.ai/cn/genres/%E7%BE%8E%E5%B0%BB" },
                        { title: "性感的腿 (42部)", value: "https://missav.ai/cn/genres/%E6%80%A7%E6%84%9F%E7%9A%84%E8%85%BF" },
                        { title: "大乳房 (31部)", value: "https://missav.ai/cn/genres/%E5%A4%A7%E4%B9%B3%E6%88%BF" },
                        { title: "白皙的皮肤 (16部)", value: "https://missav.ai/cn/genres/%E7%99%BD%E7%9A%99%E7%9A%84%E7%9A%AE%E8%82%A4" },
                        { title: "小乳房 (16部)", value: "https://missav.ai/cn/genres/%E5%B0%8F%E4%B9%B3%E6%88%BF" },
                        { title: "皮肤黑 (44部)", value: "https://missav.ai/cn/genres/%E7%9A%AE%E8%82%A4%E9%BB%91" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "排序",
                    type: "enumeration",
                    description: "排序方式",
                    value: "released_at",
                    enumOptions: [
                        { title: "发行日期", value: "released_at" },
                        { title: "最近更新", value: "published_at" },
                        { title: "收藏数", value: "saved" },
                        { title: "今日浏览数", value: "today_views" },
                        { title: "本周浏览数", value: "weekly_views" },
                        { title: "本月浏览数", value: "monthly_views" },
                        { title: "总浏览数", value: "views" }
                    ]
                },
                { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
            ]
        },
        {
            title: "职业角色类",
            description: "职业角色 - 8个类型，372部影片",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "选择类型",
                    type: "enumeration",
                    description: "选择具体类型",
                    enumOptions: [
                        { title: "接待员 (97部)", value: "https://missav.ai/cn/genres/%E6%8E%A5%E5%BE%85%E5%91%98" },
                        { title: "女导游 (92部)", value: "https://missav.ai/dm2/cn/genres/%E5%A5%B3%E5%AF%BC%E6%B8%B8" },
                        { title: "啦啦队 (69部)", value: "https://missav.ai/cn/genres/%E5%95%A6%E5%95%A6%E9%98%9F" },
                        { title: "空中小姐 CA (50部)", value: "https://missav.ai/cn/genres/%E7%A9%BA%E4%B8%AD%E5%B0%8F%E5%A7%90%20CA" },
                        { title: "台湾模特儿 (20部)", value: "https://missav.ai/cn/genres/%E5%8F%B0%E6%B9%BE%E6%A8%A1%E7%89%B9%E5%84%BF" },
                        { title: "迷你裙女警 (20部)", value: "https://missav.ai/dm1/cn/genres/%E8%BF%B7%E4%BD%A0%E8%A3%99%E5%A5%B3%E8%AD%A6" },
                        { title: "色情明星 (14部)", value: "https://missav.ai/cn/genres/%E8%89%B2%E6%83%85%E6%98%8E%E6%98%9F" },
                        { title: "演员 (10部)", value: "https://missav.ai/cn/genres/%E6%BC%94%E5%91%98" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "排序",
                    type: "enumeration",
                    description: "排序方式",
                    value: "released_at",
                    enumOptions: [
                        { title: "发行日期", value: "released_at" },
                        { title: "最近更新", value: "published_at" },
                        { title: "收藏数", value: "saved" },
                        { title: "今日浏览数", value: "today_views" },
                        { title: "本周浏览数", value: "weekly_views" },
                        { title: "本月浏览数", value: "monthly_views" },
                        { title: "总浏览数", value: "views" }
                    ]
                },
                { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
            ]
        },
        {
            title: "拍摄方式类",
            description: "拍摄方式 - 6个类型，78,894部影片",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "选择类型",
                    type: "enumeration",
                    description: "选择具体类型",
                    enumOptions: [
                        { title: "自拍 (39,847部)", value: "https://missav.ai/dm39/cn/genres/%E8%87%AA%E6%8B%8D" },
                        { title: "偷拍 (38,924部)", value: "https://missav.ai/dm38/cn/genres/%E5%81%B7%E6%8B%8D" },
                        { title: "第一次拍摄 (48部)", value: "https://missav.ai/cn/genres/%E7%AC%AC%E4%B8%80%E6%AC%A1%E6%8B%8D%E6%91%84" },
                        { title: "主观性 (16部)", value: "https://missav.ai/cn/genres/%E4%B8%BB%E8%A7%82%E6%80%A7" },
                        { title: "记录 (15部)", value: "https://missav.ai/cn/genres/%E8%AE%B0%E5%BD%95" },
                        { title: "按摩 (15部)", value: "https://missav.ai/dm6/cn/genres/%E6%8C%89%E6%91%A9" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "排序",
                    type: "enumeration",
                    description: "排序方式",
                    value: "released_at",
                    enumOptions: [
                        { title: "发行日期", value: "released_at" },
                        { title: "最近更新", value: "published_at" },
                        { title: "收藏数", value: "saved" },
                        { title: "今日浏览数", value: "today_views" },
                        { title: "本周浏览数", value: "weekly_views" },
                        { title: "本月浏览数", value: "monthly_views" },
                        { title: "总浏览数", value: "views" }
                    ]
                },
                { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
            ]
        },
        {
  title: "时长合集类",
  description: "时长与合集 - 3个类型，73,839部影片",
  requiresWebView: false,
  functionName: "loadDurationPage",  // 改用专用函数，避免影响其他栏目
  cacheDuration: 1800,
  params: [
    {
      name: "url",
      title: "选择类型",
      type: "enumeration",
      description: "选择具体类型",
      enumOptions: [
        { title: "4小时以上 (37,685部)", value: "https://missav.ai/dm37/cn/genres/4%E5%B0%8F%E6%97%B6%E4%BB%A5%E4%B8%8A" },
        { title: "合集 (36,142部)", value: "https://missav.ai/dm36/cn/genres/%E5%90%88%E9%9B%86" },
        { title: "超过工作时间 4 小时 (12部)", value: "https://missav.ai/cn/genres/%E8%B6%85%E8%BF%87%E5%B7%A5%E4%BD%9C%E6%97%B6%E9%97%B4%204%20%E5%B0%8F%E6%97%B6" }
      ]
    },
    {
      name: "sort_by",
      title: "排序",
      type: "enumeration",
      description: "排序方式",
      value: "released_at",
      enumOptions: [
        { title: "发行日期", value: "released_at" },
        { title: "最近更新", value: "published_at" },
        { title: "收藏数", value: "saved" },
        { title: "今日浏览数", value: "today_views" },
        { title: "本周浏览数", value: "weekly_views" },
        { title: "本月浏览数", value: "monthly_views" },
        { title: "总浏览数", value: "views" }
      ]
    },
    {
      name: "girlfriend",
      title: "女友名字",
      type: "input",
      description: "可选，输入女友（演员）名字以叠加筛选",
      value: ""
    },
    { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
  ]
},
        {
            title: "服装造型类",
            description: "服装与造型 - 13个类型，657部影片",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "选择类型",
                    type: "enumeration",
                    description: "选择具体类型",
                    enumOptions: [
                        { title: "裙子单声道 (75部)", value: "https://missav.ai/cn/genres/%E8%A3%99%E5%AD%90%E5%8D%95%E5%A3%B0%E9%81%93" },
                        { title: "浴衣 (72部)", value: "https://missav.ai/dm1/cn/genres/%E6%B5%B4%E8%A1%A3" },
                        { title: "中长发 (69部)", value: "https://missav.ai/dm1/cn/genres/%E4%B8%AD%E9%95%BF%E5%8F%91" },
                        { title: "连裤袜的事 (67部)", value: "https://missav.ai/cn/genres/%E8%BF%9E%E8%A3%A4%E8%A2%9C%E7%9A%84%E4%BA%8B" },
                        { title: "面具 (85部)", value: "https://missav.ai/cn/genres/%E9%9D%A2%E5%85%B7" },
                        { title: "靴子 (44部)", value: "https://missav.ai/cn/genres/%E9%9D%B4%E5%AD%90" },
                        { title: "卷发 (37部)", value: "https://missav.ai/cn/genres/%E5%8D%B7%E5%8F%91" },
                        { title: "高跟鞋 (36部)", value: "https://missav.ai/cn/genres/%E9%AB%98%E8%B7%9F%E9%9E%8B" },
                        { title: "围裙 (31部)", value: "https://missav.ai/dm25/cn/genres/%E5%9B%B4%E8%A3%99" },
                        { title: "金发 (51部)", value: "https://missav.ai/cn/genres/%E9%87%91%E5%8F%91" },
                        { title: "啡发 (76部)", value: "https://missav.ai/cn/genres/%E5%95%A1%E5%8F%91" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "排序",
                    type: "enumeration",
                    description: "排序方式",
                    value: "released_at",
                    enumOptions: [
                        { title: "发行日期", value: "released_at" },
                        { title: "最近更新", value: "published_at" },
                        { title: "收藏数", value: "saved" },
                        { title: "今日浏览数", value: "today_views" },
                        { title: "本周浏览数", value: "weekly_views" },
                        { title: "本月浏览数", value: "monthly_views" },
                        { title: "总浏览数", value: "views" }
                    ]
                },
                { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
            ]
        },
        {
            title: "特殊题材类",
            description: "特殊题材 - 25个类型，901部影片",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "选择类型",
                    type: "enumeration",
                    description: "选择具体类型",
                    enumOptions: [
                        { title: "SF (95部)", value: "https://missav.ai/cn/genres/SF" },
                        { title: "洛丽塔 (83部)", value: "https://missav.ai/cn/genres/%E6%B4%9B%E4%B8%BD%E5%A1%94" },
                        { title: "御宅 (82部)", value: "https://missav.ai/cn/genres/%E5%BE%A1%E5%AE%85" },
                        { title: "魔法少女 (75部)", value: "https://missav.ai/cn/genres/%E9%AD%94%E6%B3%95%E5%B0%91%E5%A5%B3" },
                        { title: "游戏现实版 (39部)", value: "https://missav.ai/cn/genres/%E6%B8%B8%E6%88%8F%E7%8E%B0%E5%AE%9E%E7%89%88" },
                        { title: "3D (38部)", value: "https://missav.ai/dm24/cn/genres/3D" },
                        { title: "AI生成的作品 (37部)", value: "https://missav.ai/cn/genres/AI%E7%94%9F%E6%88%90%E7%9A%84%E4%BD%9C%E5%93%81" },
                        { title: "动漫人物 (35部)", value: "https://missav.ai/cn/genres/%E5%8A%A8%E6%BC%AB%E4%BA%BA%E7%89%A9" },
                        { title: "虚拟现实 (35部)", value: "https://missav.ai/cn/genres/%E8%99%9A%E6%8B%9F%E7%8E%B0%E5%AE%9E" },
                        { title: "动画 (14部)", value: "https://missav.ai/cn/genres/%E5%8A%A8%E7%94%BB" },
                        { title: "偶像 (13部)", value: "https://missav.ai/cn/genres/%E5%81%B6%E5%83%8F" },
                        { title: "透过偶像 (32部)", value: "https://missav.ai/cn/genres/%E9%80%8F%E8%BF%87%E5%81%B6%E5%83%8F" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "排序",
                    type: "enumeration",
                    description: "排序方式",
                    value: "released_at",
                    enumOptions: [
                        { title: "发行日期", value: "released_at" },
                        { title: "最近更新", value: "published_at" },
                        { title: "收藏数", value: "saved" },
                        { title: "今日浏览数", value: "today_views" },
                        { title: "本周浏览数", value: "weekly_views" },
                        { title: "本月浏览数", value: "monthly_views" },
                        { title: "总浏览数", value: "views" }
                    ]
                },
                { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
            ]
        }
    
,
{
  title: "女优专属",
  description: "常用女优直达入口（可继续扩展）",
  requiresWebView: false,
  functionName: "loadPage",
  cacheDuration: 1800,
  params: [
    {
      name: "url",
      title: "选择女优",
      type: "enumeration",
      description: "选择一个女优，直接进入其作品列表",
      enumOptions: [
        { title: "通野未帆", value: "https://missav.ai/dm24/cn/actresses/通野未帆" },
        { title: "三上悠亞", value: "https://missav.ai/dm24/cn/actresses/三上悠亞" },
        { title: "明里籬",   value: "https://missav.ai/dm24/cn/actresses/明里籬" },
        { title: "橋本有菜", value: "https://missav.ai/dm24/cn/actresses/橋本有菜" },
        { title: "河北彩花", value: "https://missav.ai/dm24/cn/actresses/河北彩花" },
        { title: "天使もえ", value: "https://missav.ai/dm24/cn/actresses/天使もえ" },
        { title: "高桥しょう子", value: "https://missav.ai/dm24/cn/actresses/高桥しょう子" },
        { title: "葵つかさ", value: "https://missav.ai/dm24/cn/actresses/葵つかさ" },
        { title: "羽咲みはる", value: "https://missav.ai/dm24/cn/actresses/羽咲みはる" },
        { title: "Julia",   value: "https://missav.ai/dm24/cn/actresses/Julia" }
      ]
    },
    {
      name: "sort_by",
      title: "排序",
      type: "enumeration",
      description: "排序方式",
      value: "released_at",
      enumOptions: [
        { title: "发行日期", value: "released_at" },
        { title: "最近更新", value: "published_at" },
        { title: "收藏数",   value: "saved" },
        { title: "今日浏览数", value: "today_views" },
        { title: "本周浏览数", value: "weekly_views" },
        { title: "本月浏览数", value: "monthly_views" },
        { title: "总浏览数",   value: "views" }
      ]
    },
    { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
  ]
}

,
{
  title: "无码专属",
  description: "直达无码区，无广告干净",
  requiresWebView: false,
  functionName: "loadPage",
  cacheDuration: 1800,
  params: [
    {
      name: "url",
      title: "无码分类",
      type: "enumeration",
      description: "选择无码分类",
      enumOptions: [
        { title: "无码流出", value: "https://missav.ai/dm621/cn/uncensored-leak" },
        { title: "无码中字", value: "https://missav.ai/dm265/cn/chinese-subtitle" }
      ]
    },
    {
      name: "sort_by",
      title: "排序",
      type: "enumeration",
      description: "排序方式",
      value: "released_at",
      enumOptions: [
        { title: "发行日期", value: "released_at" },
        { title: "最近更新", value: "published_at" },
        { title: "收藏数",   value: "saved" },
        { title: "今日浏览数", value: "today_views" },
        { title: "本周浏览数", value: "weekly_views" },
        { title: "本月浏览数", value: "monthly_views" },
        { title: "总浏览数",   value: "views" }
      ]
    },
    { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
  ]
}

,
{
  title: "无码女优专属",
  description: "直达无码流出女优作品",
  requiresWebView: false,
  functionName: "loadPage",
  cacheDuration: 1800,
  params: [
    {
      name: "url",
      title: "选择女优",
      type: "enumeration",
      description: "选择一个女优，直接进入其无码作品",
      enumOptions: [
        { title: "通野未帆", value: "https://missav.ai/dm621/cn/actresses/通野未帆" },
        { title: "三上悠亞", value: "https://missav.ai/dm621/cn/actresses/三上悠亞" },
        { title: "明里籬",   value: "https://missav.ai/dm621/cn/actresses/明里籬" },
        { title: "橋本有菜", value: "https://missav.ai/dm621/cn/actresses/橋本有菜" },
        { title: "河北彩花", value: "https://missav.ai/dm621/cn/actresses/河北彩花" },
        { title: "天使もえ", value: "https://missav.ai/dm621/cn/actresses/天使もえ" },
        { title: "高桥しょう子", value: "https://missav.ai/dm621/cn/actresses/高桥しょう子" },
        { title: "葵つかさ", value: "https://missav.ai/dm621/cn/actresses/葵つかさ" },
        { title: "羽咲みはる", value: "https://missav.ai/dm621/cn/actresses/羽咲みはる" },
        { title: "Julia",   value: "https://missav.ai/dm621/cn/actresses/Julia" }
      ,
{ title: "波多野结衣", value: "https://missav.ai/dm621/cn/actresses/波多野结衣" },
{ title: "白石茉莉奈", value: "https://missav.ai/dm621/cn/actresses/白石茉莉奈" },
{ title: "北条麻妃", value: "https://missav.ai/dm621/cn/actresses/北条麻妃" },
{ title: "小川阿佐美", value: "https://missav.ai/dm621/cn/actresses/小川阿佐美" },
{ title: "上原亚衣", value: "https://missav.ai/dm621/cn/actresses/上原亚衣" },
{ title: "初川南", value: "https://missav.ai/dm621/cn/actresses/初川南" },
{ title: "神宫寺奈绪", value: "https://missav.ai/dm621/cn/actresses/神宫寺奈绪" },
{ title: "篠田优", value: "https://missav.ai/dm621/cn/actresses/篠田优" },
{ title: "香澄果穂", value: "https://missav.ai/dm621/cn/actresses/香澄果穂" },
{ title: "水野朝阳", value: "https://missav.ai/dm621/cn/actresses/水野朝阳" }
]
    },
    {
      name: "sort_by",
      title: "排序",
      type: "enumeration",
      description: "排序方式",
      value: "released_at",
      enumOptions: [
        { title: "发行日期", value: "released_at" },
        { title: "最近更新", value: "published_at" },
        { title: "收藏数",   value: "saved" },
        { title: "今日浏览数", value: "today_views" },
        { title: "本周浏览数", value: "weekly_views" },
        { title: "本月浏览数", value: "monthly_views" },
        { title: "总浏览数",   value: "views" }
      ]
    },
    { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
  ]
}
]
};

async function loadDurationPage(params = {}) {
  const baseUrl    = params.url;
  const page       = parseInt(params.page) || 1;
  const sortBy     = params.sort_by;
  const girlfriend = params.girlfriend ? String(params.girlfriend).trim() : "";

  let url = baseUrl;
  let hasParams = false;

  if (girlfriend) {
    // 分类页不支持 keyword；改用全站搜索路径
    url = `https://missav.ai/cn/search/${encodeURIComponent(girlfriend)}`;
    if (sortBy) {
      url += `?sort=${encodeURIComponent(sortBy)}`;
      hasParams = true;
    }
    if (page > 1) {
      url += hasParams ? `&page=${page}` : `?page=${page}`;
    }
    return await fetchVideoList(url);
  }

  // 没填女友名字，按原分类逻辑
  if (sortBy) {
    url += `?sort=${encodeURIComponent(sortBy)}`;
    hasParams = true;
  }
  if (page > 1) {
    url += hasParams ? `&page=${page}` : `?page=${page}`;
  }

  return await fetchVideoList(url);
}

async function searchVideos(params = {}) {
    const keyword = params.keyword ? params.keyword.trim() : '';
    const page = parseInt(params.page) || 1;
    const sortBy = params.sort_by;
    
    if (!keyword) {
        return [createPlaceholderItem("请输入搜索关键词")];
    }
    
    const isVideoCode = /^[A-Za-z]+-?\d+$/i.test(keyword);
    
    const encodedKeyword = encodeURIComponent(keyword);
    let url = `https://missav.ai/cn/search/${encodedKeyword}`;
    let hasParams = false;
    
    if (sortBy) {
        url += `?sort=${sortBy}`;
        hasParams = true;
    }
    
    if (page > 1) {
        url += hasParams ? `&page=${page}` : `?page=${page}`;
    }
    
    const searchResults = await fetchVideoList(url);
    
    if (isVideoCode && searchResults.length > 0) {
        const normalizedKeyword = keyword.toUpperCase().replace(/-/g, '');
        const filteredResults = searchResults.filter(video => {
            const videoCode = extractVideoCodeFromTitle(video.title) || extractVideoCodeFromDescription(video.description);
            if (videoCode) {
                const normalizedVideoCode = videoCode.toUpperCase().replace(/-/g, '');
                return normalizedVideoCode === normalizedKeyword;
            }
            return false;
        });
        
        return filteredResults;
    }
    
    return searchResults;
}

async function loadTodayHot(params = {}) {
    const page = parseInt(params.page) || 1;
    
    let url = "https://missav.ai/dm291/cn/today-hot?sort=today_views";
    
    if (page > 1) {
        url += `&page=${page}`;
    }
    
    return await fetchVideoList(url);
}

async function loadWeeklyHot(params = {}) {
    const page = parseInt(params.page) || 1;
    
    let url = "https://missav.ai/dm169/cn/weekly-hot?sort=weekly_views";
    
    if (page > 1) {
        url += `&page=${page}`;
    }
    
    return await fetchVideoList(url);
}

async function loadMonthlyHot(params = {}) {
    const page = parseInt(params.page) || 1;
    
    let url = "https://missav.ai/dm257/cn/monthly-hot?sort=monthly_views";
    
    if (page > 1) {
        url += `&page=${page}`;
    }
    
    return await fetchVideoList(url);
}

async function loadNewRelease(params = {}) {
    const page = parseInt(params.page) || 1;
    
    let url = "https://missav.ai/dm588/cn/release?sort=released_at";
    
    if (page > 1) {
        url += `&page=${page}`;
    }
    
    return await fetchVideoList(url);
}

async function loadChineseSubtitle(params = {}) {
    const page = parseInt(params.page) || 1;
    const sortBy = params.sort_by || "released_at";
    
    let url = "https://missav.ai/dm265/cn/chinese-subtitle";
    let hasParams = false;
    
    if (sortBy) {
        url += `?sort=${sortBy}`;
        hasParams = true;
    }
    
    if (page > 1) {
        url += hasParams ? `&page=${page}` : `?page=${page}`;
    }
    
    return await fetchVideoList(url);
}

async function loadPage(params = {}) {
    const baseUrl = params.url;
    const page = parseInt(params.page) || 1;
    const sortBy = params.sort_by;
    
    let url = baseUrl;
    let hasParams = false;
    
    if (sortBy) {
        url += `?sort=${sortBy}`;
        hasParams = true;
    }
    
    if (page > 1) {
        url += hasParams ? `&page=${page}` : `?page=${page}`;
    }
    
    return await fetchVideoList(url);
}

// 替换原来的 fetchVideoList
async function fetchVideoList(url) {
  // ---- 内置配置与工具（局部作用域，不污染全局）----
  const MISSAV_DOMAINS = ["missav.ai", "missav.ws", "missav.biz"]; // 可按需增减
  const MIN_HTML_SIZE  = 12000; // 小于此长度大概率是拦截页/占位页
  const BLOCK_PAT = /Just a moment|风控|Access Denied|Firewall|Forbidden|verify you are human|Cloudflare/i;

  const withDomain = (u, domain) => {
    try {
      const x = new URL(u, "https://missav.ai"); // 兼容相对路径
      x.hostname = domain;
      return x.toString();
    } catch {
      return String(u).replace(/^https?:\/\/[^/]+/i, "https://" + domain);
    }
  };

  const isBlocked = (html = "") => !html || html.length < MIN_HTML_SIZE || BLOCK_PAT.test(html);

  const buildTryList = (inputUrl) => {
    try {
      const u = new URL(inputUrl);
      const idx = MISSAV_DOMAINS.indexOf(u.hostname);
      if (idx >= 0) {
        const rest = MISSAV_DOMAINS.filter(d => d !== u.hostname);
        return [u.hostname, ...rest];
      }
    } catch {}
    return [...MISSAV_DOMAINS];
  };

  const commonHeaders = (refUrl) => {
    let referer = "https://missav.ai/";
    try { referer = new URL(refUrl).origin + "/"; } catch {}
    return {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "Connection": "keep-alive",
      "Referer": referer
    };
  };

  // ---- 实际请求：按域名轮换直到拿到正常页面 ---- 
  const domains = buildTryList(url);

  for (let i = 0; i < domains.length; i++) {
    const tryDomain = domains[i];
    const tryUrl    = withDomain(url, tryDomain);

    try {
      const resp = await Widget.http.get(tryUrl, {
        headers: commonHeaders(tryUrl),
        allow_redirects: true
      });

      const html = resp && resp.data ? String(resp.data) : "";

      if (isBlocked(html)) {
        if (i === domains.length - 1) {
          return [createPlaceholderItem("访问受限，建议更换网络或稍后重试")];
        }
        continue; // 换下一个域名
      }

      // 正常解析
      return parseVideoList(html);

    } catch (e) {
      if (i === domains.length - 1) {
        return [createPlaceholderItem("网络请求失败或被限制，请稍后重试")];
      }
      // 继续下一个域
    }
  }

  // 兜底（理论上到不了）
  return [createPlaceholderItem("访问受限，稍后重试")];
}

function createPlaceholderItem(message = "已被风控，请稍后重试") {
    return {
        id: "content-placeholder",
        type: "placeholder",
        title: "🚫 " + message,
        backdropPath: "https://via.placeholder.com/400x225/FF6B6B/FFFFFF?text=%E5%B7%B2%E8%A2%AB%E9%A3%8E%E6%8E%A7",
        mediaType: "placeholder",
        duration: 0,
        durationText: "⚠️ 访问受限",
        previewUrl: "",
        videoUrl: "",
        link: "",
        description: "🔒 " + message + "\n\n💡 可能的解决方案：\n• 等待一段时间后重新尝试\n• 检查网络连接\n• 更换网络环境\n• 稍后再试",
        playerType: "none"
    };
}

function parseVideoList(html) {
    const $ = Widget.html.load(html);
    const videos = [];
    
    $('a[href]').each((index, element) => {
        const $link = $(element);
        const href = $link.attr('href') || '';
        const $img = $link.find('img').first();
        
        if ($img.length && href.match(/\/cn\/[a-zA-Z0-9\-]+(-uncensored-leak)?$/)) {
            const imgSrc = $img.attr('data-src') || $img.attr('src');
            
            if (imgSrc) {
                let title = $link.attr('title') || $img.attr('alt') || '';
                
                if (!title) {
                    const $parent = $link.closest('div');
                    title = $parent.find('h1, h2, h3, .title, [class*="title"]').first().text().trim();
                }
                
                if (!title) {
                    title = $link.text().trim();
                }
                
                const videoId = extractVideoId(href);
                const fullVideoUrl = href.startsWith('http') ? href : `https://missav.ai${href}`;
                const horizontalCoverUrl = `https://fourhoi.com/${videoId}/cover-t.jpg`;
                let videoCode = videoId.toUpperCase().replace('-CHINESE-SUBTITLE', '').replace('-UNCENSORED-LEAK', '');
                
                if (title && !title.match(/[A-Z]+-\d+/)) {
                    title = `${videoCode} ${title}`;
                } else if (!title) {
                    title = videoCode;
                }
                
                videos.push({
                    id: fullVideoUrl,
                    type: "url",
                    title: title || `${videoCode}`,
                    backdropPath: horizontalCoverUrl,
                    mediaType: "movie",
                    duration: 0,
                    durationText: "",
                    previewUrl: "",
                    videoUrl: "",
                    link: fullVideoUrl,
                    description: `番号: ${videoCode}`,
                    playerType: "system"
                });
            }
        }
    });
    
    if (videos.length === 0) {
        return [createPlaceholderItem()];
    }
    
    return videos;
}

function extractVideoId(url) {
    const matches = url.match(/\/cn\/([a-zA-Z0-9\-]+)(-uncensored-leak)?$/);
    return matches ? matches[1] : url.split('/').pop();
}

function extractVideoCodeFromTitle(title) {
    if (!title) return null;
    const match = title.match(/^([A-Za-z]+-?\d+)/i);
    return match ? match[1] : null;
}

function extractVideoCodeFromDescription(description) {
    if (!description) return null;
    const match = description.match(/番号:\s*([A-Za-z]+-?\d+)/i);
    return match ? match[1] : null;
}

async function loadDetail(link) {
    try {
        const response = await Widget.http.get(link, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                "Accept-Encoding": "gzip, deflate, br",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
                "Upgrade-Insecure-Requests": "1",
                "DNT": "1",
                "Referer": "https://missav.ai/",
                "Connection": "keep-alive"
            },
            allow_redirects: true
        });

        const videoId = extractVideoId(link);
        const videoCode = videoId.toUpperCase().replace('-CHINESE-SUBTITLE', '').replace('-UNCENSORED-LEAK', '');

        if (!response || !response.data || response.data.includes('Just a moment') || response.data.length < 50000) {
            return {
                id: link,
                type: "detail",
                videoUrl: link,
                title: `${videoCode}`,
                description: `番号: ${videoCode}`,
                posterPath: "",
                backdropPath: `https://fourhoi.com/${videoId}/cover-t.jpg`,
                mediaType: "movie",
                duration: 0,
                durationText: "",
                previewUrl: "",
                playerType: "system",
                link: link
            };
        }

        const $ = Widget.html.load(response.data);
        
        let title = $('meta[property="og:title"]').attr('content') || '';
        if (!title) {
            title = $('h1').first().text().trim();
        }
        if (!title) {
            title = $('title').text().replace(/\s*-\s*MissAV.*$/i, '').trim();
        }
        
        let videoUrl = "";
        $('script').each((index, element) => {
            const scriptContent = $(element).html() || "";
            if (scriptContent.includes('surrit.com') && scriptContent.includes('.m3u8')) {
                const surritMatches = scriptContent.match(/https:\/\/surrit\.com\/[a-f0-9\-]+\/[^"'\s]*\.m3u8/g);
                if (surritMatches && surritMatches.length > 0) {
                    videoUrl = surritMatches[0];
                    return false;
                }
            }
            if (!videoUrl && scriptContent.includes('eval(function')) {
                const uuidMatches = scriptContent.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g);
                if (uuidMatches && uuidMatches.length > 0) {
                    videoUrl = `https://surrit.com/${uuidMatches[0]}/playlist.m3u8`;
                }
            }
        });
        
        return {
            id: link,
            type: "detail",
            videoUrl: videoUrl || link,
            title: title || `${videoCode}`,
            description: `番号: ${videoCode}`,
            posterPath: "",
            backdropPath: `https://fourhoi.com/${videoId}/cover-t.jpg`,
            mediaType: "movie",
            duration: 0,
            durationText: "",
            previewUrl: "",
            playerType: "system",
            link: link,
            customHeaders: videoUrl ? {
                "Referer": link,
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15"
            } : undefined
        };
        
    } catch (error) {
        const videoId = extractVideoId(link);
        const videoCode = videoId.toUpperCase().replace('-CHINESE-SUBTITLE', '').replace('-UNCENSORED-LEAK', '');
        
        return {
            id: link,
            type: "detail",
            videoUrl: link,
            title: `${videoCode}`,
            description: `番号: ${videoCode}`,
            posterPath: "",
            backdropPath: `https://fourhoi.com/${videoId}/cover-t.jpg`,
            mediaType: "movie",
            duration: 0,
            durationText: "",
            previewUrl: "",
            playerType: "system",
            link: link
        };
    }
}