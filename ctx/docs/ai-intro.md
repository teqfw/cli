# AI Introduction

- Path: `ctx/docs/ai-intro.md`
- Changed: `20260726`

## Purpose

Orient agents to `@teqfw/cli` before implementation work.

## Classification

The project is a Node.js CLI host and pure-JavaScript ESM library for TeqFW applications using `@teqfw/di` 2.x.
It discovers explicitly declared command providers from installed runtime packages, resolves them after DI namespace configuration, builds a parser-neutral command model, and owns execution lifecycle.

## Audience

Application assemblers run the `teq` binary.
Feature-package maintainers publish providers and immutable command descriptors.
Framework maintainers evolve the host contract.

## Distinguishing Boundaries

The public DTO does not expose Commander.
Discovery uses package metadata only.
Commands receive constructor-injected feature dependencies, not the container.
Library code never terminates the process.
Version 0.1.0 excludes prompts, completion, remote/daemon execution, authorization, hot reload, source-name discovery, legacy Core DTO compatibility, and package publication.

## Reading Angle

Read `product/overview.md`, then `architecture/overview.md`, `environment/overview.md`, and `code/overview.md`.
