# Project artifact templates

Keep fixed paths in English. Write their contents in the user's language.

## `docs/PLAN.md`

```markdown
# <Widget title> — implementation plan

## Goal
<One concise outcome statement.>

## Confirmed naming
- FileMaker file:
- npm package:
- Widget identifier:

## Primary flow
<Numbered user flow.>

## Data contract
<Input direction, approved example, identifiers, optional values.>

## Output and state
<Output contract, save response, post-save behavior, dirty tracking—or “read-only”.>

## Stack
<Only approved dependencies and why each exists.>

## FileMaker changes
<Only required script/API changes.>

## Acceptance criteria
- [ ] <Observable result>

## Verification
<Type-check, lint, targeted tests, build, FM checklist.>

## Assumptions and deferred questions
<Unknowns that do not block the core flow.>
```

## `docs/FM-INTEGRATION.md`

```markdown
# FileMaker integration

## Web Viewer setup
<Object name, JavaScript permission, readiness requirement.>

## Script contract
### `<script name>`
- Direction:
- Parameter JSON:
- Result JSON:
- Relevant script steps:

## JavaScript entry points
<Only adapters used by this widget.>

## Save and dirty-state sequence
<Only when applicable.>

## Manual verification
- [ ] Initial data loads
- [ ] Refresh works
- [ ] Events/saves reach FM
- [ ] FM can request current widget data when required
- [ ] Errors preserve user data
- [ ] Dirty-state request controls closing
```

Do not add empty sections for behavior the widget does not use.
