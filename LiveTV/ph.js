WidgetMetadata = {
    id: "Pornhub",
    title: "Pornhub",
    version: "1.0.5",
    requiredVersion: "0.0.1",
    description: "在线观看Pornhub",
    author: "海带",
    site: "https://github.com/Madai-v/ForwardWidgets",
    detailCacheDuration: 1200,
    modules: [
        {
            id: "searchKeyword",
            title: "🔍 全站搜索",
            functionName: "getSearchResults",
            cacheDuration: 180,
            params: [
                {
                    name: "search_query",
                    title: "搜索关键词",
                    type: "input",
                    description: "请输入要搜索的关键词",
                    value: ""
                },
                {
                    name: "search_type",
                    title: "是否开启精准搜索（作者名或视频标题 包含/等于 关键词）",
                    type: "enumeration",
                    description: "是否开启精准搜索",
                    value: "",
                    enumOptions: [
                        { title: "关闭", value: "no" },
                        { title: "开启", value: "yes" },

                    ]
                },
                {
                    name: "sort_by",
                    title: "排序方式",
                    type: "enumeration",
                    description: "视频排序方式",
                    value: "",
                    enumOptions: [
                        { title: "最相关", value: "" },
                        { title: "最新发布", value: "new" },
                        { title: "最多播放", value: "views" },
                        { title: "最高评分", value: "rating" }
                    ]
                },
                {
                    name: "page",
                    title: "页码",
                    type: "page",
                    description: "页码",
                    value: "1"
                }
            ]
        },
        {
            id: "favorites",
            title: "❤️ 我的最爱",
            functionName: "getFavorites",
            cacheDuration: 180,
            params: [
                {
                    name: "username",
                    title: "用户名",
                    type: "input",
                    description: "填入你的Pornhub用户名",
                    value: "",
                    placeholders: [
                        {
                            title: "示例用户",
                            value: "watchadog"
                        }
                    ]
                },
                {
                    name: "page",
                    title: "页码",
                    type: "page",
                    description: "页码",
                    value: "1"
                },
                {
                    name: "sort_by",
                    title: "排序方式",
                    type: "enumeration",
                    description: "排序方式",
                    value: "new",
                    enumOptions: [
                        {
                            title: "最新发布",
                            value: "new"
                        },
                        {
                            title: "最多播放",
                            value: "views"
                        },
                        {
                            title: "最高评分",
                            value: "rating"
                        }
                    ]
                }
            ]
        },
        {
            id: "searchUser",
            title: "​🌟 优选艺人",
            functionName: "getUserUploads",
            cacheDuration: 300,
            params: [
                {
                    name: "username",
                    title: "艺人名称",
                    type: "enumeration",
                    description: "支持全部类型",
                    belongTo: {
                        paramName: "sort_by",
                        value: ["new", "views", "rating"],
                    },
                    enumOptions: [{ 'title': 'HongKongDoll', 'value': 'HongKongDoll' }, { title: '麻豆传媒', value: 'asiam' }, { title: '麻豆-LiRongRong', value: 'Li Rong Rong' }, { 'title': 'Cabbage Sweety', 'value': 'Cabbage Sweety' }, { 'title': 'Lindainlove', 'value': 'Lindainlove' }, { 'title': 'SweetieYico', 'value': 'SweetieYico' }, { 'title': 'june liu', 'value': 'june liu' }, { 'title': 'wanrous', 'value': 'wanrous' }, { 'title': '77bandage', 'value': '77bandage' }, { 'title': 'youyou', 'value': 'youyou' }, { 'title': 'manachanx', 'value': 'manachanx' }, { title: 'lindainlove', value: 'lindainlove' }, { title: 'Karesi ni Baretara Kaisan', value: 'Karesi ni Baretara Kaisan' }, { title: 'k production film', value: 'k production film' }, { 'title': '798DS', 'value': '798DS' }, { 'title': 'aiwanxiongxiong', 'value': 'aiwanxiongxiong' }, { 'title': 'andmlove', 'value': 'andmlove' }, { 'title': 'ano ano chan', 'value': 'ano ano chan' }, { 'title': 'bibi Fluffy', 'value': 'bibi Fluffy' }, { 'title': 'CandyKissVip', 'value': 'CandyKissVip' }, { 'title': 'Chinese Bunny', 'value': 'Chinese Bunny' }, { 'title': 'DemiFairyTW', 'value': 'DemiFairyTW' }, { 'title': 'Elle Lee', 'value': 'Elle Lee' }, { 'title': 'Eve', 'value': 'Eve' }, { 'title': 'fortunecutie', 'value': 'fortunecutie' }, { 'title': 'LIs Evans', 'value': 'LIs Evans' }, { 'title': 'loliiiiipop99', 'value': 'loliiiiipop99' }, { 'title': 'Makissse', 'value': 'Makissse' }, { 'title': 'nan12138', 'value': 'nan12138' }, { 'title': 'Nana_taipei', 'value': 'Nana_taipei' }, { 'title': 'Nuomibaby', 'value': 'Nuomibaby' }, { 'title': 'papaxmama', 'value': 'papaxmama' }, { 'title': 'Qiobnxingcaiii', 'value': 'Qiobnxingcaiii' }, { 'title': 'SakuraCandy', 'value': 'SakuraCandy' }, { 'title': 'sskok16', 'value': 'sskok16' }, { 'title': 'SSR Peach', 'value': 'SSR Peach' }, { 'title': 'thelittlejuicer', 'value': 'thelittlejuicer' }, { 'title': 'TLMS_SVJ', 'value': 'TLMS_SVJ' }, { 'title': 'twtutu', 'value': 'twtutu' }, { 'title': 'Vita Won', 'value': 'Vita Won' }, { 'title': 'Yuqiao Chen', 'value': 'Yuqiao Chen' }, { 'title': 'YuzuKitty', 'value': 'YuzuKitty' }
                    ]
                },
                {
                    name: "sort_by",
                    title: "排序方式",
                    type: "enumeration",
                    description: "排序方式",
                    value: "new",
                    enumOptions: [
                        {
                            title: "最新发布",
                            value: "new"
                        },
                        {
                            title: "最多播放",
                            value: "views"
                        },
                        {
                            title: "最高评分",
                            value: "rating"
                        }
                    ]
                },
                {
                    name: "logo",
                    title: "标识符",
                    type: "constant",
                    description: "区分功能",
                    value: "yx",
                    type: "constant"
                },
                {
                    name: "page",
                    title: "页码",
                    type: "page",
                    description: "页码",
                    value: "1"
                }
            ]
        },
        {
            id: "premiumArtists",
            title: "👠 搜索艺人",
            functionName: "getUserUploads",
            cacheDuration: 300,
            params: [
                {
                    name: "user_type",
                    title: "艺人类型",
                    type: "enumeration",
                    description: "选择艺人类型",
                    value: "model",
                    enumOptions: [
                        { title: "模特", value: "model" },
                        { title: "频道", value: "channels" },
                        { title: "明星", value: "pornstar" }
                    ]
                },
                {
                    name: "username",
                    title: "艺人名称",
                    type: "input",
                    description: "支持全部类型",
                    value: ""
                },
                {
                    name: "sort_by",
                    title: "排序方式",
                    type: "enumeration",
                    description: "视频排序方式",
                    value: "new",
                    enumOptions: [
                        {
                            title: "最新发布",
                            value: "new"
                        },
                        {
                            title: "最多播放",
                            value: "views"
                        },
                        {
                            title: "最高评分",
                            value: "rating"
                        }
                    ]
                },
                {
                    name: "logo",
                    title: "标识符",
                    type: "constant",
                    description: "区分功能",
                    value: "ss",
                    type: "constant"
                },
                {
                    name: "page",
                    title: "页码",
                    type: "page",
                    description: "艺人视频页码",
                    value: "1"
                }
            ]
        },
        {
            id: "recommended",
            title: "🎬 推荐视频",
            functionName: "getRecommendedVideos",
            cacheDuration: 60,
            params: [
                {
                    name: "cookie",
                    title: "登录Cookie",
                    type: "input",
                    value: "",
                    description: "未填写情况下非个性化推荐，登录Pornhub推荐页获取"
                },
                {
                    name: "sort_by",
                    title: "推荐逻辑",
                    description: "默认最相关",
                    type: "enumeration",
                    value: "",
                    enumOptions: [
                        { title: "最相关", value: "" },
                        { title: "最新", value: "time" }
                    ]
                },
                {
                    name: "page",
                    title: "页码",
                    type: "page",
                    value: "1"
                }
            ]
        },
        {
            id: "languageVideos",
            title: "​🌐 语言筛选",
            functionName: "getVideosByLanguage",
            cacheDuration: 600,
            params: [
                {
                    name: "language",
                    title: "视频语言",
                    type: "enumeration",
                    value: "chinese",
                    description: "默认中文",
                    enumOptions: [
                        { title: "中文", value: "chinese" },
                        { title: "日语", value: "japanese" },
                        { title: "俄语", value: "russian" },
                        { title: "德语", value: "german" },
                        { title: "法语", value: "french" },
                        { title: "西班牙语", value: "spanish" },
                        { title: "荷兰语", value: "dutch" },
                        { title: "波兰语", value: "polish" },
                        { title: "捷克语", value: "czech" },
                        { title: "葡萄牙语", value: "portuguese" },

                    ]
                },
                {
                    name: "p",
                    title: "制作平台类型",
                    type: "enumeration",
                    description: "默认全部",
                    value: "",
                    enumOptions: [
                        { title: "全部", value: "" },
                        { title: "专业", value: "professional" },
                        { title: "自制", value: "homemade" }
                    ]
                },
                {
                    name: "hd",
                    title: "分辨率",
                    type: "enumeration",
                    description: "全部",
                    value: "",
                    enumOptions: [
                        { title: "全部", value: "" },
                        { title: "仅高清", value: "1" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "排序方式",
                    type: "enumeration",
                    description: "最新精选",
                    value: "",
                    enumOptions: [
                        { title: "最新精选", value: "" },
                        { title: "热播", value: "ht" },
                        { title: "最多观看", value: "mv" },
                        { title: "最高评分", value: "tr" },
                        { title: "最新视频", value: "cm" }
                    ]
                },
                {
                    name: "page",
                    title: "页码",
                    type: "page",
                    value: "1"
                }
            ]
        },
        {
            id: "hotVideos",
            title: "🔥 热播视频",
            functionName: "getVideos",
            cacheDuration: 600,
            params: [
                {
                    name: "pageType",
                    title: "区分页面类型",
                    description: "区分页面类型",
                    value: "ht",
                    type: "constant"
                },
                {
                    name: "p",
                    title: "出品类型",
                    type: "enumeration",
                    description: "全部",
                    value: "",
                    enumOptions: [
                        { title: "全部", value: "" },
                        { title: "专业", value: "professional" },
                        { title: "自制", value: "homemade" }
                    ]
                },
                {
                    name: "hd",
                    title: "分辨率",
                    description: "默认全部",
                    type: "enumeration",
                    value: "",
                    enumOptions: [
                        { title: "全部", value: "" },
                        { title: "仅高清", value: "1" }
                    ]
                },
                {
                    name: "c",
                    title: "视频类型",
                    type: "enumeration",
                    description: "筛选视频类型",
                    value: "",
                    enumOptions: [{ "title": "全部", "value": "" }, { "title": "已认证素人", "value": "138" }, { "title": "已认证模特", "value": "139" }, { "title": "亚洲人", "value": "1" }, { "title": "已认证情侣", "value": "482" }, { "title": "60帧", "value": "105" }, { "title": "大学", "value": "79" }, { "title": "18-25岁", "value": "teen" }, { "title": "韩国人", "value": "103" }, { "title": "日本人", "value": "111" }, { "title": "校园", "value": "88" }, { "title": "欧洲人", "value": "55" }, { "title": "英国人", "value": "96" }, { "title": "法国人", "value": "94" }, { "title": "浪漫", "value": "522" }, { "title": "女性自慰", "value": "492" }, { "title": "女性高潮", "value": "502" }, { "title": "3P", "value": "65" }, { "title": "Cosplay", "value": "241" }, { "title": "Gaming", "value": "881" }, { "title": "Podcast", "value": "891" }, { "title": "上班时观赏", "value": "221" }, { "title": "乱交群欢", "value": "2" }, { "title": "交互式", "value": "108" }, { "title": "佩戴式阳具", "value": "542" }, { "title": "俄国人", "value": "99" }, { "title": "公众野战", "value": "24" }, { "title": "内射中出", "value": "15" }, { "title": "内嵌字幕", "value": "732" }, { "title": "劲爆重口味", "value": "21" }, { "title": "卡通", "value": "86" }, { "title": "印度人", "value": "101" }, { "title": "双性恋男", "value": "76" }, { "title": "双龙入洞", "value": "72" }, { "title": "口交", "value": "13" }, { "title": "古典派", "value": "43" }, { "title": "合集", "value": "57" }, { "title": "名人", "value": "12" }, { "title": "大号美女", "value": "6" }, { "title": "女同", "value": "27" }, { "title": "娇妻偷吃", "value": "242" }, { "title": "射精", "value": "16" }, { "title": "巨乳", "value": "8" }, { "title": "巨屌", "value": "7" }, { "title": "巴西人", "value": "102" }, { "title": "德国人", "value": "95" }, { "title": "性玩具", "value": "23" }, { "title": "恋物癖", "value": "18" }, { "title": "恋足", "value": "93" }, { "title": "意大利人", "value": "97" }, { "title": "手交", "value": "20" }, { "title": "手淫", "value": "22" }, { "title": "抽烟", "value": "91" }, { "title": "拉丁裔美女", "value": "26" }, { "title": "拳交", "value": "19" }, { "title": "指交", "value": "592" }, { "title": "按摩", "value": "78" }, { "title": "捆绑", "value": "10" }, { "title": "捷克人", "value": "100" }, { "title": "搞笑", "value": "32" }, { "title": "撒尿", "value": "211" }, { "title": "深发女", "value": "11" }, { "title": "滑稽模仿", "value": "201" }, { "title": "潮吹", "value": "69" }, { "title": "火辣保姆", "value": "89" }, { "title": "熟女", "value": "28" }, { "title": "爆菊", "value": "35" }, { "title": "片场直击", "value": "141" }, { "title": "独家", "value": "115" }, { "title": "男同", "value": "63" }, { "title": "男性自慰", "value": "92" }, { "title": "真人实拍", "value": "31" }, { "title": "第一视角", "value": "41" }, { "title": "粗暴性爱", "value": "67" }, { "title": "素人", "value": "3" }, { "title": "红毛", "value": "42" }, { "title": "纹身女", "value": "562" }, { "title": "继家庭幻想", "value": "444" }, { "title": "老少欢", "value": "181" }, { "title": "聚会", "value": "53" }, { "title": "肌肉男", "value": "512" }, { "title": "肥臀", "value": "4" }, { "title": "脱衣舞", "value": "33" }, { "title": "自述视频", "value": "231" }, { "title": "舔屄", "value": "131" }, { "title": "色情日漫", "value": "36" }, { "title": "色情明星", "value": "30" }, { "title": "视频激情", "value": "61" }, { "title": "角色扮演", "value": "81" }, { "title": "试镜", "value": "90" }, { "title": "贫乳", "value": "59" }, { "title": "跨性别", "value": "83" }, { "title": "跨种族", "value": "25" }, { "title": "轮交", "value": "80" }, { "title": "辣妈", "value": "29" }, { "title": "金发女", "value": "9" }, { "title": "阿拉伯人", "value": "98" }, { "title": "集体颜射", "value": "14" }, { "title": "音乐", "value": "121" }, { "title": "风情少女", "value": "5" }, { "title": "高清色情片", "value": "38" }, { "title": "黑人女", "value": "17" }
                    ]
                },
                {
                    name: "country",
                    title: "国家/地区",
                    type: "enumeration",
                    description: "选择国家或地区",
                    value: "world",
                    enumOptions: [{ title: "全球", value: "world" }, { title: "日本", value: "jp" }, { title: "韩国", value: "kr" }, { title: "美国", value: "us" }, { title: "英国", value: "gb" }, { title: "法国", value: "fr" }, { title: "德国", value: "de" }, { title: "澳大利亚", value: "au" }, { title: "俄罗斯", value: "ru" }, { title: "塞尔维亚", value: "rs" }, { title: "丹麦", value: "dk" }, { title: "阿根廷", value: "ar" }, { title: "奥地利", value: "at" }, { title: "比利时", value: "be" }, { title: "巴西", value: "br" }, { title: "保加利亚", value: "bg" }, { title: "加拿大", value: "ca" }, { title: "智利", value: "cl" }, { title: "克罗地亚", value: "hr" }, { title: "捷克", value: "cz" }, { title: "埃及", value: "eg" }, { title: "芬兰", value: "fi" }, { title: "希腊", value: "gr" }, { title: "匈牙利", value: "hu" }, { title: "印度", value: "in" }, { title: "爱尔兰", value: "ie" }, { title: "以色列", value: "il" }, { title: "意大利", value: "it" }, { title: "墨西哥", value: "mx" }, { title: "摩洛哥", value: "ma" }, { title: "荷兰", value: "nl" }, { title: "新西兰", value: "nz" }, { title: "挪威", value: "no" }, { title: "巴基斯坦", value: "pk" }, { title: "波兰", value: "pl" }, { title: "葡萄牙", value: "pt" }, { title: "罗马尼亚", value: "ro" }, { title: "斯洛伐克", value: "sk" }, { title: "西班牙", value: "es" }, { title: "瑞典", value: "se" }, { title: "瑞士", value: "ch" }, { title: "乌克兰", value: "ua" }
                    ]
                },
                {
                    name: "page",
                    title: "页码",
                    type: "page",
                    description: "热门视频页码",
                    value: "1"
                }
            ]
        },
        {
            id: "topViews",
            title: "👀 最多观看",
            functionName: "getVideos",
            cacheDuration: 600,
            params: [
                {
                    name: "pageType",
                    title: "区分页面类型",
                    description: "区分页面类型",
                    value: "mv",
                    type: "constant"
                },
                {
                    name: "p",
                    title: "出品类型",
                    type: "enumeration",
                    value: "",
                    enumOptions: [
                        { title: "全部", value: "" },
                        { title: "专业", value: "professional" },
                        { title: "自制", value: "homemade" }
                    ]
                },
                {
                    name: "hd",
                    title: "分辨率",
                    description: "默认全部",
                    type: "enumeration",
                    value: "",
                    enumOptions: [
                        { title: "全部", value: "" },
                        { title: "仅高清", value: "1" }
                    ]
                },
                {
                    name: "c",
                    title: "视频类型",
                    type: "enumeration",
                    description: "筛选视频类型",
                    value: "",
                    enumOptions: [{ "title": "全部", "value": "" }, { "title": "已认证素人", "value": "138" }, { "title": "已认证模特", "value": "139" }, { "title": "亚洲人", "value": "1" }, { "title": "已认证情侣", "value": "482" }, { "title": "60帧", "value": "105" }, { "title": "大学", "value": "79" }, { "title": "18-25岁", "value": "teen" }, { "title": "韩国人", "value": "103" }, { "title": "日本人", "value": "111" }, { "title": "校园", "value": "88" }, { "title": "欧洲人", "value": "55" }, { "title": "英国人", "value": "96" }, { "title": "法国人", "value": "94" }, { "title": "浪漫", "value": "522" }, { "title": "女性自慰", "value": "492" }, { "title": "女性高潮", "value": "502" }, { "title": "3P", "value": "65" }, { "title": "Cosplay", "value": "241" }, { "title": "Gaming", "value": "881" }, { "title": "Podcast", "value": "891" }, { "title": "上班时观赏", "value": "221" }, { "title": "乱交群欢", "value": "2" }, { "title": "交互式", "value": "108" }, { "title": "佩戴式阳具", "value": "542" }, { "title": "俄国人", "value": "99" }, { "title": "公众野战", "value": "24" }, { "title": "内射中出", "value": "15" }, { "title": "内嵌字幕", "value": "732" }, { "title": "劲爆重口味", "value": "21" }, { "title": "卡通", "value": "86" }, { "title": "印度人", "value": "101" }, { "title": "双性恋男", "value": "76" }, { "title": "双龙入洞", "value": "72" }, { "title": "口交", "value": "13" }, { "title": "古典派", "value": "43" }, { "title": "合集", "value": "57" }, { "title": "名人", "value": "12" }, { "title": "大号美女", "value": "6" }, { "title": "女同", "value": "27" }, { "title": "娇妻偷吃", "value": "242" }, { "title": "射精", "value": "16" }, { "title": "巨乳", "value": "8" }, { "title": "巨屌", "value": "7" }, { "title": "巴西人", "value": "102" }, { "title": "德国人", "value": "95" }, { "title": "性玩具", "value": "23" }, { "title": "恋物癖", "value": "18" }, { "title": "恋足", "value": "93" }, { "title": "意大利人", "value": "97" }, { "title": "手交", "value": "20" }, { "title": "手淫", "value": "22" }, { "title": "抽烟", "value": "91" }, { "title": "拉丁裔美女", "value": "26" }, { "title": "拳交", "value": "19" }, { "title": "指交", "value": "592" }, { "title": "按摩", "value": "78" }, { "title": "捆绑", "value": "10" }, { "title": "捷克人", "value": "100" }, { "title": "搞笑", "value": "32" }, { "title": "撒尿", "value": "211" }, { "title": "深发女", "value": "11" }, { "title": "滑稽模仿", "value": "201" }, { "title": "潮吹", "value": "69" }, { "title": "火辣保姆", "value": "89" }, { "title": "熟女", "value": "28" }, { "title": "爆菊", "value": "35" }, { "title": "片场直击", "value": "141" }, { "title": "独家", "value": "115" }, { "title": "男同", "value": "63" }, { "title": "男性自慰", "value": "92" }, { "title": "真人实拍", "value": "31" }, { "title": "第一视角", "value": "41" }, { "title": "粗暴性爱", "value": "67" }, { "title": "素人", "value": "3" }, { "title": "红毛", "value": "42" }, { "title": "纹身女", "value": "562" }, { "title": "继家庭幻想", "value": "444" }, { "title": "老少欢", "value": "181" }, { "title": "聚会", "value": "53" }, { "title": "肌肉男", "value": "512" }, { "title": "肥臀", "value": "4" }, { "title": "脱衣舞", "value": "33" }, { "title": "自述视频", "value": "231" }, { "title": "舔屄", "value": "131" }, { "title": "色情日漫", "value": "36" }, { "title": "色情明星", "value": "30" }, { "title": "视频激情", "value": "61" }, { "title": "角色扮演", "value": "81" }, { "title": "试镜", "value": "90" }, { "title": "贫乳", "value": "59" }, { "title": "跨性别", "value": "83" }, { "title": "跨种族", "value": "25" }, { "title": "轮交", "value": "80" }, { "title": "辣妈", "value": "29" }, { "title": "金发女", "value": "9" }, { "title": "阿拉伯人", "value": "98" }, { "title": "集体颜射", "value": "14" }, { "title": "音乐", "value": "121" }, { "title": "风情少女", "value": "5" }, { "title": "高清色情片", "value": "38" }, { "title": "黑人女", "value": "17" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "时间范围",
                    type: "enumeration",
                    description: "选择统计时间范围",
                    value: "", // 默认值为空，对应每周统计
                    enumOptions: [
                        { title: "每周", value: "" },
                        { title: "每天", value: "t" },
                        { title: "每月", value: "m" },
                        { title: "每年", value: "y" },
                        { title: "迄今为止", value: "a" }
                    ]
                },
                {
                    name: "country",
                    title: "国家/地区",
                    type: "enumeration",
                    description: "选择国家或地区",
                    value: "world",
                    enumOptions: [{ title: "全球", value: "world" }, { title: "日本", value: "jp" }, { title: "韩国", value: "kr" }, { title: "美国", value: "us" }, { title: "英国", value: "gb" }, { title: "法国", value: "fr" }, { title: "德国", value: "de" }, { title: "澳大利亚", value: "au" }, { title: "俄罗斯", value: "ru" }, { title: "塞尔维亚", value: "rs" }, { title: "丹麦", value: "dk" }, { title: "阿根廷", value: "ar" }, { title: "奥地利", value: "at" }, { title: "比利时", value: "be" }, { title: "巴西", value: "br" }, { title: "保加利亚", value: "bg" }, { title: "加拿大", value: "ca" }, { title: "智利", value: "cl" }, { title: "克罗地亚", value: "hr" }, { title: "捷克", value: "cz" }, { title: "埃及", value: "eg" }, { title: "芬兰", value: "fi" }, { title: "希腊", value: "gr" }, { title: "匈牙利", value: "hu" }, { title: "印度", value: "in" }, { title: "爱尔兰", value: "ie" }, { title: "以色列", value: "il" }, { title: "意大利", value: "it" }, { title: "墨西哥", value: "mx" }, { title: "摩洛哥", value: "ma" }, { title: "荷兰", value: "nl" }, { title: "新西兰", value: "nz" }, { title: "挪威", value: "no" }, { title: "巴基斯坦", value: "pk" }, { title: "波兰", value: "pl" }, { title: "葡萄牙", value: "pt" }, { title: "罗马尼亚", value: "ro" }, { title: "斯洛伐克", value: "sk" }, { title: "西班牙", value: "es" }, { title: "瑞典", value: "se" }, { title: "瑞士", value: "ch" }, { title: "乌克兰", value: "ua" }
                    ]
                },
                {
                    name: "page",
                    title: "页码",
                    type: "page",
                    description: "热门视频页码",
                    value: "1"
                }
            ]
        },
        {
            id: "maxRating",
            title: "​🏆 最高评分",
            functionName: "getVideos", // 使用相同的getVideos函数
            cacheDuration: 600,
            params: [
                {
                    name: "pageType",
                    title: "区分页面类型",
                    description: "区分页面类型",
                    value: "tr", // 对应最高评分页面
                    type: "constant"
                },
                {
                    name: "p",
                    title: "出品类型",
                    type: "enumeration",
                    value: "",
                    enumOptions: [
                        { title: "全部", value: "" },
                        { title: "专业", value: "professional" },
                        { title: "自制", value: "homemade" }
                    ]
                },
                {
                    name: "hd",
                    title: "分辨率",
                    description: "默认全部",
                    type: "enumeration",
                    value: "",
                    enumOptions: [
                        { title: "全部", value: "" },
                        { title: "仅高清", value: "1" }
                    ]
                },
                {
                    name: "c",
                    title: "视频类型",
                    type: "enumeration",
                    description: "筛选视频类型",
                    value: "",
                    enumOptions: [{ "title": "全部", "value": "" }, { "title": "已认证素人", "value": "138" }, { "title": "已认证模特", "value": "139" }, { "title": "亚洲人", "value": "1" }, { "title": "已认证情侣", "value": "482" }, { "title": "60帧", "value": "105" }, { "title": "大学", "value": "79" }, { "title": "18-25岁", "value": "teen" }, { "title": "韩国人", "value": "103" }, { "title": "日本人", "value": "111" }, { "title": "校园", "value": "88" }, { "title": "欧洲人", "value": "55" }, { "title": "英国人", "value": "96" }, { "title": "法国人", "value": "94" }, { "title": "浪漫", "value": "522" }, { "title": "女性自慰", "value": "492" }, { "title": "女性高潮", "value": "502" }, { "title": "3P", "value": "65" }, { "title": "Cosplay", "value": "241" }, { "title": "Gaming", "value": "881" }, { "title": "Podcast", "value": "891" }, { "title": "上班时观赏", "value": "221" }, { "title": "乱交群欢", "value": "2" }, { "title": "交互式", "value": "108" }, { "title": "佩戴式阳具", "value": "542" }, { "title": "俄国人", "value": "99" }, { "title": "公众野战", "value": "24" }, { "title": "内射中出", "value": "15" }, { "title": "内嵌字幕", "value": "732" }, { "title": "劲爆重口味", "value": "21" }, { "title": "卡通", "value": "86" }, { "title": "印度人", "value": "101" }, { "title": "双性恋男", "value": "76" }, { "title": "双龙入洞", "value": "72" }, { "title": "口交", "value": "13" }, { "title": "古典派", "value": "43" }, { "title": "合集", "value": "57" }, { "title": "名人", "value": "12" }, { "title": "大号美女", "value": "6" }, { "title": "女同", "value": "27" }, { "title": "娇妻偷吃", "value": "242" }, { "title": "射精", "value": "16" }, { "title": "巨乳", "value": "8" }, { "title": "巨屌", "value": "7" }, { "title": "巴西人", "value": "102" }, { "title": "德国人", "value": "95" }, { "title": "性玩具", "value": "23" }, { "title": "恋物癖", "value": "18" }, { "title": "恋足", "value": "93" }, { "title": "意大利人", "value": "97" }, { "title": "手交", "value": "20" }, { "title": "手淫", "value": "22" }, { "title": "抽烟", "value": "91" }, { "title": "拉丁裔美女", "value": "26" }, { "title": "拳交", "value": "19" }, { "title": "指交", "value": "592" }, { "title": "按摩", "value": "78" }, { "title": "捆绑", "value": "10" }, { "title": "捷克人", "value": "100" }, { "title": "搞笑", "value": "32" }, { "title": "撒尿", "value": "211" }, { "title": "深发女", "value": "11" }, { "title": "滑稽模仿", "value": "201" }, { "title": "潮吹", "value": "69" }, { "title": "火辣保姆", "value": "89" }, { "title": "熟女", "value": "28" }, { "title": "爆菊", "value": "35" }, { "title": "片场直击", "value": "141" }, { "title": "独家", "value": "115" }, { "title": "男同", "value": "63" }, { "title": "男性自慰", "value": "92" }, { "title": "真人实拍", "value": "31" }, { "title": "第一视角", "value": "41" }, { "title": "粗暴性爱", "value": "67" }, { "title": "素人", "value": "3" }, { "title": "红毛", "value": "42" }, { "title": "纹身女", "value": "562" }, { "title": "继家庭幻想", "value": "444" }, { "title": "老少欢", "value": "181" }, { "title": "聚会", "value": "53" }, { "title": "肌肉男", "value": "512" }, { "title": "肥臀", "value": "4" }, { "title": "脱衣舞", "value": "33" }, { "title": "自述视频", "value": "231" }, { "title": "舔屄", "value": "131" }, { "title": "色情日漫", "value": "36" }, { "title": "色情明星", "value": "30" }, { "title": "视频激情", "value": "61" }, { "title": "角色扮演", "value": "81" }, { "title": "试镜", "value": "90" }, { "title": "贫乳", "value": "59" }, { "title": "跨性别", "value": "83" }, { "title": "跨种族", "value": "25" }, { "title": "轮交", "value": "80" }, { "title": "辣妈", "value": "29" }, { "title": "金发女", "value": "9" }, { "title": "阿拉伯人", "value": "98" }, { "title": "集体颜射", "value": "14" }, { "title": "音乐", "value": "121" }, { "title": "风情少女", "value": "5" }, { "title": "高清色情片", "value": "38" }, { "title": "黑人女", "value": "17" }
                    ]

                },
                {
                    name: "sort_by",
                    title: "时间范围",
                    type: "enumeration",
                    description: "选择统计时间范围",
                    value: "", // 默认值为空，对应每月统计
                    enumOptions: [
                        { title: "每月", value: "" },
                        { title: "每天", value: "t" },
                        { title: "每周", value: "w" },
                        { title: "每年", value: "y" },
                        { title: "迄今为止", value: "a" }
                    ]
                },
                {
                    name: "page",
                    title: "页码",
                    type: "page",
                    description: "最高评分视频页码",
                    value: "1"
                }
            ]
        },
        {
            id: "latestFeatured",
            title: "💎 最新精选",
            functionName: "getVideos",
            cacheDuration: 600,
            params: [
                {
                    name: "c",
                    title: "视频类型",
                    type: "enumeration",
                    value: "",
                    enumOptions: [{ "title": "全部", "value": "" }, { "title": "已认证素人", "value": "138" }, { "title": "已认证模特", "value": "139" }, { "title": "亚洲人", "value": "1" }, { "title": "已认证情侣", "value": "482" }, { "title": "60帧", "value": "105" }, { "title": "大学", "value": "79" }, { "title": "18-25岁", "value": "teen" }, { "title": "韩国人", "value": "103" }, { "title": "日本人", "value": "111" }, { "title": "校园", "value": "88" }, { "title": "欧洲人", "value": "55" }, { "title": "英国人", "value": "96" }, { "title": "法国人", "value": "94" }, { "title": "浪漫", "value": "522" }, { "title": "女性自慰", "value": "492" }, { "title": "女性高潮", "value": "502" }, { "title": "3P", "value": "65" }, { "title": "Cosplay", "value": "241" }, { "title": "Gaming", "value": "881" }, { "title": "Podcast", "value": "891" }, { "title": "上班时观赏", "value": "221" }, { "title": "乱交群欢", "value": "2" }, { "title": "交互式", "value": "108" }, { "title": "佩戴式阳具", "value": "542" }, { "title": "俄国人", "value": "99" }, { "title": "公众野战", "value": "24" }, { "title": "内射中出", "value": "15" }, { "title": "内嵌字幕", "value": "732" }, { "title": "劲爆重口味", "value": "21" }, { "title": "卡通", "value": "86" }, { "title": "印度人", "value": "101" }, { "title": "双性恋男", "value": "76" }, { "title": "双龙入洞", "value": "72" }, { "title": "口交", "value": "13" }, { "title": "古典派", "value": "43" }, { "title": "合集", "value": "57" }, { "title": "名人", "value": "12" }, { "title": "大号美女", "value": "6" }, { "title": "女同", "value": "27" }, { "title": "娇妻偷吃", "value": "242" }, { "title": "射精", "value": "16" }, { "title": "巨乳", "value": "8" }, { "title": "巨屌", "value": "7" }, { "title": "巴西人", "value": "102" }, { "title": "德国人", "value": "95" }, { "title": "性玩具", "value": "23" }, { "title": "恋物癖", "value": "18" }, { "title": "恋足", "value": "93" }, { "title": "意大利人", "value": "97" }, { "title": "手交", "value": "20" }, { "title": "手淫", "value": "22" }, { "title": "抽烟", "value": "91" }, { "title": "拉丁裔美女", "value": "26" }, { "title": "拳交", "value": "19" }, { "title": "指交", "value": "592" }, { "title": "按摩", "value": "78" }, { "title": "捆绑", "value": "10" }, { "title": "捷克人", "value": "100" }, { "title": "搞笑", "value": "32" }, { "title": "撒尿", "value": "211" }, { "title": "深发女", "value": "11" }, { "title": "滑稽模仿", "value": "201" }, { "title": "潮吹", "value": "69" }, { "title": "火辣保姆", "value": "89" }, { "title": "熟女", "value": "28" }, { "title": "爆菊", "value": "35" }, { "title": "片场直击", "value": "141" }, { "title": "独家", "value": "115" }, { "title": "男同", "value": "63" }, { "title": "男性自慰", "value": "92" }, { "title": "真人实拍", "value": "31" }, { "title": "第一视角", "value": "41" }, { "title": "粗暴性爱", "value": "67" }, { "title": "素人", "value": "3" }, { "title": "红毛", "value": "42" }, { "title": "纹身女", "value": "562" }, { "title": "继家庭幻想", "value": "444" }, { "title": "老少欢", "value": "181" }, { "title": "聚会", "value": "53" }, { "title": "肌肉男", "value": "512" }, { "title": "肥臀", "value": "4" }, { "title": "脱衣舞", "value": "33" }, { "title": "自述视频", "value": "231" }, { "title": "舔屄", "value": "131" }, { "title": "色情日漫", "value": "36" }, { "title": "色情明星", "value": "30" }, { "title": "视频激情", "value": "61" }, { "title": "角色扮演", "value": "81" }, { "title": "试镜", "value": "90" }, { "title": "贫乳", "value": "59" }, { "title": "跨性别", "value": "83" }, { "title": "跨种族", "value": "25" }, { "title": "轮交", "value": "80" }, { "title": "辣妈", "value": "29" }, { "title": "金发女", "value": "9" }, { "title": "阿拉伯人", "value": "98" }, { "title": "集体颜射", "value": "14" }, { "title": "音乐", "value": "121" }, { "title": "风情少女", "value": "5" }, { "title": "高清色情片", "value": "38" }, { "title": "黑人女", "value": "17" }
                    ]
                },
                {
                    name: "p",
                    title: "出品类型",
                    type: "enumeration",
                    value: "",
                    enumOptions: [
                        { title: "全部", value: "" },
                        { title: "专业", value: "professional" },
                        { title: "自制", value: "homemade" }
                    ]
                },
                {
                    name: "hd",
                    title: "分辨率",
                    type: "enumeration",
                    value: "",
                    enumOptions: [
                        { title: "全部", value: "" },
                        { title: "仅高清", value: "1" }
                    ]
                },
                {
                    name: "page",
                    title: "页码",
                    type: "page",
                    value: "1"
                }
            ]
        },
        {
            id: "newVideos",
            title: "​🆕 最新视频",
            functionName: "getVideos",
            cacheDuration: 600,
            params: [
                {
                    name: "pageType",
                    title: "页面类型",
                    value: "cm",
                    type: "constant"
                },
                {
                    name: "p",
                    title: "出品类型",
                    type: "enumeration",
                    value: "",
                    enumOptions: [
                        { title: "全部", value: "" },
                        { title: "专业", value: "professional" },
                        { title: "自制", value: "homemade" }
                    ]
                },
                {
                    name: "hd",
                    title: "分辨率",
                    type: "enumeration",
                    value: "",
                    enumOptions: [
                        { title: "全部", value: "" },
                        { title: "仅高清", value: "1" }
                    ]
                },
                {
                    name: "c",
                    title: "视频类型",
                    type: "enumeration",
                    value: "",
                    enumOptions: [{ "title": "全部", "value": "" }, { "title": "已认证素人", "value": "138" }, { "title": "已认证模特", "value": "139" }, { "title": "亚洲人", "value": "1" }, { "title": "已认证情侣", "value": "482" }, { "title": "60帧", "value": "105" }, { "title": "大学", "value": "79" }, { "title": "18-25岁", "value": "teen" }, { "title": "韩国人", "value": "103" }, { "title": "日本人", "value": "111" }, { "title": "校园", "value": "88" }, { "title": "欧洲人", "value": "55" }, { "title": "英国人", "value": "96" }, { "title": "法国人", "value": "94" }, { "title": "浪漫", "value": "522" }, { "title": "女性自慰", "value": "492" }, { "title": "女性高潮", "value": "502" }, { "title": "3P", "value": "65" }, { "title": "Cosplay", "value": "241" }, { "title": "Gaming", "value": "881" }, { "title": "Podcast", "value": "891" }, { "title": "上班时观赏", "value": "221" }, { "title": "乱交群欢", "value": "2" }, { "title": "交互式", "value": "108" }, { "title": "佩戴式阳具", "value": "542" }, { "title": "俄国人", "value": "99" }, { "title": "公众野战", "value": "24" }, { "title": "内射中出", "value": "15" }, { "title": "内嵌字幕", "value": "732" }, { "title": "劲爆重口味", "value": "21" }, { "title": "卡通", "value": "86" }, { "title": "印度人", "value": "101" }, { "title": "双性恋男", "value": "76" }, { "title": "双龙入洞", "value": "72" }, { "title": "口交", "value": "13" }, { "title": "古典派", "value": "43" }, { "title": "合集", "value": "57" }, { "title": "名人", "value": "12" }, { "title": "大号美女", "value": "6" }, { "title": "女同", "value": "27" }, { "title": "娇妻偷吃", "value": "242" }, { "title": "射精", "value": "16" }, { "title": "巨乳", "value": "8" }, { "title": "巨屌", "value": "7" }, { "title": "巴西人", "value": "102" }, { "title": "德国人", "value": "95" }, { "title": "性玩具", "value": "23" }, { "title": "恋物癖", "value": "18" }, { "title": "恋足", "value": "93" }, { "title": "意大利人", "value": "97" }, { "title": "手交", "value": "20" }, { "title": "手淫", "value": "22" }, { "title": "抽烟", "value": "91" }, { "title": "拉丁裔美女", "value": "26" }, { "title": "拳交", "value": "19" }, { "title": "指交", "value": "592" }, { "title": "按摩", "value": "78" }, { "title": "捆绑", "value": "10" }, { "title": "捷克人", "value": "100" }, { "title": "搞笑", "value": "32" }, { "title": "撒尿", "value": "211" }, { "title": "深发女", "value": "11" }, { "title": "滑稽模仿", "value": "201" }, { "title": "潮吹", "value": "69" }, { "title": "火辣保姆", "value": "89" }, { "title": "熟女", "value": "28" }, { "title": "爆菊", "value": "35" }, { "title": "片场直击", "value": "141" }, { "title": "独家", "value": "115" }, { "title": "男同", "value": "63" }, { "title": "男性自慰", "value": "92" }, { "title": "真人实拍", "value": "31" }, { "title": "第一视角", "value": "41" }, { "title": "粗暴性爱", "value": "67" }, { "title": "素人", "value": "3" }, { "title": "红毛", "value": "42" }, { "title": "纹身女", "value": "562" }, { "title": "继家庭幻想", "value": "444" }, { "title": "老少欢", "value": "181" }, { "title": "聚会", "value": "53" }, { "title": "肌肉男", "value": "512" }, { "title": "肥臀", "value": "4" }, { "title": "脱衣舞", "value": "33" }, { "title": "自述视频", "value": "231" }, { "title": "舔屄", "value": "131" }, { "title": "色情日漫", "value": "36" }, { "title": "色情明星", "value": "30" }, { "title": "视频激情", "value": "61" }, { "title": "角色扮演", "value": "81" }, { "title": "试镜", "value": "90" }, { "title": "贫乳", "value": "59" }, { "title": "跨性别", "value": "83" }, { "title": "跨种族", "value": "25" }, { "title": "轮交", "value": "80" }, { "title": "辣妈", "value": "29" }, { "title": "金发女", "value": "9" }, { "title": "阿拉伯人", "value": "98" }, { "title": "集体颜射", "value": "14" }, { "title": "音乐", "value": "121" }, { "title": "风情少女", "value": "5" }, { "title": "高清色情片", "value": "38" }, { "title": "黑人女", "value": "17" }
                    ]
                },
                {
                    name: "page",
                    title: "页码",
                    type: "page",
                    value: "1"
                }
            ]
        }

    ]
};

// 通用工具函数 - 减少代码冗余
// 将时间格式（如"7:34"）转换为秒数
function convertDurationToSeconds(duration) {
    if (!duration) return 0;
    var parts = duration.split(':').map(function (part) { return parseInt(part, 10); });
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 1 && !isNaN(parts[0])) return parts[0];
    return 0;
}

// 清理URL中的换行符和首尾空格
function trimUrl(url) {
    return url ? url.replace(/\r?\n|\r/g, "").trim() : "";
}

// 从元素中提取viewkey - 减少重复代码
function extractViewkey($, element) {
    var $element = $(element);
    // 尝试多种可能的属性
    var viewkey = $element.attr('data-video-vkey') || $element.attr('data-id') || $element.attr('id');

    // 如果没有直接属性，尝试从链接中提取
    if (!viewkey) {
        var linkElement = $element.find('a[href*="viewkey="]');
        if (linkElement.length) {
            var href = linkElement.attr('href');
            var keyMatch = href.match(/viewkey=([^&]+)/);
            if (keyMatch && keyMatch[1]) {
                viewkey = keyMatch[1];
            }
        }
    }

    // 清理viewkey，移除可能的前缀
    return viewkey ? viewkey.replace(/^(video|vkey|v|vfavouriteVideo)_/, "") : null;
}

// 提取视频预览URL - 优先data-webm，其次data-mediabook
function extractPreviewUrl($, element, viewkey) {
    var $element = $(element);
    var previewUrl = null;

    // 1. 首先尝试从a标签获取data-webm
    var previewLinkElement = $element.find('a.js-videoPreview, a.webm-videoPreview, a[data-webm]');
    if (previewLinkElement.length) {
        previewUrl = previewLinkElement.attr('data-webm');
        if (previewUrl) {
            return trimUrl(previewUrl);
        }
    }

    // 2. 尝试从img标签获取data-webm
    var thumbElement = $element.find('img.thumb, img.js-videoThumb, img[data-thumb]');
    if (thumbElement.length) {
        previewUrl = thumbElement.attr('data-webm');
        if (previewUrl) {
            return trimUrl(previewUrl);
        }

        // 3. 降级到data-mediabook
        previewUrl = thumbElement.attr('data-mediabook');
        if (previewUrl) {
            return trimUrl(previewUrl);
        }
    }

    return "";
}

// 提取视频的播放量、收藏量和上传日期
function extractVideoStats($, element) {
    var $element = $(element);
    var views = 0;
    var favorites = 0;
    var uploadDate = "";

    // 提取播放量
    var viewsElement = $element.find('.views, .videoDetailsBlock .views, .videoViews');
    if (viewsElement.length) {
        var viewsText = viewsElement.text().trim();
        // 提取数字部分，处理如"1.5K"、"2.3M"等格式
        var viewsMatch = viewsText.match(/(\d+(?:\.\d+)?)\s*([KMB])?/i);
        if (viewsMatch) {
            var viewsNum = parseFloat(viewsMatch[1]);
            var unit = viewsMatch[2] ? viewsMatch[2].toUpperCase() : "";

            if (unit === 'K') viewsNum *= 1000;
            else if (unit === 'M') viewsNum *= 1000000;
            else if (unit === 'B') viewsNum *= 1000000000;

            views = Math.round(viewsNum);
        }
    }

    // 提取收藏量
    var favElement = $element.find('.favorites, .videoDetailsBlock .favorites, .favoritesCounter');
    if (favElement.length) {
        var favText = favElement.text().trim();
        // 提取数字部分，处理如"1.5K"、"2.3M"等格式
        var favMatch = favText.match(/(\d+(?:\.\d+)?)\s*([KMB])?/i);
        if (favMatch) {
            var favNum = parseFloat(favMatch[1]);
            var unit = favMatch[2] ? favMatch[2].toUpperCase() : "";

            if (unit === 'K') favNum *= 1000;
            else if (unit === 'M') favNum *= 1000000;
            else if (unit === 'B') favNum *= 1000000000;

            favorites = Math.round(favNum);
        }
    }

    // 提取上传日期
    var dateElement = $element.find('.added, .videoDetailsBlock .added, .uploadDate');
    if (dateElement.length) {
        uploadDate = dateElement.text().trim();
    }

    return { views: views, favorites: favorites, uploadDate: uploadDate };
}

// 从视频元素提取通用信息
function extractVideoInfo($, element, viewkey) {
    var $element = $(element);

    // 提取视频标题
    var titleElement = $element.find('.title a, .videoTitle a, a.title');
    var title = titleElement.length ? (titleElement.attr('title') || titleElement.text().trim()) : "未知标题";

    // 提取缩略图URL
    var thumbElement = $element.find('img.thumb, img.js-videoThumb, img[data-thumb]');
    var thumbnailUrl = "";
    if (thumbElement.length) {
        thumbnailUrl = thumbElement.attr('src') || thumbElement.attr('data-mediumthumb') || thumbElement.attr('data-thumb') || "";
        thumbnailUrl = trimUrl(thumbnailUrl);
    }

    // 提取视频预览URL
    var previewUrl = extractPreviewUrl($, element, viewkey);

    // 提取视频时长
    var durationElement = $element.find('.duration, .videoDuration');
    var durationText = durationElement.length ? durationElement.text().trim() : "未知时长";
    var duration = convertDurationToSeconds(durationText);

    // 提取上传者信息
    var uploaderElement = $element.find('.usernameBadgesWrapper a, .usernameWrap a');
    var uploader = uploaderElement.length ? uploaderElement.text().trim() : "未知上传者";

    // 提取视频统计信息（播放量、收藏量、上传日期）
    var stats = extractVideoStats($, element);

    // 构建视频详情页URL
    var link = "/view_video.php?viewkey=" + viewkey;

    // 整合所有信息并输出单条日志
    var videoData = {
        id: viewkey,
        type: "link",
        mediaType: "movie",
        title: title,
        coverUrl: thumbnailUrl,
        previewUrl: previewUrl,
        duration: duration,
        durationText: durationText,
        uploader: uploader,
        link: link,
        views: stats.views,
        favorites: stats.favorites,
        uploadDate: stats.uploadDate
    };

    console.log("视频信息: " + JSON.stringify(videoData));

    return videoData;
}

// 从HTML中提取m3u8链接
function extractM3u8FromHtml(html) {
    try {
        // 方法1: mediaDefinitions
        let match = html.match(/"mediaDefinitions"\s*:\s*(\[.+?\])/);
        if (match) {
            try {
                let defs = JSON.parse(match[1].replace(/'/g, '"').replace(/,\s*]/g, ']'));
                let hlsItems = defs.filter(item => item && item.format === 'hls' && item.videoUrl);
                if (hlsItems.length > 0) {
                    hlsItems.sort((a, b) => (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0));
                    let formats = hlsItems.map(i => ({
                        url: i.videoUrl,
                        format: (i.quality ? i.quality + 'p' : ''),
                        ext: 'm3u8',
                        type: 'hls'
                    }));
                    return {
                        videoUrl: hlsItems[0].videoUrl,
                        quality: (hlsItems[0].quality ? hlsItems[0].quality + 'p' : ''),
                        formats
                    };
                }
            } catch { }
        }

        // 方法2: flashvars
        match = html.match(/var\s+flashvars_\d+\s*=\s*({.+?});/);
        if (match) {
            try {
                let flashvars = JSON.parse(match[1]);
                let hlsItems = flashvars.mediaDefinitions?.filter(item => item && item.format === 'hls' && item.videoUrl) || [];
                if (hlsItems.length > 0) {
                    hlsItems.sort((a, b) => (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0));
                    let formats = hlsItems.map(i => ({
                        url: i.videoUrl,
                        format: (i.quality ? i.quality + 'p' : ''),
                        ext: 'm3u8',
                        type: 'hls'
                    }));
                    return {
                        videoUrl: hlsItems[0].videoUrl,
                        quality: (hlsItems[0].quality ? hlsItems[0].quality + 'p' : ''),
                        formats
                    };
                }
            } catch { }
        }

        return null;
    } catch (error) {
        console.log("从HTML提取m3u8链接失败: " + error.message);
        return null;
    }
}



// 检测页面分页信息（用于getFavorites）
function detectPagination(htmlContent, requestedPage) {
    // 初始化页码
    var page = Math.max(1, Number(requestedPage) || 1);
    var maxPage = 1;

    // 检测分页控件是否存在
    var hasPagination = htmlContent.includes('class="pagination3 paginationGated"') ||
        htmlContent.includes('id="moreDataBtn"');

    if (hasPagination) {
        // 尝试从moreDataBtn的onclick参数中提取最大页码
        var btnMatch = htmlContent.match(/loadMoreData\('.*?',\s*'(\d+)',\s*'(\d+)'\)/);
        if (btnMatch && btnMatch.length >= 3) {
            maxPage = Math.max(parseInt(btnMatch[1]), parseInt(btnMatch[2]));
        } else {
            // 尝试从分页链接中提取最大页码
            var pageLinks = htmlContent.match(/href="[^"]*page=(\d+)/g) || [];
            var pageNumbers = [];
            for (var i = 0; i < pageLinks.length; i++) {
                var match = pageLinks[i].match(/page=(\d+)/);
                pageNumbers.push(match ? parseInt(match[1]) : 0);
            }
            if (pageNumbers.length > 0) {
                maxPage = Math.max.apply(null, pageNumbers.concat([1]));
            }
        }
    }

    // 限制请求的页码不超过最大页码
    page = Math.min(page, maxPage);

    console.log("分页信息: " + JSON.stringify({ page: page, maxPage: maxPage, hasPagination: hasPagination }));

    return { page: page, maxPage: maxPage, hasPagination: hasPagination };
}

// 根据排序方式获取对应的URL参数
function getSortParam(sort_by) {
    switch (sort_by) {
        case 'views':
            return 'o=mv'; // 按播放量排序
        case 'rating':
            return 'o=tr'; // 按评分排序
        default:
            return ''; // 默认排序（最新发布）
    }
}

// 获取作者
function extractAuthor($, element) {
    let author = "";
    // 1. 优先 .usernameWrap a，无title属性也能取文本
    let authorA = $(element).find('.usernameWrap a');
    if (authorA.length) {
        author = authorA.attr('title') ? authorA.attr('title').trim() : authorA.text().trim();
    } else {
        // 2. 兼容 .usernameBadgesWrapper a[title]
        let authorA2 = $(element).find('.usernameBadgesWrapper a[title]');
        if (authorA2.length) {
            author = authorA2.attr('title')?.trim() || authorA2.text().trim();
        }
    }
    return author;
}

// 搜索功能主函数 
async function getSearchResults(params) {
    const searchQuery = params.search_query || '';
    const page = Math.max(1, Number(params.page) || 1);  // 确保页码正确
    const sortBy = params.sort_by || "";
    const searchType = params.search_type || "no";  // 获取是否开启精准搜索的设置

    const formattedQuery = searchQuery.trim().replace(/[\s\-]+/g, '+').toLowerCase();;
    let baseUrl = `https://cn.pornhub.com/video/search?search=${formattedQuery}`;
    if (sortBy === 'new') baseUrl += '&o=mr';
    else if (sortBy === 'views') baseUrl += '&o=mv';
    else if (sortBy === 'rating') baseUrl += '&o=tr';
    if (page > 1) baseUrl += `&page=${page}`;  // 根据页码构建URL

    // 添加日志，查看生成的 baseUrl
    console.log(`[getSearchResults] 当前请求的搜索 URL: ${baseUrl}`);

    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/137.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Referer": "https://cn.pornhub.com/"
    };

    try {
        const response = await Widget.http.get(baseUrl, { headers });

        if (response && response.data) {
            const $ = Widget.html.load(response.data);  // ✅ 正确加载页面
            if (!$) return [];
            const $list = $("li.pcVideoListItem.js-pop.videoblock.videoBox.videoBoxesSearch");

            // 添加日志，查看返回的 $list 长度
            console.log(`[getSearchResults] 返回的搜索结果项数: ${$list.length}`);

            if ($list.length > 0) {
                return parseSearchResults($, $list, searchQuery, formattedQuery, searchType);  // 传递正确的searchQuery和searchType
            } else {
                console.log("[getSearchResults] 未找到任何视频，返回空数组");
                return [];
            }
        } else {
            throw new Error("页面加载失败");
        }
    } catch (e) {
        console.error("[getSearchResults] 错误:", e);
        throw e;
    }
}

// 搜索功能解析函数
function parseSearchResults($, $list, searchQuery, formattedQuery, searchType) {
    const result = [];
    console.log(`解析搜索结果，匹配总项数: ${$list.length}`);

    $list.each((i, el) => {
        const $item = $(el);

        // 提取视频 ID
        const vkey = $item.find("a[href*='viewkey=']").attr("href")?.match(/viewkey=([^&]+)/)?.[1];
        if (!vkey) {
            console.log("未找到 vkey, 跳过");
            return; // 如果没有找到视频ID，跳过该项
        }

        // 提取视频标题
        const title = $item.find(".title a").attr("title") ||
            $item.find(".title a").text() ||
            $item.find(".title").text().trim();

        // 使用 extractAuthor 函数提取作者名
        const author = extractAuthor($, $item);  // 提取作者名
        console.log(`提取到的标题: ${title}, 作者: ${author}`);

        // 格式化作者信息到 description
        const description = author ? `作者：${author}` : "";

        // 如果开启精准搜索，先进行筛选
        if (searchType === 'yes' && !filterExactSearchResults(title, author, searchQuery)) {
            // console.log(`标题 ${title} 或者 作者 ${author} 不匹配，跳过`); 
            return; // 如果不匹配，跳过该项
        } else {
            console.log(`✅[精准搜索] 匹配成功: 标题 ${title}, 作者 ${author}`);
        }

        // 提取其他数据并添加到结果中
        let link = $item.find(".title a").attr("href") || $item.find("a[href*='viewkey=']").attr("href") || "";
        if (link && !/^https?:\/\//.test(link)) {
            link = "https://cn.pornhub.com" + link;
        }

        const img = $item.find("img");
        const coverUrl = img.attr("src") || img.attr("data-src") || img.attr("data-thumb");
        const previewUrl = img.attr("data-mediabook") || img.attr("data-preview") || img.attr("data-webm") || "";
        const durationText = $item.find(".duration, .videoDuration").text().trim();

        result.push({
            id: vkey,
            type: "link",
            mediaType: "movie",
            title: title,
            description: description,
            coverUrl: coverUrl,
            previewUrl: previewUrl,
            durationText: durationText,
            link: link
        });
    });

    console.log(`解析到的视频数: ${result.length}`);
    return result;
}

// 精准搜索过滤函数：对视频标题和作者进行匹配
function filterExactSearchResults(title, author, searchQuery) {
    const query = searchQuery.toLowerCase();
    return title.toLowerCase().includes(query) || author.toLowerCase().includes(query);  // 判断标题或作者是否包含搜索关键词
}




// 获取我的最爱列表视频
function getFavorites(params) {
    return new Promise(function (resolve, reject) {
        try {
            console.log("开始获取收藏列表: " + JSON.stringify(params));
            // 参数验证
            if (!params.username) {
                console.log("错误: 未提供用户名");
                reject(new Error("请提供用户名"));
                return;
            }

            // 构建基础URL
            var baseUrl = "https://cn.pornhub.com/users/" + params.username + "/videos/favorites";

            // 添加排序参数
            var sortParam = getSortParam(params.sort_by);
            if (sortParam) {
                baseUrl += "?" + sortParam;
            }

            console.log("基础URL: " + baseUrl);

            // 首次请求（用于检测分页）
            Widget.http.get(baseUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "Referer": "https://cn.pornhub.com/"
                }
            }).then(function (firstPageResponse) {
                // 检查响应
                if (!firstPageResponse || !firstPageResponse.data) {
                    console.log("错误: 获取收藏列表失败，无响应或响应无数据");
                    reject(new Error("获取收藏列表失败，请检查网络连接或用户名是否正确"));
                    return;
                }

                // 检查是否有地区限制
                if (firstPageResponse.data.includes("As you may know, your elected officials") ||
                    firstPageResponse.data.includes("Trust and Safety measures")) {
                    console.log("错误: 检测到地区限制");
                    reject(new Error("无法访问Pornhub，可能存在地区限制"));
                    return;
                }

                // 检查是否是空收藏列表
                if (firstPageResponse.data.includes("没有收藏视频") ||
                    firstPageResponse.data.includes("No videos found") ||
                    firstPageResponse.data.includes("empty-list")) {
                    console.log("收藏列表为空");
                    resolve([]); // 返回空数组表示没有收藏视频
                    return;
                }

                // 检测分页信息
                var pagination = detectPagination(firstPageResponse.data, params.page);
                var page = pagination.page;

                // 构建最终URL
                var fullUrl = baseUrl;
                if (page > 1) {
                    // 如果已有排序参数，使用&连接页码参数，否则使用?
                    fullUrl += (sortParam ? '&' : '?') + "page=" + page;
                }

                console.log("最终请求URL: " + fullUrl);

                // 如果不是第1页，需要重新请求
                var responsePromise;
                if (page > 1) {
                    responsePromise = Widget.http.get(fullUrl, {
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                            "Referer": "https://cn.pornhub.com/"
                        }
                    });
                } else {
                    responsePromise = Promise.resolve(firstPageResponse);
                }

                return responsePromise;
            }).then(function (response) {
                if (!response || !response.data) {
                    console.log("错误: 获取页面失败");
                    reject(new Error("获取收藏列表页面失败"));
                    return;
                }

                // 解析HTML
                var $ = Widget.html.load(response.data);

                // 提取视频列表
                var videos = [];
                var processedViewkeys = {}; // 用于去重

                // 尝试多种选择器找到视频项
                var videoItems = $("#videoFavoritesListSection .pcVideoListItem");
                if (!videoItems.length) {
                    videoItems = $("li.pcVideoListItem[id^=\"vfavouriteVideo\"]");
                }
                if (!videoItems.length) {
                    videoItems = $("li.pcVideoListItem, div.videoblock, div.videoBox");
                }

                console.log("找到 " + videoItems.length + " 个视频项");

                // 如果找不到任何视频项
                if (videoItems.length === 0) {
                    var errorMessage = "未找到任何收藏视频项。";
                    if (response.data.includes("登录") || response.data.includes("Login") ||
                        response.data.includes("sign in") || response.data.includes("注册")) {
                        errorMessage += " 这通常需要登录才能查看收藏列表。";
                    } else {
                        errorMessage += " 请确认用户名是否正确，或页面结构是否已变化。";
                    }
                    reject(new Error(errorMessage));
                    return;
                }

                // 处理每个视频项
                videoItems.each(function (index, element) {
                    try {
                        // 提取viewkey
                        var viewkey = extractViewkey($, element);
                        if (!viewkey) {
                            return; // 跳过无效项
                        }

                        // 检查是否已处理过该viewkey，避免重复添加
                        if (processedViewkeys[viewkey]) {
                            return;
                        }

                        // 提取视频信息
                        var videoInfo = extractVideoInfo($, element, viewkey);

                        const author = extractAuthor($, element);
                        videoInfo.description = author ? `作者：${author}` : "";

                        // 添加到结果数组
                        videos.push(videoInfo);

                        // 添加到已处理集合
                        processedViewkeys[viewkey] = true;

                    } catch (error) {
                        console.log("处理视频项时出错: " + error.message);
                    }
                });

                console.log("成功提取 " + videos.length + " 个收藏视频");

                resolve(videos);
            }).catch(function (error) {
                console.log("获取收藏列表失败: " + error.message);
                reject(error);
            });
        } catch (error) {
            console.log("获取收藏列表失败: " + error.message);
            reject(error);
        }
    });
}


//功能分流
async function getUserUploads(params = {}) {
    const logo = params.logo; // "yx"=优选艺人, "ss"=搜索艺人

    if (logo === "yx") {
        // 1. 优选艺人模式：params.username是type，查表拿真实用户名
        const enumOptions = [{ title: 'HongKongDoll', value: 'HongKongDoll', type: 'model' }, { title: '麻豆传媒', value: 'asiam', type: 'channels' }, { title: '麻豆-LiRongRong', value: 'Li Rong Rong', type: 'pornstar' }, { 'title': 'june liu', 'value': 'june liu', 'type': 'pornstar' }, { 'title': 'Cabbage Sweety', 'value': 'Cabbage Sweety', 'type': 'model' }, { 'title': 'Lindainlove', 'value': 'Lindainlove', 'type': 'model' }, { 'title': 'SweetieYico', 'value': 'SweetieYico', 'type': 'model' }, { 'title': 'wanrous', 'value': 'wanrous', 'type': 'model' }, { 'title': '77bandage', 'value': '77bandage', 'type': 'model' }, { 'title': 'youyou', 'value': 'youyou', 'type': 'model' }, { 'title': 'manachanx', 'value': 'manachanx', type: 'model' }, { title: 'lindainlove', value: 'lindainlove', type: 'model' }, { title: 'Karesi ni Baretara Kaisan', value: 'Karesi ni Baretara Kaisan', type: 'model' }, { title: 'k production film', value: 'k production film', type: 'model' }, { title: '798DS', value: '798DS', type: 'model' }, { title: 'aiwanxiongxiong', value: 'aiwanxiongxiong', type: 'model' }, { title: 'andmlove', value: 'andmlove', type: 'model' }, { title: 'ano ano chan', value: 'ano ano chan', type: 'model' }, { title: 'bibi Fluffy', value: 'bibi Fluffy', type: 'model' }, { title: 'CandyKissVip', value: 'CandyKissVip', type: 'model' }, { title: 'Chinese Bunny', value: 'Chinese Bunny', type: 'model' }, { title: 'DemiFairyTW', value: 'DemiFairyTW', type: 'model' }, { title: 'Elle Lee', value: 'Elle Lee', type: 'model' }, { title: 'Eve', value: 'Eve', type: 'model' }, { title: 'fortunecutie', value: 'fortunecutie', type: 'model' }, { title: 'LIs Evans', value: 'LIs Evans', type: 'model' }, { title: 'loliiiiipop99', value: 'loliiiiipop99', type: 'model' }, { title: 'Makissse', value: 'Makissse', type: 'model' }, { title: 'nan12138', value: 'nan12138', type: 'model' }, { title: 'Nana_taipei', value: 'Nana_taipei', type: 'model' }, { title: 'Nuomibaby', value: 'Nuomibaby', type: 'model' }, { title: 'papaxmama', value: 'papaxmama', type: 'model' }, { title: 'Qiobnxingcaiii', value: 'Qiobnxingcaiii', type: 'model' }, { title: 'SakuraCandy', value: 'SakuraCandy', type: 'model' }, { title: 'sskok16', value: 'sskok16', type: 'model' }, { title: 'SSR Peach', value: 'SSR Peach', type: 'model' }, { title: 'thelittlejuicer', value: 'thelittlejuicer', type: 'model' }, { title: 'TLMS_SVJ', value: 'TLMS_SVJ', type: 'model' }, { title: 'twtutu', value: 'twtutu', type: 'model' }, { title: 'Vita Won', value: 'Vita Won', type: 'model' }, { title: 'Yuqiao Chen', value: 'Yuqiao Chen', type: 'model' }, { title: 'YuzuKitty', value: 'YuzuKitty', type: 'model' },
        ];
        const option = enumOptions.find(opt => opt.value === params.username);
        if (!option) throw new Error("优选艺人未选中或无效");
        const username = option.value;    // "HongKongDoll"等
        const userType = option.type;     // "model"/"channels"/"pornstar"
        return await doFetch(userType, username, params);
    }

    if (logo === "ss") {
        // 2. 搜索艺人模式：params.user_type是类型，params.username是用户输入的名称
        const userType = (params.user_type || "model").toLowerCase();
        const username = (params.username || "").trim();
        if (!username) throw new Error("请输入艺人名称");
        // 下面和优选一样，类型分流
        return await doFetch(userType, username, params);
    }

    throw new Error("未知入口，请检查logo参数");
}

// 公共 fetch 逻辑（类型分流解析）
async function doFetch(type, username, params) {
    const sortBy = params.sort_by || "new";
    const page = Math.max(1, Number(params.page) || 1);

    // 对传入的 username 进行处理：空格替换为连字符并转为小写
    const formattedUsername = username.trim().replace(/\s+/g, '-').toLowerCase();

    // 拼接URL
    let url = "";
    if (type === "pornstar") {
        // 1. 尝试请求 /videos/upload
        let uploadUrl = `/pornstar/${encodeURIComponent(formattedUsername)}/videos/upload?o=mr${page > 1 ? `&page=${page}` : ''}`;
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/137.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
        };

        console.log(`[doFetch] 尝试请求明星上传页: ${uploadUrl}`);


        // 构建完整URL
        const fullUrl = `https://cn.pornhub.com${uploadUrl}`;

        // 发送请求
        const response = await Widget.http.get(fullUrl, { headers });
        // 输出请求和响应信息
        console.log(`HTTP状态码: ${response.statusCode}`);

        // 如果上传页状态码为 200
        if (response.statusCode === 200) {
            const $ = Widget.html.load(response.data); // 解析HTML
            const $list = $("ul#moreData.full-row-thumbs.videos.row-5-thumbs");

            // 判断上传页是否存在视频列表
            if ($list.length > 0 && $list.find("li.pcVideoListItem, .wrap.flexibleHeight").length > 0) {
                console.log(`[doFetch] 上传页存在视频，返回并解析该页`);
                return parsePornstarVideos(response.data); // 如果上传页存在，直接解析
            } else {
                console.log(`[doFetch] 上传页存在但无视频内容，准备降级到主页解析`);
            }
        }

        // 如果上传页面存在但没有视频内容，降级请求主页
        const homepageUrl = `https://cn.pornhub.com/pornstar/${encodeURIComponent(formattedUsername)}`;
        const resp2 = await Widget.http.get(homepageUrl, { headers });
        if (!resp2 || !resp2.data) throw new Error("明星主页无法获取");
        return parsePornstarHomePage(resp2.data); // 请求主页并解析

    } else if (type === "model") {
        if (sortBy === "new") url = `/model/${encodeURIComponent(formattedUsername)}/videos?o=mr${page > 1 ? `&page=${page}` : ''}`;
        else if (sortBy === "views") url = `/model/${encodeURIComponent(formattedUsername)}/videos?o=mv${page > 1 ? `&page=${page}` : ''}`;
        else if (sortBy === "rating") url = `/model/${encodeURIComponent(formattedUsername)}/videos?o=tr${page > 1 ? `&page=${page}` : ''}`;
        else url = `/model/${encodeURIComponent(formattedUsername)}/videos${page > 1 ? `?page=${page}` : ''}`;
    } else if (type === "channels") {
        if ((sortBy === "new" || sortBy === "default") && page === 1)
            url = `/channels/${encodeURIComponent(formattedUsername)}`;
        else if ((sortBy === "new" || sortBy === "default") && page > 1)
            url = `/channels/${encodeURIComponent(formattedUsername)}/videos?page=${page}`;
        else if (sortBy === "views")
            url = `/channels/${encodeURIComponent(formattedUsername)}/videos?o=vi${page > 1 ? `&page=${page}` : ''}`;
        else if (sortBy === "rating")
            url = `/channels/${encodeURIComponent(formattedUsername)}/videos?o=ra${page > 1 ? `&page=${page}` : ''}`;
        else
            url = `/channels/${encodeURIComponent(formattedUsername)}`;
    } else {
        throw new Error("不支持的艺人类型");
    }

    const baseUrl = `https://cn.pornhub.com${url}`;
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/137.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
    };

    console.log(`[doFetch] 尝试请求: ${baseUrl}`);
    // 请求其他类型（model, channels）的内容
    const response = await Widget.http.get(baseUrl, { headers });
    if (!response || !response.data) throw new Error("页面加载失败");

    if (type === "model") return parseModelVideos(response.data);
    if (type === "channels") return parseChannelVideos(response.data);
    throw new Error("不支持的艺人类型");
}


//解析Model视频页面
function parseModelVideos(html) {
    var $ = Widget.html.load(html);

    // 1. 只取第一个视频区块 section
    var $sections = $(".videoSection.clear-both");
    console.log("[日志] 页面 videoSection.clear-both 区块数量：", $sections.length);
    if (!$sections.length) {
        console.log("未找到视频区块 section");
        return [];
    }

    var $firstSection = $sections.first();

    // 2. 在这个 section 里找所有视频卡片
    var videoItems = $firstSection.find(".videoblock, .videoBox, .pcVideoListItem, li[data-video-vkey]");
    console.log("[日志] 第一个 videoSection 下视频卡片数量：", videoItems.length);

    var videos = [];
    var processedViewkeys = {};
    videoItems.each(function (index, element) {
        try {
            var viewkey = extractViewkey($, element);
            if (!viewkey) return;
            if (processedViewkeys[viewkey]) return;
            var videoInfo = extractVideoInfo($, element, viewkey);
            videos.push(videoInfo);
            processedViewkeys[viewkey] = true;
        } catch (error) {
            console.log("处理视频项时出错: " + error.message);
        }
    });

    console.log("成功提取 " + videos.length + " 个艺人上传视频");
    return videos;
}

//解析Channel视频页面
function parseChannelVideos(html) {
    const $ = Widget.html.load(html);
    const result = [];
    const $ul = $('ul#moreData.videosGridWrapper, ul#showAllChanelVideos.videosGridWrapper');
    console.log("[parseChannelVideos] 命中的 ul 个数:", $ul.length);

    if (!$ul.length) throw new Error("未找到频道视频主区块");

    $ul.find("li.pcVideoListItem, li.videoblock, li.videoBox").each(function () {
        const $item = $(this);
        let vkey = $item.attr('data-video-vkey') ||
            $item.attr('data-id') ||
            ($item.find("a[href*='viewkey=']").attr("href") || "").match(/viewkey=([^&]+)/)?.[1];
        if (!vkey) return;

        const title = $item.find(".title a").attr("title") ||
            $item.find(".title a").text() ||
            $item.find(".title").text().trim();

        let link = $item.find(".title a").attr("href") || $item.find("a[href*='viewkey=']").attr("href") || "";
        if (link && !/^https?:\/\//.test(link)) link = "https://cn.pornhub.com" + link;

        const img = $item.find("img");
        const coverUrl = img.attr("src") || img.attr("data-thumb") || img.attr("data-src") || "";
        const previewUrl = img.attr("data-mediabook") || img.attr("data-preview") || img.attr("data-webm") || "";

        const durationText = $item.find(".duration, .videoDuration").text().trim();
        const author = extractAuthor($, $item);

        result.push({
            id: vkey,
            type: "link",
            mediaType: "movie",
            title: title,
            coverUrl: coverUrl,
            previewUrl: previewUrl,
            durationText: durationText,
            link: link,
            description: author ? `作者：${author}` : ""
        });
    });

    if (result.length === 0) throw new Error("未提取到频道视频数据");
    return result;
}

// Pornstar主页（有上传区）视频提取
function parsePornstarVideos(html) {
    const $ = Widget.html.load(html);
    const result = [];
    const $list = $("ul#moreData.full-row-thumbs.videos.row-5-thumbs");

    if (!$list.length) {
        console.log("[parsePornstarVideos] 没有找到明星上传视频列表 ul#moreData.full-row-thumbs.videos.row-5-thumbs");
        return [];
    }

    $list.find("li.pcVideoListItem, .wrap.flexibleHeight").each(function () {
        const $item = $(this);

        let vkey = $item.attr('data-video-vkey')
            || $item.attr('data-id')
            || ($item.find("a[href*='viewkey=']").attr("href") || "").match(/viewkey=([^&]+)/)?.[1];
        if (!vkey) return;

        const title = $item.find(".title a").attr("title")
            || $item.find(".title a").text()
            || $item.find(".title").text().trim();

        let link = $item.find(".title a").attr("href") || $item.find("a[href*='viewkey=']").attr("href") || "";
        if (link && !/^https?:\/\//.test(link)) link = "https://cn.pornhub.com" + link;

        const img = $item.find("img");
        const coverUrl = img.attr("src") || img.attr("data-thumb") || img.attr("data-src") || "";
        const previewUrl = img.attr("data-mediabook") || img.attr("data-preview") || img.attr("data-webm") || "";
        const durationText = $item.find(".duration, .videoDuration").text().trim();

        result.push({
            id: vkey,
            type: "link",
            mediaType: "movie",
            title: title,
            coverUrl: coverUrl,
            previewUrl: previewUrl,
            durationText: durationText,
            link: link,
            description: ""
        });
    });

    if (result.length === 0) {
        console.log("[parsePornstarVideos] 未提取到任何明星上传视频数据");
    }
    return result;
}

// Pornstar主页（无上传区）视频提取
function parsePornstarHomePage(html) {
    const $ = Widget.html.load(html);
    const result = [];
    $(".sectionWrapper .wrap.flexibleHeight").each(function () {
        const $item = $(this);

        let vkey = $item.find("a[href*='viewkey=']").attr("href")?.match(/viewkey=([^&]+)/)?.[1];
        if (!vkey) return;

        const title = $item.find(".title a").attr("title") ||
            $item.find(".title a").text() ||
            $item.find(".title").text().trim();

        let link = $item.find(".title a").attr("href") || $item.find("a[href*='viewkey=']").attr("href") || "";
        if (link && !/^https?:\/\//.test(link)) link = "https://cn.pornhub.com" + link;

        const img = $item.find("img");
        const coverUrl = img.attr("src") || img.attr("data-thumb") || img.attr("data-src") || "";
        const previewUrl = img.attr("data-mediabook") || img.attr("data-preview") || img.attr("data-webm") || "";
        const durationText = $item.find(".duration, .videoDuration").text().trim();

        result.push({
            id: vkey,
            type: "link",
            mediaType: "movie",
            title: title,
            coverUrl: coverUrl,
            previewUrl: previewUrl,
            durationText: durationText,
            link: link
        });
    });
    if (result.length === 0) throw new Error("未提取到主页视频数据");
    return result;
}





//处理cooike
function fixCookie(cookieStr) {
    let arr = cookieStr.split(";").map(s => s.trim()).filter(Boolean);
    // 只保留有效 key=value（且无 undefined/空值）
    let valid = arr.filter(s => s.includes("=") && !/^([^=]+)=\s*$/.test(s) && !/undefined/i.test(s));
    // user_session 放最前（有则优先，无也可）
    valid.sort((a, b) => {
        if (a.startsWith("user_session=")) return -1;
        if (b.startsWith("user_session=")) return 1;
        return 0;
    });
    return valid.join("; ");
}

//获取推荐视频列表
async function getRecommendedVideos(params = {}) {
    const rawCookie = params.cookie || "";
    const page = Math.max(1, Number(params.page) || 1);
    const sortBy = (params.sort_by || "").trim(); // ""(最相关) or "time"(最新)

    const cookie = fixCookie(rawCookie);

    // 构建 URL
    let url = `https://cn.pornhub.com/recommended`;
    const query = [];
    if (sortBy) query.push(`o=${encodeURIComponent(sortBy)}`);
    if (page > 1) query.push(`page=${page}`);
    if (query.length > 0) url += "?" + query.join("&");
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/137.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Referer": "https://cn.pornhub.com/",
        "Cookie": cookie
    };

    const response = await Widget.http.get(url, { headers });

    if (!response || !response.data) {
        throw new Error("推荐页面加载失败，请检查网络/代理/Cookie");
    }

    // 自动检测是否为已登录状态（核心逻辑）
    const html = response.data;
    const isLogged =
        html.includes('class="logged-in"') ||
        html.includes("var isLogged = 1") ||
        html.includes("'login_user': 'Yes'") ||
        html.includes('id="topProfileMenu"') || // 顶部用户菜单
        html.includes('/users/'); // 有用户专属链接
    if (!isLogged) {
        throw new Error("未登录或 Cookie 已失效，请重新获取 Cookie");
    }

    // 解析视频区块
    const $ = Widget.html.load(html);
    const videoSelector = ".pcVideoListItem, .videoblock, .videoBox, li.videoblock.videoBox";
    const result = [];
    $(videoSelector).each(function () {
        const $item = $(this);

        let vkey = $item.attr('data-video-vkey')
            || $item.attr('data-id')
            || ($item.find("a[href*='viewkey=']").attr("href") || "").match(/viewkey=([^&]+)/)?.[1];
        if (!vkey) return;

        const title = $item.find(".title a").attr("title")
            || $item.find(".title a").text()
            || $item.find(".title").text().trim();

        let link = $item.find(".title a").attr("href") || $item.find("a[href*='viewkey=']").attr("href") || "";
        if (link && !/^https?:\/\//.test(link)) {
            link = "https://cn.pornhub.com" + link;
        }

        const img = $item.find("img");
        const coverUrl = img.attr("src") || img.attr("data-thumb") || img.attr("data-src") || "";
        const previewUrl = img.attr("data-mediabook") || img.attr("data-preview") || img.attr("data-webm") || "";
        const durationText = $item.find(".duration, .videoDuration").text().trim();

        let authorName = extractAuthor($, $item);
        const description = authorName ? `作者：${authorName}` : "";

        result.push({
            id: vkey,
            type: "link",
            mediaType: "movie",
            title: title,
            coverUrl: coverUrl,
            previewUrl: previewUrl,
            durationText: durationText,
            link: link,
            description: description
        });
    });

    if (result.length === 0) {
        throw new Error("页面结构可能已变，未提取到推荐视频数据。");
    }
    return result;
}

// 按分类获取视频列表
async function getVideos(originalParams = {}) {
    // 参数解包，保证不会undefined
    const params = { ...originalParams };
    const pageType = params.pageType || "";     // "cm" 最新 "ht" 热播 "mv" 最多观看 "tr" 最高评分
    const c = params.c || "";                   // 分类id（"teen"为特殊18-25岁）
    const cc = params.country || "";            // 国家代码（只在mv、ht下有效且不能为world）
    const page = params.page || 1;
    const hd = params.hd || "";                 // 高清参数，1为高清，其它为空
    const sort_by = params.sort_by || "";       // 时间范围参数，仅mv/tr下有效
    const p = params.p || ""; // 平台类型参数

    let url = "";

    // 1. 最新视频
    if (pageType === "cm") {
        if (c === "teen") {
            url = `https://cn.pornhub.com/categories/teen?o=cm&page=${page}`;
            if (hd === "1") url += `&hd=1`;
            if (p) url += `&p=${p}`;
        } else {
            url = `https://cn.pornhub.com/video?o=cm&page=${page}`;
            if (c) url += `&c=${c}`;
            if (hd === "1") url += `&hd=1`;
            if (p) url += `&p=${p}`;
        }
    }
    // 2. 热播视频
    else if (pageType === "ht") {
        if (c === "teen") {
            url = `https://cn.pornhub.com/categories/teen?o=ht&page=${page}`;
            if (cc && cc !== "world") url += `&cc=${cc}`;
            if (hd === "1") url += `&hd=1`;
            if (p) url += `&p=${p}`;
        } else {
            url = `https://cn.pornhub.com/video?o=ht&page=${page}`;
            if (c) url += `&c=${c}`;
            if (cc && cc !== "world") url += `&cc=${cc}`;
            if (hd === "1") url += `&hd=1`;
            if (p) url += `&p=${p}`;
        }
    }
    // 3. 最多观看
    else if (pageType === "mv") {
        if (c === "teen") {
            url = `https://cn.pornhub.com/categories/teen?o=mv&page=${page}`;
            if (sort_by) url += `&t=${sort_by}`;
            if (cc && cc !== "world") url += `&cc=${cc}`;
            if (hd === "1") url += `&hd=1`;
            if (p) url += `&p=${p}`;
        } else {
            url = `https://cn.pornhub.com/video?o=mv&page=${page}`;
            if (c) url += `&c=${c}`;
            if (sort_by) url += `&t=${sort_by}`;
            if (cc && cc !== "world") url += `&cc=${cc}`;
            if (hd === "1") url += `&hd=1`;
            if (p) url += `&p=${p}`;
        }
    }
    // 4. 最高评分
    else if (pageType === "tr") {
        if (c === "teen") {
            url = `https://cn.pornhub.com/categories/teen?o=tr&page=${page}`;
            if (sort_by) url += `&t=${sort_by}`;
            if (hd === "1") url += `&hd=1`;
            if (p) url += `&p=${p}`;
        } else {
            url = `https://cn.pornhub.com/video?o=tr&page=${page}`;
            if (c) url += `&c=${c}`;
            if (sort_by) url += `&t=${sort_by}`;
            if (hd === "1") url += `&hd=1`;
            if (p) url += `&p=${p}`;
        }
    }
    // 5. 最新精选
    else if (pageType === "latestFeatured") {

        if (c === "teen") {
            url = `https://cn.pornhub.com/categories/teen?page=${page}`;
            if (hd === "1") url += `&hd=1`;
            if (p) url += `&p=${p}`;
        } else {
            url = `https://cn.pornhub.com/video?page=${page}`;
            if (c) url += `&c=${c}`;
            if (hd === "1") url += `&hd=1`;
            if (p) url += `&p=${p}`;
        }
    }
    // 6. 其它类型兜底
    else {
        url = `https://cn.pornhub.com/video?o=${pageType}&page=${page}`;
        if (c) url += `&c=${c}`;
        if (hd === "1") url += `&hd=1`;
        if (p) url += `&p=${p}`;
    }

    console.log("最终拼接的URL:", url);

    try {
        const response = await Widget.http.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
            }
        });

        const htmlContent = response.data;
        const $ = Widget.html.load(htmlContent);

        const videoSelector = $(".pcVideoListItem.js-pop.videoblock.videoBox").length
            ? ".pcVideoListItem.js-pop.videoblock.videoBox"
            : ".pcVideoListItem, .videoblock, .videoBox";

        const items = [];
        $(videoSelector).each(function () {
            const $item = $(this);

            let vkey = $item.attr('data-video-vkey')
                || $item.attr('data-id')
                || ($item.find("a[href*='viewkey=']").attr("href") || "").match(/viewkey=([^&]+)/)?.[1];
            if (!vkey) return;

            const title = $item.find(".title a").attr("title")
                || $item.find(".title").text().trim();
            let link = $item.find(".title a").attr("href") || "";
            if (link && !/^https?:\/\//.test(link)) {
                link = "https://cn.pornhub.com" + link;
            }

            const img = $item.find("img");
            const coverUrl = img.attr("src") || img.attr("data-thumb") || img.attr("data-src") || "";
            const previewUrl = img.attr("data-mediabook") || img.attr("data-preview") || img.attr("data-webm") || "";
            const durationText = $item.find(".duration, .videoDuration").text().trim();

            const authorName = extractAuthor($, $item); // $item是$(this)
            const description = authorName ? `作者：${authorName}` : "";

            items.push({
                id: vkey,
                type: "link",
                mediaType: "movie",
                title: title,
                coverUrl: coverUrl,
                previewUrl: previewUrl,
                durationText: durationText,
                link: link,
                description: description
            });
        });

        if (items.length === 0) {
            throw new Error("页面结构可能已变，未提取到视频数据。");
        }

        return items;

    } catch (error) {
        console.error("获取视频失败:", error.message);
        throw new Error("获取视频失败: " + error.message);
    }
}

//按语言分类获取视频列表
async function getVideosByLanguage(originalParams = {}) {
    const params = { ...originalParams };
    const language = params.language || "chinese";
    const p = params.p || "";
    const hd = params.hd || "";
    const sort_by = params.sort_by || "";
    const page = params.page || 1;

    // 拼接基础url
    let url = `https://cn.pornhub.com/language/${encodeURIComponent(language)}?page=${page}`;
    if (p) url += `&p=${p}`;
    if (hd === "1") url += `&hd=1`;
    if (sort_by) url += `&o=${sort_by}`;

    console.log("按语言筛选拼接URL:", url);

    try {
        const response = await Widget.http.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
            }
        });

        const htmlContent = response.data;
        const $ = Widget.html.load(htmlContent);

        // 选择器同前
        const videoSelector = $(".pcVideoListItem.js-pop.videoblock.videoBox").length
            ? ".pcVideoListItem.js-pop.videoblock.videoBox"
            : ".pcVideoListItem, .videoblock, .videoBox";

        const items = [];
        $(videoSelector).each(function () {
            const $item = $(this);
            let vkey = $item.attr('data-video-vkey')
                || $item.attr('data-id')
                || ($item.find("a[href*='viewkey=']").attr("href") || "").match(/viewkey=([^&]+)/)?.[1];
            if (!vkey) return;

            const title = $item.find(".title a").attr("title")
                || $item.find(".title").text().trim();
            let link = $item.find(".title a").attr("href") || "";
            if (link && !/^https?:\/\//.test(link)) {
                link = "https://cn.pornhub.com" + link;
            }

            const img = $item.find("img");
            const coverUrl = img.attr("src") || img.attr("data-thumb") || img.attr("data-src") || "";
            const previewUrl = img.attr("data-mediabook") || img.attr("data-preview") || img.attr("data-webm") || "";
            const durationText = $item.find(".duration, .videoDuration").text().trim();

            const authorName = extractAuthor($, $item); // $item是$(this)
            const description = authorName ? `作者：${authorName}` : "";

            items.push({
                id: vkey,
                type: "link",
                mediaType: "movie",
                title: title,
                coverUrl: coverUrl,
                previewUrl: previewUrl,
                durationText: durationText,
                link: link,
                description: description
            });
        });

        if (items.length === 0) {
            throw new Error("页面结构可能已变，未提取到视频数据。");
        }

        return items;

    } catch (error) {
        console.error("获取按语言筛选视频失败:", error.message);
        throw new Error("获取按语言筛选视频失败: " + error.message);
    }
}

// 推荐区块极速切片采集
function extractRecommendedVideos(htmlContent, maxCount = 10) {
    let relatedHtml = "";
    const blockStart = htmlContent.indexOf('<ul class="videos underplayer-thumbs fixedSizeThumbsVideosListing"');
    if (blockStart !== -1) {
        const blockEnd = htmlContent.indexOf('</ul>', blockStart);
        if (blockEnd !== -1) {
            relatedHtml = htmlContent.slice(blockStart, blockEnd + 5);
        }
    }
    const $ = Widget.html.load(relatedHtml || htmlContent);

    const result = [];
    $("li[data-video-vkey]").slice(0, maxCount).each(function (i, element) {
        const $element = $(element);
        const vkey = $element.attr('data-video-vkey');
        if (!vkey) return;
        const title = $element.find('.title').text().trim() || $element.find('a[title]').attr('title') || '';
        const img = $element.find('img');
        const coverUrl = img.attr('src') || img.attr('data-thumb') || img.attr('data-src') || '';
        const previewUrl = img.attr('data-mediabook') || img.attr('data-preview') || img.attr('data-webm') || '';
        const durationText = $element.find('.duration, .videoDuration').text().trim();
        const authorName = extractAuthor($, element);
        const description = authorName ? `作者：${authorName}` : "";
        result.push({
            id: vkey,
            type: "link",
            mediaType: "movie",
            title: title,
            coverUrl: coverUrl,
            previewUrl: previewUrl,
            durationText: durationText,
            link: `https://cn.pornhub.com/view_video.php?viewkey=${vkey}`,
            description: description
        });
    });
    return result;
}


// 加载视频详情函数
async function loadDetail(link) {
    try {
        console.log(`开始加载视频详情: ${link}`);

        // 1. 提取 viewkey
        const viewkeyMatch = link.match(/viewkey=([^&]+)/);
        if (!viewkeyMatch || !viewkeyMatch[1]) {
            console.log(`错误: 无效的视频链接 ${link}`);
            throw new Error("无效的视频链接");
        }
        const viewkey = viewkeyMatch[1];

        // 2. 构建详情页链接并获取HTML
        const fullVideoUrl = `https://cn.pornhub.com/view_video.php?viewkey=${viewkey}`;
        const response = await Widget.http.get(fullVideoUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });
        const htmlContent = response.data;

        // 3. 用详情HTML直接提取 m3u8
        const m3u8Data = extractM3u8FromHtml(htmlContent);

        if (!m3u8Data || !m3u8Data.videoUrl) {
            console.log(`错误: 无法获取视频播放链接`);
            throw new Error("无法获取视频播放链接");
        }

        // 4. 主视频作者
        const $root = Widget.html.load(htmlContent);
        const mainAuthorA = $root('.usernameWrap a').first();
        const mainAuthor = mainAuthorA.attr('title') || "";

        // 5. 推荐区块采集（极速切片，独立函数）
        const recommendedVideos = extractRecommendedVideos(htmlContent, 10);
        console.log("推荐区块采集数量:", recommendedVideos.length);

        // 6. 返回 ForwardWidget 兼容的详情对象
        const result = {
            id: viewkey,
            type: "detail",
            mediaType: "movie",
            videoUrl: m3u8Data.videoUrl,
            customHeaders: {
                "Referer": fullVideoUrl,
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            quality: m3u8Data.quality,
            title: "视频播放",
            duration: 0,
            formats: m3u8Data.formats,
            description: mainAuthor ? `作者：${mainAuthor}` : "",
            childItems: recommendedVideos
        };

        console.log(`视频详情加载成功: ${JSON.stringify({ id: result.id, quality: result.quality, recommendCount: recommendedVideos.length })}`);
        return result;
    } catch (error) {
        console.log(`loadDetail 执行失败: ${error.message}`);
        throw error;
    }
}


module.exports = {
    metadata: WidgetMetadata,
    getSearchResults: getSearchResults,
    getFavorites: getFavorites,
    getRecommendedVideos: getRecommendedVideos,
    getUserUploads: getUserUploads,
    getVideos: getVideos,
    loadDetail: loadDetail
};
