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
- Ask exactly one question at a time and wait for the answer.
- Prefer a structured single-choice tool when available; otherwise ask in plain text.
- For every choice, give a recommended answer and a short reason.
- Adapt follow-up questions to prior answers. Skip irrelevant branches.
- Look up repository facts instead of asking the user.
- Do not try to discover every future edge case. Record unresolved items as assumptions or later follow-ups.
- Make no filesystem or dependency changes before explicit plan approval.

Fixed technical names remain English. Localize user-facing UI, prose, comments, and project-specific identifiers where practical. See [interview stages](references/interview.md).

## 1. Inspect before interviewing

Read, without editing:

- `package.json` and `package-lock.json`
- `fm/fmConfig.js`
- `README.md`
- current source entry points and FM bridge files
- Git status and existing user changes

Confirm this is an `fm-starter-ai`-style React/TypeScript project. If user changes already exist, preserve them and surface conflicts; never regenerate files blindly.

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

Read [references/fm-integration.md](references/fm-integration.md) whenever FM communication is needed.

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

Personalize all visible starter identity:

- rename the included `.fmp12` file
- update `package.json` name and localized description
- update `package-lock.json`
- update `fm/fmConfig.js`
- update the HTML title and relevant README identity
- rename the `.code-workspace` file when present

Keep `$` as `fmConfig.server` unless the user said the file is hosted. Keep the fixed bridge APIs and FM script names in English.

Use the explicit `data=test` URL parameter for the approved representative fixture. Without that exact parameter, the widget must use the FM bridge and never silently fall back to mock data. In mock mode, show the target FM script and business parameter for Report Data and Report State below the widget controls.

Preserve the Terser `ascii_only` production setting and the build encoding check. WebDirect may corrupt literal umlauts in compiled button labels even when input values and standard browsers appear correct.

If FM changes are required, create `docs/FM-INTEGRATION.md` from [references/artifacts.md](references/artifacts.md). Include only the scripts, script steps, parameters, and results needed by this widget. Do not attempt to edit internal scripts in the binary `.fmp12` file.

If approved requirements change during implementation, stop, explain the impact, and obtain approval for the revised plan instead of expanding scope silently.

## 6. Verify and report

Always run:

1. TypeScript type-check
2. ESLint
3. Targeted automated tests for meaningful logic
4. Production build
5. IDE or language-server diagnostics

Also provide a short manual FM checklist covering Web Viewer readiness, load/refresh, events or saving, error behavior, and dirty-state reporting when applicable.

Do not mark the work complete with failing checks. Report exact files changed, verification results, and anything that still requires work inside FileMaker.
