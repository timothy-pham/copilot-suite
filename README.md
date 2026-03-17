# copilot-master-provisioner

Automated CLI-based bootstrap package to provision GitHub Copilot configurations for local environments (macOS/Linux) and specific project codebases.

## Features
- Stateful CLI with checkpoint/resume via `cache/state.json`.
- Tech stack and architecture discovery (heuristics).
- Skill sync and install from `https://github.com/VoltAgent/awesome-agent-skills`.
- System-wide VS Code settings hardening for Copilot + formatting best practices.
- Project-level `.github/copilot-instructions.md` generation.
- One-shot `setup.sh` for gh CLI, gh-copilot extension, aliases, and autopilot.

## Quick Start
Install as an npm package (local or global), then run `autopilot`.

```bash
npm install -g copilot-master-provisioner
autopilot --project /path/to/your/project
```

Or run locally with npx:
```bash
npx copilot-master-provisioner --project /path/to/your/project
```
If you omit `--project`, it will use the current working directory:
```bash
npx copilot-master-provisioner
```

Install directly from a private or SSH Git repo:
```bash
npm install -g git+ssh://git@github.com:timothy-pham/copilot-suite.git
```

You can also run the bundled setup script:
```bash
./setup.sh --project /path/to/your/project
```

Or run the CLI directly:
```bash
./bin/autopilot --project /path/to/your/project
```

## CLI Options
```bash
autopilot --help
```

Common flags:
- `--project`: target project path (default: current working directory).
- `--skip-skills`: skip skills repo sync/install.
- `--skip-vscode`: skip VS Code settings update.
- `--restart`: ignore prior state and run fresh.
- `--resume`: resume if state exists.
- `--non-interactive`: accept defaults (skips skill install prompt).

## Repository Structure
- `bin/`: executable CLI entrypoint (`autopilot`).
- `core/`: core modules (scanner, state, skills, VS Code, instructions).
- `templates/`: instruction + settings templates.
- `skills/`: reserved for future local skills.
- `cache/`: state + synced skills repo cache.

## State & Resume
Progress is recorded in `cache/state.json`. If the process is interrupted, rerun `./bin/autopilot` and choose Resume or Restart.

## VS Code Settings
The CLI writes to the user-level `settings.json` (with a `.bak` backup). The settings include Copilot enablement, model defaults, and format-on-save rules. If your VS Code settings file uses comments (JSONC), it will be rewritten as JSON.

## Skills Sync
Skills are discovered by searching for `SKILL.md` in the remote repository and copied into `<project>/copilot/skills/<skill-name>/`.
The CLI also installs bundled lightweight skills from `skills/bundled/` by default.

## Notes
- Requires Node.js (>=18) and `git` for full functionality (skills sync uses git).
- Stack and architecture detection is heuristic. Use the generated instructions as a starting point.
- Copilot model settings vary by VS Code version. Adjust `templates/vscode-settings.json` if needed.
