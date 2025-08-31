#!/usr/bin/env node
/**
 * 合并根目录 surge/*.sgmodule → surge/mcollection.sgmodule
 * - 支持 [General]/[Rule]/[Map Local]/[Script]/[MITM]
 * - [General]/[Rule]/[Map Local]/[Script]：保序不去重
 * - 智能合并 force-http-engine-hosts
 * - [MITM] hostname 去重+排序
 * - 支持无段落模块：整文件当作 Script，并从注释 "# hostname = ..." 收集域名
 */
const fs = require('fs');
const path = require('path');

const ROOT     = process.cwd();
const SRC_DIR  = path.join(ROOT, 'surge');
const OUT_FILE = path.join(SRC_DIR, 'mcollection.sgmodule');

const EXTRA_HOSTNAMES = [];

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
  return Object.values(sec).some(arr => arr.some(l => l.trim() !== ''));
}
function collectHostFromLines(lines, hostSet){
  for(const raw of lines){
    const line = raw.trim();
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
  if(!fs.existsSync(SRC_DIR)){ console.error('[ERR] surge/ 不存在'); process.exit(1); }

  const files = fs.readdirSync(SRC_DIR)
    .filter(f => f.endsWith('.sgmodule') && !/mcollection/i.test(f))
    .sort();

  const GENERAL=[], RULE=[], MAPL=[], SCRIPT=[];
  const HOSTS = new Set(EXTRA_HOSTNAMES);
  const FORCE_HOSTS = new Set();

  for(const f of files){
    const raw = fs.readFileSync(path.join(SRC_DIR,f), 'utf8');
    const sec = parseSections(raw);

    if(hasAnyContent(sec)){
      if(sec['General'].length){
        GENERAL.push('', `#************************************#`, `# ${f}`, ...sec['General']);
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
        RULE.push('', `#************************************#`, `# ${f}`, ...sec['Rule']);
      }
      if(sec['Map Local'].length){
        MAPL.push('', `#************************************#`, `# ${f}`, ...sec['Map Local']);
      }
      if(sec['Script'].length){
        SCRIPT.push('', `#************************************#`, `# ${f}`, ...sec['Script']);
      }
      collectHostFromLines(sec['MITM'], HOSTS);
      collectHostFromLines([...sec['General'], ...sec['Rule'], ...sec['Map Local'], ...sec['Script']], HOSTS);
    } else {
      const lines = nl(raw).split('\n').filter(l => !/^#!/.test(l.trim()));
      if(lines.length){
        SCRIPT.push('', `#************************************#`, `# ${f}`, ...lines);
      }
      collectHostFromLines(lines, HOSTS);
    }
  }

  const forceHostOut = Array.from(FORCE_HOSTS).sort().join(', ');
  const hostOut = Array.from(HOSTS).sort().join(', ');

  const header = [
    '#!name=mcollection 🔐APP',
    '#!desc=自动合并生成的合集模块',
    '#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ',
    '#!category=🔐APP'
  ].join('\n');

  let out = header + '\n';
  if(GENERAL.length){
    out += `\n[General]\n${GENERAL.join('\n')}\n`;
    if(forceHostOut){
      out += `\n#************************************#\n# merged force-http-engine-hosts\nforce-http-engine-hosts = %APPEND% ${forceHostOut}\n`;
    }
  } else if(forceHostOut){
    out += `\n[General]\n#************************************#\n# merged force-http-engine-hosts\nforce-http-engine-hosts = %APPEND% ${forceHostOut}\n`;
  }
  if(RULE.length)   out += `\n[Rule]\n${RULE.join('\n')}\n`;
  if(MAPL.length)   out += `\n[Map Local]\n${MAPL.join('\n')}\n`;
  if(SCRIPT.length) out += `\n[Script]\n${SCRIPT.join('\n')}\n`;
  if(hostOut)       out += `\n[MITM]\nhostname = %APPEND% ${hostOut}\n`;

  fs.writeFileSync(OUT_FILE, out.replace(/\n{3,}/g,'\n\n'), 'utf8');
  console.log('[OK] Surge 合集生成：', OUT_FILE);
}

build();
