#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'surge');
const OUT = path.join(SRC_DIR, 'mcollection.sgmodule');
const extsg = /\.sgmodule$/i;

const nl = s => s.replace(/\r?\n/g, '\n');

function listFiles(dir) {
  const out = [];
  (function walk(d){
    if (!fs.existsSync(d)) return;
    for (const name of fs.readdirSync(d)) {
      const p = path.join(d, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) { walk(p); continue; }
      if (/mcollection/i.test(name)) continue;   // 跳过产物
      if (extsg.test(name)) out.push(p);
    }
  })(dir);
  return out.sort((a,b)=>a.localeCompare(b,'en'));
}

function parseSections(text){
  const lines = nl(text).split('\n');
  const out = { 'General':[], 'Rule':[], 'Map Local':[], 'URL Rewrite':[], 'Script':[], 'MITM':[] };
  let current = null;
  for (const raw of lines) {
    const trimmed = raw.trimEnd();
    const m = trimmed.match(/^\[(General|Rule|Map Local|URL Rewrite|Script|MITM)\]$/i);
    if (m) { current = m[1].replace(/\b(?:url rewrite)\b/i,'URL Rewrite'); continue; }
    if (current) out[current].push(raw);
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
      m[1].replace(/^\s*%APPEND%\s*/i,'').split(',').map(s=>s.trim()).filter(Boolean).forEach(h=>hostSet.add(h));
      continue;
    }
    m = line.match(/^#\s*hostname\s*=\s*([^\n\r]+)/i);
    if (m){
      m[1].split(',').map(s=>s.trim()).filter(Boolean).forEach(h=>hostSet.add(h));
    }
  }
}

function build(){
  if (!fs.existsSync(SRC_DIR)) fs.mkdirSync(SRC_DIR, { recursive:true });

  const files = listFiles(SRC_DIR);
  console.log('[Surge] scanning:', SRC_DIR);
  console.log('[Surge] files:', files.length, files.map(p=>path.relative(SRC_DIR,p)));

  const GENERAL=[], RULE=[], MAPL=[], URLRW=[], SCRIPT=[];
  const HOSTS = new Set();
  const FORCE = new Set();

  for (const p of files){
    const raw = fs.readFileSync(p, 'utf8');
    const sec = parseSections(raw);
    const display = path.relative(SRC_DIR, p) || path.basename(p);
    let appended = false;

    if (hasAnyContent(sec)){
      if (sec['General'].length){
        GENERAL.push('', '#************************************#', `# ${display}`, ...sec['General']);
        for (const lineRaw of sec['General']){
          const m = lineRaw.match(/^\s*force-http-engine-hosts\s*=\s*([^\n\r]+)/i);
          if (m){
            m[1].replace(/^\s*%APPEND%\s*/i,'').split(',').map(s=>s.trim()).filter(Boolean).forEach(x=>FORCE.add(x));
          }
        }
        appended = true;
      }
      if (sec['Rule'].length){
        RULE.push('', '#************************************#', `# ${display}`, ...sec['Rule']); appended = true;
      }
      if (sec['Map Local'].length){
        MAPL.push('', '#************************************#', `# ${display}`, ...sec['Map Local']); appended = true;
      }
      if (sec['URL Rewrite'].length){
        URLRW.push('', '#************************************#', `# ${display}`, ...sec['URL Rewrite']); appended = true;
      }
      if (sec['Script'].length){
        SCRIPT.push('', '#************************************#', `# ${display}`, ...sec['Script']); appended = true;
      }
      collectHostFromLines(sec['MITM'], HOSTS);
      collectHostFromLines([...sec['General'], ...sec['Rule'], ...sec['Map Local'], ...sec['URL Rewrite'], ...sec['Script']], HOSTS);
    } else {
      // 无段落：整文件→Script 并入；同时收集注释 hostname
      const lines = nl(raw).split('\n').filter(l => !/^#!/.test(l.trim()));
      if (lines.length){
        SCRIPT.push('', '#************************************#', `# ${display}`, ...lines);
        appended = true;
      }
      collectHostFromLines(lines, HOSTS);
    }

    console.log(`[Surge] ${display} -> ${appended ? 'appended' : 'skipped'}`);
  }

  const forceOut = Array.from(FORCE).filter(Boolean).map(s=>s.trim()).filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>a.localeCompare(b,'en')).join(', ');
  const hostOut  = Array.from(HOSTS).filter(Boolean).map(s=>s.trim()).filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>a.localeCompare(b,'en')).join(', ');

  const header = [
    '#!name=mcollection 🔐APP',
    '#!desc=自动合并生成的合集模块 (Surge)',
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
  if (RULE.length)   out += `\n[Rule]\n${RULE.join('\n')}\n`;
  if (MAPL.length)   out += `\n[Map Local]\n${MAPL.join('\n')}\n`;
  if (URLRW.length)  out += `\n[URL Rewrite]\n${URLRW.join('\n')}\n`;
  if (SCRIPT.length) out += `\n[Script]\n${SCRIPT.join('\n')}\n`;
  if (hostOut)       out += `\n[MITM]\nhostname = %APPEND% ${hostOut}\n`;

  fs.writeFileSync(OUT, out.replace(/\n{3,}/g,'\n\n'), 'utf8');
  console.log('[Surge] built:', OUT);
}

build();