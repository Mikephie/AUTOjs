#!/usr/bin/env node
/**
 * 合并根目录 loon/*.plugin → loon/Mikephie_合集.plugin
 * - 支持 [General]/[Rule]/[Map Local]/[Script]/[MITM]
 * - [General]/[Rule]/[Map Local]/[Script]：保序不去重
 * - 仅 [MITM] hostname 去重+排序
 * - 智能汇总 [General] 的 force-http-engine-hosts 为一行（去重+排序）
 * - 支持“无段落”模块：整文件视为 [Script]，并从注释 "# hostname = ..." 收集域名
 * - 跳过名字含“合集”的文件
 */
const fs = require('fs');
const path = require('path');

const ROOT     = process.cwd();
const SRC_DIR  = path.join(ROOT, 'loon');
const OUT_FILE = path.join(SRC_DIR, 'Mikephie_合集.plugin');

// 可选：全局固定追加 MITM 域名
const EXTRA_HOSTNAMES = [
  // 'buy.itunes.apple.com',
];

const nl = s => s.replace(/\r?\n/g, '\n');

function parseSections(text){
  const lines = nl(text).split('\n');
  const out = { 'General':[], 'Rule':[], 'Map Local':[], 'Script':[], 'MITM':[] };
  let current = null;
  for(const raw of lines){
    const trimmed = raw.trimEnd();
    const m = trimmed.match(/^\[(General|Rule|Map Local|Script|MITM)\]$/i);
    if(m){ current = m[1]; continue; }
    if(current){ out[current].push(raw); }
  }
  return out;
}
function hasAnyContent(sec){
  return ['General','Rule','Map Local','Script','MITM'].some(k => sec[k].some(l => l.trim() !== ''));
}
function collectHostFromLines(lines, hostSet){
  for(const lineRaw of lines){
    const line = lineRaw.trim();
    let m = line.match(/^\s*hostname\s*=\s*([^\n\r]+)/i);
    if(m){
      m[1].replace(/^\s*%APPEND%\s*/i,'')
          .split(',').map(s=>s.trim()).filter(Boolean)
          .forEach(h=>hostSet.add(h));
      continue;
    }
    m = line.match(/^#\s*hostname\s*=\s*([^\n\r]+)/i);
    if(m){
      m[1].split(',').map(s=>s.trim()).filter(Boolean).forEach(h=>hostSet.add(h));
    }
  }
}

function build(){
  if(!fs.existsSync(SRC_DIR)){ console.error('[ERR] loon/ 不存在'); process.exit(1); }

  const files = fs.readdirSync(SRC_DIR)
    .filter(f => f.endsWith('.plugin') && !/合集/.test(f))
    .sort((a,b)=>a.localeCompare(b,'en'));

  const GENERAL=[], RULE=[], MAPL=[], SCRIPT=[];
  const HOSTS = new Set(EXTRA_HOSTNAMES);
  const FORCE_HOSTS = new Set();

  for(const f of files){
    const raw = fs.readFileSync(path.join(SRC_DIR,f), 'utf8');
    const sec = parseSections(raw);

    if(hasAnyContent(sec)){
      if(sec['General'].length){
        GENERAL.push('', `# ===== ${f} — [General] =====`, ...sec['General']);
        for(const lineRaw of sec['General']){
          const m = lineRaw.match(/^\s*force-http-engine-hosts\s*=\s*([^\n\r]+)/i);
          if(m){
            m[1].replace(/^\s*%APPEND%\s*/i,'')
                .split(',').map(s=>s.trim()).filter(Boolean)
                .forEach(h=>FORCE_HOSTS.add(h));
          }
        }
      }
      if(sec['Rule'].length){
        RULE.push('', `# ===== ${f} — [Rule] =====`, ...sec['Rule']);
      }
      if(sec['Map Local'].length){
        MAPL.push('', `# ===== ${f} — [Map Local] =====`, ...sec['Map Local']);
      }
      if(sec['Script'].length){
        SCRIPT.push('', `# ===== ${f} — [Script] =====`, ...sec['Script']);
      }
      collectHostFromLines(sec['MITM'], HOSTS);
      collectHostFromLines([...sec['General'], ...sec['Rule'], ...sec['Map Local'], ...sec['Script']], HOSTS);
    } else {
      const lines = nl(raw).split('\n').filter(l => !/^#!/.test(l.trim()));
      if(lines.length){
        SCRIPT.push('', `# ===== ${f} — [Script](sectionless) =====`, ...lines);
      }
      collectHostFromLines(lines, HOSTS);
    }
  }

  const forceHostOut = Array.from(FORCE_HOSTS)
    .filter(Boolean).map(s=>s.trim())
    .filter((v,i,a)=>a.indexOf(v)===i)
    .sort((a,b)=>a.localeCompare(b,'en'))
    .join(', ');

  const hostOut = Array.from(HOSTS)
    .filter(Boolean).map(s=>s.trim())
    .filter((v,i,a)=>a.indexOf(v)===i)
    .sort((a,b)=>a.localeCompare(b,'en'))
    .join(', ');

  const header = [
    '#!name=Mikephie(Loon)自用合集🔐APP',
    '#!desc=由 loon/*.plugin 自动合并生成（含 [General]；保序不丢行）',
    '#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ',
    '#!category=🔐APP'
  ].join('\n');

  let out = header + '\n';
  if(GENERAL.length){
    out += `\n[General]\n${GENERAL.join('\n')}\n`;
    if(forceHostOut){
      out += `\n# ===== auto-merged — force-http-engine-hosts =====\nforce-http-engine-hosts = %APPEND% ${forceHostOut}\n`;
    }
  } else if(forceHostOut){
    out += `\n[General]\n# ===== auto-merged — force-http-engine-hosts =====\nforce-http-engine-hosts = %APPEND% ${forceHostOut}\n`;
  }
  if(RULE.length)   out += `\n[Rule]\n${RULE.join('\n')}\n`;
  if(MAPL.length)   out += `\n[Map Local]\n${MAPL.join('\n')}\n`;
  if(SCRIPT.length) out += `\n[Script]\n${SCRIPT.join('\n')}\n`;
  if(hostOut)       out += `\n[MITM]\nhostname = %APPEND% ${hostOut}\n`;

  out = out.replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync(OUT_FILE, out, 'utf8');
  console.log('[OK] Loon 合集生成：', OUT_FILE);
}

build();
