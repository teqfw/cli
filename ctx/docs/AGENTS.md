# Project Documentation

- Path: `ctx/docs/AGENTS.md`
- Changed: `20260726`

## Purpose

This branch is the authoritative project-facing context.

## Level Map

- `architecture/` — stable engineering structure and lifecycle.
- `code/` — implementation mapping and verification.
- `environment/` — supported runtime and configuration.
- `product/` — product meaning, roles, use cases, and language.
- `AGENTS.md` — documentation boundary.
- `ai-intro.md` — compact orientation.
- `filesystem.md` — root repository map.

## Level Boundary

Documentation proceeds product → architecture → environment → code.
Ordinary Markdown files are agent documents; paired `*.skin.md` files are Human semantic controls.
Read a skin before editing its paired document.
Keep generated and visual material under `ctx/assets/**`.
