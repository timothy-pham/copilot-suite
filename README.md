# copilot-suite

`copilot-suite` is a CLI bootstrapper for setting up project-scoped GitHub Copilot (instructions, skills) guidance in a single run.

It helps a repository start with:

- `.github/copilot-instructions.md`
- `.github/skills/*`
- `.github/copilot-instructions.improve.prompt.md`

## Overview

The `autopilot` command guides the user through a lightweight setup flow:

- choose `English` or `Tiếng Việt`
- detect the project stack and architecture signals
- discover skills from the official repositories
- offer a curated starter pack first
- let the user install additional skills from the discovered catalog
- generate a project-specific `copilot-instructions.md`
- save a follow-up prompt that can be pasted into Copilot Chat to refine the instructions against the real codebase

Official skill sources:

- [github/awesome-copilot](https://github.com/github/awesome-copilot/tree/main)
- [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills)

## Recommended Starter Pack

The default starter pack includes:

- `architecture-blueprint-generator`
- `add-educational-comments`
- `agentic-eval`

This pack is intended to provide a practical baseline before the user browses the full skill catalog.

## Quick Start

Install globally:

```bash
npm install -g git+ssh://git@github.com:timothy-pham/copilot-suite.git
autopilot --project /path/to/your/project
```

Install locally:

```bash
npm install git+ssh://git@github.com:timothy-pham/copilot-suite.git
npx copilot-suite --project /path/to/your/project
```

Run directly from the repository:

```bash
./bin/autopilot --project /path/to/your/project
```

Or use the helper script:

```bash
./setup.sh --project /path/to/your/project
```

## Interactive Workflow

During an interactive run, `autopilot` will:

1. Ask for the interface language.
2. Inspect the target project to detect the stack and architecture hints.
3. Sync the official skill sources.
4. Offer the recommended starter pack.
5. Show the discovered skills catalog for optional additional installs.
6. Generate `.github/copilot-instructions.md`.
7. Save `.github/copilot-instructions.improve.prompt.md` and optionally copy its content to the clipboard.

In `--non-interactive` mode, the CLI:

- uses `--lang` when provided, otherwise falls back to the OS locale
- installs the recommended starter pack automatically
- skips additional skill selection
- still writes the refinement prompt file

## CLI Options

```bash
autopilot --help
```

Common flags:

- `--project <path>`: target project path.
- `--lang <en|vi>`: choose the CLI and generated instructions language.
- `--skills-repo <url>`: add an extra skills repository on top of the official sources. This flag can be repeated.
- `--skip-skills`: skip remote skill discovery and installation.
- `--state-path <path>`: override the checkpoint file path.
- `--restart`: ignore a previous run and start fresh.
- `--resume`: resume from the last checkpoint.
- `--non-interactive`: run with defaults and install the starter pack automatically.

## Generated Output

After a successful run, the target project contains:

- `.github/copilot-instructions.md`
- `.github/copilot-instructions.improve.prompt.md`
- `.github/skills/<source>--<skill>/...`

## Requirements

- Node.js `>=18`
- `git` for syncing the official skill repositories

## Notes

- Skill discovery is based on locating `SKILL.md` in each configured source.
- The generated `copilot-instructions.md` is a strong starting point, not a final repository audit.
- The refinement prompt is designed to help a Copilot agent tailor the instructions to the actual codebase after the initial bootstrap.
- Vietnamese documentation is available in [README.vi.md](./README.vi.md).
