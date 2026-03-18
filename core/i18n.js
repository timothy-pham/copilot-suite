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
    languagePrompt: 'Choose language / Chọn ngôn ngữ: [1] English, [2] Tiếng Việt (default: English): ',
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
    installedTag: 'installed',
    projectInstructions: 'Project Instructions',
    instructionsWritten: 'Wrote {path}.',
    refinePromptCopy: 'Copy a prompt to the clipboard so an agent can review the codebase and improve copilot-instructions.md?',
    refinePromptCopied: 'Copied the refinement prompt to the clipboard via {tool}.',
    refinePromptPasteHint: 'Paste the copied prompt into Copilot Chat so the agent can improve the instructions for this codebase.',
    refinePromptSaved: 'Saved the refinement prompt to {path}.',
    refinePromptClipboardMissing: 'Clipboard tool not available. The prompt was saved to a file instead.',
    autopilotComplete: 'Autopilot complete.',
  },
  vi: {
    languageHeader: 'Ngôn Ngữ',
    languagePrompt: 'Chọn ngôn ngữ / Choose language: [1] English, [2] Tiếng Việt (mặc định: Tiếng Việt): ',
    languageInvalid: 'Lựa chọn không hợp lệ. Sẽ dùng Tiếng Việt.',
    languageSelected: 'Ngôn ngữ: {value}',
    stateCompletePrompt: 'Lần chạy trước đã hoàn tất. Chạy lại từ đầu?',
    stateResumePrompt: 'Đã tìm thấy tiến trình trước đó. Tiếp tục từ bước đang dở?',
    envCheck: 'Kiểm Tra Môi Trường',
    nodeVersion: '- Node: {value}',
    gitAvailable: '- Git: {value}',
    gitAvailableYes: 'sẵn sàng',
    gitAvailableNo: 'không tìm thấy',
    unknownValue: 'Chưa xác định',
    stackDetection: 'Nhận Diện Stack',
    stackDetected: 'Stack phát hiện được: {value}',
    architectureSignals: 'Dấu hiệu kiến trúc: {value}',
    architectureNone: 'Dấu hiệu kiến trúc: chưa phát hiện rõ (theo heuristic)',
    skillsSync: 'Đồng Bộ Skills',
    skillsSkipped: 'Bỏ qua đồng bộ skills.',
    skillsRepoSyncing: 'Đang đồng bộ skills từ {label}...',
    skillsRepoSynced: 'Đã đồng bộ {label}: tìm thấy {count} skills.',
    skillsRepoFailed: 'Không thể đồng bộ {label}: {error}',
    skillsGitMissing: 'Bỏ qua skills từ remote: không tìm thấy git.',
    skillsSourceSummary: 'Đã discover từ các nguồn official: {value}',
    skillsNoneFound: 'Không tìm thấy skill nào trong các repo đã cấu hình.',
    starterPackTitle: 'Starter Pack',
    starterPackPrompt: 'Bạn có muốn cài starter pack gợi ý không?',
    starterPackUnavailable: 'Starter pack không khả dụng vì thiếu một hoặc nhiều skill được đề xuất.',
    starterPackInstalled: 'Đã cài {count} starter skills.',
    starterPackDefault: 'Chế độ non-interactive: đã cài starter pack gợi ý.',
    availableSkills: 'Danh sách skills discover được:',
    additionalSkillsPrompt: "Chọn thêm skills (ví dụ 1,2-4), 'all', hoặc Enter để bỏ qua: ",
    additionalSkillsSkipped: 'Không chọn thêm skill nào.',
    additionalSkillsDefault: 'Chế độ non-interactive: bỏ qua bước chọn thêm skills.',
    invalidSelection: 'Lựa chọn không hợp lệ.',
    noValidSelections: 'Không có lựa chọn hợp lệ.',
    installedRemoteSkills: 'Đã cài thêm {count} skills.',
    installedTag: 'đã cài',
    projectInstructions: 'Copilot Instructions',
    instructionsWritten: 'Đã ghi {path}.',
    refinePromptCopy: 'Bạn có muốn copy prompt vào clipboard để agent đọc codebase và cải tiến copilot-instructions.md không?',
    refinePromptCopied: 'Đã copy prompt cải tiến instructions vào clipboard bằng {tool}.',
    refinePromptPasteHint: 'Hãy dán prompt vừa copy vào Copilot Chat để Agent cải tiến instructions cho codebase này.',
    refinePromptSaved: 'Đã lưu prompt cải tiến instructions tại {path}.',
    refinePromptClipboardMissing: 'Máy chưa hỗ trợ clipboard command phù hợp. Prompt đã được lưu ra file.',
    autopilotComplete: 'Autopilot đã hoàn tất.',
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
  if (['vi', 'vn', 'vietnamese', 'tieng viet', 'tiếng việt', '2'].includes(value)) return 'vi';
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
