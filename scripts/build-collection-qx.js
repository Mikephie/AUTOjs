#!/usr/bin/env node
/**
 * Merge quantumultx/*.js → quantumultx/mcollection.conf
 * - 只扫描 .js（大小写不敏感）
 * - 严格跳过产物 mcollection.conf（避免递归）
 * - 支持两种 .js 内容：
 *   A) 文件里直接写了 QX 段落 [rewrite_local]/[mitm]/[rewrite]/[URL Rewrite]
 *   B) 仅在注释中写了这些段落（/* ... *\/ 或 // ...）
 * - hostname 去重 + 排序；也从 "# hostname = ..." 注释收集
 * - 无段落则跳过（不把 JS 源码写进规则）
 * - 目录为空也会输出仅含头部的 mcollection.conf
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'quantumultx');
const OUT = path.join(SRC_DIR, 'mcollection.conf');

const nl = s => s.replace(/\r?\n/g, '\n');

function ensureDir() {
  if (!fs.existsSync(SRC_DIR)) fs.mkdirSync(SRC_DIR, { recursive: true });
}

function listJsFiles(dir) {
  return fs.readdirSync(dir)
    .filter(f => /\.js$/i.test(f))                // 只扫 .js
    .filter(f => !/^mcollection(\..+)?$/i.test(f))// 严格避开任何 mcollection.* 源文件
    .sort((a,b)=>a.localeCompare(b,'en'));
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
    const m = trimmed.match(/^\[(.+?)\]$/); // 捕获 [xxx]
    if (m){
      const name = normalizeSectionName(m[1]);
      current = name || null;
      continue;
    }
    if (current){
      out[current].push(raw);
    }
  }
  return out;
}
function hasAnyContent(sec){
  return Object.values(sec).some(arr => arr.some(l => l.trim() !== ''));
}

// 从注释中提取候选配置
function extractCommentConfigFromJS(raw){
  const parts = [];
  // 块注释 /* ... */
  const blockRe = /\/\*([\s\S]*?)\*\//g;
  let m;
  while ((m = blockRe.exec(raw)) !== null) parts.push(m[1]);
  // 行注释 // ...
  const lines = nl(raw).split('\n')
    .filter(line => /^\s*\/\//.test(line))
    .map(line => line.replace(/^\s*\/\//, ''))
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
  ensureDir();
  const files = listJsFiles(SRC_DIR);

  const REWRITE = [];
  const HOSTS = new Set();

  console.log(`[QX] scanning ${SRC_DIR}, ${files.length} .js file(s)`);

  for (const f of files){
    const p = path.join(SRC_DIR, f);
    const raw = fs.readFileSync(p, 'utf8');

    // 优先：若 .js 里直接存在段落标头，则直接按全文解析
    const hasDirectSections = /\[(?:rewrite_local|rewrite|url rewrite|mitm)\]/i.test(raw);
    let parseText = raw;

    if (!hasDirectSections){
      // 否则：尝试从注释中提取段落
      parseText = extractCommentConfigFromJS(raw);
    }

    const sec = parseSections(parseText);
    let appended = false;

    if (hasAnyContent(sec)){
      if (sec['rewrite_local'].length){
        REWRITE.push('', '#************************************#', `# ${f}`, ...sec['rewrite_local']);
        appended = true;
      }
      collectHostFromLines(sec['mitm'], HOSTS);
      collectHostFromLines(sec['rewrite_local'], HOSTS);
    }

    console.log(`[QX] ${f} -> ${appended ? 'appended' : 'skipped (no QX sections found)'}`);
  }

  const hostOut = Array.from(HOSTS)
    .filter(Boolean).map(s=>s.trim())
    .filter((v,i,a)=>a.indexOf(v)===i)
    .sort((a,b)=>a.localeCompare(b,'en')).join(', ');

  const header = [
    '#!name=✨ mcollection (Quantumult X) ✨',
    '#!desc=自动合并生成的 Quantumult X 合集',
    '#!author=🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ',
    '#!category=🔐APP',
    '#!icon=https://raw.githubusercontent.com/Mikephie/icons/main/loon/heji.gif'
  ].join('\n');

  let out = header + '\n';
  if (REWRITE.length) out += `\n[rewrite_local]\n${REWRITE.join('\n')}\n`;
  if (hostOut)        out += `\n[mitm]\nhostname = ${hostOut}\n`;

  fs.writeFileSync(OUT, out.replace(/\n{3,}/g,'\n\n'), 'utf8');
  console.log('[QX] built:', OUT, `rewrite:${REWRITE.length>0?'yes':'no'}, mitm_hosts:${HOSTS.size}`);
}

build();