# FileMaker integration contract

This file defines the contract. For the actual script steps inside each script, see
[fm-scripts.md](fm-scripts.md).

Use these exact, English script names:

- `fmWidget_getData`
- `fmWidget_handleEvent`
- `fmWidget_upload`
- `fmWidget_reportData`
- `fmWidget_reportState`

Use these canonical JavaScript methods inside the application:

- `window.fmWidget.load(payload)`
- `window.fmWidget.refresh()`
- `window.fmWidget.requestData()`
- `window.fmWidget.requestState()`

Because Claris documents FileMaker's script step as invoking a named global JavaScript function, expose these thin global adapters for the actual **Perform JavaScript in Web Viewer** step:

- `fmWidgetLoad(payload)` → `window.fmWidget.load(payload)`
- `fmWidgetRefresh()` → `window.fmWidget.refresh()`
- `fmWidgetRequestData()` → `window.fmWidget.requestData()`
- `fmWidgetRequestState()` → `window.fmWidget.requestState()`

Do not rely on an undocumented dotted function name in the FileMaker script step.

## Web Viewer prerequisite

The Web Viewer must enable **Allow JavaScript to perform FileMaker scripts**. FileMaker cannot call JavaScript before the page and function are loaded; relevant FM scripts must handle Web Viewer readiness.

## Widget fetches data

Use `fm-gofer` when JavaScript must await an FM script result:

```ts
const result = await FMGofer.PerformScript("fmWidget_getData", parameter).json<Result>();
```

FM receives an envelope in `Get ( ScriptParameter )`. The business request is under `parameter`; `callbackName` and `promiseID` identify how FM resolves the promise.

Relevant FM steps:

```text
Set Variable [ $parameter ; JSONGetElement ( Get ( ScriptParameter ) ; "parameter" ) ]
Set Variable [ $callbackName ; JSONGetElement ( Get ( ScriptParameter ) ; "callbackName" ) ]
Set Variable [ $promiseID ; JSONGetElement ( Get ( ScriptParameter ) ; "promiseID" ) ]
# Build the JSON result required by this widget.
Perform JavaScript in Web Viewer [ Object Name: <web viewer object> ; Function Name: $callbackName ; Parameters: $promiseID, $jsonResult, False ]
```

Document only the project-specific JSON-building and branching steps around this callback.

## Processing feedback contract

When FM must tell the Web Viewer whether sent data or state was processed, use FMGofer rather than the built-in fire-and-forget function. Use FMGofer's callback contract directly:

- Callback parameter 1: `promiseID`
- Callback parameter 2: result or error message text
- Callback parameter 3: empty/`False` resolves the promise; truthy/`True` rejects it

No custom `{ "ok": ... }` result is needed. The Web Viewer information area shows a processing state while awaiting the callback, then displays the resolved result text or rejected error text. Use `.json()` only when the result itself is intentionally JSON, such as the data returned by `fmWidget_getData`.

## FM pushes data

FM calls:

```text
Perform JavaScript in Web Viewer [ Object Name: <web viewer object> ; Function Name: "fmWidgetLoad" ; Parameters: $jsonPayload ]
```

The JavaScript function's return value is ignored by FileMaker.

## Widget sends an event or save

When the information area must show whether FM processed the event or save, use `await FMGofer.PerformScript("fmWidget_handleEvent", parameter)`. FM reads business values below the envelope's `parameter` key, then resolves the callback with a success message and `False`, or rejects it with an error message and `True`.

Use `window.FileMaker.PerformScript` or `PerformScriptWithOption` only for behavior explicitly approved as fire-and-forget with no processing feedback.

Ask what the widget does after the event. Sending data does not by itself define success feedback, reset, reload, navigation, or closing behavior.

## FM requests current widget data

FM calls the adapter `fmWidgetRequestData`. The adapter returns immediately; JavaScript then starts `fmWidget_reportData` through FMGofer with current React state:

```json
{ "data": { "message": "Current input value" } }
```

Inside FM, read it from `parameter.data.message`, process it, then resolve the FMGofer callback with a success message and `False`, or reject it with an error message and `True`. The initiating FM script must not expect a JavaScript return value and should end or hand off control. Generate the `data` object from current React state, not from the last payload loaded from FM.

## FM requests dirty state

FM calls the adapter `fmWidgetRequestState`. The adapter returns immediately; JavaScript then starts `fmWidget_reportState` through FMGofer with:

```json
{ "dirty": true }
```

Inside FM, read it from `parameter.dirty`, perform the close decision or other workflow, then resolve the FMGofer callback with a success message and `False`, or reject it with an error message and `True`. The initiating FM script must not expect a JavaScript return value and should end or hand off control. Avoid an await cycle in which FM waits for JavaScript while JavaScript waits for the same FM script.

## Upload

`fmWidget_upload` receives the built HTML path and widget name from `fm/fmUpload.js`. Keep upload mechanics separate from runtime data/event scripts.

## Documentation boundary

Create complete JavaScript/TypeScript code, but provide only the relevant FM script names, variables, JSON paths, callback, branching, and continuation steps. Do not fabricate unrelated record-navigation or business scripts. Do not attempt to edit the binary `.fmp12` file.
