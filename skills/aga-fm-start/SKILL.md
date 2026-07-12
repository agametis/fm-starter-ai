---
name: aga-fm-start
description: Creates an AI-assisted FileMaker Web Viewer widget project from the Agametis template. Use when a user wants to start, download, or scaffold a new FileMaker Web Viewer widget project.
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
- explicit `data=test` URL-controlled mock mode
- FileMaker upload tooling
- the project-local `aga-fm-widget` skill

Mention the four inputs the builder will eventually need:

1. A brief widget goal
2. A project name
3. Representative, anonymized input JSON
4. Whether the widget sends data back to FM

## 5. Offer the handoff

Ask whether the user wants to start the guided widget workflow now.

- If the host can switch to or reload the generated project, do so and invoke `aga-fm-widget`.
- Otherwise, give exact instructions to open the generated folder and ask the new agent session to use `aga-fm-widget`.
- Do not pretend a newly downloaded project skill is active when the host has not discovered it.
