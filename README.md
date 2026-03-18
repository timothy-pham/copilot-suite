# copilot-master-provisioner

CLI bootstrapper for generating project-scoped GitHub Copilot setup in one run:

- `.github/copilot-instructions.md`
- `.github/skills/*`
- an optional prompt file to help an agent refine the generated instructions against the real codebase

## What Changed

The autopilot flow now:

- asks the user to choose `English` or `Tiếng Việt` first
- discovers skills from the two official repositories:
  - [github/awesome-copilot](https://github.com/github/awesome-copilot/tree/main)
  - [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills)
- offers a recommended starter pack before showing the full discovered catalog
- installs skills into `.github/skills`, which matches the current GitHub Copilot custom instructions and skills layout
- writes a follow-up prompt to `.github/copilot-instructions.improve.prompt.md` and can copy that prompt to the clipboard in interactive mode

The recommended starter pack currently includes:

- `architecture-blueprint-generator`
- `add-educational-comments`
- `agentic-eval`

## Quick Start

Install globally:

```bash
npm install -g git+ssh://git@github.com:timothy-pham/copilot-suite.git
autopilot --project /path/to/your/project
```

Install locally:

```bash
npm install git+ssh://git@github.com:timothy-pham/copilot-suite.git
npx copilot-master-provisioner --project /path/to/your/project
```

Run directly from the repo:

```bash
./bin/autopilot --project /path/to/your/project
```

Or use the helper script:

```bash
./setup.sh --project /path/to/your/project
```

## Interactive Flow

`autopilot` now follows this order:

1. Choose language.
2. Detect stack and architecture signals.
3. Sync the official skill sources.
4. Offer the starter pack.
5. Show the discovered skills catalog so the user can install additional skills.
6. Update VS Code settings unless skipped.
7. Generate `.github/copilot-instructions.md`.
8. Offer a ready-to-paste prompt for improving `copilot-instructions.md` against the actual codebase.

In `--non-interactive` mode, the CLI:

- uses `--lang` if provided, otherwise falls back to the OS locale
- installs the recommended starter pack automatically
- skips additional skill selection
- still writes the refinement prompt file

## CLI Options

```bash
autopilot --help
```

Common flags:

- `--project <path>`: target project path.
- `--lang <en|vi>`: choose CLI and generated instructions language.
- `--skills-repo <url>`: add an extra skill repository on top of the two official sources. You can repeat this flag.
- `--skip-skills`: skip remote skill discovery and installation.
- `--skip-vscode`: skip VS Code settings update.
- `--state-path <path>`: override the checkpoint file path.
- `--restart`: ignore a previous run and start fresh.
- `--resume`: resume from the last checkpoint.
- `--non-interactive`: accept defaults and install the starter pack automatically.

## Output Layout

After a successful run, the target project contains:

- `.github/copilot-instructions.md`
- `.github/copilot-instructions.improve.prompt.md`
- `.github/skills/<source>--<skill>/...`

## Notes

- Node.js `>=18` and `git` are required for full skill sync.
- Skill discovery is based on finding `SKILL.md` in each configured source.
- The generated `copilot-instructions.md` is intentionally a starting point. The follow-up prompt is there to help tailor it to the real repository.
- A Vietnamese guide is available in [README.vi.md](./README.vi.md).
