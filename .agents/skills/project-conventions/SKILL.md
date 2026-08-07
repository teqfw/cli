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

- Work in the repository's `main` branch. This project rule overrides any GitHub-skill instruction to use a separate branch.
- At the start of work, check upstream in the root and `ctx/` when applicable; keep each local `main` synchronized by fast-forwarding when safe.
- Before changes, inspect every affected working tree.
- Do not commit or push unless the user requests it.

## Communication

- User: Russian unless requested otherwise; code, comments, docs, commits, identifiers: English.
- Report changes, verification, and remaining risks.

## GitHub

- In all multiline text sent to GitHub, including issues and comments, use actual line breaks; never send literal `\n`, which GitHub displays as text.

## Shared memory

- `flancer32/ai-memo` is the shared cross-project issue tracker and memory.
- May create issues: source `teqfw/cli`; name the project or projects expected to resolve them.
- When referring to a commit in another repository, use its full GitHub URL: `https://github.com/vendor/name/commit/<sha>`.
- Notes: `project/teqfw/cli/`.

## Validation

- Use `teqfw-esm-validator` only for `src/`.
