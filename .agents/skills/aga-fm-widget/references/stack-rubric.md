# Minimal stack rubric

React, TypeScript, and Vite already exist and are not optional. Everything else needs a reason.

A Web Viewer widget is embedded, single-purpose, and shipped as one inlined HTML file. Dependencies
cost payload size and build complexity here more than they would in a normal web app. The default
answer is no.

## Defaults by widget archetype

Start from this table, then justify any deviation. "Nothing" means plain React with the existing
`src/index.css`.

| Widget archetype | Default | Add a dependency only when |
| --- | --- | --- |
| Read-only display, badges, key figures | Nothing | never |
| Single chart | One maintained chart library | — |
| Several charts or a dashboard | One chart library, shared config | a second library is never the answer |
| List or table, roughly under a few hundred rows, sorting only | Nothing — `useMemo` plus a sort comparator | — |
| Table with pagination, filtering, column state, selection, or virtualization | A focused headless table library | the state above is genuinely needed, not anticipated |
| Form up to roughly ten flat fields | Nothing — `useState` and explicit validation | — |
| Form with nested data, arrays, dynamic sections, or repeated validation | A form library | — |
| Any amount of styling that stays project-specific | Existing CSS | the design system argument below applies |
| Standard UI icons | `lucide-react` | never hand-author or copy SVG icon markup |
| Several complex accessible controls: dialog, combobox, menu, tabs, date picker | Accessible primitives | — |
| One difficult control | A focused primitive for that control only | never a full visual system |
| Any single FM request, however slow | Nothing | never a server-state library |
| Repeated fetching with caching, invalidation, or dependent queries | A server-state library | — |
| FM payload that is complex, variable, multi-branch, or safety-critical | A runtime schema library, plus generated types | — |
| Any other FM payload | TypeScript types plus explicit guards in `parseWidgetPayload` | — |

When the React widget uses icons, import named icon components directly from `lucide-react`.
Do not generate icons manually from SVGs or add another general-purpose icon library; Lucide covers
standard widget needs. Include `lucide-react` in the proposed stack and obtain approval before
installing it.

Before naming a specific package, verify its current official documentation, React 19
compatibility, license, and maintenance status. Do not name a package from memory alone, and never
install one because it is popular.

## Judgment calls the table does not settle

### Tailwind CSS

Use the existing CSS when the widget has one view or a few components, styling is modest, and no
reusable design system is needed.

Recommend Tailwind only when many components need repeated responsive states or design tokens,
utility composition materially reduces project-specific CSS, and the user accepts the extra
dependency and conventions. Do not recommend it merely because the widget uses React.

### UI component libraries

Recommend a full library only when the widget needs several complex accessible controls, or must
follow an existing design system. Prefer focused accessible primitives when only one difficult
control is needed.

### Runtime schemas

Always create TypeScript types for the approved contract first. A schema library is additional, not
an alternative — and for a fixed contract the explicit guards in `parseWidgetPayload` are usually
clearer and smaller. See [contract-change.md](contract-change.md).

## Recommendation format

For each proposed dependency, state:

1. The requirement it addresses
2. Why built-in React or CSS is insufficient
3. The cost or convention it adds
4. The recommendation: install or omit

Then ask the user to approve the proposed stack. Install nothing before that approval.

If the table's default is "Nothing" and you still want a dependency, say explicitly which row you
are deviating from and why.
