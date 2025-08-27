var WidgetMetadata = {
    id: "missav",
    title: "MissAV",
    description: "\u83b7\u53d6 MissAV \u63a8\u8350",
    author: "Mikephie",
    site: "https://widgets-xd.vercel.app",
    version: "1.0.0",
    requiredVersion: "0.0.2",
    detailCacheDuration: 300,
    modules: [
        {
            title: "\u641c\u7d22\u5f71\u7247",
            description: "\u641c\u7d22 MissAV \u5f71\u7247\u5185\u5bb9",
            requiresWebView: false,
            functionName: "searchVideos",
            cacheDuration: 1800,
            params: [
                {
                    name: "keyword",
                    title: "\u641c\u7d22\u5173\u952e\u8bcd",
                    type: "input",
                    description: "\u8f93\u5165\u641c\u7d22\u5173\u952e\u8bcd\uff08\u6f14\u5458\u540d\u3001\u756a\u53f7\u3001\u6807\u9898\u7b49\uff09",
                    value: ""
                },
                {
                    name: "sort_by",
                    title: "\u6392\u5e8f",
                    type: "enumeration",
                    description: "\u6392\u5e8f\u65b9\u5f0f",
                    value: "released_at",
                    enumOptions: [
                        { title: "\u53d1\u884c\u65e5\u671f", value: "released_at" },
                        { title: "\u6700\u8fd1\u66f4\u65b0", value: "published_at" },
                        { title: "\u6536\u85cf\u6570", value: "saved" },
                        { title: "\u4eca\u65e5\u6d4f\u89c8\u6570", value: "today_views" },
                        { title: "\u672c\u5468\u6d4f\u89c8\u6570", value: "weekly_views" },
                        { title: "\u672c\u6708\u6d4f\u89c8\u6570", value: "monthly_views" },
                        { title: "\u603b\u6d4f\u89c8\u6570", value: "views" }
                    ]
                },
                { name: "page", title: "\u9875\u7801", type: "page", description: "\u9875\u7801", value: "1" }
            ]
        },
        {
            title: "\u4eca\u65e5\u70ed\u95e8",
            description: "\u4eca\u65e5\u70ed\u95e8\u5f71\u7247",
            requiresWebView: false,
            functionName: "loadTodayHot",
            cacheDuration: 1800,
            params: [
                { name: "page", title: "\u9875\u7801", type: "page", description: "\u9875\u7801", value: "1" }
            ]
        },
        {
            title: "\u672c\u5468\u70ed\u95e8",
            description: "\u672c\u5468\u70ed\u95e8\u5f71\u7247",
            requiresWebView: false,
            functionName: "loadWeeklyHot",
            cacheDuration: 1800,
            params: [
                { name: "page", title: "\u9875\u7801", type: "page", description: "\u9875\u7801", value: "1" }
            ]
        },
        {
            title: "\u672c\u6708\u70ed\u95e8",
            description: "\u672c\u6708\u70ed\u95e8\u5f71\u7247",
            requiresWebView: false,
            functionName: "loadMonthlyHot",
            cacheDuration: 1800,
            params: [
                { name: "page", title: "\u9875\u7801", type: "page", description: "\u9875\u7801", value: "1" }
            ]
        },
        {
            title: "\u65b0\u4f5c\u4e0a\u5e02",
            description: "\u65b0\u4f5c\u4e0a\u5e02\u5f71\u7247",
            requiresWebView: false,
            functionName: "loadNewRelease",
            cacheDuration: 1800,
            params: [
                { name: "page", title: "\u9875\u7801", type: "page", description: "\u9875\u7801", value: "1" }
            ]
        },
        {
            title: "\u4e2d\u6587\u5b57\u5e55",
            description: "\u4e2d\u6587\u5b57\u5e55\u5f71\u7247",
            requiresWebView: false,
            functionName: "loadChineseSubtitle",
            cacheDuration: 1800,
            params: [
                {
                    name: "sort_by",
                    title: "\u6392\u5e8f",
                    type: "enumeration",
                    description: "\u6392\u5e8f\u65b9\u5f0f",
                    value: "released_at",
                    enumOptions: [
                        { title: "\u53d1\u884c\u65e5\u671f", value: "released_at" },
                        { title: "\u6700\u8fd1\u66f4\u65b0", value: "published_at" },
                        { title: "\u6536\u85cf\u6570", value: "saved" },
                        { title: "\u4eca\u65e5\u6d4f\u89c8\u6570", value: "today_views" },
                        { title: "\u672c\u5468\u6d4f\u89c8\u6570", value: "weekly_views" },
                        { title: "\u672c\u6708\u6d4f\u89c8\u6570", value: "monthly_views" },
                        { title: "\u603b\u6d4f\u89c8\u6570", value: "views" }
                    ]
                },
                { name: "page", title: "\u9875\u7801", type: "page", description: "\u9875\u7801", value: "1" }
            ]
        },
        {
            title: "\u65e0\u7801\u5f71\u7247\u5e93",
            description: "\u65e0\u7801\u5f71\u7247\u5404\u5206\u7c7b",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "\u9009\u62e9\u5206\u7c7b",
                    type: "enumeration",
                    description: "\u9009\u62e9\u5206\u7c7b",
                    enumOptions: [
                        { title: "\u65e0\u7801\u6d41\u51fa", value: "https://missav.ai/dm621/cn/uncensored-leak" },
                        { title: "FC2", value: "https://missav.ai/dm99/cn/fc2" },
                        { title: "HEYZO", value: "https://missav.ai/dm319995/cn/heyzo" },
                        { title: "\u4e1c\u4eac\u70ed", value: "https://missav.ai/dm29/cn/tokyohot" },
                        { title: "Caribbeancom", value: "https://missav.ai/dm1271239/cn/caribbeancom" },
                        { title: "Gachinco", value: "https://missav.ai/dm135/cn/gachinco" },
                        { title: "XXX-AV", value: "https://missav.ai/dm29/cn/xxxav" },
                        { title: "\u4eba\u59bb\u65a9", value: "https://missav.ai/dm24/cn/marriedslash" },
                        { title: "\u987d\u76ae 4610", value: "https://missav.ai/dm19/cn/naughty4610" },
                        { title: "\u987d\u76ae 0930", value: "https://missav.ai/dm22/cn/naughty0930" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "\u6392\u5e8f",
                    type: "enumeration",
                    description: "\u6392\u5e8f\u65b9\u5f0f",
                    value: "released_at",
                    enumOptions: [
                        { title: "\u53d1\u884c\u65e5\u671f", value: "released_at" },
                        { title: "\u6700\u8fd1\u66f4\u65b0", value: "published_at" },
                        { title: "\u6536\u85cf\u6570", value: "saved" },
                        { title: "\u4eca\u65e5\u6d4f\u89c8\u6570", value: "today_views" },
                        { title: "\u672c\u5468\u6d4f\u89c8\u6570", value: "weekly_views" },
                        { title: "\u672c\u6708\u6d4f\u89c8\u6570", value: "monthly_views" },
                        { title: "\u603b\u6d4f\u89c8\u6570", value: "views" }
                    ]
                },
                { name: "page", title: "\u9875\u7801", type: "page", description: "\u9875\u7801", value: "1" }
            ]
        },
        {
            title: "\u4e9a\u6d32AV\u4e13\u533a",
            description: "\u4e9a\u6d32AV\u5404\u5206\u7c7b",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "\u9009\u62e9\u5206\u7c7b",
                    type: "enumeration",
                    description: "\u9009\u62e9\u5206\u7c7b",
                    enumOptions: [
                        { title: "\u9ebb\u8c46\u4f20\u5a92", value: "https://missav.ai/dm34/cn/madou" },
                        { title: "\u97e9\u56fd\u76f4\u64ad", value: "https://missav.ai/cn/klive" },
                        { title: "\u4e2d\u56fd\u76f4\u64ad", value: "https://missav.ai/cn/clive" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "\u6392\u5e8f",
                    type: "enumeration",
                    description: "\u6392\u5e8f\u65b9\u5f0f",
                    value: "released_at",
                    enumOptions: [
                        { title: "\u53d1\u884c\u65e5\u671f", value: "released_at" },
                        { title: "\u6700\u8fd1\u66f4\u65b0", value: "published_at" },
                        { title: "\u6536\u85cf\u6570", value: "saved" },
                        { title: "\u4eca\u65e5\u6d4f\u89c8\u6570", value: "today_views" },
                        { title: "\u672c\u5468\u6d4f\u89c8\u6570", value: "weekly_views" },
                        { title: "\u672c\u6708\u6d4f\u89c8\u6570", value: "monthly_views" },
                        { title: "\u603b\u6d4f\u89c8\u6570", value: "views" }
                    ]
                },
                { name: "page", title: "\u9875\u7801", type: "page", description: "\u9875\u7801", value: "1" }
            ]
        },
        {
            title: "\u5f71\u7247\u8d28\u91cf\u7c7b",
            description: "\u5f71\u7247\u8d28\u91cf\u7c7b - 12\u4e2a\u7c7b\u578b，748,863\u90e8\u5f71\u7247",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "\u9009\u62e9\u7c7b\u578b",
                    type: "enumeration",
                    description: "\u9009\u62e9\u5177\u4f53\u7c7b\u578b",
                    enumOptions: [
                        { title: "\u9ad8\u6e05 (248,852\u90e8)", value: "https://missav.ai/dm95/cn/genres/%E9%AB%98%E6%B8%85" },
                        { title: "\u72ec\u5bb6 (220,805\u90e8)", value: "https://missav.ai/dm136/cn/genres/%E7%8B%AC%E5%AE%B6" },
                        { title: "\u5355\u4f53\u4f5c\u54c1 (185,259\u90e8)", value: "https://missav.ai/dm118/cn/genres/%E5%8D%95%E4%BD%93%E4%BD%9C%E5%93%81" },
                        { title: "\u8584\u683c (93,610\u90e8)", value: "https://missav.ai/dm95/cn/genres/%E8%96%84%E6%A0%BC" },
                        { title: "\u5168\u9ad8\u6e05 (FHD) (11928\u90e8)", value: "https://missav.ai/cn/genres/%E5%85%A8%E9%AB%98%E6%B8%85%20(FHD)" },
                        { title: "\u4f4e\u6210\u672c\u5f71\u7247 (70\u90e8)", value: "https://missav.ai/cn/genres/%E4%BD%8E%E6%88%90%E6%9C%AC%E5%BD%B1%E7%89%87" },
                        { title: "\u5957\u88c5\u5546\u54c1 (44\u90e8)", value: "https://missav.ai/cn/genres/%E5%A5%97%E8%A3%85%E5%95%86%E5%93%81" },
                        { title: "\u9650\u65f6\u7279\u5356 (37\u90e8)", value: "https://missav.ai/cn/genres/%E9%99%90%E6%97%B6%E7%89%B9%E5%8D%96" },
                        { title: "\u9ad8\u6e05 (HD) (36\u90e8)", value: "https://missav.ai/cn/genres/%E9%AB%98%E6%B8%85%20%28HD%29" },
                        { title: "\u534f\u529b\u4f5c\u54c1 (32\u90e8)", value: "https://missav.ai/cn/genres/%E5%8D%8F%E5%8A%9B%E4%BD%9C%E5%93%81" },
                        { title: "\u5355\u4e00\u4f5c\u54c1 (13\u90e8)", value: "https://missav.ai/cn/genres/%E5%8D%95%E4%B8%80%E4%BD%9C%E5%93%81" },
                        { title: "\u4ec5\u9650\u5206\u53d1 (12\u90e8)", value: "https://missav.ai/cn/genres/%E4%BB%85%E9%99%90%E5%88%86%E5%8F%91" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "\u6392\u5e8f",
                    type: "enumeration",
                    description: "\u6392\u5e8f\u65b9\u5f0f",
                    value: "released_at",
                    enumOptions: [
                        { title: "\u53d1\u884c\u65e5\u671f", value: "released_at" },
                        { title: "\u6700\u8fd1\u66f4\u65b0", value: "published_at" },
                        { title: "\u6536\u85cf\u6570", value: "saved" },
                        { title: "\u4eca\u65e5\u6d4f\u89c8\u6570", value: "today_views" },
                        { title: "\u672c\u5468\u6d4f\u89c8\u6570", value: "weekly_views" },
                        { title: "\u672c\u6708\u6d4f\u89c8\u6570", value: "monthly_views" },
                        { title: "\u603b\u6d4f\u89c8\u6570", value: "views" }
                    ]
                },
                { name: "page", title: "\u9875\u7801", type: "page", description: "\u9875\u7801", value: "1" }
            ]
        },
        {
            title: "\u89d2\u8272\u4e0e\u8eab\u4efd",
            description: "\u89d2\u8272\u4e0e\u8eab\u4efd - 23\u4e2a\u7c7b\u578b，609,543\u90e8\u5f71\u7247",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "\u9009\u62e9\u7c7b\u578b",
                    type: "enumeration",
                    description: "\u9009\u62e9\u5177\u4f53\u7c7b\u578b",
                    enumOptions: [
                        { title: "\u4eba\u59bb (123,405\u90e8)", value: "https://missav.ai/dm67/cn/genres/%E4%BA%BA%E5%A6%BB" },
                        { title: "\u719f\u5973 (111,004\u90e8)", value: "https://missav.ai/dm107/cn/genres/%E7%86%9F%E5%A5%B3" },
                        { title: "\u7d20\u4eba (97,868\u90e8)", value: "https://missav.ai/dm95/cn/genres/%E7%B4%A0%E4%BA%BA" },
                        { title: "\u7f8e\u5c11\u5973 (89,506\u90e8)", value: "https://missav.ai/dm93/cn/genres/%E7%BE%8E%E5%B0%91%E5%A5%B3" },
                        { title: "\u75f4\u5973 (71,969\u90e8)", value: "https://missav.ai/dm68/cn/genres/%E7%97%B4%E5%A5%B3" },
                        { title: "\u5973\u9ad8\u4e2d\u751f (62,542\u90e8)", value: "https://missav.ai/dm61/cn/genres/%E5%A5%B3%E9%AB%98%E4%B8%AD%E7%94%9F" },
                        { title: "\u79d8\u4e66 (997\u90e8)", value: "https://missav.ai/dm63/cn/genres/\u79d8\u4e66" },
                        { title: "\u7f8e\u4e3d\u7684\u6210\u719f\u5973\u4eba (135\u90e8)", value: "https://missav.ai/cn/genres/\u7f8e\u4e3d\u7684\u6210\u719f\u5973\u4eba" },
                        { title: "\u5988\u5988\u670b\u53cb (98\u90e8)", value: "https://missav.ai/cn/genres/%E5%A6%88%E5%A6%88%E6%9C%8B%E5%8F%8B" },
                        { title: "M\u5973\u4eba (77\u90e8)", value: "https://missav.ai/dm1/cn/genres/M%E5%A5%B3%E4%BA%BA" },
                        { title: "\u6210\u719f\u7684\u5973\u4eba (32\u90e8)", value: "https://missav.ai/cn/genres/%E6%88%90%E7%86%9F%E7%9A%84%E5%A5%B3%E4%BA%BA" },
                        { title: "\u5bb6\u5ead\u4e3b\u5987 (32\u90e8)", value: "https://missav.ai/cn/genres/%E5%AE%B6%E5%BA%AD%E4%B8%BB%E5%A6%87" },
                        { title: "\u6210\u719f\u5973\u4eba / \u5df2\u5a5a\u5973\u4eba (29\u90e8)", value: "https://missav.ai/cn/genres/%E6%88%90%E7%86%9F%E5%A5%B3%E4%BA%BA%20/%20%E5%B7%B2%E5%A9%9A%E5%A5%B3%E4%BA%BA" },
                        { title: "\u5176\u4ed6\u5b66\u751f (21\u90e8)", value: "https://missav.ai/cn/genres/%E5%85%B6%E4%BB%96%E5%AD%A6%E7%94%9F" },
                        { title: "\u5927\u5c0f\u59d0 (19\u90e8)", value: "https://missav.ai/dm69/cn/genres/%E5%A4%A7%E5%B0%8F%E5%A7%90" },
                        { title: "\u516c\u4e3b (18\u90e8)", value: "https://missav.ai/cn/genres/%E5%85%AC%E4%B8%BB" },
                        { title: "\u7f8e\u4e3d\u7684\u5973\u5b69 (12\u90e8)", value: "https://missav.ai/dm89/cn/genres/%E7%BE%8E%E4%B8%BD%E7%9A%84%E5%A5%B3%E5%AD%A9" },
                        { title: "\u65b0\u5a18 / \u5e74\u8f7b\u7684\u59bb\u5b50 (10\u90e8)", value: "https://missav.ai/cn/genres/%E6%96%B0%E5%A8%98%20/%20%E5%B9%B4%E8%BD%BB%E7%9A%84%E5%A6%BB%E5%AD%90" },
                        { title: "\u517b\u5973 (10\u90e8)", value: "https://missav.ai/dm1/cn/genres/%E5%85%BB%E5%A5%B3" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "\u6392\u5e8f",
                    type: "enumeration",
                    description: "\u6392\u5e8f\u65b9\u5f0f",
                    value: "released_at",
                    enumOptions: [
                        { title: "\u53d1\u884c\u65e5\u671f", value: "released_at" },
                        { title: "\u6700\u8fd1\u66f4\u65b0", value: "published_at" },
                        { title: "\u6536\u85cf\u6570", value: "saved" },
                        { title: "\u4eca\u65e5\u6d4f\u89c8\u6570", value: "today_views" },
                        { title: "\u672c\u5468\u6d4f\u89c8\u6570", value: "weekly_views" },
                        { title: "\u672c\u6708\u6d4f\u89c8\u6570", value: "monthly_views" },
                        { title: "\u603b\u6d4f\u89c8\u6570", value: "views" }
                    ]
                },
                { name: "page", title: "\u9875\u7801", type: "page", description: "\u9875\u7801", value: "1" }
            ]
        },
        {
            title: "\u6027\u884c\u4e3a\u7c7b\u578b",
            description: "\u6027\u884c\u4e3a\u7c7b\u578b - 19\u4e2a\u7c7b\u578b，759,620\u90e8\u5f71\u7247",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "\u9009\u62e9\u7c7b\u578b",
                    type: "enumeration",
                    description: "\u9009\u62e9\u5177\u4f53\u7c7b\u578b",
                    enumOptions: [
                        { title: "\u4e2d\u51fa (198,292\u90e8)", value: "https://missav.ai/dm127/cn/genres/%E4%B8%AD%E5%87%BA" },
                        { title: "\u53e3\u4ea4 (95,026\u90e8)", value: "https://missav.ai/dm93/cn/genres/%E5%8F%A3%E4%BA%A4" },
                        { title: "\u9a91\u4e58 (86,850\u90e8)", value: "https://missav.ai/dm82/cn/genres/%E9%AA%91%E4%B9%98" },
                        { title: "\u6f6e\u5439 (73,825\u90e8)", value: "https://missav.ai/dm71/cn/genres/%E6%BD%AE%E5%90%B9" },
                        { title: "\u4e73\u4ea4 (68,569\u90e8)", value: "https://missav.ai/dm67/cn/genres/%E4%B9%B3%E4%BA%A4" },
                        { title: "\u989c\u5c04 (63,513\u90e8)", value: "https://missav.ai/dm59/cn/genres/%E9%A2%9C%E5%B0%84" },
                        { title: "\u81ea\u6170 (60,648\u90e8)", value: "https://missav.ai/dm59/cn/genres/%E8%87%AA%E6%85%B0" },
                        { title: "\u624b\u6deb (58,635\u90e8)", value: "https://missav.ai/dm57/cn/genres/%E6%89%8B%E6%B7%AB" },
                        { title: "\u5185\u5c04\u7cbe (57\u90e8)", value: "https://missav.ai/dm77/cn/genres/%E5%86%85%E5%B0%84%E7%B2%BE" },
                        { title: "\u6781\u81f4\u9ad8\u6f6e (88\u90e8)", value: "https://missav.ai/dm19/cn/genres/%E6%9E%81%E8%87%B4%E9%AB%98%E6%BD%AE" },
                        { title: "3P (26\u90e8)", value: "https://missav.ai/dm45/cn/genres/3P" },
                        { title: "\u591a\u4eba (26\u90e8)", value: "https://missav.ai/cn/genres/%E5%A4%9A%E4%BA%BA" },
                        { title: "\u72d7\u72d7\u5f0f (19\u90e8)", value: "https://missav.ai/cn/genres/%E7%8B%97%E7%8B%97%E5%BC%8F" },
                        { title: "\u6492\u5c3f (17\u90e8)", value: "https://missav.ai/cn/genres/%E6%92%92%E5%B0%BF" },
                        { title: "\u76d0\u5439 (16\u90e8)", value: "https://missav.ai/cn/genres/%E7%9B%90%E5%90%B9" },
                        { title: "\u6492\u5c3f (14\u90e8)", value: "https://missav.ai/dm12/cn/genres/%E6%92%92%E5%B0%BF" },
                        { title: "3P / 4P (11\u90e8)", value: "https://missav.ai/cn/genres/3P%20/%204P" },
                        { title: "\u6d17\u6fa1 (26\u90e8)", value: "https://missav.ai/cn/genres/%E6%B4%97%E6%BE%A1" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "\u6392\u5e8f",
                    type: "enumeration",
                    description: "\u6392\u5e8f\u65b9\u5f0f",
                    value: "released_at",
                    enumOptions: [
                        { title: "\u53d1\u884c\u65e5\u671f", value: "released_at" },
                        { title: "\u6700\u8fd1\u66f4\u65b0", value: "published_at" },
                        { title: "\u6536\u85cf\u6570", value: "saved" },
                        { title: "\u4eca\u65e5\u6d4f\u89c8\u6570", value: "today_views" },
                        { title: "\u672c\u5468\u6d4f\u89c8\u6570", value: "weekly_views" },
                        { title: "\u672c\u6708\u6d4f\u89c8\u6570", value: "monthly_views" },
                        { title: "\u603b\u6d4f\u89c8\u6570", value: "views" }
                    ]
                },
                { name: "page", title: "\u9875\u7801", type: "page", description: "\u9875\u7801", value: "1" }
            ]
        },
        {
            title: "\u60c5\u8282\u4e0e\u4e3b\u9898",
            description: "\u60c5\u8282\u4e0e\u4e3b\u9898 - 15\u4e2a\u7c7b\u578b，363,926\u90e8\u5f71\u7247",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "\u9009\u62e9\u7c7b\u578b",
                    type: "enumeration",
                    description: "\u9009\u62e9\u5177\u4f53\u7c7b\u578b",
                    enumOptions: [
                        { title: "\u4f01\u5212 (67,686\u90e8)", value: "https://missav.ai/dm67/cn/genres/%E4%BC%81%E5%88%92" },
                        { title: "\u4e71\u4f26 (56,481\u90e8)", value: "https://missav.ai/dm55/cn/genres/%E4%B9%B1%E4%BC%A6" },
                        { title: "NTR (51,273\u90e8)", value: "https://missav.ai/dm51/cn/genres/NTR" },
                        { title: "\u642d\u8baa (48,965\u90e8)", value: "https://missav.ai/dm48/cn/genres/%E6%90%AD%E8%AE%AA" },
                        { title: "\u6deb\u4e71 (47,821\u90e8)", value: "https://missav.ai/dm47/cn/genres/%E6%B7%AB%E4%B9%B1" },
                        { title: "\u5267\u60c5 (46,573\u90e8)", value: "https://missav.ai/dm46/cn/genres/%E5%89%A7%E6%83%85" },
                        { title: "\u7f9e\u8fb1 (44,892\u90e8)", value: "https://missav.ai/dm44/cn/genres/%E7%BE%9E%E8%BE%B1" },
                        { title: "\u59bb\u5b50\u7684\u51fa\u8f68 / NTR / \u6234\u7eff\u5e3d\u5b50 (74\u90e8)", value: "https://missav.ai/cn/genres/%E5%A6%BB%E5%AD%90%E7%9A%84%E5%87%BA%E8%BD%A8%20/%20NTR%20/%20%E6%88%B4%E7%BB%BF%E5%B8%BD%E5%AD%90" },
                        { title: "\u6234\u7eff\u5e3d\u5b50 (39\u90e8)", value: "https://missav.ai/cn/genres/%E6%88%B4%E7%BB%BF%E5%B8%BD%E5%AD%90" },
                        { title: "\u544a\u767d\u4f53\u9a8c (30\u90e8)", value: "https://missav.ai/cn/genres/%E5%91%8A%E7%99%BD%E4%BD%93%E9%AA%8C" },
                        { title: "\u5916\u9047\u59bb\u5b50 / NTR / \u6234\u7eff\u5e3d\u5b50 (17\u90e8)", value: "https://missav.ai/cn/genres/%E5%A4%96%E9%81%87%E5%A6%BB%E5%AD%90%20/%20NTR%20/%20%E6%88%B4%E7%BB%BF%E5%B8%BD%E5%AD%90" },
                        { title: "\u4ea4\u5f80 (13\u90e8)", value: "https://missav.ai/cn/genres/%E4%BA%A4%E5%BE%80" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "\u6392\u5e8f",
                    type: "enumeration",
                    description: "\u6392\u5e8f\u65b9\u5f0f",
                    value: "released_at",
                    enumOptions: [
                        { title: "\u53d1\u884c\u65e5\u671f", value: "released_at" },
                        { title: "\u6700\u8fd1\u66f4\u65b0", value: "published_at" },
                        { title: "\u6536\u85cf\u6570", value: "saved" },
                        { title: "\u4eca\u65e5\u6d4f\u89c8\u6570", value: "today_views" },
                        { title: "\u672c\u5468\u6d4f\u89c8\u6570", value: "weekly_views" },
                        { title: "\u672c\u6708\u6d4f\u89c8\u6570", value: "monthly_views" },
                        { title: "\u603b\u6d4f\u89c8\u6570", value: "views" }
                    ]
                },
                { name: "page", title: "\u9875\u7801", type: "page", description: "\u9875\u7801", value: "1" }
            ]
        },
        {
            title: "\u7279\u6b8a\u73a9\u6cd5\u7c7b",
            description: "\u7279\u6b8a\u73a9\u6cd5 - 9\u4e2a\u7c7b\u578b，85,102\u90e8\u5f71\u7247",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "\u9009\u62e9\u7c7b\u578b",
                    type: "enumeration",
                    description: "\u9009\u62e9\u5177\u4f53\u7c7b\u578b",
                    enumOptions: [
                        { title: "\u591a\u4eba\u8fd0\u52a8 (53,962\u90e8)", value: "https://missav.ai/dm53/cn/genres/%E5%A4%9A%E4%BA%BA%E8%BF%90%E5%8A%A8" },
                        { title: "\u62d8\u675f (41,628\u90e8)", value: "https://missav.ai/dm41/cn/genres/%E6%8B%98%E6%9D%9F" },
                        { title: "\u810f\u8bdd (63\u90e8)", value: "https://missav.ai/cn/genres/%E8%84%8F%E8%AF%9D" },
                        { title: "\u50ac\u7720\u6d17\u8111 (62\u90e8)", value: "https://missav.ai/cn/genres/%E5%82%AC%E7%9C%A0%E6%B4%97%E8%84%91" },
                        { title: "\u53e3\u7403 (51\u90e8)", value: "https://missav.ai/cn/genres/%E5%8F%A3%E7%90%83" },
                        { title: "\u653e\u7f6ePlay (31\u90e8)", value: "https://missav.ai/cn/genres/%E6%94%BE%E7%BD%AEPlay" },
                        { title: "\u5974\u96b6 (26\u90e8)", value: "https://missav.ai/dm6/cn/genres/%E5%A5%B4%E9%9A%B6" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "\u6392\u5e8f",
                    type: "enumeration",
                    description: "\u6392\u5e8f\u65b9\u5f0f",
                    value: "released_at",
                    enumOptions: [
                        { title: "\u53d1\u884c\u65e5\u671f", value: "released_at" },
                        { title: "\u6700\u8fd1\u66f4\u65b0", value: "published_at" },
                        { title: "\u6536\u85cf\u6570", value: "saved" },
                        { title: "\u4eca\u65e5\u6d4f\u89c8\u6570", value: "today_views" },
                        { title: "\u672c\u5468\u6d4f\u89c8\u6570", value: "weekly_views" },
                        { title: "\u672c\u6708\u6d4f\u89c8\u6570", value: "monthly_views" },
                        { title: "\u603b\u6d4f\u89c8\u6570", value: "views" }
                    ]
                },
                { name: "page", title: "\u9875\u7801", type: "page", description: "\u9875\u7801", value: "1" }
            ]
        },
        {
            title: "\u8eab\u6750\u7279\u5f81\u7c7b",
            description: "\u8eab\u6750\u7279\u5f81 - 14\u4e2a\u7c7b\u578b，234,821\u90e8\u5f71\u7247",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "\u9009\u62e9\u7c7b\u578b",
                    type: "enumeration",
                    description: "\u9009\u62e9\u5177\u4f53\u7c7b\u578b",
                    enumOptions: [
                        { title: "\u5de8\u4e73 (165,810\u90e8)", value: "https://missav.ai/dm112/cn/genres/%E5%B7%A8%E4%B9%B3" },
                        { title: "\u82d7\u6761 (34,968\u90e8)", value: "https://missav.ai/dm34/cn/genres/%E8%8B%97%E6%9D%A1" },
                        { title: "\u7f8e\u4e73 (33,527\u90e8)", value: "https://missav.ai/dm33/cn/genres/%E7%BE%8E%E4%B9%B3" },
                        { title: "D\u7f69\u676f (79\u90e8)", value: "https://missav.ai/cn/genres/D%E7%BD%A9%E6%9D%AF" },
                        { title: "\u80cc\u90e8 (73\u90e8)", value: "https://missav.ai/dm355/cn/genres/%E8%83%8C%E9%83%A8" },
                        { title: "\u7f8e\u4e3d\u7684\u5c41\u80a1 (60\u90e8)", value: "https://missav.ai/cn/genres/%E7%BE%8E%E4%B8%BD%E7%9A%84%E5%B1%81%E8%82%A1" },
                        { title: "E\u7f69\u676f\u4ee5\u4e0a\u7684Judai（\u9752\u5c11\u5e74） (55\u90e8)", value: "https://missav.ai/cn/genres/E%E7%BD%A9%E6%9D%AF%E4%BB%A5%E4%B8%8A%E7%9A%84Judai%EF%BC%88%E9%9D%92%E5%B0%91%E5%B9%B4%EF%BC%89" },
                        { title: "\u751c\u5c41\u80a1 (54\u90e8)", value: "https://missav.ai/cn/genres/%E7%94%9C%E5%B1%81%E8%82%A1" },
                        { title: "\u7f8e\u5c3b (46\u90e8)", value: "https://missav.ai/cn/genres/%E7%BE%8E%E5%B0%BB" },
                        { title: "\u6027\u611f\u7684\u817f (42\u90e8)", value: "https://missav.ai/cn/genres/%E6%80%A7%E6%84%9F%E7%9A%84%E8%85%BF" },
                        { title: "\u5927\u4e73\u623f (31\u90e8)", value: "https://missav.ai/cn/genres/%E5%A4%A7%E4%B9%B3%E6%88%BF" },
                        { title: "\u767d\u7699\u7684\u76ae\u80a4 (16\u90e8)", value: "https://missav.ai/cn/genres/%E7%99%BD%E7%9A%99%E7%9A%84%E7%9A%AE%E8%82%A4" },
                        { title: "\u5c0f\u4e73\u623f (16\u90e8)", value: "https://missav.ai/cn/genres/%E5%B0%8F%E4%B9%B3%E6%88%BF" },
                        { title: "\u76ae\u80a4\u9ed1 (44\u90e8)", value: "https://missav.ai/cn/genres/%E7%9A%AE%E8%82%A4%E9%BB%91" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "\u6392\u5e8f",
                    type: "enumeration",
                    description: "\u6392\u5e8f\u65b9\u5f0f",
                    value: "released_at",
                    enumOptions: [
                        { title: "\u53d1\u884c\u65e5\u671f", value: "released_at" },
                        { title: "\u6700\u8fd1\u66f4\u65b0", value: "published_at" },
                        { title: "\u6536\u85cf\u6570", value: "saved" },
                        { title: "\u4eca\u65e5\u6d4f\u89c8\u6570", value: "today_views" },
                        { title: "\u672c\u5468\u6d4f\u89c8\u6570", value: "weekly_views" },
                        { title: "\u672c\u6708\u6d4f\u89c8\u6570", value: "monthly_views" },
                        { title: "\u603b\u6d4f\u89c8\u6570", value: "views" }
                    ]
                },
                { name: "page", title: "\u9875\u7801", type: "page", description: "\u9875\u7801", value: "1" }
            ]
        },
        {
            title: "\u804c\u4e1a\u89d2\u8272\u7c7b",
            description: "\u804c\u4e1a\u89d2\u8272 - 8\u4e2a\u7c7b\u578b，372\u90e8\u5f71\u7247",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "\u9009\u62e9\u7c7b\u578b",
                    type: "enumeration",
                    description: "\u9009\u62e9\u5177\u4f53\u7c7b\u578b",
                    enumOptions: [
                        { title: "\u63a5\u5f85\u5458 (97\u90e8)", value: "https://missav.ai/cn/genres/%E6%8E%A5%E5%BE%85%E5%91%98" },
                        { title: "\u5973\u5bfc\u6e38 (92\u90e8)", value: "https://missav.ai/dm2/cn/genres/%E5%A5%B3%E5%AF%BC%E6%B8%B8" },
                        { title: "\u5566\u5566\u961f (69\u90e8)", value: "https://missav.ai/cn/genres/%E5%95%A6%E5%95%A6%E9%98%9F" },
                        { title: "\u7a7a\u4e2d\u5c0f\u59d0 CA (50\u90e8)", value: "https://missav.ai/cn/genres/%E7%A9%BA%E4%B8%AD%E5%B0%8F%E5%A7%90%20CA" },
                        { title: "\u53f0\u6e7e\u6a21\u7279\u513f (20\u90e8)", value: "https://missav.ai/cn/genres/%E5%8F%B0%E6%B9%BE%E6%A8%A1%E7%89%B9%E5%84%BF" },
                        { title: "\u8ff7\u4f60\u88d9\u5973\u8b66 (20\u90e8)", value: "https://missav.ai/dm1/cn/genres/%E8%BF%B7%E4%BD%A0%E8%A3%99%E5%A5%B3%E8%AD%A6" },
                        { title: "\u8272\u60c5\u660e\u661f (14\u90e8)", value: "https://missav.ai/cn/genres/%E8%89%B2%E6%83%85%E6%98%8E%E6%98%9F" },
                        { title: "\u6f14\u5458 (10\u90e8)", value: "https://missav.ai/cn/genres/%E6%BC%94%E5%91%98" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "\u6392\u5e8f",
                    type: "enumeration",
                    description: "\u6392\u5e8f\u65b9\u5f0f",
                    value: "released_at",
                    enumOptions: [
                        { title: "\u53d1\u884c\u65e5\u671f", value: "released_at" },
                        { title: "\u6700\u8fd1\u66f4\u65b0", value: "published_at" },
                        { title: "\u6536\u85cf\u6570", value: "saved" },
                        { title: "\u4eca\u65e5\u6d4f\u89c8\u6570", value: "today_views" },
                        { title: "\u672c\u5468\u6d4f\u89c8\u6570", value: "weekly_views" },
                        { title: "\u672c\u6708\u6d4f\u89c8\u6570", value: "monthly_views" },
                        { title: "\u603b\u6d4f\u89c8\u6570", value: "views" }
                    ]
                },
                { name: "page", title: "\u9875\u7801", type: "page", description: "\u9875\u7801", value: "1" }
            ]
        },
        {
            title: "\u62cd\u6444\u65b9\u5f0f\u7c7b",
            description: "\u62cd\u6444\u65b9\u5f0f - 6\u4e2a\u7c7b\u578b，78,894\u90e8\u5f71\u7247",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "\u9009\u62e9\u7c7b\u578b",
                    type: "enumeration",
                    description: "\u9009\u62e9\u5177\u4f53\u7c7b\u578b",
                    enumOptions: [
                        { title: "\u81ea\u62cd (39,847\u90e8)", value: "https://missav.ai/dm39/cn/genres/%E8%87%AA%E6%8B%8D" },
                        { title: "\u5077\u62cd (38,924\u90e8)", value: "https://missav.ai/dm38/cn/genres/%E5%81%B7%E6%8B%8D" },
                        { title: "\u7b2c\u4e00\u6b21\u62cd\u6444 (48\u90e8)", value: "https://missav.ai/cn/genres/%E7%AC%AC%E4%B8%80%E6%AC%A1%E6%8B%8D%E6%91%84" },
                        { title: "\u4e3b\u89c2\u6027 (16\u90e8)", value: "https://missav.ai/cn/genres/%E4%B8%BB%E8%A7%82%E6%80%A7" },
                        { title: "\u8bb0\u5f55 (15\u90e8)", value: "https://missav.ai/cn/genres/%E8%AE%B0%E5%BD%95" },
                        { title: "\u6309\u6469 (15\u90e8)", value: "https://missav.ai/dm6/cn/genres/%E6%8C%89%E6%91%A9" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "\u6392\u5e8f",
                    type: "enumeration",
                    description: "\u6392\u5e8f\u65b9\u5f0f",
                    value: "released_at",
                    enumOptions: [
                        { title: "\u53d1\u884c\u65e5\u671f", value: "released_at" },
                        { title: "\u6700\u8fd1\u66f4\u65b0", value: "published_at" },
                        { title: "\u6536\u85cf\u6570", value: "saved" },
                        { title: "\u4eca\u65e5\u6d4f\u89c8\u6570", value: "today_views" },
                        { title: "\u672c\u5468\u6d4f\u89c8\u6570", value: "weekly_views" },
                        { title: "\u672c\u6708\u6d4f\u89c8\u6570", value: "monthly_views" },
                        { title: "\u603b\u6d4f\u89c8\u6570", value: "views" }
                    ]
                },
                { name: "page", title: "\u9875\u7801", type: "page", description: "\u9875\u7801", value: "1" }
            ]
        },
        {
  title: "\u65f6\u957f\u5408\u96c6\u7c7b",
  description: "\u65f6\u957f\u4e0e\u5408\u96c6 - 3\u4e2a\u7c7b\u578b\uff0c73,839\u90e8\u5f71\u7247",
  requiresWebView: false,
  functionName: "loadDurationPage",  // 改用专用函数，避免影响其他栏目
  cacheDuration: 1800,
  params: [
    {
      name: "url",
      title: "\u9009\u62e9\u7c7b\u578b",
      type: "enumeration",
      description: "\u9009\u62e9\u5177\u4f53\u7c7b\u578b",
      enumOptions: [
        { title: "4\u5c0f\u65f6\u4ee5\u4e0a (37,685\u90e8)", value: "https://missav.ai/dm37/cn/genres/4%E5%B0%8F%E6%97%B6%E4%BB%A5%E4%B8%8A" },
        { title: "\u5408\u96c6 (36,142\u90e8)", value: "https://missav.ai/dm36/cn/genres/%E5%90%88%E9%9B%86" },
        { title: "\u8d85\u8fc7\u5de5\u4f5c\u65f6\u95f4 4 \u5c0f\u65f6 (12\u90e8)", value: "https://missav.ai/cn/genres/%E8%B6%85%E8%BF%87%E5%B7%A5%E4%BD%9C%E6%97%B6%E9%97%B4%204%20%E5%B0%8F%E6%97%B6" }
      ]
    },
    {
      name: "sort_by",
      title: "\u6392\u5e8f",
      type: "enumeration",
      description: "\u6392\u5e8f\u65b9\u5f0f",
      value: "released_at",
      enumOptions: [
        { title: "\u53d1\u884c\u65e5\u671f", value: "released_at" },
        { title: "\u6700\u8fd1\u66f4\u65b0", value: "published_at" },
        { title: "\u6536\u85cf\u6570", value: "saved" },
        { title: "\u4eca\u65e5\u6d4f\u89c8\u6570", value: "today_views" },
        { title: "\u672c\u5468\u6d4f\u89c8\u6570", value: "weekly_views" },
        { title: "\u672c\u6708\u6d4f\u89c8\u6570", value: "monthly_views" },
        { title: "\u603b\u6d4f\u89c8\u6570", value: "views" }
      ]
    },
    {
      name: "girlfriend",
      title: "\u5973\u53cb\u540d\u5b57",
      type: "input",
      description: "\u53ef\u9009\uff0c\u8f93\u5165\u5973\u53cb\uff08\u6f14\u5458\uff09\u540d\u5b57\u4ee5\u53e0\u52a0\u7b5b\u9009",
      value: ""
    },
    { name: "page", title: "\u9875\u7801", type: "page", description: "\u9875\u7801", value: "1" }
  ]
},
        {
            title: "\u670d\u88c5\u9020\u578b\u7c7b",
            description: "\u670d\u88c5\u4e0e\u9020\u578b - 13\u4e2a\u7c7b\u578b，657\u90e8\u5f71\u7247",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "\u9009\u62e9\u7c7b\u578b",
                    type: "enumeration",
                    description: "\u9009\u62e9\u5177\u4f53\u7c7b\u578b",
                    enumOptions: [
                        { title: "\u88d9\u5b50\u5355\u58f0\u9053 (75\u90e8)", value: "https://missav.ai/cn/genres/%E8%A3%99%E5%AD%90%E5%8D%95%E5%A3%B0%E9%81%93" },
                        { title: "\u6d74\u8863 (72\u90e8)", value: "https://missav.ai/dm1/cn/genres/%E6%B5%B4%E8%A1%A3" },
                        { title: "\u4e2d\u957f\u53d1 (69\u90e8)", value: "https://missav.ai/dm1/cn/genres/%E4%B8%AD%E9%95%BF%E5%8F%91" },
                        { title: "\u8fde\u88e4\u889c\u7684\u4e8b (67\u90e8)", value: "https://missav.ai/cn/genres/%E8%BF%9E%E8%A3%A4%E8%A2%9C%E7%9A%84%E4%BA%8B" },
                        { title: "\u9762\u5177 (85\u90e8)", value: "https://missav.ai/cn/genres/%E9%9D%A2%E5%85%B7" },
                        { title: "\u9774\u5b50 (44\u90e8)", value: "https://missav.ai/cn/genres/%E9%9D%B4%E5%AD%90" },
                        { title: "\u5377\u53d1 (37\u90e8)", value: "https://missav.ai/cn/genres/%E5%8D%B7%E5%8F%91" },
                        { title: "\u9ad8\u8ddf\u978b (36\u90e8)", value: "https://missav.ai/cn/genres/%E9%AB%98%E8%B7%9F%E9%9E%8B" },
                        { title: "\u56f4\u88d9 (31\u90e8)", value: "https://missav.ai/dm25/cn/genres/%E5%9B%B4%E8%A3%99" },
                        { title: "\u91d1\u53d1 (51\u90e8)", value: "https://missav.ai/cn/genres/%E9%87%91%E5%8F%91" },
                        { title: "\u5561\u53d1 (76\u90e8)", value: "https://missav.ai/cn/genres/%E5%95%A1%E5%8F%91" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "\u6392\u5e8f",
                    type: "enumeration",
                    description: "\u6392\u5e8f\u65b9\u5f0f",
                    value: "released_at",
                    enumOptions: [
                        { title: "\u53d1\u884c\u65e5\u671f", value: "released_at" },
                        { title: "\u6700\u8fd1\u66f4\u65b0", value: "published_at" },
                        { title: "\u6536\u85cf\u6570", value: "saved" },
                        { title: "\u4eca\u65e5\u6d4f\u89c8\u6570", value: "today_views" },
                        { title: "\u672c\u5468\u6d4f\u89c8\u6570", value: "weekly_views" },
                        { title: "\u672c\u6708\u6d4f\u89c8\u6570", value: "monthly_views" },
                        { title: "\u603b\u6d4f\u89c8\u6570", value: "views" }
                    ]
                },
                { name: "page", title: "\u9875\u7801", type: "page", description: "\u9875\u7801", value: "1" }
            ]
        },
        {
            title: "\u7279\u6b8a\u9898\u6750\u7c7b",
            description: "\u7279\u6b8a\u9898\u6750 - 25\u4e2a\u7c7b\u578b，901\u90e8\u5f71\u7247",
            requiresWebView: false,
            functionName: "loadPage",
            cacheDuration: 1800,
            params: [
                {
                    name: "url",
                    title: "\u9009\u62e9\u7c7b\u578b",
                    type: "enumeration",
                    description: "\u9009\u62e9\u5177\u4f53\u7c7b\u578b",
                    enumOptions: [
                        { title: "SF (95\u90e8)", value: "https://missav.ai/cn/genres/SF" },
                        { title: "\u6d1b\u4e3d\u5854 (83\u90e8)", value: "https://missav.ai/cn/genres/%E6%B4%9B%E4%B8%BD%E5%A1%94" },
                        { title: "\u5fa1\u5b85 (82\u90e8)", value: "https://missav.ai/cn/genres/%E5%BE%A1%E5%AE%85" },
                        { title: "\u9b54\u6cd5\u5c11\u5973 (75\u90e8)", value: "https://missav.ai/cn/genres/%E9%AD%94%E6%B3%95%E5%B0%91%E5%A5%B3" },
                        { title: "\u6e38\u620f\u73b0\u5b9e\u7248 (39\u90e8)", value: "https://missav.ai/cn/genres/%E6%B8%B8%E6%88%8F%E7%8E%B0%E5%AE%9E%E7%89%88" },
                        { title: "3D (38\u90e8)", value: "https://missav.ai/dm24/cn/genres/3D" },
                        { title: "AI\u751f\u6210\u7684\u4f5c\u54c1 (37\u90e8)", value: "https://missav.ai/cn/genres/AI%E7%94%9F%E6%88%90%E7%9A%84%E4%BD%9C%E5%93%81" },
                        { title: "\u52a8\u6f2b\u4eba\u7269 (35\u90e8)", value: "https://missav.ai/cn/genres/%E5%8A%A8%E6%BC%AB%E4%BA%BA%E7%89%A9" },
                        { title: "\u865a\u62df\u73b0\u5b9e (35\u90e8)", value: "https://missav.ai/cn/genres/%E8%99%9A%E6%8B%9F%E7%8E%B0%E5%AE%9E" },
                        { title: "\u52a8\u753b (14\u90e8)", value: "https://missav.ai/cn/genres/%E5%8A%A8%E7%94%BB" },
                        { title: "\u5076\u50cf (13\u90e8)", value: "https://missav.ai/cn/genres/%E5%81%B6%E5%83%8F" },
                        { title: "\u900f\u8fc7\u5076\u50cf (32\u90e8)", value: "https://missav.ai/cn/genres/%E9%80%8F%E8%BF%87%E5%81%B6%E5%83%8F" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "\u6392\u5e8f",
                    type: "enumeration",
                    description: "\u6392\u5e8f\u65b9\u5f0f",
                    value: "released_at",
                    enumOptions: [
                        { title: "\u53d1\u884c\u65e5\u671f", value: "released_at" },
                        { title: "\u6700\u8fd1\u66f4\u65b0", value: "published_at" },
                        { title: "\u6536\u85cf\u6570", value: "saved" },
                        { title: "\u4eca\u65e5\u6d4f\u89c8\u6570", value: "today_views" },
                        { title: "\u672c\u5468\u6d4f\u89c8\u6570", value: "weekly_views" },
                        { title: "\u672c\u6708\u6d4f\u89c8\u6570", value: "monthly_views" },
                        { title: "\u603b\u6d4f\u89c8\u6570", value: "views" }
                    ]
                },
                { name: "page", title: "\u9875\u7801", type: "page", description: "\u9875\u7801", value: "1" }
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
        return [createPlaceholderItem("\u8bf7\u8f93\u5165\u641c\u7d22\u5173\u952e\u8bcd")];
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

function createPlaceholderItem(message = "\u5df2\u88ab\u98ce\u63a7，\u8bf7\u7a0d\u540e\u91cd\u8bd5") {
    return {
        id: "content-placeholder",
        type: "placeholder",
        title: "🚫 " + message,
        backdropPath: "https://via.placeholder.com/400x225/FF6B6B/FFFFFF?text=%E5%B7%B2%E8%A2%AB%E9%A3%8E%E6%8E%A7",
        mediaType: "placeholder",
        duration: 0,
        durationText: "⚠️ \u8bbf\u95ee\u53d7\u9650",
        previewUrl: "",
        videoUrl: "",
        link: "",
        description: "🔒 " + message + "\n\n💡 \u53ef\u80fd\u7684\u89e3\u51b3\u65b9\u6848：\n• \u7b49\u5f85\u4e00\u6bb5\u65f6\u95f4\u540e\u91cd\u65b0\u5c1d\u8bd5\n• \u68c0\u67e5\u7f51\u7edc\u8fde\u63a5\n• \u66f4\u6362\u7f51\u7edc\u73af\u5883\n• \u7a0d\u540e\u518d\u8bd5",
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
                    description: `\u756a\u53f7: ${videoCode}`,
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
    const match = description.match(/\u756a\u53f7:\s*([A-Za-z]+-?\d+)/i);
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
                description: `\u756a\u53f7: ${videoCode}`,
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
            description: `\u756a\u53f7: ${videoCode}`,
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
            description: `\u756a\u53f7: ${videoCode}`,
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