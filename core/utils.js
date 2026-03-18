const fs = require('fs');
const path = require('path');
const readline = require('readline');

const COLOR = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function supportsColor() {
  return Boolean(process.stdout.isTTY && !process.env.NO_COLOR);
}

function paint(text, ...codes) {
  if (!supportsColor()) return String(text);
  return `${codes.join('')}${text}${COLOR.reset}`;
}

function bold(text) {
  return paint(text, COLOR.bold);
}

function dim(text) {
  return paint(text, COLOR.dim);
}

function color(text, tone) {
  return paint(text, COLOR[tone] || '', COLOR.bold);
}

function icon(name) {
  const icons = {
    section: '◆',
    success: '✓',
    warn: '⚠',
    info: 'ℹ',
    arrow: '→',
    bullet: '•',
    folder: '📁',
    prompt: '✦',
  };
  return icons[name] || '•';
}

function printHeader(title, options = {}) {
  const marker = options.icon || icon('section');
  const tone = options.color || 'cyan';
  const heading = `${marker} ${title}`;
  const line = '─'.repeat(Math.max(title.length + 2, 24));
  console.log(`\n${color(heading, tone)}\n${dim(line)}`);
}

function printMessage(kind, message) {
  const toneMap = {
    success: 'green',
    warn: 'yellow',
    error: 'red',
    info: 'blue',
  };
  const iconMap = {
    success: icon('success'),
    warn: icon('warn'),
    error: icon('warn'),
    info: icon('info'),
  };
  console.log(`${color(iconMap[kind] || icon('bullet'), toneMap[kind] || 'blue')} ${message}`);
}

function printKeyValue(label, value) {
  const left = `${bold(label)}${dim(' :')}`;
  console.log(`  ${left} ${value}`);
}

function printListItem(text, options = {}) {
  const marker = options.marker || icon('bullet');
  const tone = options.color || null;
  const renderedMarker = tone ? color(marker, tone) : marker;
  console.log(`  ${renderedMarker} ${text}`);
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function confirm(prompt, options = {}) {
  const defaultYes = options.defaultYes ?? true;
  const suffix = options.suffix || (defaultYes ? '[Y/n]' : '[y/N]');
  const yesValues = new Set((options.yesValues || ['y', 'yes', 'c', 'co']).map((value) => value.toLowerCase()));
  const noValues = new Set((options.noValues || ['n', 'no', 'k', 'khong']).map((value) => value.toLowerCase()));
  const retryMessage = options.retryMessage || 'Please enter y or n.';
  while (true) {
    const input = (await ask(`${prompt} ${suffix}: `)).trim().toLowerCase();
    if (!input) return defaultYes;
    if (yesValues.has(input)) return true;
    if (noValues.has(input)) return false;
    console.log(retryMessage);
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function atomicWrite(filePath, data) {
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, data, 'utf8');
  fs.renameSync(tmpPath, filePath);
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeJson(filePath, payload) {
  const data = JSON.stringify(payload, null, 2) + '\n';
  atomicWrite(filePath, data);
}

function stripJsoncComments(text) {
  let result = '';
  let i = 0;
  let inString = false;
  while (i < text.length) {
    const char = text[i];
    const next = i + 1 < text.length ? text[i + 1] : '';

    if (inString) {
      result += char;
      if (char === '\\' && i + 1 < text.length) {
        result += text[i + 1];
        i += 2;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      i += 1;
      continue;
    }

    if (char === '"') {
      inString = true;
      result += char;
      i += 1;
      continue;
    }

    if (char === '/' && next === '/') {
      i += 2;
      while (i < text.length && !['\n', '\r'].includes(text[i])) {
        i += 1;
      }
      continue;
    }

    if (char === '/' && next === '*') {
      i += 2;
      while (i + 1 < text.length && !(text[i] === '*' && text[i + 1] === '/')) {
        i += 1;
      }
      i += 2;
      continue;
    }

    result += char;
    i += 1;
  }

  return result;
}

function readJsonc(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = readText(filePath);
  const stripped = stripJsoncComments(raw);
  if (!stripped.trim()) return {};
  try {
    return JSON.parse(stripped);
  } catch (_err) {
    const withoutTrailing = stripped.replace(/,(\\s*[}\\]])/g, '$1');
    return JSON.parse(withoutTrailing);
  }
}

function mergeDicts(base, overlay) {
  const result = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      result[key] = mergeDicts(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function parseSelection(selection, maxIndex) {
  const indices = [];
  const parts = selection.split(',').map((p) => p.trim()).filter(Boolean);
  for (const part of parts) {
    if (part.includes('-')) {
      const [startS, endS] = part.split('-', 2);
      const start = parseInt(startS, 10);
      const end = parseInt(endS, 10);
      if (Number.isNaN(start) || Number.isNaN(end)) throw new Error('Invalid range');
      for (let i = start; i <= end; i += 1) indices.push(i);
    } else {
      const value = parseInt(part, 10);
      if (Number.isNaN(value)) throw new Error('Invalid selection');
      indices.push(value);
    }
  }
  const deduped = [];
  for (const idx of indices) {
    if (idx >= 1 && idx <= maxIndex && !deduped.includes(idx)) deduped.push(idx);
  }
  return deduped;
}

function detectProjectName(projectPath) {
  return path.basename(path.resolve(projectPath));
}

function normalizeList(values) {
  if (!values || values.length === 0) return 'Unknown';
  return Array.from(new Set(values)).sort().join(', ');
}

function tryReadJson(filePath) {
  try {
    return JSON.parse(readText(filePath));
  } catch (_err) {
    return {};
  }
}

function safeRelpath(target, base) {
  try {
    return path.relative(base, target);
  } catch (_err) {
    return target;
  }
}

function humanJoin(items) {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function classifyArchitecture(signals) {
  const patterns = [];
  if ((signals.clean || 0) >= 3) patterns.push('Clean Architecture');
  if ((signals.hexagonal || 0) >= 2) patterns.push('Hexagonal Architecture');
  if ((signals.solid || 0) >= 2) patterns.push('SOLID-oriented');
  return patterns;
}

function incrementSignal(signals, key) {
  signals[key] = (signals[key] || 0) + 1;
}

function detectArchitectureFromDirs(dirnames) {
  const signals = {};
  const lower = new Set(dirnames.map((d) => d.toLowerCase()));

  if (['domain', 'application', 'infrastructure'].some((d) => lower.has(d))) incrementSignal(signals, 'clean');
  if (['usecases', 'use-cases', 'use_cases'].some((d) => lower.has(d))) incrementSignal(signals, 'clean');
  if (['adapters', 'ports'].some((d) => lower.has(d))) incrementSignal(signals, 'hexagonal');
  if (['entities', 'valueobjects', 'value-objects'].some((d) => lower.has(d))) incrementSignal(signals, 'clean');
  if (['interfaces', 'contracts'].some((d) => lower.has(d))) incrementSignal(signals, 'solid');
  if (['services', 'repositories'].some((d) => lower.has(d))) incrementSignal(signals, 'solid');

  return signals;
}

module.exports = {
  bold,
  color,
  dim,
  printHeader,
  printKeyValue,
  printListItem,
  printMessage,
  ask,
  confirm,
  ensureDir,
  atomicWrite,
  readText,
  writeJson,
  stripJsoncComments,
  readJsonc,
  mergeDicts,
  parseSelection,
  detectProjectName,
  normalizeList,
  tryReadJson,
  safeRelpath,
  humanJoin,
  classifyArchitecture,
  detectArchitectureFromDirs,
};
