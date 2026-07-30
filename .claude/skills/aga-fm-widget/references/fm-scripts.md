# FileMaker script step recipes

Step-level detail for the five bridge scripts. [fm-integration.md](fm-integration.md) defines the
contract; this file shows what goes inside the scripts.

Only document the scripts and steps this widget actually needs. Do not fabricate record-navigation
or business logic, and do not attempt to edit the binary `.fmp12` file — describe the changes so
the user makes them in FileMaker Pro.

## The shared FMGofer envelope

Every script called through FMGofer receives:

```text
Set Variable [ $scriptParameter ; Value: Get ( ScriptParameter ) ]
Set Variable [ $parameter ; Value: JSONGetElement ( $scriptParameter ; "parameter" ) ]
Set Variable [ $callbackName ; Value: JSONGetElement ( $scriptParameter ; "callbackName" ) ]
Set Variable [ $promiseID ; Value: JSONGetElement ( $scriptParameter ; "promiseID" ) ]
```

The business payload is under `parameter`. `callbackName` and `promiseID` are how FileMaker settles
the JavaScript promise.

## Resolving and rejecting

The callback's third parameter decides the outcome:

```text
# Resolve:
Perform JavaScript in Web Viewer [
  Object Name: <Web Viewer object name> ;
  Function Name: $callbackName ;
  Parameters: $promiseID, "Daten verarbeitet.", False
]

# Reject:
Perform JavaScript in Web Viewer [
  Object Name: <Web Viewer object name> ;
  Function Name: $callbackName ;
  Parameters: $promiseID, "Validierung fehlgeschlagen.", True
]
```

The second parameter is the message text, and the Web Viewer displays it as the success or error
message. No custom `{ "ok": ... }` wrapper is needed.

The exception is a script that intentionally returns structured data, such as `fmWidget_getData`:
its second parameter is a JSON string and JavaScript parses it with FMGofer's `.json()`. The third
parameter still controls resolve versus reject.

## `fmWidget_upload`

Receives the built file path and widget name from `fm/fmUpload.js`:

```json
{ "thePath": "/absolute/path/to/dist/index.html", "widgetName": "fmStarterAi" }
```

Keep upload mechanics separate from the runtime data and event scripts.

## `fmWidget_getData`

Read the envelope, build the widget payload as JSON text, pass it as the callback's second
parameter with `False` third.

```text
# Build $payload for the approved input contract.
Perform JavaScript in Web Viewer [
  Object Name: <Web Viewer object name> ;
  Function Name: $callbackName ;
  Parameters: $promiseID, $payload, False
]
```

## `fmWidget_handleEvent`

```text
Set Variable [ $event ; Value: JSONGetElement ( $parameter ; "event" ) ]
Set Variable [ $data ; Value: JSONGetElement ( $parameter ; "data" ) ]
# Process only the events this widget sends.
# Resolve with a success message and False, or reject with an error message and True.
```

Use FileMaker's direct `PerformScript` API only for an event explicitly approved as
fire-and-forget with no processing feedback.

## `fmWidget_reportData`

FileMaker asks for the current unsaved values by calling the JavaScript adapter
`fmWidgetRequestData`. JavaScript then starts this script through FMGofer.

```text
Set Variable [ $data ; Value: JSONGetElement ( $parameter ; "data" ) ]
# Process the values in FileMaker.
# Resolve with a success message and False, or reject with an error message and True.
```

The envelope looks like:

```json
{
  "parameter": { "data": { "message": "Current input value" } },
  "callbackName": "...",
  "promiseID": "..."
}
```

The FileMaker script that called `fmWidgetRequestData` must then exit. It must not expect a
JavaScript return value.

## `fmWidget_reportState`

FileMaker calls `fmWidgetRequestState`; JavaScript starts this script with `{ "dirty": true }`.

```text
Set Variable [ $dirty ; Value: JSONGetElement ( $parameter ; "dirty" ) ]
If [ $dirty ]
  # Keep the window open, or ask whether unsaved changes may be discarded.
Else
  # Continue the close or navigation action.
End If
# Resolve with a success message and False, or reject with an error message and True.
```

The nested parameter is:

```json
{ "parameter": { "dirty": true } }
```

Never build an await cycle where FileMaker waits for JavaScript while JavaScript waits for the same
FileMaker script.

## Web Viewer setup

Enable **Allow JavaScript to perform FileMaker scripts**.

Use these global function names in **Perform JavaScript in Web Viewer**:

- `fmWidgetLoad` with a JSON payload
- `fmWidgetRefresh` with no parameter
- `fmWidgetRequestData` with no parameter
- `fmWidgetRequestState` with no parameter

They delegate to `window.fmWidget`. The request adapters return immediately so the initiating
FileMaker script can finish. Never use a dotted function name in the script step.

FileMaker cannot call JavaScript before the page and the function exist, so the relevant FileMaker
scripts must handle Web Viewer readiness.
