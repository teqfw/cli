---
name: project-conventions
description: Project-wide conventions that must be loaded for every agent session in this repository.
---

# Project Conventions

Apply the following rules in order of priority. If a rule conflicts with an applicable `AGENTS.md` instruction, follow `AGENTS.md`.

## 1. Repository topology

- Treat the project root as the single Git repository.
- Treat `ctx/` as the authoritative ADSM cognitive context within that repository, not as a separate repository.
- Include changes under `ctx/` in the root repository's Git status checks, commits, and pushes.

## 2. Git workflow

Work directly on `main` unless the task explicitly specifies another branch. Do not create working branches.

Before starting work, fetch the root repository and ensure the local branch in use matches its upstream version.

## 3. Communication

- Communicate with the user in Russian unless the user explicitly requests another language.
- Write source code, comments, documentation, commit messages, and identifiers in English.
- Report the changes made, the verification performed, and remaining risks.
- Create a GitHub issue in `flancer32/ai-memo` when a problem requires the user's attention.
- In every new issue, state the address of the project that initiated it.

## 4. Validation

- Use the `teqfw-esm-validator` skill only for the `src/` directory.
