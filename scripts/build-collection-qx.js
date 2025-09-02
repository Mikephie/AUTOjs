#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'quantumultx');
const OUT = path.join(SRC_DIR, 'mcollection.conf');

const nl = s => s.replace(/\r?\n/g, '\n');

function listJsFiles(dir) {
  const out = [];
  (function walk(d){
    if (!fs.existsSync(d)) return;
    for (const name of fs.readdirSync(d)) {
      const p = path.join(d, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) { walk(p); continue; }
      if (!/\.js$/i.test(name)) continue;
      if (/^mcollection(\..+)?$/i.test(name)) continue; // 跳过任何 mcollection.*
      out.push(p);
    }
  })(dir);
  return out.sort((a,b)=>a.localeCompare(b,'en'));
}

function normalizeSectionName(s){
  const t = s.toLowerCase().trim();
  if (t === 'mitm') return 'mitm';
  if (t === 'rewrite_local' || t === 'rewrite' || t === 'url rewrite') return 'rewrite_local';
  return '';
}
function parseSections(text){
  const lines = nl(text).split('\n');
  const out = { 'rewrite_local': [], 'mitm': [] };
  let current = null;
  for (const raw of lines){
    const trimmed = raw.trimEnd();
    const m = trimmed.match(/^\[(.+?)\]$/);
    if (m){
      const name = normalizeSectionName(m[1]);
      current = name || null;
      continue;
    }
    if (current) out[current].push(raw);
  }
  return out;
}
function hasAnyContent(sec){
  return Object.values(sec).some(arr => arr.some(l => l.trim() !== ''));
}
function extractCommentConfigFromJS(raw){
  const parts = [];
  const blockRe = /\/\*([\s\S]*?)\*\//g;
  let m;
  while ((m = blockRe.exec(raw)) !== null) parts.push(m[1]);
  const lines = nl(raw).split('\n')
    .filter(line => /^\s*\/\//.test(line))
    .map(line => line.replace(/^\s*\/\//,''))
    .join('\n');
  if (lines.trim()) parts.push(lines);
  return parts.join('\n');
}
function collectHostFromLines(lines, hostSet){
  for(const raw of lines){
    const line = raw.trim();
    let m = line.match(/^\s*hostname\s*=\s*([^\n\r]+)/i);
    if (m){
      m[1].split(',').map(s=>s.trim()).filter(Boolean).forEach(h=>hostSet.add(h));
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

  const files = listJsFiles(SRC_DIR);
  console.log('[QX] scanning:', SRC_DIR);
  console.log('[QX] files:', files.length, files.map(p=>path.relative(SRC_DIR,p)));

  const REWRITE=[], HOSTS=new Set();

  for (const p of files){
    const raw = fs.readFileSync(p, 'utf8');
    const hasDirectSections = /\[(?:rewrite_local|rewrite|url rewrite|mitm)\]/i.test(raw);
    const parseText = hasDirectSections ? raw : extractCommentConfigFromJS(raw);
    const sec = parseSections(parseText);
    const display = path.relative(SRC_DIR, p) || path.basename(p);

    let appended = false;
    if (hasAnyContent(sec)){
      if (sec['rewrite_local'].length){
        REWRITE.push('', '#************************************#', `# ${display}`, ...sec['rewrite_local']);
        appended = true;
      }
      collectHostFromLines(sec['mitm'], HOSTS);
      collectHostFromLines(sec['rewrite_local'], HOSTS);
    }
    console.log(`[QX] ${display} -> ${appended ? 'appended' : 'skipped (no QX sections found)'}`);
  }

  const hostOut = Array.from(HOSTS).filter(Boolean).map(s=>s.trim()).filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>a.localeCompare(b,'en')).join(', ');

  const header = [
    '#!name=✨ mcollection (Quantumult X) ✨',
    '#!desc=自动合并生成的 Quantumult X 合集',
    '#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ',
    '#!category=🔐APP'
  ].join('\n');

  let out = header + '\n';
  if (REWRITE.length) out += `\n[rewrite_local]\n${REWRITE.join('\n')}\n`;
  if (hostOut)        out += `\n[mitm]\nhostname = ${hostOut}\n`;

  fs.writeFileSync(OUT, out.replace(/\n{3,}/g,'\n\n'), 'utf8');
  console.log('[QX] built:', OUT);
}

build();