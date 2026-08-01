---
name: project-conventions
description: Project-specific conventions. Use for every task in this repository.
---

# Project Conventions

`AGENTS.md` overrides this file.

## Repositories

- The root and `ctx/` are one Git repository; include `ctx/` in root Git operations.
- `ctx/` is the authoritative ADSM cognitive context.

## Workflow

- Work on `main` unless the task specifies another branch; do not create branches.
- Before work, fetch and ensure the current branch matches its upstream.

## Communication

- User: Russian unless requested otherwise; code, comments, docs, commits, identifiers: English.
- Report changes, verification, and remaining risks.

## Shared memory

- `flancer32/ai-memo` is the shared cross-project issue tracker and memory.
- May create issues: source `teqfw/cli`; name the project or projects expected to resolve them.
- Notes: `project/teqfw/cli/`.

## Validation

- Use `teqfw-esm-validator` only for `src/`.
