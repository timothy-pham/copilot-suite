You are working inside the repository for `{{PROJECT_NAME}}`.

Your task is to improve `{{INSTRUCTIONS_PATH}}` so it becomes specific to this codebase instead of staying generic.

Known context:

- Detected stack: {{STACK}}
- Architecture signals: {{ARCH}}
- Installed skills:
  {{INSTALLED_SKILLS}}

What to do:

1. Read the current `copilot-instructions.md`.
2. Inspect representative files across the repository to understand the real architecture, coding patterns, tooling, testing approach, and risky areas.
3. Identify which existing instructions are too generic, inaccurate, redundant, or missing.
4. Rewrite `copilot-instructions.md` to be materially more useful for future agents working in this repo.

Requirements:

- Keep the final file concise and practical.
- Prefer concrete repository-specific rules over generic best practices.
- Reference actual frameworks, directories, workflows, and testing conventions that you observe.
- Preserve any existing guidance that is still correct.
- Do not invent architecture rules that are not supported by the codebase.

Output:

- Update only `{{INSTRUCTIONS_PATH}}`.
- After editing, briefly summarize what you changed and why.
- Suggest any Skills that would be a good fit for this codebase if applicable.
