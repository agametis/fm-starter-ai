# Worked example, end to end

Optional. Read this if you want a concrete pattern for how the interview answers turn into code and
FileMaker steps. It is one small editable widget, start to finish.

## What the user asked for

A Web Viewer panel listing open invoices. The user marks some as paid and saves. FileMaker must be
able to check for unsaved changes before closing the window.

Interview outcome:

- name: `Offene Rechnungen` → `Offene Rechnungen.fmp12`, npm `offene-rechnungen`, widget
  `offeneRechnungen`
- loading: widget fetches on startup through `fmWidget_getData`
- editable: yes, status only
- save: awaited, so the panel can show FileMaker's result
- dirty state: yes
- stack: nothing beyond React — a sortable list under a few hundred rows

## Input contract

```json
{
  "meta": { "title": "Offene Rechnungen" },
  "data": [
    { "recordId": "42", "customer": "Muster AG", "amount": 125.5, "status": "open" },
    { "recordId": "57", "customer": "Beispiel GmbH", "amount": 89.9, "status": "open" }
  ]
}
```

`recordId` is the stable FileMaker identifier and is required. `customer` may be empty.

## Types

```ts
// src/fm/types.ts
export interface InvoiceRow {
	recordId: string;
	customer: string;
	amount: number;
	status: "open" | "paid";
}

export interface WidgetPayload {
	meta?: { title?: string };
	data: InvoiceRow[];
}
```

## Validation

The rewritten `parseWidgetPayload` guards every row and names the failing JSON path, because that
message is what the information area displays. The full before/after is in
[contract-change.md](contract-change.md).

## Editable state and dirty tracking

Only `status` is editable, so the baseline covers exactly that:

```tsx
const serialize = (rows: InvoiceRow[]) =>
	JSON.stringify(rows.map(({ recordId, status }) => [recordId, status]));

const [rows, setRows] = useState<InvoiceRow[]>([]);
const [baseline, setBaseline] = useState("");
const dirty = serialize(rows) !== baseline;
```

Loading accepted FileMaker data resets the baseline. An awaited save resets it only after
FileMaker confirms success. A failed save keeps the edits.

## Output contract

Rows are edited individually, so the save sends a change set rather than the whole list:

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

`getData` returns that `data` object. `requestState` still reports only `{ "dirty": true|false }`.

## FileMaker side

Three of the five scripts are used. `fmWidget_reportData` is not, because FileMaker never needs the
unsaved values independently of the save. Step-level recipes are in
[fm-scripts.md](fm-scripts.md).

`fmWidget_getData` — build the payload, resolve the callback:

```text
Set Variable [ $callbackName ; JSONGetElement ( Get ( ScriptParameter ) ; "callbackName" ) ]
Set Variable [ $promiseID ; JSONGetElement ( Get ( ScriptParameter ) ; "promiseID" ) ]
# Loop the found set and build $data as a JSON array of invoice objects.
Set Variable [ $payload ; JSONSetElement ( "{}" ; [ "meta.title" ; "Offene Rechnungen" ; JSONString ] ; [ "data" ; $data ; JSONArray ] ) ]
Perform JavaScript in Web Viewer [ Object Name: "wvInvoices" ; Function Name: $callbackName ; Parameters: $promiseID, $payload, False ]
```

`fmWidget_handleEvent` — apply the change set, then resolve or reject:

```text
Set Variable [ $parameter ; JSONGetElement ( Get ( ScriptParameter ) ; "parameter" ) ]
Set Variable [ $updated ; JSONGetElement ( $parameter ; "data.updated" ) ]
# Loop $updated, go to each record by recordId, set the status field.
# On success:
Perform JavaScript in Web Viewer [ ... ; $promiseID, "3 Rechnungen aktualisiert.", False ]
# On failure:
Perform JavaScript in Web Viewer [ ... ; $promiseID, "Rechnung 42 ist gesperrt.", True ]
```

`fmWidget_reportState` — the close guard. FileMaker's close script calls `fmWidgetRequestState`
and then **exits**; it must not wait for a return value. JavaScript starts `fmWidget_reportState`,
which decides what happens:

```text
Set Variable [ $dirty ; JSONGetElement ( $parameter ; "dirty" ) ]
If [ $dirty ]
  Show Custom Dialog [ "Ungespeicherte Änderungen verwerfen?" ]
  # Close only if confirmed.
Else
  # Close the window.
End If
Perform JavaScript in Web Viewer [ ... ; $promiseID, "Status geprüft.", False ]
```

## Acceptance criteria that came out of this

- [ ] Opening the Web Viewer lists the open invoices without a manual action
- [ ] Marking a row paid sets unsaved changes to yes
- [ ] Save shows FileMaker's success text and resets unsaved changes to no
- [ ] A rejected save keeps the edits and shows FileMaker's error text
- [ ] Closing with unsaved changes prompts; closing without them does not
- [ ] `npm run build` passes, and `dist/index.html` contains no fixture values
