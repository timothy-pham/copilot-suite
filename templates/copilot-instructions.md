# GitHub Copilot Instructions

## Project Overview
- Project: {{PROJECT_NAME}}
- Detected Stack: {{STACK}}
- Architectural Patterns: {{ARCH}}

## Code Style
- Prefer clarity over cleverness.
- Favor small, composable functions.
- Keep modules focused on a single responsibility.
- Use explicit names and avoid ambiguous abbreviations.
- Preserve established formatting conventions in this repository.

## Error Handling
- Treat errors as data: return explicit error types/results where possible.
- Include actionable context in error messages (operation, input, expected shape).
- Avoid swallowing exceptions; rethrow with context or handle explicitly.
- Log errors at the boundary (API/CLI/worker) with structured fields.

## Security
- Validate all external inputs at the boundary.
- Avoid leaking secrets in logs or error messages.
- Use least-privilege defaults for any new automation or scripts.
- Prefer dependency allowlists and version pinning when adding new deps.

## Architectural Integrity (Clean Architecture)
- Keep domain logic free of framework-specific details.
- Define interfaces/ports at the domain boundary; implement adapters in infrastructure.
- Keep application/use-case orchestration separate from IO concerns.
- Avoid circular dependencies between layers.

## Testing & Quality
- Add tests for new behavior, especially in domain and application layers.
- Favor deterministic tests; avoid time/network dependencies where possible.
- Update or add docs when behavior changes.

## Copilot Guidance
- When unsure, propose a plan and ask clarifying questions.
- Prefer incremental, reviewable changes over large refactors.
- Keep changes minimal unless explicitly asked to redesign.
