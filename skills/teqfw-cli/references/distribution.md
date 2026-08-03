# Distribution

The package publishes this version-matched consumer skill at
`node_modules/@teqfw/cli/skills/teqfw-cli/`. Start with `SKILL.md`; every
required reference is below that directory and describes the installed package
version.

The host project owns agent configuration. Installing `@teqfw/cli` must not
create links or change host configuration automatically.

A host that uses a root-level `.agents/skills/` catalog can mount this skill:

```sh
mkdir -p .agents/skills
ln -s ../../node_modules/@teqfw/cli/skills/teqfw-cli .agents/skills/teqfw-cli
```

A globally installed skill is an alternative discovery mechanism. Prefer the
local link when package-version-aligned guidance matters. The host project's
instructions and cognitive context remain authoritative for product intent and
architecture.
