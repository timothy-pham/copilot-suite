const fs = require('fs');
const path = require('path');
const { copyTextToClipboard } = require('./clipboard');
const {
  buildInstructionsRefinementPrompt,
  writeInstructions,
  writeInstructionsRefinementPrompt,
} = require('./instructions');
const { buildSkillSources, getDefaultLanguage, resolveLanguage, STARTER_SKILL_PACK, t } = require('./i18n');
const { detectArchitecture } = require('./scanner');
const { discoverSkills, installSkills, syncSkillsRepo } = require('./skills');
const { StateStore } = require('./state');
const {
  ask,
  bold,
  color,
  confirm,
  humanJoin,
  parseSelection,
  printHeader,
  printKeyValue,
  printListItem,
  printMessage,
} = require('./utils');

function joinForDisplay(items, language) {
  if (!items || items.length === 0) return '';
  if (language === 'vi') {
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} và ${items[1]}`;
    return `${items.slice(0, -1).join(', ')} và ${items[items.length - 1]}`;
  }
  return humanJoin(items);
}

function parseArgs(argv) {
  const args = {
    project: process.cwd(),
    skillsRepos: [],
    skipSkills: false,
    statePath: null,
    restart: false,
    resume: false,
    nonInteractive: false,
    lang: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--project') {
      args.project = argv[i + 1];
      i += 1;
    } else if (arg === '--skills-repo') {
      args.skillsRepos.push(argv[i + 1]);
      i += 1;
    } else if (arg === '--skip-skills') {
      args.skipSkills = true;
    } else if (arg === '--state-path') {
      args.statePath = argv[i + 1];
      i += 1;
    } else if (arg === '--restart') {
      args.restart = true;
    } else if (arg === '--resume') {
      args.resume = true;
    } else if (arg === '--non-interactive') {
      args.nonInteractive = true;
    } else if (arg === '--lang') {
      args.lang = argv[i + 1];
      i += 1;
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    }
  }

  return args;
}

function printHelp() {
  printHeader('autopilot', { icon: '✦', color: 'cyan' });
  console.log(`${bold('Usage')}  autopilot [options]\n`);
  console.log(bold('Options'));
  console.log('  --project <path>        Path to target project (default: cwd)');
  console.log('  --skills-repo <url>     Add an extra skills repository on top of the official sources');
  console.log('  --lang <en|vi>          Choose CLI and instructions language');
  console.log('  --skip-skills           Skip skills sync/install');
  console.log('  --state-path <path>     Override state file path');
  console.log('  --restart               Restart and ignore previous state');
  console.log('  --resume                Resume from previous state');
  console.log('  --non-interactive       Run with defaults (installs starter pack)');
}

function resolveRoot() {
  return path.resolve(__dirname, '..');
}

function resolveCacheRoot(root, projectPath, override) {
  if (override) return path.dirname(override);
  const rootCache = path.join(root, 'cache');
  try {
    fs.mkdirSync(rootCache, { recursive: true });
    fs.accessSync(rootCache, fs.constants.W_OK);
    return rootCache;
  } catch (_err) {
    return path.join(projectPath, 'cache');
  }
}

function confirmOptions(language, defaultYes = true) {
  if (language === 'vi') {
    return {
      defaultYes,
      retryMessage: 'Vui lòng nhập y hoặc n.',
      yesValues: ['y', 'yes', 'c', 'co', 'có'],
      noValues: ['n', 'no', 'k', 'khong', 'không'],
    };
  }

  return {
    defaultYes,
    retryMessage: 'Please enter y or n.',
    yesValues: ['y', 'yes'],
    noValues: ['n', 'no'],
  };
}

async function selectLanguage(state, requestedLanguage, nonInteractive) {
  const savedLanguage = resolveLanguage(state.getData('language'));
  const explicitLanguage = resolveLanguage(requestedLanguage);
  if (explicitLanguage) return explicitLanguage;
  if (savedLanguage) return savedLanguage;

  const fallbackLanguage = getDefaultLanguage();
  if (nonInteractive) return fallbackLanguage;

  printHeader('Language / Ngôn Ngữ');
  const answer = await ask(t(fallbackLanguage, 'languagePrompt'));
  const selectedLanguage = resolveLanguage(answer);
  if (!selectedLanguage) {
    if (answer.trim()) console.log(t(fallbackLanguage, 'languageInvalid'));
    return fallbackLanguage;
  }
  return selectedLanguage;
}

async function promptResume(state, language, nonInteractive, forceRestart, forceResume) {
  if (forceRestart) {
    state.clear();
    return;
  }
  if (forceResume) return;

  if (state.data.status === 'complete') {
    if (nonInteractive || (await confirm(t(language, 'stateCompletePrompt'), confirmOptions(language)))) {
      state.clear();
    }
    return;
  }

  if ((state.data.completed_steps || []).length) {
    if (nonInteractive) return;
    if (await confirm(t(language, 'stateResumePrompt'), confirmOptions(language))) return;
    state.clear();
  }
}

function stepEnvCheck(state, language) {
  printHeader(t(language, 'envCheck'), { icon: '⚙', color: 'blue' });
  printKeyValue('Node', process.version);
  const { spawnSync } = require('child_process');
  const result = spawnSync('git', ['--version'], { stdio: 'ignore' });
  const gitAvailable = !result.error && result.status === 0;
  printKeyValue('Git', gitAvailable ? t(language, 'gitAvailableYes') : t(language, 'gitAvailableNo'));
  state.setData('git_available', gitAvailable);
}

function stepStackDetect(state, projectPath, language) {
  printHeader(t(language, 'stackDetection'), { icon: '🧭', color: 'cyan' });
  const result = detectArchitecture(projectPath);
  state.setData('stack', result.stack);
  state.setData('patterns', result.patterns);
  printKeyValue(
    language === 'vi' ? 'Stack' : 'Stack',
    joinForDisplay(result.stack, language) || t(language, 'unknownValue'),
  );
  if (result.patterns.length) {
    printKeyValue(
      language === 'vi' ? 'Kiến trúc' : 'Architecture',
      joinForDisplay(result.patterns, language),
    );
  } else {
    printKeyValue(language === 'vi' ? 'Kiến trúc' : 'Architecture', t(language, 'unknownValue'));
  }
}

function mergeInstalledSkills(...lists) {
  const merged = new Map();
  for (const list of lists) {
    for (const skill of list || []) {
      merged.set(skill.id, skill);
    }
  }
  return Array.from(merged.values());
}

function printStarterPack(skills) {
  skills.forEach((skill, index) => {
    const details = skill.description ? ` - ${skill.description}` : '';
    printListItem(`${bold(`${index + 1}.`)} ${skill.name} ${color(`[${skill.source.label}]`, 'blue')}${details}`, {
      marker: '★',
      color: 'yellow',
    });
  });
}

function printDiscoveredSkills(skills, installedIds, language) {
  printHeader(t(language, 'availableSkills'), { icon: '📁', color: 'cyan' });
  skills.forEach((skill, idx) => {
    const installedTag = installedIds.has(skill.id) ? ` [${t(language, 'installedTag')}]` : '';
    const details = skill.description ? ` - ${skill.description}` : '';
    const index = String(idx + 1).padStart(2, ' ');
    const installedLabel = installedTag ? color(installedTag, 'green') : '';
    console.log(`  ${color(index, 'cyan')}. ${bold(skill.name)} ${color(`[${skill.source.label}]`, 'blue')} (${skill.relpath})${details}${installedLabel}`);
  });
}

async function stepSkills(state, projectPath, sources, cacheDir, language, nonInteractive, skip) {
  printHeader(t(language, 'skillsSync'), { icon: '📦', color: 'cyan' });
  if (skip) {
    printMessage('warn', t(language, 'skillsSkipped'));
    return;
  }

  if (!state.getData('git_available', false)) {
    printMessage('warn', t(language, 'skillsGitMissing'));
    return;
  }

  const discoveredSkills = [];
  const sourceSummary = [];

  for (const source of sources) {
    printMessage('info', t(language, 'skillsRepoSyncing', { label: source.label }));
    try {
      const repoPath = syncSkillsRepo(source, cacheDir);
      const sourceSkills = discoverSkills(repoPath, source);
      discoveredSkills.push(...sourceSkills);
      sourceSummary.push(`${source.label} (${sourceSkills.length})`);
      printMessage('success', t(language, 'skillsRepoSynced', { label: source.label, count: sourceSkills.length }));
    } catch (err) {
      printMessage('warn', t(language, 'skillsRepoFailed', { label: source.label, error: String(err.message || err) }));
    }
  }

  if (!discoveredSkills.length) {
    printMessage('warn', t(language, 'skillsNoneFound'));
    return;
  }

  state.setData(
    'skills_discovered',
    discoveredSkills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      source: skill.source,
      relpath: skill.relpath,
    })),
  );

  printKeyValue(language === 'vi' ? 'Nguồn' : 'Sources', sourceSummary.join(', '));

  const starterPackSkills = STARTER_SKILL_PACK.map((id) => discoveredSkills.find((skill) => skill.id === id)).filter(Boolean);
  let installedSkills = [];

  printHeader(t(language, 'starterPackTitle'), { icon: '★', color: 'yellow' });
  if (starterPackSkills.length === STARTER_SKILL_PACK.length) {
    printStarterPack(starterPackSkills);
    if (nonInteractive) {
      installedSkills = installSkills(
        discoveredSkills,
        starterPackSkills.map((skill) => skill.id),
        projectPath,
      );
      printMessage('success', t(language, 'starterPackDefault'));
    } else if (await confirm(t(language, 'starterPackPrompt'), confirmOptions(language))) {
      installedSkills = installSkills(
        discoveredSkills,
        starterPackSkills.map((skill) => skill.id),
        projectPath,
      );
      printMessage('success', t(language, 'starterPackInstalled', { count: installedSkills.length }));
    }
  } else {
    printMessage('warn', t(language, 'starterPackUnavailable'));
  }

  const installedIds = new Set(installedSkills.map((skill) => skill.id));
  printDiscoveredSkills(discoveredSkills, installedIds, language);

  if (nonInteractive) {
    printMessage('info', t(language, 'additionalSkillsDefault'));
    state.setData('skills_installed', installedSkills);
    return;
  }

  const selection = (await ask(t(language, 'additionalSkillsPrompt'))).trim().toLowerCase();
  if (!selection) {
    printMessage('info', t(language, 'additionalSkillsSkipped'));
    state.setData('skills_installed', installedSkills);
    return;
  }

  let selectedIndices = [];
  if (selection === 'all') {
    selectedIndices = Array.from({ length: discoveredSkills.length }, (_, index) => index + 1);
  } else {
    try {
      selectedIndices = parseSelection(selection, discoveredSkills.length);
    } catch (_err) {
      printMessage('warn', t(language, 'invalidSelection'));
      state.setData('skills_installed', installedSkills);
      return;
    }
  }

  const additionalIds = selectedIndices
    .map((index) => discoveredSkills[index - 1])
    .filter(Boolean)
    .map((skill) => skill.id)
    .filter((skillId) => !installedIds.has(skillId));

  if (!additionalIds.length) {
    printMessage('warn', t(language, 'noValidSelections'));
    state.setData('skills_installed', installedSkills);
    return;
  }

  const additionalSkills = installSkills(discoveredSkills, additionalIds, projectPath);
  installedSkills = mergeInstalledSkills(installedSkills, additionalSkills);
  state.setData('skills_installed', installedSkills);
  printMessage('success', t(language, 'installedRemoteSkills', { count: additionalSkills.length }));
}

async function stepInstructions(state, projectPath, instructionTemplatePath, promptTemplatePath, language, nonInteractive) {
  printHeader(t(language, 'projectInstructions'), { icon: '📝', color: 'cyan' });
  const stack = state.getData('stack', []);
  const patterns = state.getData('patterns', []);
  const installedSkills = state.getData('skills_installed', []);

  const target = writeInstructions(projectPath, instructionTemplatePath, stack, patterns, installedSkills, language);
  printMessage('success', t(language, 'instructionsWritten', { path: target }));

  const promptContent = buildInstructionsRefinementPrompt(
    projectPath,
    promptTemplatePath,
    stack,
    patterns,
    installedSkills,
    language,
  );
  const promptPath = writeInstructionsRefinementPrompt(projectPath, promptContent);

  if (!nonInteractive && (await confirm(t(language, 'refinePromptCopy'), confirmOptions(language)))) {
    const clipboard = copyTextToClipboard(promptContent);
    if (clipboard.ok) {
      printMessage('success', t(language, 'refinePromptCopied', { tool: clipboard.tool }));
      printMessage('info', t(language, 'refinePromptPasteHint'));
    } else {
      printMessage('warn', t(language, 'refinePromptClipboardMissing'));
    }
  }

  printMessage('info', t(language, 'refinePromptSaved', { path: promptPath }));
  state.setData('instructions_path', target);
  state.setData('instructions_refinement_prompt_path', promptPath);
}

function instructionTemplatePath(root, language) {
  return path.join(root, 'templates', `copilot-instructions.${language}.md`);
}

function refinementPromptTemplatePath(root, language) {
  return path.join(root, 'templates', `copilot-instructions-improve-prompt.${language}.md`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return 0;
  }

  const root = resolveRoot();
  const projectPath = path.resolve(args.project);
  if (!fs.existsSync(projectPath)) {
    printMessage('error', `Project path does not exist: ${projectPath}`);
    return 1;
  }

  const cacheRoot = resolveCacheRoot(root, projectPath, args.statePath);
  const statePath = args.statePath || path.join(cacheRoot, 'state.json');
  const state = new StateStore(statePath);
  state.load();

  const language = await selectLanguage(state, args.lang, args.nonInteractive);
  await promptResume(state, language, args.nonInteractive, args.restart, args.resume);
  state.setData('language', language);
  state.setData('project_path', projectPath);

  const steps = [
    ['env_check', () => stepEnvCheck(state, language)],
    ['stack_detect', () => stepStackDetect(state, projectPath, language)],
    [
      'skills_sync',
      () => stepSkills(state, projectPath, buildSkillSources(args.skillsRepos), cacheRoot, language, args.nonInteractive, args.skipSkills),
    ],
    [
      'instructions_generate',
      () =>
        stepInstructions(
          state,
          projectPath,
          instructionTemplatePath(root, language),
          refinementPromptTemplatePath(root, language),
          language,
          args.nonInteractive,
        ),
    ],
  ];

  for (const [stepName, handler] of steps) {
    if (state.isComplete(stepName)) continue;
    await handler();
    state.markComplete(stepName);
    state.setStatus('in_progress');
    state.save();
  }

  state.setStatus('complete');
  state.save();
  printHeader(t(language, 'autopilotComplete'), { icon: '✓', color: 'green' });
  return 0;
}

module.exports = { main };
