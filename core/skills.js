const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { ensureDir, readText, safeRelpath } = require('./utils');

function repoCacheKey(source) {
  const hash = crypto.createHash('sha1').update(source.repoUrl).digest('hex').slice(0, 8);
  return `${source.id}-${hash}`;
}

function syncSkillsRepo(source, cacheDir) {
  ensureDir(cacheDir);
  const repoPath = path.join(cacheDir, repoCacheKey(source));

  try {
    if (fs.existsSync(path.join(repoPath, '.git'))) {
      execFileSync('git', ['-C', repoPath, 'remote', 'set-url', 'origin', source.repoUrl], { stdio: 'ignore' });
      execFileSync('git', ['-C', repoPath, 'pull', '--ff-only'], { stdio: 'ignore' });
    } else {
      execFileSync('git', ['clone', '--depth', '1', source.repoUrl, repoPath], { stdio: 'ignore' });
    }
  } catch (_err) {
    throw new Error(`git clone/pull failed for ${source.repoUrl}`);
  }

  return repoPath;
}

function resolveSkillsRoot(repoPath, source) {
  const root = source.skillsSubdir ? path.join(repoPath, source.skillsSubdir) : repoPath;
  return fs.existsSync(root) ? root : repoPath;
}

function parseFrontmatter(text) {
  const match = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/);
  if (!match) return {};

  const metadata = {};
  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf(':');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
    metadata[key] = value;
  }

  return metadata;
}

function extractDescription(text, frontmatter) {
  if (frontmatter.description) return frontmatter.description;

  const lines = text
    .replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n?/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (line.startsWith('#')) continue;
    if (line.startsWith('##')) continue;
    return line;
  }

  return '';
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function buildSkillRecord(skillDir, repoPath, skillsRoot, source) {
  const skillFile = path.join(skillDir, 'SKILL.md');
  const content = readText(skillFile);
  const frontmatter = parseFrontmatter(content);
  const relpath = safeRelpath(skillDir, repoPath);
  const relativeToSkillsRoot = safeRelpath(skillDir, skillsRoot);
  const slug = relativeToSkillsRoot.split(path.sep).join('-');
  const name = frontmatter.name || path.basename(skillDir);

  return {
    id: `${source.id}:${relativeToSkillsRoot.split(path.sep).join('/')}`,
    name,
    slug,
    description: extractDescription(content, frontmatter),
    path: skillDir,
    relpath,
    repoPath,
    source: {
      id: source.id,
      label: source.label,
      repoUrl: source.repoUrl,
    },
    installDirName: `${slugify(source.id)}--${slugify(slug || name)}`,
  };
}

function discoverSkills(repoPath, source) {
  const skillsRoot = resolveSkillsRoot(repoPath, source);
  const skills = [];

  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);

    if (files.includes('SKILL.md')) {
      skills.push(buildSkillRecord(dir, repoPath, skillsRoot, source));
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      walk(path.join(dir, entry.name));
    }
  };

  walk(skillsRoot);
  skills.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  return skills;
}

function copyDir(src, dest) {
  if (fs.cpSync) {
    fs.cpSync(src, dest, { recursive: true });
    return;
  }

  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isSymbolicLink()) {
      const link = fs.readlinkSync(srcPath);
      fs.symlinkSync(link, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function normalizeSelection(selected, skills) {
  const unique = [];
  for (const idx of selected) {
    if (typeof idx === 'number') {
      const skill = skills[idx - 1];
      if (skill && !unique.includes(skill)) unique.push(skill);
      continue;
    }
    const skill = skills.find((item) => item.id === idx);
    if (skill && !unique.includes(skill)) unique.push(skill);
  }
  return unique;
}

function installSkills(skills, selected, projectPath) {
  const chosenSkills = normalizeSelection(selected, skills);
  const installed = [];
  const targetRoot = path.join(projectPath, '.github', 'skills');

  ensureDir(targetRoot);

  for (const skill of chosenSkills) {
    const dest = path.join(targetRoot, skill.installDirName);
    if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
    copyDir(skill.path, dest);
    installed.push({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      source: skill.source,
      relpath: skill.relpath,
      installPath: dest,
    });
  }

  return installed;
}

module.exports = { syncSkillsRepo, discoverSkills, installSkills };
