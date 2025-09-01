#!/usr/bin/env node
/**
 * 合并根目录 loon/*.plugin → loon/mcollection.plugin
 * 段落支持： [General]/[Rule]/[Map Local]/[Rewrite]/[Script]/[MITM]
 * - [General]/[Rule]/[Map Local]/[Rewrite]/[Script]：保序不去重
 * - [MITM] hostname 去重+排序
 * - 汇总 [General] 的 force-http-engine-hosts（去重+排序，统一一行）
 * - 无段落模块：整文件视为 [Script]；从注释 "# hostname = ..." 也收集域名
 * - 跳过自身产物（mcollection），避免递归
 */
const fs = require('fs');
const path = require('path');

const ROOT    = process.cwd();
const SRC_DIR = path.join(ROOT, 'loon');
const OUT     = path.join(SRC_DIR, 'mcollection.plugin');

const EXTRA_HOSTNAMES = [];

const nl = s => s.replace(/\r?\n/g, '\n');

function parseSections(text){
  const lines = nl(text).split('\n');
  const out = {
    'General':[], 'Rule':[], 'Map Local':[], 'Rewrite':[], 'Script':[], 'MITM':[]
  };
  let current = null;
  for (const raw of lines){
    const trimmed = raw.trimEnd();
    const m = trimmed.match(/^\[(General|Rule|Map Local|Rewrite|Script|MITM)\]$/i);
    if (m){ current = m[1]; continue; }
    if (current){ out[current].push(raw); }
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
    if (m){
      m[1].replace(/^\s*%APPEND%\s*/i,'')
          .split(',').map(s=>s.trim()).filter(Boolean)
          .forEach(h=>hostSet.add(h));
      continue;
    }
    m = line.match(/^#\s*hostname\s*=\s*([^\n\r]+)/i);
    if (m){
      m[1].split(',').map(s=>s.trim()).filter(Boolean)
        .forEach(h=>hostSet.add(h));
    }
  }
}

function build(){
  if (!fs.existsSync(SRC_DIR)) fs.mkdirSync(SRC_DIR, { recursive:true });

  const files = fs.readdirSync(SRC_DIR)
    .filter(f => f.endsWith('.plugin') && !/mcollection/i.test(f))
    .sort((a,b)=>a.localeCompare(b,'en'));

  const GENERAL=[], RULE=[], MAPL=[], REWRITE=[], SCRIPT=[];
  const HOSTS = new Set(EXTRA_HOSTNAMES);
  const FORCE = new Set();

  for (const f of files){
    const raw = fs.readFileSync(path.join(SRC_DIR, f), 'utf8');
    const sec = parseSections(raw);

    if (hasAnyContent(sec)){
      if (sec['General'].length){
        GENERAL.push('', '#************************************#', `# ${f}`, ...sec['General']);
        for (const lineRaw of sec['General']){
          const m = lineRaw.match(/^\s*force-http-engine-hosts\s*=\s*([^\n\r]+)/i);
          if (m){
            m[1].replace(/^\s*%APPEND%\s*/i,'')
                .split(',').map(s=>s.trim()).filter(Boolean)
                .forEach(x=>FORCE.add(x));
          }
        }
      }
      if (sec['Rule'].length){
        RULE.push('', '#************************************#', `# ${f}`, ...sec['Rule']);
      }
      if (sec['Map Local'].length){
        MAPL.push('', '#************************************#', `# ${f}`, ...sec['Map Local']);
      }
      if (sec['Rewrite'].length){
        REWRITE.push('', '#************************************#', `# ${f}`, ...sec['Rewrite']);
      }
      if (sec['Script'].length){
        SCRIPT.push('', '#************************************#', `# ${f}`, ...sec['Script']);
      }
      collectHostFromLines(sec['MITM'], HOSTS);
      collectHostFromLines([...sec['General'], ...sec['Rule'], ...sec['Map Local'], ...sec['Rewrite'], ...sec['Script']], HOSTS);
    } else {
      const lines = nl(raw).split('\n').filter(l => !/^#!/.test(l.trim()));
      if (lines.length){
        SCRIPT.push('', '#************************************#', `# ${f}`, ...lines);
      }
      collectHostFromLines(lines, HOSTS);
    }
  }

  const forceOut = Array.from(FORCE).filter(Boolean).map(s=>s.trim())
    .filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>a.localeCompare(b,'en')).join(', ');
  const hostOut  = Array.from(HOSTS).filter(Boolean).map(s=>s.trim())
    .filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>a.localeCompare(b,'en')).join(', ');

  const header = [
    '#!name=mcollection 🔐APP',
    '#!desc=自动合并生成的合集模块',
    '#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ',
    '#!category=🔐APP',
    '#!icon=https://raw.githubusercontent.com/Mikephie/icons/main/loon/heji.gif'
  ].join('\n');

  let out = header + '\n';
  if (GENERAL.length){
    out += `\n[General]\n${GENERAL.join('\n')}\n`;
    if (forceOut){
      out += `\n#************************************#\n# merged force-http-engine-hosts\nforce-http-engine-hosts = %APPEND% ${forceOut}\n`;
    }
  } else if (forceOut){
    out += `\n[General]\n#************************************#\n# merged force-http-engine-hosts\nforce-http-engine-hosts = %APPEND% ${forceOut}\n`;
  }
  if (RULE.length)    out += `\n[Rule]\n${RULE.join('\n')}\n`;
  if (MAPL.length)    out += `\n[Map Local]\n${MAPL.join('\n')}\n`;
  if (REWRITE.length) out += `\n[Rewrite]\n${REWRITE.join('\n')}\n`;
  if (SCRIPT.length)  out += `\n[Script]\n${SCRIPT.join('\n')}\n`;
  if (hostOut)        out += `\n[MITM]\nhostname = %APPEND% ${hostOut}\n`;

  fs.writeFileSync(OUT, out.replace(/\n{3,}/g,'\n\n'), 'utf8');
  console.log('[OK] Loon mcollection built:', OUT);
}

build();