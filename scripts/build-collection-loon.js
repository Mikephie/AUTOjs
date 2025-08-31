#!/usr/bin/env node
/**
 * 合并根目录 loon/ 下的所有 *.plugin → loon/Mikephie_合集.plugin
 * - 支持 [Rule] / [Map Local] / [Script] / [MITM] 合并
 * - 汇总 hostname → hostname = %APPEND% ...
 * - 保序去重；保留注释和空行；跳过名字含“合集”的文件
 */

const fs = require('fs');
const path = require('path');

const ROOT     = process.cwd();
const SRC_DIR  = path.join(ROOT, 'loon');
const OUT_FILE = path.join(SRC_DIR, 'Mikephie_合集.plugin');

// 固定追加的 MITM 域名（如需全局追加，填在这；默认留空）
const EXTRA_HOSTNAMES = [
  // 'buy.itunes.apple.com',
];

function readUtf8(p){ return fs.readFileSync(p, 'utf8'); }
function normNL(s){ return s.replace(/\r?\n/g, '\n'); }

function uniqStable(lines){
  const seen = new Set(), out = [];
  for(const raw of lines){
    const key = raw.trim();
    if(!key){ out.push(raw); continue; }
    if(seen.has(key)) continue;
    seen.add(key);
    out.push(raw);
  }
  while(out.length && !out[0].trim()) out.shift();
  while(out.length && !out[out.length-1].trim()) out.pop();
  return out;
}

function extractBlocks(text, section){
  const re = new RegExp(`^\\[${section}\\]\\s*([\\s\\S]*?)(?=^\\[|$)`, 'gmi');
  const out = [];
  let m;
  while((m = re.exec(text)) !== null){
    const body = (m[1] || '').trim();
    if(body) out.push(body);
  }
  return out;
}

function gatherHostnames(text){
  const mitmBodies = extractBlocks(text, 'MITM');
  const hostSet = new Set();
  for(const body of mitmBodies){
    const lines = normNL(body).split('\n');
    for(const line of lines){
      const m = line.match(/^\s*hostname\s*=\s*([^\n\r]+)/i);
      if(!m) continue;
      m[1]
        .replace(/^\s*%APPEND%\s*/i, '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .forEach(h => hostSet.add(h));
    }
  }
  return hostSet;
}

function build(){
  if(!fs.existsSync(SRC_DIR)){
    console.error('[ERR] loon/ 目录不存在');
    process.exit(1);
  }

  const files = fs.readdirSync(SRC_DIR)
    .filter(f => f.endsWith('.plugin') && !/合集/.test(f))
    .sort((a,b)=>a.localeCompare(b,'en'));

  const RULE  = [], MAPL = [], SCRIPT = [];
  const HOSTS = new Set(EXTRA_HOSTNAMES);

  for(const f of files){
    const p = path.join(SRC_DIR, f);
    const raw = normNL(readUtf8(p));

    const addSec = (sec, bucket) => {
      const blocks = extractBlocks(raw, sec);
      if(!blocks.length) return;
      bucket.push('', `# ===== ${f} — [${sec}] =====`);
      for(const b of blocks){
        bucket.push(...normNL(b).split('\n'));
      }
    };
    addSec('Rule',      RULE);
    addSec('Map Local', MAPL);
    addSec('Script',    SCRIPT);

    const set = gatherHostnames(raw);
    for(const h of set) HOSTS.add(h);
  }

  const ruleOut   = uniqStable(RULE);
  const maplOut   = uniqStable(MAPL);
  const scriptOut = uniqStable(SCRIPT);
  const hostOut   = Array.from(HOSTS)
                    .filter(Boolean)
                    .map(s=>s.trim())
                    .filter((v,i,a)=>a.indexOf(v)===i)
                    .sort((a,b)=>a.localeCompare(b,'en'))
                    .join(', ');

  let header = [
    '#!name=Mikephie(Loon)自用合集🔐APP',
    '#!desc=由仓库 loon/*.plugin 自动合并生成',
    '#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ',
    '#!category=🔐APP'
  ].join('\n');

  let out = header + '\n';
  if(ruleOut.length)   out += `\n[Rule]\n${ruleOut.join('\n')}\n`;
  if(maplOut.length)   out += `\n[Map Local]\n${maplOut.join('\n')}\n`;
  if(scriptOut.length) out += `\n[Script]\n${scriptOut.join('\n')}\n`;
  if(hostOut)          out += `\n[MITM]\nhostname = %APPEND% ${hostOut}\n`;

  fs.writeFileSync(OUT_FILE, out, 'utf8');
  console.log('[OK] Loon 合集生成：', OUT_FILE);
}

build();
