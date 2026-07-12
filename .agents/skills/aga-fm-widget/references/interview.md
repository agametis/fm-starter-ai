# Adaptive interview stages

Ask one question at a time. The order may change when an answer creates a dependency, but do not skip required decisions.

## Stage A — Intent and naming

1. Ask for a short description of the desired outcome and primary user.
2. Clarify the main interaction only when the description is ambiguous.
3. Propose the project name from the folder; derive FileMaker, npm, and widget names; ask for confirmation.

Do not ask for a separate “simple versus complex” mode. This workflow always targets a production widget on React and TypeScript.

## Stage B — Input and loading

1. Ask for representative, anonymized JSON. Accept pasted JSON or a project-relative JSON file.
2. Validate syntax and explain any ambiguity rather than silently repairing the contract.
3. Ask which values are identifiers and which may be absent or empty.
4. Recommend initial delivery:
   - FM push through `fmWidgetLoad` when FM already has the relevant context.
   - Widget fetch through `fmWidget_getData` for self-refreshing, filtered, or searchable widgets.
5. Ask whether initial data should load automatically when the widget opens or only after an interface action. For widgets that should show current data immediately, recommend an automatic `window.fmWidget.refresh()` on startup while retaining any manual refresh control.
6. Ask about target Web Viewer size only when layout density, a chart, or a form makes it relevant. Otherwise default to responsive fill.

The JSON is mandatory before the final plan, not before early discovery.

## Stage C — Behavior and output

Ask whether the widget only displays data or modifies it.

For read-only widgets, skip save and dirty-state questions.

For editable widgets:

1. Clarify the user's editing and save flow.
2. Recommend a full snapshot or change set using the data-contract guide.
3. Propose concrete output JSON and ask for approval.
4. Ask whether saving is fire-and-forget or awaits an FM response; recommend based on what the UI must do after saving.
5. Ask whether FM must be able to request the widget's current unsaved data independently of the save flow. If yes, define the current-data payload returned by `fmWidgetRequestData` through `fmWidget_reportData`.
6. Recommend dirty tracking against the last loaded or successfully saved baseline and ask for confirmation.
7. If dirty tracking is approved, explain that FM calls `fmWidgetRequestState`, then `fmWidget_reportState` receives `{ "dirty": true|false }`.

Ask what the widget should show after an event or save: success, reset, reload, navigation, close, or no change. Do not assume “send data” defines the widget's next state.

## Stage D — UI and stack

1. Identify the essential display, input, validation, loading, empty, error, and success states.
2. Surface at most three feature ideas revealed by the JSON; ask before adding any.
3. Read the stack rubric and recommend the smallest suitable dependencies.
4. Obtain explicit dependency approval.

## Stage E — Artifacts and acceptance

1. Ask whether to create `docs/PLAN.md`.
2. Summarize observable acceptance criteria.
3. List unresolved assumptions without forcing speculative answers.
4. Present the complete plan and ask for explicit implementation approval.
