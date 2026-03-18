const OFFICIAL_SKILL_SOURCES = [
  {
    id: 'github-awesome-copilot',
    label: 'GitHub Awesome Copilot',
    repoUrl: process.env.AUTOPILOT_GITHUB_SKILLS_REPO || 'https://github.com/github/awesome-copilot.git',
    skillsSubdir: 'skills',
  },
  {
    id: 'anthropic-skills',
    label: 'Anthropic Skills',
    repoUrl: process.env.AUTOPILOT_ANTHROPIC_SKILLS_REPO || 'https://github.com/anthropics/skills.git',
    skillsSubdir: 'skills',
  },
];

const STARTER_SKILL_PACK = [
  'github-awesome-copilot:architecture-blueprint-generator',
  'github-awesome-copilot:add-educational-comments',
  'github-awesome-copilot:agentic-eval',
];

const MESSAGES = {
  en: {
    languageHeader: 'Language',
    languagePrompt: 'Choose language / Chon ngon ngu: [1] English, [2] Tieng Viet (default: English): ',
    languageInvalid: 'Invalid selection. Defaulting to English.',
    languageSelected: 'Language: {value}',
    stateCompletePrompt: 'Previous run completed. Restart?',
    stateResumePrompt: 'Previous run detected. Resume from last step?',
    envCheck: 'Environment Check',
    nodeVersion: '- Node: {value}',
    gitAvailable: '- Git: {value}',
    gitAvailableYes: 'available',
    gitAvailableNo: 'missing',
    unknownValue: 'Unknown',
    stackDetection: 'Stack Detection',
    stackDetected: 'Detected stack: {value}',
    architectureSignals: 'Architecture signals: {value}',
    architectureNone: 'Architecture signals: None detected (heuristics)',
    skillsSync: 'Skills Sync',
    skillsSkipped: 'Skipped skills sync.',
    skillsRepoSyncing: 'Syncing skills from {label}...',
    skillsRepoSynced: 'Synced {label}: {count} skills found.',
    skillsRepoFailed: 'Failed to sync {label}: {error}',
    skillsGitMissing: 'Skipping remote skills: git not available.',
    skillsSourceSummary: 'Official sources discovered: {value}',
    skillsNoneFound: 'No skills found in the configured repositories.',
    starterPackTitle: 'Starter Pack',
    starterPackPrompt: 'Install the recommended starter pack?',
    starterPackUnavailable: 'Starter pack is unavailable because one or more recommended skills were not found.',
    starterPackInstalled: 'Installed {count} starter skills.',
    starterPackDefault: 'Non-interactive mode: installed the recommended starter pack.',
    availableSkills: 'Discovered skills:',
    additionalSkillsPrompt: "Select additional skills (e.g. 1,2-4), 'all', or Enter to skip: ",
    additionalSkillsSkipped: 'No additional skills selected.',
    additionalSkillsDefault: 'Non-interactive mode: skipping additional skill selection.',
    invalidSelection: 'Invalid selection.',
    noValidSelections: 'No valid selections.',
    installedRemoteSkills: 'Installed {count} additional skills.',
    vscodeSettings: 'VS Code Settings',
    vscodeSkipped: 'Skipped VS Code settings update.',
    vscodePrompt: 'Apply VS Code settings to {path}?',
    vscodeUpdated: 'VS Code settings updated (backup created).',
    projectInstructions: 'Project Instructions',
    instructionsWritten: 'Wrote {path}.',
    refinePromptCopy: 'Copy a prompt to the clipboard so an agent can review the codebase and improve copilot-instructions.md?',
    refinePromptCopied: 'Copied the refinement prompt to the clipboard via {tool}.',
    refinePromptSaved: 'Saved the refinement prompt to {path}.',
    refinePromptClipboardMissing: 'Clipboard tool not available. The prompt was saved to a file instead.',
    autopilotComplete: 'Autopilot complete.',
  },
  vi: {
    languageHeader: 'Ngon Ngu',
    languagePrompt: 'Chon ngon ngu / Choose language: [1] English, [2] Tieng Viet (mac dinh: Tieng Viet): ',
    languageInvalid: 'Lua chon khong hop le. Se dung Tieng Viet.',
    languageSelected: 'Ngon ngu: {value}',
    stateCompletePrompt: 'Lan chay truoc da hoan tat. Chay lai tu dau?',
    stateResumePrompt: 'Da tim thay tien trinh truoc do. Tiep tuc tu buoc dang do?',
    envCheck: 'Kiem Tra Moi Truong',
    nodeVersion: '- Node: {value}',
    gitAvailable: '- Git: {value}',
    gitAvailableYes: 'san sang',
    gitAvailableNo: 'khong tim thay',
    unknownValue: 'Chua xac dinh',
    stackDetection: 'Nhan Dien Stack',
    stackDetected: 'Stack phat hien duoc: {value}',
    architectureSignals: 'Dau hieu kien truc: {value}',
    architectureNone: 'Dau hieu kien truc: chua phat hien ro (theo heuristic)',
    skillsSync: 'Dong Bo Skills',
    skillsSkipped: 'Bo qua dong bo skills.',
    skillsRepoSyncing: 'Dang dong bo skills tu {label}...',
    skillsRepoSynced: 'Da dong bo {label}: tim thay {count} skills.',
    skillsRepoFailed: 'Khong the dong bo {label}: {error}',
    skillsGitMissing: 'Bo qua skills tu remote: khong tim thay git.',
    skillsSourceSummary: 'Da discover tu cac nguon official: {value}',
    skillsNoneFound: 'Khong tim thay skill nao trong cac repo da cau hinh.',
    starterPackTitle: 'Starter Pack',
    starterPackPrompt: 'Ban co muon cai starter pack goi y khong?',
    starterPackUnavailable: 'Starter pack khong kha dung vi thieu mot hoac nhieu skill duoc de xuat.',
    starterPackInstalled: 'Da cai {count} starter skills.',
    starterPackDefault: 'Che do non-interactive: da cai starter pack goi y.',
    availableSkills: 'Danh sach skills discover duoc:',
    additionalSkillsPrompt: "Chon them skills (vi du 1,2-4), 'all', hoac Enter de bo qua: ",
    additionalSkillsSkipped: 'Khong chon them skill nao.',
    additionalSkillsDefault: 'Che do non-interactive: bo qua buoc chon them skills.',
    invalidSelection: 'Lua chon khong hop le.',
    noValidSelections: 'Khong co lua chon hop le.',
    installedRemoteSkills: 'Da cai them {count} skills.',
    vscodeSettings: 'Cau Hinh VS Code',
    vscodeSkipped: 'Bo qua cap nhat cau hinh VS Code.',
    vscodePrompt: 'Ap dung cau hinh VS Code vao {path}?',
    vscodeUpdated: 'Da cap nhat VS Code settings (da tao file backup).',
    projectInstructions: 'Copilot Instructions',
    instructionsWritten: 'Da ghi {path}.',
    refinePromptCopy: 'Ban co muon copy prompt vao clipboard de agent doc codebase va cai tien copilot-instructions.md khong?',
    refinePromptCopied: 'Da copy prompt cai tien instructions vao clipboard bang {tool}.',
    refinePromptSaved: 'Da luu prompt cai tien instructions tai {path}.',
    refinePromptClipboardMissing: 'May chua ho tro clipboard command phu hop. Prompt da duoc luu ra file.',
    autopilotComplete: 'Autopilot da hoan tat.',
  },
};

function getDefaultLanguage() {
  const envLang = String(process.env.LANG || '').toLowerCase();
  if (envLang.startsWith('vi')) return 'vi';
  return 'en';
}

function resolveLanguage(input) {
  if (!input) return null;
  const value = String(input).trim().toLowerCase();
  if (['en', 'english', '1'].includes(value)) return 'en';
  if (['vi', 'vn', 'vietnamese', 'tieng viet', '2'].includes(value)) return 'vi';
  return null;
}

function format(template, vars = {}) {
  return Object.entries(vars).reduce((output, [key, value]) => output.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)), template);
}

function t(language, key, vars) {
  const table = MESSAGES[language] || MESSAGES.en;
  const template = table[key] || MESSAGES.en[key] || key;
  return format(template, vars);
}

function buildSkillSources(extraRepos = []) {
  const customSources = extraRepos
    .filter(Boolean)
    .map((repoUrl, index) => ({
      id: `custom-${index + 1}`,
      label: `Custom Skills ${index + 1}`,
      repoUrl,
      skillsSubdir: 'skills',
    }));

  return [...OFFICIAL_SKILL_SOURCES, ...customSources];
}

module.exports = {
  OFFICIAL_SKILL_SOURCES,
  STARTER_SKILL_PACK,
  buildSkillSources,
  getDefaultLanguage,
  resolveLanguage,
  t,
};
