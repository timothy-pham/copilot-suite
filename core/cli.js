const fs = require('fs');
const path = require('path');
const { writeInstructions } = require('./instructions');
const { detectArchitecture } = require('./scanner');
const { discoverSkills, installSkills, syncSkillsRepo } = require('./skills');
const { StateStore } = require('./state');
const { ask, confirm, humanJoin, parseSelection, printHeader } = require('./utils');
const { detectSettingsPath, updateSettings } = require('./vscode');

function parseArgs(argv) {
  const args = {
    project: process.cwd(),
    skillsRepo: 'https://github.com/VoltAgent/awesome-agent-skills',
    skipSkills: false,
    skipVscode: false,
    statePath: null,
    restart: false,
    resume: false,
    nonInteractive: false,
  };

  const flagMap = {
    '--project': 'project',
    '--skills-repo': 'skillsRepo',
    '--skip-skills': 'skipSkills',
    '--skip-vscode': 'skipVscode',
    '--state-path': 'statePath',
    '--restart': 'restart',
    '--resume': 'resume',
    '--non-interactive': 'nonInteractive',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (flagMap[arg]) {
      const key = flagMap[arg];
      if (['skipSkills', 'skipVscode', 'restart', 'resume', 'nonInteractive'].includes(key)) {
        args[key] = true;
      } else {
        args[key] = argv[i + 1];
        i += 1;
      }
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    }
  }

  return args;
}

function printHelp() {
  console.log('Usage: autopilot [options]');
  console.log('');
  console.log('Options:');
  console.log('  --project <path>        Path to target project (default: cwd)');
  console.log('  --skills-repo <url>     Skills repository URL');
  console.log('  --skip-skills           Skip skills sync/install');
  console.log('  --skip-vscode           Skip VS Code settings update');
  console.log('  --state-path <path>     Override state file path');
  console.log('  --restart               Restart and ignore previous state');
  console.log('  --resume                Resume from previous state');
  console.log('  --non-interactive       Run with defaults');
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

async function promptResume(state, nonInteractive, forceRestart, forceResume) {
  if (forceRestart) {
    state.clear();
    return;
  }
  if (forceResume) return;

  if (state.data.status === 'complete') {
    if (nonInteractive || (await confirm('Previous run completed. Restart?'))) {
      state.clear();
    }
    return;
  }

  if ((state.data.completed_steps || []).length) {
    if (nonInteractive) return;
    if (await confirm('Previous run detected. Resume from last step?')) return;
    state.clear();
  }
}

function stepEnvCheck(state) {
  printHeader('Environment Check');
  console.log(`- Node: ${process.version}`);
  const { spawnSync } = require('child_process');
  const result = spawnSync('git', ['--version'], { stdio: 'ignore' });
  const gitAvailable = !result.error && result.status === 0;
  console.log(`- Git: ${gitAvailable ? 'available' : 'missing'}`);
  state.setData('git_available', gitAvailable);
}

function stepStackDetect(state, projectPath) {
  printHeader('Stack Detection');
  const result = detectArchitecture(projectPath);
  state.setData('stack', result.stack);
  state.setData('patterns', result.patterns);
  console.log(`Detected stack: ${humanJoin(result.stack) || 'Unknown'}`);
  if (result.patterns.length) {
    console.log(`Architecture signals: ${humanJoin(result.patterns)}`);
  } else {
    console.log('Architecture signals: None detected (heuristics)');
  }
}

async function stepSkills(state, projectPath, repoUrl, cacheDir, root, nonInteractive, skip) {
  printHeader('Skills Sync');
  if (skip) {
    console.log('Skipped skills sync.');
    return;
  }
  const bundledRoot = path.join(root, 'skills', 'bundled');
  let bundledInstalled = [];
  if (fs.existsSync(bundledRoot)) {
    const bundled = discoverSkills(bundledRoot);
    if (bundled.length) {
      const indices = Array.from({ length: bundled.length }, (_, i) => i + 1);
      bundledInstalled = installSkills(bundled, indices, projectPath);
      console.log(`Installed ${bundledInstalled.length} bundled skills.`);
    }
  }
  if (!state.getData('git_available', false)) {
    console.log('Skipping skills: git not available.');
    if (bundledInstalled.length) state.setData('skills_installed', bundledInstalled);
    return;
  }
  let repoPath;
  try {
    repoPath = syncSkillsRepo(repoUrl, cacheDir);
  } catch (err) {
    console.log(String(err.message || err));
    if (bundledInstalled.length) state.setData('skills_installed', bundledInstalled);
    return;
  }
  const skills = discoverSkills(repoPath);
  if (!skills.length) {
    console.log('No skills found in repository.');
    return;
  }

  console.log('Available skills:');
  skills.forEach((skill, idx) => {
    console.log(`${String(idx + 1).padStart(2, ' ')}. ${skill.name} (${skill.relpath})`);
  });

  if (nonInteractive) {
    console.log('Non-interactive mode: skipping skill install.');
    if (bundledInstalled.length) state.setData('skills_installed', bundledInstalled);
    return;
  }

  const selection = (await ask("Select skills (e.g., 1,2-4), 'all', or Enter to skip: ")).trim().toLowerCase();
  if (!selection) {
    console.log('No skills selected.');
    if (bundledInstalled.length) state.setData('skills_installed', bundledInstalled);
    return;
  }

  let indices = [];
  if (selection === 'all') {
    indices = Array.from({ length: skills.length }, (_, i) => i + 1);
  } else {
    try {
      indices = parseSelection(selection, skills.length);
    } catch (_err) {
      console.log('Invalid selection.');
      if (bundledInstalled.length) state.setData('skills_installed', bundledInstalled);
      return;
    }
  }

  if (!indices.length) {
    console.log('No valid selections.');
    if (bundledInstalled.length) state.setData('skills_installed', bundledInstalled);
    return;
  }

  const installed = installSkills(skills, indices, projectPath);
  const combined = [...bundledInstalled, ...installed];
  state.setData('skills_installed', combined);
  console.log(`Installed ${installed.length} skills from remote.`);
}

async function stepVscode(state, templatePath, nonInteractive, skip) {
  printHeader('VS Code Settings');
  if (skip) {
    console.log('Skipped VS Code settings update.');
    return;
  }
  const settingsPath = detectSettingsPath();
  if (nonInteractive || (await confirm(`Apply VS Code settings to ${settingsPath}?`))) {
    updateSettings(settingsPath, templatePath);
    console.log('VS Code settings updated (backup created).');
  } else {
    console.log('Skipped VS Code settings update.');
  }
}

function stepInstructions(state, projectPath, templatePath) {
  printHeader('Project Instructions');
  const stack = state.getData('stack', []);
  const patterns = state.getData('patterns', []);
  const target = writeInstructions(projectPath, templatePath, stack, patterns);
  console.log(`Wrote ${target}.`);
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
    console.log(`Project path does not exist: ${projectPath}`);
    return 1;
  }

  const cacheRoot = resolveCacheRoot(root, projectPath, args.statePath);
  const statePath = args.statePath || path.join(cacheRoot, 'state.json');
  const state = new StateStore(statePath);
  state.load();

  await promptResume(state, args.nonInteractive, args.restart, args.resume);
  state.setData('project_path', projectPath);

  const steps = [
    ['env_check', () => stepEnvCheck(state)],
    ['stack_detect', () => stepStackDetect(state, projectPath)],
    [
      'skills_sync',
      () => stepSkills(state, projectPath, args.skillsRepo, cacheRoot, root, args.nonInteractive, args.skipSkills),
    ],
    [
      'vscode_config',
      () => stepVscode(state, path.join(root, 'templates', 'vscode-settings.json'), args.nonInteractive, args.skipVscode),
    ],
    [
      'instructions_generate',
      () => stepInstructions(state, projectPath, path.join(root, 'templates', 'copilot-instructions.md')),
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
  console.log('\nAutopilot complete.');
  return 0;
}

module.exports = { main };
