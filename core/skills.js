const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { ensureDir, safeRelpath } = require('./utils');

function syncSkillsRepo(repoUrl, cacheDir) {
  ensureDir(cacheDir);
  const repoPath = path.join(cacheDir, 'skills_repo');

  try {
    if (fs.existsSync(path.join(repoPath, '.git'))) {
      execFileSync('git', ['-C', repoPath, 'pull', '--ff-only'], { stdio: 'ignore' });
    } else {
      execFileSync('git', ['clone', '--depth', '1', repoUrl, repoPath], { stdio: 'inherit' });
    }
  } catch (err) {
    throw new Error('git is required to sync skills. Please install git or skip this step.');
  }

  return repoPath;
}

function discoverSkills(repoPath) {
  const skills = [];
  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = entries.filter((e) => e.isFile()).map((e) => e.name);
    if (files.includes('SKILL.md')) {
      const name = path.basename(dir);
      skills.push({ name, path: dir, relpath: safeRelpath(dir, repoPath) });
    }
    for (const entry of entries) {
      if (entry.isDirectory()) walk(path.join(dir, entry.name));
    }
  };

  walk(repoPath);
  skills.sort((a, b) => a.name.localeCompare(b.name));
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

function installSkills(skills, selected, projectPath) {
  const installed = [];
  const targetRoot = path.join(projectPath, 'copilot', 'skills');
  ensureDir(targetRoot);

  for (const idx of selected) {
    const skill = skills[idx - 1];
    const dest = path.join(targetRoot, skill.name);
    if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
    copyDir(skill.path, dest);
    installed.push(skill.name);
  }

  return installed;
}

module.exports = { syncSkillsRepo, discoverSkills, installSkills };
