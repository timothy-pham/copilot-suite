const fs = require('fs');
const path = require('path');
const { classifyArchitecture, detectArchitectureFromDirs, tryReadJson } = require('./utils');

function detectStack(projectPath) {
  const stack = new Set();

  const packageJson = path.join(projectPath, 'package.json');
  if (fs.existsSync(packageJson)) {
    stack.add('Node.js');
    const pkg = tryReadJson(packageJson);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps['@nestjs/core'] || deps['@nestjs/common']) stack.add('NestJS');
    if (deps.react) stack.add('React');
    if (deps.next) stack.add('Next.js');
    if (deps.vue) stack.add('Vue');
    if (deps.svelte) stack.add('Svelte');
  }

  if (fs.existsSync(path.join(projectPath, 'nest-cli.json'))) stack.add('NestJS');
  if (fs.existsSync(path.join(projectPath, 'go.mod'))) stack.add('Go');
  if (fs.existsSync(path.join(projectPath, 'pubspec.yaml'))) stack.add('Flutter');
  if (fs.existsSync(path.join(projectPath, 'Cargo.toml'))) stack.add('Rust');
  if (fs.existsSync(path.join(projectPath, 'pyproject.toml'))) stack.add('Python');
  if (fs.existsSync(path.join(projectPath, 'requirements.txt'))) stack.add('Python');
  if (fs.existsSync(path.join(projectPath, 'pom.xml'))) stack.add('Java');
  if (fs.existsSync(path.join(projectPath, 'build.gradle')) || fs.existsSync(path.join(projectPath, 'build.gradle.kts')))
    stack.add('Java/Kotlin');
  if (fs.existsSync(path.join(projectPath, 'composer.json'))) stack.add('PHP');

  const topFiles = fs.readdirSync(projectPath);
  if (topFiles.some((name) => name.endsWith('.tf'))) stack.add('Terraform');

  return Array.from(stack).sort();
}

function mergeSignals(base, incoming) {
  const merged = { ...base };
  for (const [key, value] of Object.entries(incoming)) {
    merged[key] = (merged[key] || 0) + value;
  }
  return merged;
}

function detectArchitecture(projectPath) {
  const stack = detectStack(projectPath);
  let signals = {};

  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    if (dirs.includes('.git')) {
      dirs.splice(dirs.indexOf('.git'), 1);
    }
    signals = mergeSignals(signals, detectArchitectureFromDirs(dirs));
    for (const child of dirs) {
      walk(path.join(dir, child));
    }
  };

  walk(projectPath);
  const patterns = classifyArchitecture(signals);
  return { stack, patterns, signals };
}

module.exports = { detectArchitecture };
