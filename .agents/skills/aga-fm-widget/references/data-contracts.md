# JSON and change-tracking guidance

Preserve a simple user-provided shape when it already expresses the widget clearly. Do not require an envelope by habit.

## When to recommend `meta` and `data`

Recommend an envelope when transport or control information is distinct from the business data, for example:

```json
{
  "meta": {
    "title": "Open invoices",
    "readOnly": false,
    "locale": "de-DE",
    "version": 1
  },
  "data": [
    { "recordId": "42", "amount": 125.5, "status": "open" }
  ]
}
```

Useful `meta` values include labels, permissions, locale, filters, pagination, protocol version, and stable context IDs. Do not move business records into `meta`.

## Output recommendations

Use a full snapshot for a small, cohesive form when FM replaces or validates the complete object:

```json
{
  "event": "save",
  "data": {
    "recordId": "42",
    "name": "Example",
    "status": "active"
  }
}
```

Use a change set for large lists, bulk editing, deletion, or conflict-sensitive updates:

```json
{
  "event": "save-changes",
  "data": {
    "updated": [{ "recordId": "42", "changes": { "status": "paid" } }],
    "created": [],
    "deleted": ["57"]
  }
}
```

Every changed record needs a stable FM identifier. Define null, empty string, absent keys, numeric values, dates, and deletion semantics explicitly when they occur in the sample.

The outer output shape is a project recommendation, not a mandatory universal schema. `event` plus `data` is generally useful for `fmWidget_handleEvent`, but add `meta` only when context, correlation, or versioning needs it.

When FM requests current unsaved values through `fmWidgetRequestData`, build the response from current React state and send it to `fmWidget_reportData` as `{ "data": ... }`. Do not return the last input payload unless it still matches the editable state.

## Dirty state

For editable widgets, recommend comparing current editable state with the last loaded or successfully saved baseline.

- Loading accepted FM data resets the baseline.
- An awaited save resets it only after FM confirms success.
- A fire-and-forget save must define whether the UI clears immediately or waits for a later FM reload.
- Failed saves preserve the edited state.
- `fmWidgetRequestState` reports only `{ "dirty": true|false }` through `fmWidget_reportState`.

Do not include the full edited payload in state reporting.

## Runtime validation

Always create TypeScript types for the approved contract. Add runtime validation only when data is complex, changes independently, comes from multiple FM branches, or an invalid payload could cause damaging behavior. Otherwise use small explicit guards with actionable error messages.
