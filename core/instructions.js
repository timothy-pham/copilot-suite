const path = require('path');
const { t } = require('./i18n');
const { detectProjectName, ensureDir, normalizeList, readText, atomicWrite } = require('./utils');

function replaceTokens(template, values) {
  return Object.entries(values).reduce(
    (output, [key, value]) => output.replace(new RegExp(`{{${key}}}`, 'g'), value),
    template,
  );
}

function renderInstalledSkills(installedSkills, language) {
  if (!installedSkills || installedSkills.length === 0) {
    return language === 'vi' ? '- Chưa cài thêm skill nào.' : '- No additional skills installed yet.';
  }

  return installedSkills
    .map(
      (skill) =>
        `- ${skill.name} (${skill.source.label}${skill.description ? `): ${skill.description}` : ')'}`,
    )
    .join('\n');
}

function buildTemplateContext(projectPath, stack, patterns, installedSkills, language) {
  const unknown = t(language, 'unknownValue');
  const stackLabel = stack && stack.length ? normalizeList(stack) : unknown;
  const architectureLabel = patterns && patterns.length ? normalizeList(patterns) : unknown;

  return {
    PROJECT_NAME: detectProjectName(projectPath),
    STACK: stackLabel,
    ARCH: architectureLabel,
    INSTALLED_SKILLS: renderInstalledSkills(installedSkills, language),
    INSTRUCTIONS_PATH: path.join(projectPath, '.github', 'copilot-instructions.md'),
  };
}

function renderTemplate(templatePath, context) {
  const template = readText(templatePath);
  return replaceTokens(template, context);
}

function writeInstructions(projectPath, templatePath, stack, patterns, installedSkills, language) {
  const targetDir = path.join(projectPath, '.github');
  ensureDir(targetDir);
  const targetPath = path.join(targetDir, 'copilot-instructions.md');
  const context = buildTemplateContext(projectPath, stack, patterns, installedSkills, language);
  const content = renderTemplate(templatePath, context);
  atomicWrite(targetPath, content);
  return targetPath;
}

function buildInstructionsRefinementPrompt(projectPath, templatePath, stack, patterns, installedSkills, language) {
  const context = buildTemplateContext(projectPath, stack, patterns, installedSkills, language);
  return renderTemplate(templatePath, context);
}

function writeInstructionsRefinementPrompt(projectPath, content) {
  const targetDir = path.join(projectPath, '.github');
  ensureDir(targetDir);
  const targetPath = path.join(targetDir, 'copilot-instructions.improve.prompt.md');
  atomicWrite(targetPath, content);
  return targetPath;
}

module.exports = {
  buildInstructionsRefinementPrompt,
  writeInstructions,
  writeInstructionsRefinementPrompt,
};
