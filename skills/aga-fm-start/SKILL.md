---
name: aga-fm-start
description: Creates an AI-assisted FileMaker Web Viewer widget project from the agametis template. Use when a user wants to start, download, or scaffold a new FileMaker Web Viewer widget project.
license: MIT
compatibility: Requires network access, Git, Node.js 24+, npm, and an agent that supports the Agent Skills standard.
---

# Start an AI-assisted FileMaker widget project

Respond in the language used by the user. Keep commands, paths, API names, and skill names unchanged.

## 1. Check prerequisites

Before asking decisions, inspect rather than guess:

- `node --version` must report Node.js 24 or newer.
- `git --version` must succeed.
- `npm` must be available.

If a prerequisite is missing, stop and explain how to install or update it. Do not create a partial project.

## 2. Choose the destination

Ask one question: where should the project be created?

- Accept a new directory path.
- Accept `.` only when the current directory is empty.
- Never approve overwriting or merging into a non-empty directory.

Show the resolved destination and ask for confirmation before running the command.

## 3. Create the project

Run:

```bash
npx @agametis/create-app-for-fm@latest ai <directory>
```

Do not reproduce the downloader in the skill. The npm CLI is the single supported installer.

If creation fails, report the exact failed stage. Do not claim that dependencies, Git, or the baseline commit succeeded unless verified.

## 4. Explain what was created

In the user's language, briefly explain that the project provides:

- React, TypeScript, and Vite
- a single-file FileMaker Web Viewer build
- `fm-gofer` and a stable FM bridge
- explicit `data=test` URL-controlled mock mode that is available only during development
- a production build check that prevents the sample-data fixture from entering `dist/index.html`
- FileMaker upload tooling
- the project-local `aga-fm-widget` skill, plus `AGENTS.md` and `CLAUDE.md` so any agent finds it

Mention the four inputs the builder will eventually need:

1. A brief widget goal
2. A project name
3. Representative, anonymized input JSON
4. Whether the widget sends data back to FM

## 5. Offer the handoff

Ask whether the user wants to start the guided widget workflow now.

The generated project ships the builder at a fixed path:

```text
.claude/skills/aga-fm-widget/SKILL.md
```

Discovery works through three layers, so the workflow starts on any host:

- Hosts that read `.claude/skills/` register the skill directly and can invoke `/aga-fm-widget`.
  `.agents/skills/` contains a committed copy for Codex, Cline, Warp, Zed, Amp, and Replit.
- `AGENTS.md` and `CLAUDE.md` in the project root tell any agent to read the canonical file
  before building or changing the widget.
- As a direct fallback, the user can say:
  _read `.claude/skills/aga-fm-widget/SKILL.md` and follow it_.

The two skill trees must contain the same files. `.claude/skills/` is canonical; copy every skill
change into `.agents/skills/`.

Then:

- If the host can switch to or reload the generated project, do so and start `aga-fm-widget`.
- Otherwise, tell the user to open the generated folder in their agent-enabled editor and give
  them the exact sentence from the fallback above.

Never claim the skill is already active in the current session when the host has not registered
it. Name the path instead — the path always works.
