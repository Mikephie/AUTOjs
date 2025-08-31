#!/usr/bin/env node
/**
 * 合并根目录 surge/*.sgmodule → surge/Mikephie_合集.sgmodule
 * - 行扫描解析 [Rule]/[Map Local]/[Script]/[MITM]
 * - 仅对 MITM 的 hostname 去重+排序；其余严格保序拼接
 * - 跳过文件名包含“合集”的产物，避免自我递归
 */
const fs = require('fs');
const path = require('path');

const ROOT     = process.cwd();
const SRC_DIR  = path.join(ROOT, 'surge');
const OUT_FILE = path.join(SRC_DIR, 'Mikephie_合集.sgmodule');

// 可选：全局固定追加 MITM 域名
const EXTRA_HOSTNAMES = [
  // 'buy.itunes.apple.com',
];

const nl = s => s.replace(/\r?\n/g, '\n');

function parseSections(text){
  const lines = nl(text).split('\n');
  const out = { 'Rule':[], 'Map Local':[], 'Script':[], 'MITM':[] };
  let current = null;
  for(const raw of lines){
    const trimmed = raw.trimEnd();
    const m = trimmed.match(/^\[(Rule|Map Local|Script|MITM)\]$/i);
    if(m){ current = m[1]; continue; }
    if(current){ out[current].push(raw); } // 保留原样（含空行、注释）
  }
  return out;
}

function build(){
  if(!fs.existsSync(SRC_DIR)){ console.error('[ERR] surge/ 不存在'); process.exit(1); }

  const files = fs.readdirSync(SRC_DIR)
    .filter(f => f.endsWith('.sgmodule') && !/合集/.test(f))
    .sort((a,b)=>a.localeCompare(b,'en')); // 文件名决定拼接顺序（可用 00- 前缀控序）

  const RULE=[], MAPL=[], SCRIPT=[];
  const HOSTS = new Set(EXTRA_HOSTNAMES);

  for(const f of files){
    const raw = fs.readFileSync(path.join(SRC_DIR,f), 'utf8');
    const sec = parseSections(raw);

    if(sec['Rule'].length){
      RULE.push('', `# ===== ${f} — [Rule] =====`, ...sec['Rule']);
    }
    if(sec['Map Local'].length){
      MAPL.push('', `# ===== ${f} — [Map Local] =====`, ...sec['Map Local']);
    }
    if(sec['Script'].length){
      SCRIPT.push('', `# ===== ${f} — [Script] =====`, ...sec['Script']);
    }
    // 收集 MITM hostnames
    for(const line of sec['MITM']){
      const m = line.match(/^\s*hostname\s*=\s*([^\n\r]+)/i);
      if(!m) continue;
      m[1].replace(/^\s*%APPEND%\s*/i,'')
          .split(',')
          .map(s=>s.trim())
          .filter(Boolean)
          .forEach(h=>HOSTS.add(h));
    }
  }

  const hostOut = Array.from(HOSTS)
    .filter(Boolean).map(s=>s.trim())
    .filter((v,i,a)=>a.indexOf(v)===i)
    .sort((a,b)=>a.localeCompare(b,'en'))
    .join(', ');

  const header = [
    '#!name=Mikephie(Surge)自用合集🔐APP',
    '#!desc=由 surge/*.sgmodule 自动合并生成（保序且不丢行）',
    '#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ',
    '#!category=🔐APP'
  ].join('\n');

  let out = header + '\n';
  if(RULE.length)   out += `\n[Rule]\n${RULE.join('\n')}\n`;
  if(MAPL.length)   out += `\n[Map Local]\n${MAPL.join('\n')}\n`;
  if(SCRIPT.length) out += `\n[Script]\n${SCRIPT.join('\n')}\n`;
  if(hostOut)       out += `\n[MITM]\nhostname = %APPEND% ${hostOut}\n`;

  // 清理多余空行（最多保留 1 个）
  out = out.replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(OUT_FILE, out, 'utf8');
  console.log('[OK] Surge 合集生成：', OUT_FILE);
}

build();
