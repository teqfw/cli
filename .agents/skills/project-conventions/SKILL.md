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
- When an `npm` or `git` operation is known in advance to require network access, request `sandbox_permissions: "require_escalated"` for the initial command instead of retrying the same operation in the restricted sandbox first.
- Run local npm checks in the sandbox when they do not need network or external system access, except tests that spawn child processes. Run subprocess-based tests (including acceptance tests and the full `npm test` suite) outside the sandbox with `sandbox_permissions: "require_escalated"`: the restricted sandbox can suppress child-process stdout/stderr and cause false failures or hangs.
- Do not commit or push unless the user requests it.

## Project-local skills

- Before reading a project-local skill, inspect its directory entry with `ls -la` and resolve symlinks with `readlink -f` (or an equivalent command). Project skills may be symlinks into `node_modules`; do not conclude that a skill is absent until its target has been checked.

## Communication

- User: Russian unless requested otherwise; code, comments, docs, commits, identifiers: English.
- Report changes, verification, and remaining risks.

## Project boundaries

- Before changing product files, read `ctx/AGENTS.md` and `ctx/docs/filesystem.md`.
- Preserve the dependency order: product → architecture → environment → code.

## GitHub

- Run every `gh` command with `sandbox_permissions: "require_escalated"`, because GitHub CLI credentials are stored in the OS keyring and are unavailable inside the sandbox.
- In all multiline text sent to GitHub, including issues and comments, use actual line breaks; never send literal `\n`, which GitHub displays as text.

## Shared memory

- `flancer32/ai-memo` is the shared cross-project issue tracker and memory.
- May create issues: source `teqfw/cli`; name the project or projects expected to resolve them.
- When referring to a commit in another repository, use its full GitHub URL: `https://github.com/vendor/name/commit/<sha>`.
- Notes: `project/teqfw/cli/`.

## Validation

- Use `teqfw-esm-validator` only for `src/`.
- When the user requests verification on GitHub resources, use the repository's GitHub Actions workflow for the target commit or pull request. Wait for the matching run to finish; inspect every relevant job rather than only the workflow summary. Report the run link, checked Node.js versions, executed gates, and any failure logs. Do not create a synthetic commit solely to trigger CI; push or manually dispatch a workflow only when authorized and supported by the workflow.
