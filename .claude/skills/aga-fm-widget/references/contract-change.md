# Replacing the starter contract

The starter ships a deliberately tiny demo contract, `{ meta?, data: { message: string } }`. It is
hard-coded in five files. Change all five together or the widget breaks in ways that type-checking
alone does not catch: the validator will reject the real payload at runtime while the UI compiles
cleanly.

Work in this order. Do not stop after step 4.

## 1. `src/fm/types.ts` — the shape

Replace `WidgetPayload` with the approved contract. Keep `meta` optional unless the plan requires
it. Export any record type the UI and the output contract both need.

## 2. `src/fm/bridge.ts` — the guards

Three things in this file know the contract:

- `parseWidgetPayload` — rewrite the guards for the new shape. Keep the pattern: throw an `Error`
  whose message names the offending JSON path, because that text is what the information area
  shows the user.
- `InstallApiOptions.getData` — its return type is `WidgetPayload["data"]`; widen or change it if
  the save/report payload is no longer the whole `data` object.
- `FM_SCRIPTS` — only if the widget genuinely needs a script the template lacks. The five
  documented script names do not change.

Do not weaken validation to make a payload pass. If the real data has optional fields, model them
as optional in the type and check them explicitly.

## 3. `src/sampleData.ts` — the fixture

Replace `samplePayload` with the approved representative JSON. Keep two things:

- the module's dev-only status — it must stay reachable exclusively through the dynamic `import()`
  inside `fetchWidgetPayload`, behind `import.meta.env.DEV`. The `forbid-dev-only-modules` plugin in
  `vite.config.ts` fails the production build if this module contributes any code to the bundle.
- the `__sampleDataModule: true` property — a text-level second check in
  `scripts/verify-build-encoding.js`. It is not sufficient on its own: a fixture of numbers and
  booleans has no distinctive text to search for, which is exactly why the plugin checks the module
  graph instead.

If you move or rename the file, update `DEV_ONLY_MODULES` in `vite.config.ts` to match. If you drop
the marker, say so in your report rather than leaving the weaker check silently disabled.

## 4. `src/App.tsx` — state and UI

Update the state, the dirty baseline, and the rendered UI. The starter compares two strings
(`draft !== baseline`); a richer contract usually needs a stable serialization of the editable
subset, compared against the last loaded or successfully saved snapshot. Keep the existing status
and error handling wiring — `onLoad`, `onError`, `onRefreshStart`, `onRequestStart`,
`onRequestSuccess` — and the mock-mode request preview block.

## 5. `src/fm/bridge.test.ts` — the contract tests

Update the tests to the new contract. Never delete them to get a green run. The existing cases are
the contract's specification and each one still has a job:

- accepts the documented payload
- preserves non-ASCII text end to end
- rejects a payload that cannot drive the widget
- `isMockMode` is true only for `data=test`
- each FM request sends the right script name and parameter, and reports success
- an FM rejection reaches `onError` and not `onRequestSuccess`

## Then the project identity

Only after the plan is approved, and only once per project:

- rename the included `.fmp12` file
- `package.json` — `name`, localized `description`
- `package-lock.json` — the two `name` fields
- `fm/fmConfig.js` — `file` and `widgetName`; keep `server: "$"` unless the file is hosted
- `index.html` — `<title>` and the description meta tag
- the `.code-workspace` file name
- `README.md` identity lines

## Worked example

Contract change from a single message to a list of editable invoice rows.

Input JSON agreed with the user:

```json
{
  "meta": { "title": "Offene Rechnungen", "readOnly": false },
  "data": [
    { "recordId": "42", "customer": "Muster AG", "amount": 125.5, "status": "open" }
  ]
}
```

`src/fm/types.ts`:

```ts
export interface InvoiceRow {
	recordId: string;
	customer: string;
	amount: number;
	status: "open" | "paid";
}

export interface WidgetPayload {
	meta?: {
		title?: string;
		readOnly?: boolean;
	};
	data: InvoiceRow[];
}
```

`parseWidgetPayload` before:

```ts
const candidate = parsed as Partial<WidgetPayload>;
if (
	!candidate.data ||
	typeof candidate.data !== "object" ||
	typeof candidate.data.message !== "string"
) {
	throw new Error('The widget payload must contain a string at "data.message".');
}

return {
	meta: candidate.meta,
	data: { message: candidate.data.message },
};
```

After — note that every row is validated, the identifier is required, and the error message names
the exact JSON path so the information area stays useful:

```ts
const candidate = parsed as Partial<WidgetPayload>;
if (!Array.isArray(candidate.data)) {
	throw new Error('The widget payload must contain an array at "data".');
}

const data = candidate.data.map((row, index) => {
	const invoice = row as Partial<InvoiceRow>;
	if (typeof invoice.recordId !== "string" || invoice.recordId === "") {
		throw new Error(`"data[${index}].recordId" must be a non-empty string.`);
	}
	if (typeof invoice.amount !== "number" || Number.isNaN(invoice.amount)) {
		throw new Error(`"data[${index}].amount" must be a number.`);
	}
	if (invoice.status !== "open" && invoice.status !== "paid") {
		throw new Error(`"data[${index}].status" must be "open" or "paid".`);
	}

	return {
		recordId: invoice.recordId,
		customer: typeof invoice.customer === "string" ? invoice.customer : "",
		amount: invoice.amount,
		status: invoice.status,
	};
});

return { meta: candidate.meta, data };
```

Dirty tracking for a list compares a serialization of the editable subset, not the whole payload:

```ts
const serialize = (rows: InvoiceRow[]) =>
	JSON.stringify(rows.map(({ recordId, status }) => [recordId, status]));

const dirty = serialize(rows) !== baseline;
```

Output contract for the save, as a change set because rows are edited individually:

```json
{
  "event": "save-changes",
  "data": {
    "updated": [{ "recordId": "42", "changes": { "status": "paid" } }],
    "created": [],
    "deleted": []
  }
}
```

`getData` then returns that `data` object rather than the loaded payload, so
`InstallApiOptions.getData` changes type accordingly.
