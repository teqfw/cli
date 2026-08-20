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
- When the user requests verification on GitHub resources, use the repository's GitHub Actions workflow for the target commit or pull request. Wait for the matching run to finish; inspect every relevant job rather than only the workflow summary. Report the run link, checked Node.js versions, executed gates, and any failure logs. Do not create a synthetic commit solely to trigger CI; push or manually dispatch a workflow only when authorized and supported by the workflow.
