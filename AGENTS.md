# Agent instructions

This project is `fm-starter-ai`: a React, TypeScript, and Vite template that builds **one**
interactive widget for a FileMaker Web Viewer as a single-file `dist/index.html`.

## Building or changing the widget

The guided builder is an Agent Skill. Its canonical instructions are at:

```text
.claude/skills/aga-fm-widget/SKILL.md
```

Read that file before creating or changing the widget, its data contract, or its FileMaker
communication. It interviews the user, gets a plan approved, and only then edits files.

`.claude/skills/` is the canonical source for this project's skills. `.agents/skills/` contains a
committed copy for Codex, Cline, Warp, Zed, Amp, and Replit. When changing or adding a skill,
edit `.claude/skills/` first, then copy the same changes into `.agents/skills/`; both trees must
remain identical.

The separate top-level `skills/aga-fm-start/` is not part of this project's runtime skills. It is a
standalone skill published for global installation with the `skills` package, and it scaffolds new
projects rather than building widgets inside one.

If you were asked to build or extend the widget and have not read that file yet, read it now.

## Contracts that must not drift

These names are fixed and stay in English even when the interaction is in another language.

FileMaker scripts:

- `fmWidget_getData` — the widget requests data; returns JSON through the FMGofer callback
- `fmWidget_handleEvent` — the widget sends an event or save
- `fmWidget_reportData` — the widget reports its current editable data
- `fmWidget_reportState` — the widget reports `{ "dirty": true|false }`
- `fmWidget_upload` — receives the built HTML path from `fm/fmUpload.js`

JavaScript API in [src/fm/bridge.ts](src/fm/bridge.ts):

- `window.fmWidget.load(payload)`, `.refresh()`, `.save()`, `.requestData()`, `.requestState()`
- Global adapters for **Perform JavaScript in Web Viewer**: `fmWidgetLoad`, `fmWidgetRefresh`,
  `fmWidgetRequestData`, `fmWidgetRequestState`. FileMaker's script step takes a plain global
  function name, so never use a dotted name there.

FMGofer resolves a promise when the callback's third parameter is `False` and rejects it when
that parameter is `True`. The second parameter is the message text, or JSON for
`fmWidget_getData`.

## Rules

- Mock mode is development-only and explicit: the `data=test` URL parameter plus
  `import.meta.env.DEV`. Load `src/sampleData.ts` only through a dynamic import behind that
  guard. The widget must never silently fall back to sample data.
- Keep `terserOptions.format.ascii_only` and the checks in
  [scripts/verify-build-encoding.js](scripts/verify-build-encoding.js). WebDirect corrupts
  literal non-ASCII characters in compiled labels.
- Never delete, skip, or weaken a test, type, or build check to make a command pass.
- Do not edit the binary `.fmp12` file. Document required FileMaker script steps instead.

## Commands

```bash
npm run dev          # http://localhost:5173/?data=test for mock mode
npm run type-check
npm run lint
npm test
npm run build        # includes the production encoding and sample-data checks
npm run deploy-to-fm # build, then hand dist/index.html to fmWidget_upload
```
