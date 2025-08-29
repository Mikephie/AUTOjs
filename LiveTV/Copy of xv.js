// ==============================
// XVideos Widget -- 简洁完整版（含高清优先/HLS挑最高码率）
// ==============================

const BASE_URL = 'https://www.xvideos.com';

// ---- 请求头（更像浏览器，降低风控）
const DEFAULT_HEADERS = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Referer': 'https://www.google.com/',
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
};

// ---- 极简工具
function merge(obj, src) {
  obj = obj || {};
  src = src || {};
  for (const k in src) {
    if (!Object.prototype.hasOwnProperty.call(src, k)) continue;
    const v = src[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      obj[k] = merge(obj[k] || {}, v);
    } else {
      obj[k] = v;
    }
  }
  return obj;
}
function htmlUnescape(s) {
  return String(s || '')
    .replace(/&amp;/g,'&')
    .replace(/&lt;/g,'<')
    .replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"')
    .replace(/&#39;/g,"'");
}
function formatUrl(url) {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${BASE_URL}${url}`;
  return url;
}
function generateVideoPreviewUrl(thumbnailUrl) {
  if (!thumbnailUrl) return '';
  const dir = thumbnailUrl.substring(0, thumbnailUrl.lastIndexOf('/'));
  return `${dir
    .replace(/\/thumbs(169)?(xnxx)?((l*)|(poster))\//, '/videopreview/')
    .replace(/(-[0-9]+)_([0-9]+)/, '_$2$1')}_169.mp4`;
}

// —— 解析 HLS master，挑选最高码率分路
const HLS_HEADERS = {
  'Accept': 'application/vnd.apple.mpegurl,text/plain;q=0.9,*/*;q=0.8'
};
function resolveRelative(baseUrl, rel) {
  if (!rel) return '';
  if (/^https?:\/\//i.test(rel)) return rel;
  const prefix = baseUrl.replace(/[^\/?#]+(\?.*)?$/, ''); // 保留目录
  if (rel.startsWith('/')) {
    const origin = baseUrl.match(/^https?:\/\/[^\/]+/i)?.[0] || '';
    return origin + rel;
  }
  return prefix + rel;
}
async function pickBestHLS(masterUrl) {
  try {
    const text = await widgetAPI.get(masterUrl, { headers: HLS_HEADERS });
    const lines = String(text).split('\n');
    let best = null, maxBW = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXT-X-STREAM-INF')) {
        const bwMatch = line.match(/BANDWIDTH=(\d+)/i);
        const bw = bwMatch ? parseInt(bwMatch[1], 10) : 0;
        const next = (lines[i + 1] || '').trim(); // 下一行是分路地址
        if (next && bw >= maxBW) {
          maxBW = bw;
          best = next;
        }
      }
    }
    if (best) return resolveRelative(masterUrl, best);
    return masterUrl; // 不是 master，直接返回
  } catch (e) {
    console.warn('pickBestHLS 失败，回退 master：', e);
    return masterUrl;
  }
}

// ---- Widget 存储（带超时）
async function getStorageItem(key) {
  return Promise.race([
    Widget.storage.getItem(key),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
  ]);
}
async function setStorageItem(key, value) {
  return Promise.race([
    Widget.storage.setItem(key, value),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
  ]);
}

// ---- 统一 http
class WidgetAPI {
  constructor(getDefaultOptions) {
    this.getDefaultOptions = getDefaultOptions;
  }
  async get(url, options) {
    let baseOptions = { headers: DEFAULT_HEADERS };
    if (this.getDefaultOptions) {
      try {
        const def = await this.getDefaultOptions();
        baseOptions = merge(baseOptions, def);
      } catch (e) {
        console.warn('获取默认配置失败，使用基础配置:', e);
      }
    }
    const finalOptions = merge(baseOptions, options || {});
    try {
      const resp = await Widget.http.get(url, finalOptions);
      if (!resp || resp.statusCode !== 200) {
        throw new Error(`请求失败: ${(resp && resp.statusCode) || '未知错误'}`);
      }
      return resp.data;
    } catch (e) {
      throw new Error(`网络请求失败: ${e instanceof Error ? e.message : '未知错误'}`);
    }
  }
  async getHtml(url, options) {
    const text = await this.get(url, options);
    return Widget.html.load(text);
  }
}

// ---- 实例：附带 session_token（如果存得到）
const widgetAPI = new WidgetAPI(async () => {
  try {
    const token = await getStorageItem('xvideos.session_token');
    if (token) return { headers: { Cookie: `session_token=${token}` } };
  } catch {}
  return {};
});

// ---- 规范化人名 -> slug（含常见别名）
function normalizePornstarInput(input) {
  let s = String(input || '').trim().toLowerCase()
    .replace(/[.’'"]/g, '')
    .replace(/\s+|_+/g, '-')
    .replace(/-model\b/, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const alias = {
    'nancy-ace': 'nancy-a',
    'nancy a': 'nancy-a',
    'nancy a.': 'nancy-a',
    'eva': 'eva-elfie',
  };
  return alias[s] || s;
}

// ---- 列表卡片解析（标准）
function parseThumbList($, scopeSelector) {
  return Array.from($(scopeSelector)).map(el => {
    const $el = $(el);
    const $title = $el.find('.title a');
    let link = $title.attr('href');
    if (!link) return null;
    link = formatUrl(link);

    const img = $el.find('img');
    const backdropPath =
      img.attr('data-src') ||
      img.attr('data-thumb_url') ||
      img.attr('src') || '';
    const title = ($title.text() || '').trim();

    const item = {
      id: link,
      type: 'url',
      mediaType: 'movie',
      link,
      title,
      backdropPath
    };
    if (backdropPath) item.previewUrl = generateVideoPreviewUrl(backdropPath);
    return item;
  }).filter(Boolean);
}

// ---- 列表卡片解析（更通用：兼容搜索页/其它模板）
function parseAnyVideoList($) {
  // A. 常见容器
  let list = parseThumbList($, '#content .thumb-block:not(.thumb-ad)');
  if (list.length) return list;

  // B. 其它模板 class
  list = parseThumbList($, '.mozaique .thumb-block, .video-card, .thumb-block');
  if (list.length) return list;

  // C. 搜索页兜底：扫所有视频链接
  const items = [];
  $('a[href^="/video"]').each((_, a) => {
    const $a = $(a);
    const href = $a.attr('href') || '';
    if (!/\/video\d+\//.test(href)) return;
    const $card = $a.closest('.thumb-block, .video-card, .thumb, .thumb-inside') || $a;
    const title = ($a.attr('title') || $a.text() || '').trim();
    const img = $card.find('img');
    const backdropPath =
      img.attr('data-src') || img.attr('data-thumb_url') || img.attr('src') || '';

    const link = formatUrl(href);
    const item = {
      id: link,
      type: 'url',
      mediaType: 'movie',
      link,
      title: title || 'Video',
      backdropPath
    };
    if (backdropPath) item.previewUrl = generateVideoPreviewUrl(backdropPath);
    items.push(item);
  });

  // 去重
  const uniq = [];
  const seen = new Set();
  for (const it of items) {
    if (!seen.has(it.id)) {
      seen.add(it.id);
      uniq.push(it);
    }
  }
  return uniq;
}

// ---- JSON item -> 统一格式
function formatXVideosItem(item) {
  const url = formatUrl(item.u);
  return {
    id: url,
    type: 'url',
    mediaType: 'movie',
    link: url,
    title: htmlUnescape(item.tf || item.t),
    backdropPath: item.i,
    previewUrl: generateVideoPreviewUrl(item.i)
  };
}

// ==============================
// 模块实现
// ==============================

WidgetMetadata = {
  id: 'xvideos',
  title: 'XVideos',
  description: 'XVideos',
  author: 'Mikephie',
  version: '2.2.0',
  requiredVersion: '0.0.1',
  site: 'https://github.com/baranwang/forward-widget',
  detailCacheDuration: 1,
  modules: [
    {
      id: 'xvideos.new',
      title: '最新视频',
      description: 'XVideos 最新视频',
      functionName: 'getNewList',
      params: [
        { name: 'page', title: '页码', type: 'page', value: '0' }
      ]
    },
    {
      id: 'xvideos.channel',
      title: '频道',
      description: 'XVideos 频道',
      functionName: 'getChannelList',
      params: [
        {
          name: 'channel',
          title: '频道',
          type: 'input',
          value: '',
          placeholders: [
            { "title":"AsiaM","value":"asiam" },
            { "title":"AV Jiali","value":"av-jiali" },
            { "title":"Japanesecreampiesystem717","value":"japanese_creampie_system717" },
            { "title":"StockingsCat","value":"stockingscat" },
            { "title":"Japan HDV","value":"japan-hdv" },
            { "title":"Jav HD","value":"javhd" },
            { "title":"Caribbeancom","value":"caribbeancom" },
            { "title":"Hisidepon","value":"hisidepon" },
            { "title":"Monmon Tw","value":"monmon_tw" },
            { "title":"MOON FORCE","value":"moonforce" },
            { "title":"Mya Mya","value":"myanma_porn" },
            { "title":"Zzzgirlxxx","value":"zzzgirlxxx" },
            { "title":"Guodong Media","value":"guodong_media" },
            { "title":"Aipornmix","value":"aipornmix1" },
            { "title":"YOSUGA","value":"yosuga" },
            { "title":"Momoka","value":"japanese31" },
            { "title":"Raptor Inc","value":"raptor_inc" },
            { "title":"Girls of HEL","value":"girlsofhel_official" },
            { "title":"Armadillo","value":"shiroutotv" },
            { "title":"1pondo","value":"ipondo" },
            { "title":"Swaglive","value":"swaglive" },
            { "title":"NIKSINDIAN","value":"niks_indian" },
            { "title":"Jimmyreload","value":"jimmyreload" },
            { "title":"S Cute Official","value":"s-cute-official" },
            { "title":"Zenra","value":"zenra-subtitled-japanese-av" },
            { "title":"Japaneserxrx","value":"japaneserxrx" },
            { "title":"Claire0607018","value":"claire0607018" },
            { "title":"JapBliss","value":"japbliss" },
            { "title":"Hey Milf","value":"heymilf" },
            { "title":"Tenshigao","value":"tenshigao" },
            { "title":"AV 69","value":"av69tv" },
            { "title":"Ronysworld","value":"ronysworld" },
            { "title":"Uttaran20","value":"uttaran20" },
            { "title":"Jukujosukidesu","value":"jukujosukidesu" },
            { "title":"Schoolgirls HD","value":"schoolgirlshd" },
            { "title":"Psychoporn Tw","value":"psychoporn_tw" },
            { "title":"Hotxvip","value":"hotxvip1" },
            { "title":"Kmib","value":"k-mib" },
            { "title":"Javhub","value":"javhub" },
            { "title":"DirectorTONG","value":"directortong1" },
            { "title":"Toptenxx","value":"top_tenxxx" },
            { "title":"Kimberlisah","value":"rapliandae" },
            { "title":"Xx66689","value":"xx66689" },
            { "title":"Indigosin","value":"indigo_sin" },
            { "title":"HEYZO","value":"heyzo-xxx" },
            { "title":"Elle Lee Official","value":"elle_lee_official" },
            { "title":"MAX-Japanese","value":"max-japanese" },
            { "title":"Kninebox","value":"kninebox" },
            { "title":"HotyNitu","value":"villagefuke1_official" },
            { "title":"Ferame","value":"ferame" },
            { "title":"Babeneso","value":"babeneso" },
            { "title":"Yellowgamesbyjason","value":"yellow_games_by_jason" },
            { "title":"Creampiedaily","value":"creampiedaily" },
            { "title":"YellowPlum","value":"yellowplum" },
            { "title":"Pikkur.com","value":"pikkurcom" },
            { "title":"Hotxcreator","value":"hotxcreator" },
            { "title":"Kopihitamenak","value":"kopihitamenak" },
            { "title":"Mistress Land","value":"mistressland" },
            { "title":"Gogouncensored","value":"gogouncensored" },
            { "title":"AV Tits","value":"avtits" },
            { "title":"Peach Japan","value":"peach_japan" },
            { "title":"Marutahub","value":"marutahub" },
            { "title":"Neonxvip","value":"neonxvip" },
            { "title":"Emuyumi Couple","value":"emuyumi-couple" },
            { "title":"Venna","value":"venna84" },
            { "title":"Monger In Asia","value":"monger-in-asia" },
            { "title":"All Japanese Pass","value":"alljapanesepass" },
            { "title":"Indianxworld","value":"indianxworld" },
            { "title":"Golupaa","value":"ratanprem009" },
            { "title":"Riya Bhabhi1","value":"riya_bhabhi1" },
            { "title":"Horny Indian Couple","value":"hornyindiancouple" },
            { "title":"AV Stockings","value":"avstockings" },
            { "title":"Asians Bondage","value":"asians-bondage" },
            { "title":"sexworld","value":"sexworld72" },
            { "title":"Eagle MILF","value":"eagle-milf" },
            { "title":"Nana69","value":"nana01921" },
            { "title":"Doggy","value":"doggy2198" },
            { "title":"Netuandhubby","value":"netu_and_hubby" },
            { "title":"PETERS","value":"peters-1" },
            { "title":"Osakaporn","value":"osakaporn" }
          ]
        },
        { name: 'page', title: '页码', type: 'page', value: '0' }
      ]
    },
    {
      id: 'xvideos.pornstars',
      title: '色情明星',
      description: 'XVideos 色情明星',
      functionName: 'getPornstarsList',
      params: [
        {
          name: 'pornstar',
          title: '色情明星',
          type: 'input',
          placeholders: [
            // 常用
            { title: 'Eva Elfie',         value: 'eva-elfie' },
            { title: 'Nancy A',           value: 'nancy-a' },
            { title: 'Mandy Flores',      value: 'mandy-flores' },
            { title: 'Yui Hatano',        value: 'yui-hatano-1' },
            { title: 'Anri Okita',        value: 'anri-okita' },
            { title: 'Eimi Fukada',       value: 'eimi-fukada' },
            { title: 'Yua Mikami',        value: 'yua-mikami' },
            { title: 'Ichika Matsumoto',  value: 'ichika-matsumoto' },
            { title: 'Marina Yuzuki',     value: 'marina-yuzuki' },
            { title: 'Hitomi Tanaka',     value: 'hitomi-tanaka' },
            { title: 'Ai Uehara',         value: 'ai-uehara' },
            { title: 'Maria Ozawa',       value: 'maria-ozawa' },

            // 欧美常见
            { title: 'Angela White',      value: 'angela-white' },
            { title: 'Lana Rhoades',      value: 'lana-rhoades' },
            { title: 'Mia Malkova',       value: 'mia-malkova' },
            { title: 'Riley Reid',        value: 'riley-reid' },
            { title: 'Abella Danger',     value: 'abella-danger' },
            { title: 'Adriana Chechik',   value: 'adriana-chechik' },
            { title: 'Brandi Love',       value: 'brandi-love' },
            { title: 'Cory Chase',        value: 'cory-chase' },
            { title: 'Madison Ivy',       value: 'madison-ivy' },
            { title: 'Kendra Lust',       value: 'kendra-lust' },
            { title: 'Piper Perri',       value: 'piper-perri' },
            { title: 'Nicole Aniston',    value: 'nicole-aniston' },
            { title: 'Dillion Harper',    value: 'dillion-harper' },
            { title: 'Eva Lovia',         value: 'eva-lovia' },
            { title: 'Keisha Grey',       value: 'keisha-grey' },
            { title: 'Asa Akira',         value: 'asa-akira' },

            // 日系补充
            { title: 'Aoi Shirosaki',     value: 'aoi-shirosaki-1' },
            { title: 'Shoko Takahashi',   value: 'shoko-takahashi' },
            { title: 'Kana Momonogi',     value: 'kana-momonogi' },
            { title: 'Hibiki Otsuki',     value: 'hibiki-otsuki' },
            { title: 'Akiho Yoshizawa',   value: 'akiho-yoshizawa' },
            { title: 'Minami Aizawa',     value: 'minami-aizawa' },
            { title: 'Nene Yoshitaka',    value: 'nene-yoshitaka' },
            { title: 'Remu Suzumori',     value: 'remu-suzumori' },
            { title: 'Karen Kaede',       value: 'karen-kaede' },
            { title: 'Aika Yumeno',       value: 'aika-yumeno' },
            { title: 'Tsukasa Aoi',       value: 'tsukasa-aoi' },

            // 你原本的几个（保留）
            { title: 'Momoka',            value: 'momoka142' },
            { title: 'Rae Lil Black',     value: 'rae-lil-black' },
            { title: 'Hushixiaolu',       value: 'hushixiaolu2' },
            { title: 'Monmon Tw',         value: 'monmon_tw1' },
            { title: 'May Thai',          value: 'may-thai' },
            { title: 'Mia Khalifa',       value: 'mia-khalifa-model' }
          ]
        },
        { name: 'page', title: '页码', type: 'page', value: '0' }
      ]
    }
  ]
};

// ---- 最新
async function getNewList(params) {
  try {
    const currentRegion = await getStorageItem('xvideos.region');
    if (currentRegion !== params.region) {
      setStorageItem('xvideos.region', params.region);
      const resp = await Widget.http.get(`${BASE_URL}/change-country/${params.region}`);
      if (resp.headers && resp.headers['set-cookie']) {
        const cookies = String(resp.headers['set-cookie']).split(';');
        for (const cookie of cookies) {
          const [key, value] = cookie.split('=');
          if (key === 'session_token') {
            setStorageItem('xvideos.session_token', value);
            break;
          }
        }
      }
    }
  } catch {}

  const page = params.page ? parseInt(params.page) : 0;
  let url = `${BASE_URL}/`;
  if (page > 0) url += `new/${page}`;

  const $ = await widgetAPI.getHtml(url);
  return parseThumbList($, '#content .thumb-block:not(.thumb-ad)');
}

// ---- 频道
async function getChannelList(params) {
  const page = params.page ? parseInt(params.page) : 0;
  try {
    const resp = await widgetAPI.get(`${BASE_URL}/channels/${params.channel}/videos/best/${page}`);
    if (resp && Array.isArray(resp.videos)) return resp.videos.map(formatXVideosItem);
  } catch (e) {
    console.error('频道视频加载失败', e);
  }
  // 回退 HTML
  try {
    const $ = await widgetAPI.getHtml(`${BASE_URL}/channels/${params.channel}/videos/best/${page}`);
    return parseAnyVideoList($);
  } catch {
    return [];
  }
}

// ---- 色情明星（多 slug、多路由、搜索兜底、canonical 跟随）
async function getPornstarsList(params) {
  const page = params.page ? parseInt(params.page) : 0;

  const raw = params.pornstar || '';
  const base = normalizePornstarInput(raw);

  const slugCandidates = Array.from(new Set([
    base,
    `${base}-1`, // 有些演员有编号后缀
    raw.toLowerCase().trim().replace(/[.’'"]/g, '').replace(/\s+|_+/g, '-')
  ].filter(Boolean)));

  const keyword = base.replace(/-/g, ' ');

  const routesOf = (slug) => ([
    `${BASE_URL}/pornstars/${slug}/videos/best/${page}`,
    `${BASE_URL}/profiles/${slug}/videos/best/${page}`,
    `${BASE_URL}/profiles/${slug}/videos`,
    `${BASE_URL}/?k=${encodeURIComponent(keyword)}`
  ]);

  const parseBy$ = ($) => parseAnyVideoList($);

  const htmlFlow = async (url) => {
    try {
      const $ = await widgetAPI.getHtml(url);
      let list = parseBy$($);
      if (list.length) return list;

      // canonical / og:url 跟随
      const canon = $('link[rel="canonical"]').attr('href') || $('meta[property="og:url"]').attr('content') || '';
      if (canon && typeof canon === 'string') {
        let follow = canon;
        if (/\/profiles\/[^\/]+$/i.test(follow)) follow += '/videos';
        if (/\/videos$/.test(follow) && page > 0) {
          follow = follow.replace(/\/videos$/, `/videos/best/${page}`);
        }
        try {
          const $2 = await widgetAPI.getHtml(follow);
          list = parseBy$($2);
          if (list.length) return list;
        } catch {}
      }
    } catch {}
    return [];
  };

  for (const slug of slugCandidates) {
    for (const url of routesOf(slug)) {
      // 优先尝试 JSON
      try {
        const resp = await widgetAPI.get(url);
        if (resp && Array.isArray(resp.videos) && resp.videos.length) {
          return resp.videos.map(formatXVideosItem);
        }
      } catch {}

      // 回退 HTML（含 canonical）
      const htmlList = await htmlFlow(url);
      if (htmlList.length) return htmlList;
    }
  }

  console.error('色情明星视频加载失败（可能 slug/路由不匹配或地区风控）：', raw, slugCandidates, page);
  return [];
}

// ---- 详情页（高清优先：MP4高码率 > 解析HLS挑最高带宽 > 低码率）
const VIDEO_URL_KEYWORDS = [
  'html5player.setVideoUrlHigh',
  'html5player.setVideoHLS',
  'html5player.setVideoUrlLow'
];

async function loadDetail(url) {
  try {
    const $ = await widgetAPI.getHtml(url);

    // 1) 从 scripts 里找直链 / HLS
    let mp4High = '';
    let hlsUrl  = '';
    let mp4Low  = '';

    $('script').each((_, el) => {
      const text = $(el).text() || '';
      if (!mp4High) {
        const m = text.match(/html5player\.setVideoUrlHigh\('(.*?)'/);
        if (m && m[1]) mp4High = m[1];
      }
      if (!hlsUrl) {
        const m = text.match(/html5player\.setVideoHLS\('(.*?)'/);
        if (m && m[1]) hlsUrl = m[1];
      }
      if (!mp4Low) {
        const m = text.match(/html5player\.setVideoUrlLow\('(.*?)'/);
        if (m && m[1]) mp4Low = m[1];
      }
    });

    // 2) 从 ld+json 兜底（有时有 contentUrl）
    let name = '', desc = '', thumb = '', date = '';
    const ldJson = $('script[type="application/ld+json"]').text();
    if (ldJson) {
      try {
        const data = JSON.parse(ldJson);
        name  = data.name || '';
        desc  = data.description || '';
        thumb = Array.isArray(data.thumbnailUrl) ? data.thumbnailUrl[0] : (data.thumbnailUrl || '');
        date  = data.uploadDate || '';
        if (!mp4High && !hlsUrl && data.contentUrl) {
          if (/\.m3u8($|\?)/i.test(data.contentUrl)) hlsUrl = data.contentUrl;
          else mp4High = data.contentUrl;
        }
      } catch {}
    }

    // 3) 选择“尽量高清”的最终播放地址
    let videoUrl = '';
    if (mp4High) {
      videoUrl = mp4High; // 优先 MP4 高码率直链
    } else if (hlsUrl) {
      videoUrl = await pickBestHLS(hlsUrl); // 解析 master，选最大 BANDWIDTH
    } else if (mp4Low) {
      videoUrl = mp4Low;
    }

    if (!videoUrl) throw new Error('未找到视频资源');

    const result = {
      id: url,
      type: 'detail',
      mediaType: 'movie',
      link: url,
      videoUrl,
      title: name || $('title').text().trim() || 'Video',
      description: desc,
      backdropPath: thumb,
      releaseDate: date
    };

    // 4) 相关视频（可选）
    try {
      const relatedScript = Array.from($('script')).map(el => $(el).text()).find(t => t.includes('var video_related='));
      if (relatedScript) {
        const m = relatedScript.match(/video_related=\[(.*?)\];/);
        if (m && m[1]) {
          const list = JSON.parse(`[${m[1]}]`);
          result.childItems = list.map(formatXVideosItem);
        }
      }
    } catch (e) {
      console.error('视频相关视频加载失败', e);
    }

    return result;
  } catch (e) {
    console.error('视频详情加载失败', e);
    return null;
  }
}