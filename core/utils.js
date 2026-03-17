const fs = require('fs');
const path = require('path');
const readline = require('readline');

function printHeader(title) {
  const line = '='.repeat(title.length);
  console.log(`${title}\n${line}`);
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

async function confirm(prompt, defaultYes = true) {
  const suffix = defaultYes ? '[Y/n]' : '[y/N]';
  while (true) {
    const input = (await ask(`${prompt} ${suffix}: `)).trim().toLowerCase();
    if (!input) return defaultYes;
    if (['y', 'yes'].includes(input)) return true;
    if (['n', 'no'].includes(input)) return false;
    console.log('Please enter y or n.');
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
  printHeader,
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
