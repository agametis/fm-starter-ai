# Minimal stack rubric

React, TypeScript, and Vite already exist and are not optional.

Before recommending a package, verify its current official documentation, React compatibility, license, and maintenance status. Explain what requirement the package satisfies. Never install a package merely because it is popular.

## Styling

Use the existing CSS when:

- the widget has one view or a few components
- styling is modest
- no reusable design system is needed

Recommend Tailwind CSS when:

- many components need repeated responsive states or design tokens
- utility composition materially reduces project-specific CSS
- the user accepts the additional dependency and conventions

Do not recommend Tailwind solely because the widget uses React.

## UI component libraries

Recommend a UI library only when the widget needs several complex, accessible controls such as dialogs, comboboxes, menus, tabs, date pickers, or form feedback, or must follow an existing design system.

Prefer focused accessible primitives over a full visual system when only one difficult control is needed.

## Domain libraries

- Charts: recommend a maintained chart library that directly supports the required chart and interaction.
- Sortable/searchable tables: consider a focused table library when pagination, filtering, selection, column state, or virtualization is substantial.
- Forms: use React state for small forms; consider a form library for many fields, nested data, repeated validation, or dynamic sections.
- Runtime schemas: generate TypeScript types first; add a schema library only for complex, variable, or safety-critical FM payloads.
- Server-state libraries: add one only for repeated fetching, caching, invalidation, dependent queries, or complex request state. A single FM request does not justify it.

## Recommendation format

For each proposed dependency state:

1. The requirement it addresses
2. Why built-in React/CSS is insufficient
3. The cost or convention it adds
4. The recommendation: install or omit

Then ask the user to approve the proposed stack.
