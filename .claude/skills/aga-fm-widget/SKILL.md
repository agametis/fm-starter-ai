---
name: aga-fm-widget
description: Interviews a user, plans, and implements one React and TypeScript widget for a FileMaker Web Viewer. Use when creating or extending a widget in an fm-starter-ai project, including JSON contracts, FM communication, dirty-state handling, stack selection, and deployment guidance.
license: MIT
compatibility: Requires a trusted fm-starter-ai project, Node.js 24+, npm, Git, and an Agent Skills-compatible coding agent.
---

# Build one FileMaker Web Viewer widget

Build one production-oriented widget per project. React, TypeScript, and Vite are the fixed foundation.

## Non-negotiable interaction rules

- Respond in the language used by the user.
- Ask one question at a time and wait for the answer. Where the host offers a structured question tool that takes several questions at once, you may group closely related decisions — at most four — into one round. Never group across interview stages.
- For every choice, give a recommended answer and a short reason.
- Adapt follow-up questions to prior answers. Skip irrelevant branches.
- Look up repository facts instead of asking the user.
- Do not try to discover every future edge case. Record unresolved items as assumptions or later follow-ups.
- Make no filesystem or dependency changes before explicit plan approval.

## Never do these

- Never delete, skip, or weaken a test, a type, or a build check to make a command pass. If a check fails after your change, fix the code, or re-point the check at the approved contract and say so explicitly in your report.
- If the same command fails twice for the same reason, stop and report it. Do not keep iterating.
- Report which verification commands actually ran and what they actually returned. Never report completion with a failing or skipped check.
- Never let the widget fall back to sample data outside development.

Fixed technical names remain English. Localize user-facing UI, prose, comments, and project-specific identifiers where practical. See [interview stages](references/interview.md).

## 1. Inspect before interviewing

This skill is project-local by design. It ships inside an `fm-starter-ai` project and edits that project's files. It is not meant to be installed globally, because a global copy drifts from the template version it is editing.

So before anything else, confirm the working directory is an `fm-starter-ai`-style React/TypeScript project. Read, without editing:

- `package.json` and `package-lock.json`
- `fm/fmConfig.js`
- `README.md`
- current source entry points and FM bridge files
- Git status and existing user changes

**If this is not such a project, stop.** Do not scaffold one from memory and do not adapt this workflow to an unrelated codebase. Tell the user to create a project first, with `npx @agametis/create-app-for-fm@latest ai <directory>` or the `aga-fm-start` skill, then reopen that folder and run the copy of this skill that ships inside it.

If user changes already exist, preserve them and surface conflicts; never regenerate files blindly.

### Is this a first run or a change to an existing widget?

The project is already personalized if `package.json` `name` is no longer `fm-starter-ai`, or `docs/PLAN.md` exists, or the source no longer uses the starter `data.message` contract.

In that case this is a change request, not a new project:

- Skip the readiness notice in step 2 and the full interview in step 3.
- Skip all identity personalization in step 5. It happens once per project.
- Recover the existing contract from `docs/PLAN.md`, `docs/FM-INTEGRATION.md`, and the source, and state your understanding of it back to the user.
- Ask only what the requested change needs.
- Then follow steps 4 through 6 normally: plan, approve, implement, verify.

## 2. Show the readiness notice

Tell the user they will need:

1. A brief description of the widget
2. A project name
3. Representative input data as valid JSON
4. Whether the widget sends data back to FM

Add one brief warning to anonymize personal data, credentials, and production secrets.

Ask whether to continue or cancel. If canceled, make no changes and explain how to restart later.

## 3. Conduct the adaptive interview

Follow [references/interview.md](references/interview.md). Representative JSON may arrive later, but it is mandatory before the final plan.

Use the folder name as the suggested project name. Derive and show for confirmation:

- FileMaker filename: title form, for example `Sales Dashboard.fmp12`
- npm package name: kebab case, for example `sales-dashboard`
- widget identifier: camel case, for example `salesDashboard`

For German technical names transliterate `ä→ae`, `ö→oe`, `ü→ue`, and `ß→ss`. Preserve the original characters in display text and the FileMaker filename.

Read [references/stack-rubric.md](references/stack-rubric.md) before recommending dependencies. Recommend the smallest suitable stack and obtain approval before adding packages.

Read [references/data-contracts.md](references/data-contracts.md) when analyzing input JSON, designing output JSON, or discussing change tracking.

Read [references/fm-integration.md](references/fm-integration.md) whenever FM communication is needed, and [references/fm-scripts.md](references/fm-scripts.md) when you need the actual FM script steps.

Optional: [references/example-walkthrough.md](references/example-walkthrough.md) shows one small widget end to end, from interview answers to code and FM steps. Read it if you want a concrete pattern to follow.

## 4. Decide whether to write a plan file

Ask whether to create `docs/PLAN.md`; recommend yes. The content uses the user's language, but the path stays fixed.

Regardless of that answer, present a concise plan in the conversation with:

- confirmed naming
- user flow and UI states
- input contract and loading direction
- output/save contract when applicable
- dirty-state behavior when applicable
- approved dependencies and why each is needed
- FM changes required
- observable acceptance criteria
- verification steps
- explicit assumptions and deferred questions

The plan is ready when naming, the primary flow, representative JSON, FM interactions, stack, and acceptance criteria are clear. Do not block on speculative future edge cases.

Ask for explicit approval. If the plan changes, revise it and ask again.

## 5. Implement only after approval

Work surgically and preserve existing conventions and user changes.

Read [references/contract-change.md](references/contract-change.md) before you touch the payload type. The starter contract `data.message` is hard-coded in five files that must change together, and that file lists them in order with a worked before/after. Skipping it is the most common way this step goes wrong: the UI compiles while `parseWidgetPayload` still rejects the real payload at runtime.

On a first run, personalize all visible starter identity — once per project, and only after plan approval:

- rename the included `.fmp12` file
- update `package.json` name and localized description
- update `package-lock.json`
- update `fm/fmConfig.js`
- update the HTML title and relevant README identity
- rename the `.code-workspace` file when present

Keep `$` as `fmConfig.server` unless the user said the file is hosted. Keep the fixed bridge APIs and FM script names in English.

Use the explicit `data=test` URL parameter for the approved representative fixture. Mock mode and its fixture are development-only. Without that exact parameter, or in any production build, the widget must use the FM bridge and never silently fall back to mock data. Load the fixture behind an `import.meta.env.DEV` guard with a dynamic import; never statically import sample data into the application graph. In mock mode, show the target FM script and business parameter for Report Data and Report State below the widget controls.

Preserve both production safeguards. They adapt to whatever UI and fixture you build, so you should not need to edit either one:

- `vite.config.ts` — the Terser `ascii_only` setting, and the `forbid-dev-only-modules` plugin, which fails the build if `src/sampleData.ts` contributes code to the bundle. It reads the module graph, so it works for any fixture shape.
- `scripts/verify-build-encoding.js` — the output must be pure ASCII, the sample-data marker must be absent, and non-ASCII text in your source must appear escaped rather than dropped.

WebDirect may corrupt literal umlauts in compiled button labels even when input values and standard browsers appear correct, which is why ASCII-only output matters.

If you move or rename the fixture, update `DEV_ONLY_MODULES` in `vite.config.ts` to the new path — otherwise the authoritative check silently stops guarding anything. Keep the `__sampleDataModule` marker or an equivalent, and update the marker name in the script if you rename it.

If FM changes are required, create `docs/FM-INTEGRATION.md` from [references/artifacts.md](references/artifacts.md). Include only the scripts, script steps, parameters, and results needed by this widget. Do not attempt to edit internal scripts in the binary `.fmp12` file.

If approved requirements change during implementation, stop, explain the impact, and obtain approval for the revised plan instead of expanding scope silently.

## 6. Verify and report

Always run:

1. `npm run type-check`
2. `npm run lint`
3. `npm test` — with targeted tests for the meaningful logic you added
4. `npm run build` — this also runs the encoding, marker, and escape-coverage checks
5. Host diagnostics, if this host exposes them. Say so if it does not, rather than claiming this step passed.

Then confirm by inspection that `dist/index.html` contains no representative fixture values, not just no marker.

Also provide a short manual FM checklist covering Web Viewer readiness, load/refresh, events or saving, error behavior, and dirty-state reporting when applicable.

Do not mark the work complete with failing checks. Report exact files changed, verification results, and anything that still requires work inside FileMaker.
