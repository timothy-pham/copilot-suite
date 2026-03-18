# GitHub Copilot Instructions

## Project Overview
- Project: {{PROJECT_NAME}}
- Detected Stack: {{STACK}}
- Architecture Signals: {{ARCH}}

## Installed Skills
{{INSTALLED_SKILLS}}

## Engineering Principles
- Prefer clarity over cleverness.
- Keep functions and modules focused on a single responsibility.
- Preserve the repository's existing conventions before introducing new patterns.
- Keep changes incremental unless a deeper redesign is explicitly requested.
- Prefer simple abstractions that match the current codebase over speculative frameworks.

## Error Handling
- Validate inputs at the boundary and fail with actionable context.
- Avoid swallowing exceptions; handle them explicitly or rethrow with useful details.
- Log errors only at the appropriate boundary and do not leak secrets.

## Security
- Treat secrets, tokens, and production data as sensitive.
- Prefer least-privilege defaults for scripts, automations, and infrastructure changes.
- Avoid adding network or filesystem side effects unless the task clearly requires them.

## Testing And Quality
- Add or update tests for behavior changes when the repository already has a testing pattern.
- Keep tests deterministic and avoid hidden time or network dependencies.
- Update nearby documentation when developer workflows or behavior change.

## Collaboration Guidance
- Start by inspecting the current implementation before proposing changes.
- Call out assumptions, tradeoffs, and risks when they materially affect the solution.
- If the generated guidance becomes too generic, refine this file against the real codebase.
