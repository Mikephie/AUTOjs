#!/usr/bin/env node
/**
 * Merge quantumultx/*.conf → quantumultx/mcollection.conf
 * Sections supported: [rewrite_local], [mitm]
 * - hostname 去重 + 排序；从注释 "# hostname = ..." 也收集
 * - 文件间以 "#************************************#" + 文件名 分隔
 * - 跳过自身产物（mcollection.conf）
 * - 目录不存在/为空也会生成只含头部的文件
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'quantumultx');
const OUT = path.join(SRC_DIR, 'mcollection.conf');

const nl = s => s.replace(/\r?\n/g, '\n');

function parseSections(text){
  const lines = nl(text).split('\n');
  const out = { 'rewrite_local': [], 'mitm': [] };
  let current = null;
  for (const raw of lines){
    const trimmed = raw.trimEnd();
    const m = trimmed.match(/^\[(rewrite_local|mitm)\]$/i);
    if (m){ current = m[1].toLowerCase(); continue; }
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
    // [mitm] 下：hostname = a, b
    let m = line.match(/^\s*hostname\s*=\s*([^\n\r]+)/i);
    if (m){
      m[1].split(',').map(s=>s.trim()).filter(Boolean).forEach(h=>hostSet.add(h));
      continue;
    }
    // 注释里也收
    m = line.match(/^#\s*hostname\s*=\s*([^\n\r]+)/i);
    if (m){
      m[1].split(',').map(s=>s.trim()).filter(Boolean).forEach(h=>hostSet.add(h));
    }
  }
}

function build(){
  if (!fs.existsSync(SRC_DIR)) fs.mkdirSync(SRC_DIR, { recursive: true });

  const files = fs.readdirSync(SRC_DIR)
    .filter(f => f.endsWith('.conf') && !/mcollection/i.test(f))
    .sort((a,b)=>a.localeCompare(b,'en'));

  const REWRITE=[], MITM_HOSTS=new Set();

  for (const f of files){
    const raw = fs.readFileSync(path.join(SRC_DIR, f), 'utf8');
    const sec = parseSections(raw);

    if (hasAnyContent(sec)){
      if (sec['rewrite_local'].length){
        REWRITE.push('', '#************************************#', `# ${f}`, ...sec['rewrite_local']);
      }
      collectHostFromLines(sec['mitm'], MITM_HOSTS);
      collectHostFromLines([...sec['rewrite_local']], MITM_HOSTS);
    } else {
      // 无段落：当成 rewrite_local 并入，同时收集注释 hostname
      const lines = nl(raw).split('\n').filter(l => !/^#!/.test(l.trim()));
      if (lines.length){
        REWRITE.push('', '#************************************#', `# ${f}`, ...lines);
      }
      collectHostFromLines(lines, MITM_HOSTS);
    }
  }

  const hostOut = Array.from(MITM_HOSTS)
    .filter(Boolean).map(s=>s.trim())
    .filter((v,i,a)=>a.indexOf(v)===i)
    .sort((a,b)=>a.localeCompare(b,'en')).join(', ');

  const header = [
    '#!name=✨ mcollection (Quantumult X) ✨',
    '#!desc=自动合并生成的 Quantumult X 合集',
    '#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ',
    '#!category=🔐APP'
  ].join('\n');

  let out = header + '\n';
  if (REWRITE.length) out += `\n[rewrite_local]\n${REWRITE.join('\n')}\n`;
  if (hostOut) out += `\n[mitm]\nhostname = ${hostOut}\n`;

  fs.writeFileSync(OUT, out.replace(/\n{3,}/g,'\n\n'), 'utf8');
  console.log('[OK] QX mcollection built:', OUT);
}

build();