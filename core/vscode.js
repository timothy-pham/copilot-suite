const fs = require('fs');
const os = require('os');
const path = require('path');
const { ensureDir, mergeDicts, readJsonc, readText } = require('./utils');

function detectSettingsPath() {
  const home = os.homedir();
  if (process.platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'Code', 'User', 'settings.json');
  }
  if (process.platform.startsWith('linux')) {
    return path.join(home, '.config', 'Code', 'User', 'settings.json');
  }
  if (process.platform.startsWith('win')) {
    const appdata = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
    return path.join(appdata, 'Code', 'User', 'settings.json');
  }
  return path.join(home, '.config', 'Code', 'User', 'settings.json');
}

function loadTemplate(templatePath) {
  return JSON.parse(readText(templatePath));
}

function updateSettings(settingsPath, templatePath) {
  const existing = readJsonc(settingsPath);
  const template = loadTemplate(templatePath);
  const merged = mergeDicts(existing, template);

  ensureDir(path.dirname(settingsPath));
  if (fs.existsSync(settingsPath)) {
    fs.copyFileSync(settingsPath, `${settingsPath}.bak`);
  }

  fs.writeFileSync(settingsPath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
  return merged;
}

module.exports = { detectSettingsPath, updateSettings };
