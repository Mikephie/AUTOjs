#!/usr/bin/env node
/**
 * 合并根目录 loon/ 下的所有 *.plugin → loon/Mikephie_合集.plugin
 * 变更点：
 *  - [Rule]/[Map Local]/[Script] 只拼接不去重（严格保序）
 *  - 仅 [MITM] 的 hostname 去重/排序
 */

const fs = require('fs');
const path = require('path');

const ROOT     = process.cwd();
const SRC_DIR  = path.join(ROOT, 'loon');
const OUT_FILE = path.join(SRC_DIR, 'Mikephie_合集.plugin');

// （可选）全局固定追加的 MITM 域名
const EXTRA_HOSTNAMES = [
  // 'buy.itunes.apple.com',
];

function readUtf8(p){ return fs.readFileSync(p,'utf8'); }
function nl(s){ return s.replace(/\r?\n/g,'\n'); }

function extractBlocks(text, section){
  const re = new RegExp(`^\\[${section}\\]\\s*([\\s\\S]*?)(?=^\\[|$)`, 'gmi');
  const out=[];
  let m;
  while((m=re.exec(text))!==null){
    out.push((m[1]||'').replace(/\s+$/,''));
  }
  return out;
}

function gatherHostnames(text){
  const mitmBodies = extractBlocks(text,'MITM');
  const set = new Set();
  for(const body of mitmBodies){
    for(const line of nl(body).split('\n')){
      const m = line.match(/^\s*hostname\s*=\s*([^\n\r]+)/i);
      if(!m) continue;
      m[1]
        .replace(/^\s*%APPEND%\s*/i,'')
        .split(',')
        .map(s=>s.trim())
        .filter(Boolean)
        .forEach(h=>set.add(h));
    }
  }
  return set;
}

function build(){
  if(!fs.existsSync(SRC_DIR)){
    console.error('[ERR] loon/ 目录不存在'); process.exit(1);
  }

  const files = fs.readdirSync(SRC_DIR)
    .filter(f => f.endsWith('.plugin') && !/合集/.test(f))
    .sort((a,b)=>a.localeCompare(b,'en'));

  const RULE=[], MAPL=[], SCRIPT=[];
  const HOSTS = new Set(EXTRA_HOSTNAMES);

  for(const f of files){
    const raw = nl(readUtf8(path.join(SRC_DIR,f)));

    const addSec = (sec, bucket) => {
      const blocks = extractBlocks(raw, sec);
      if(!blocks.length) return;
      bucket.push('');
      bucket.push(`# ===== ${f} — [${sec}] =====`);
      for(const b of blocks){
        bucket.push(...nl(b).split('\n'));
      }
    };
    addSec('Rule',      RULE);
    addSec('Map Local', MAPL);
    addSec('Script',    SCRIPT);

    for(const h of gatherHostnames(raw)) HOSTS.add(h);
  }

  const hostOut = Array.from(HOSTS)
    .filter(Boolean).map(s=>s.trim())
    .filter((v,i,a)=>a.indexOf(v)===i)
    .sort((a,b)=>a.localeCompare(b,'en'))
    .join(', ');

  const header = [
    '#!name=Mikephie(Loon)自用合集🔐APP',
    '#!desc=由 loon/*.plugin 自动合并生成（保持原模块顺序与完整内容）',
    '#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ',
    '#!category=🔐APP'
  ].join('\n');

  let out = header + '\n';
  if(RULE.length)   out += `\n[Rule]\n${RULE.join('\n')}\n`;
  if(MAPL.length)   out += `\n[Map Local]\n${MAPL.join('\n')}\n`;
  if(SCRIPT.length) out += `\n[Script]\n${SCRIPT.join('\n')}\n`;
  if(hostOut)       out += `\n[MITM]\nhostname = %APPEND% ${hostOut}\n`;

  fs.writeFileSync(OUT_FILE, out.replace(/\n{3,}/g,'\n\n'), 'utf8');
  console.log('[OK] Loon 合集生成：', OUT_FILE);
}

build();
