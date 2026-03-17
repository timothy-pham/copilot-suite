const path = require('path');
const { detectProjectName, ensureDir, normalizeList, readText, atomicWrite } = require('./utils');

function renderTemplate(templatePath, projectPath, stack, patterns) {
  const template = readText(templatePath);
  return template
    .replace('{{PROJECT_NAME}}', detectProjectName(projectPath))
    .replace('{{STACK}}', normalizeList(stack))
    .replace('{{ARCH}}', normalizeList(patterns));
}

function writeInstructions(projectPath, templatePath, stack, patterns) {
  const targetDir = path.join(projectPath, '.github');
  ensureDir(targetDir);
  const targetPath = path.join(targetDir, 'copilot-instructions.md');
  const content = renderTemplate(templatePath, projectPath, stack, patterns);
  atomicWrite(targetPath, content);
  return targetPath;
}

module.exports = { writeInstructions };
