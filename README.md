# FM Starter AI

[Deutsche Version](#fm-starter-ai-deutsch)

An AI-assisted React and TypeScript template for building one interactive widget for a FileMaker Web Viewer.

## What the template provides

- React 19, TypeScript, and Vite
- A single-file production build for embedding in FileMaker
- `fm-gofer` for awaited JavaScript-to-FileMaker requests
- A small, stable `window.fmWidget` API for FileMaker-to-JavaScript calls
- An explicit browser mock mode—never an automatic production fallback
- FileMaker upload tooling
- The project-local `aga-fm-widget` Agent Skill for guided planning and implementation

The builder keeps React, TypeScript, and Vite as the foundation. It recommends additional libraries only when the widget requirements justify them.

## Requirements

- Node.js 24 or newer
- Git
- FileMaker Pro 19.4 or newer
- A Web Viewer with **Allow JavaScript to perform FileMaker scripts** enabled

## Create a project

Install the portable `aga-fm-start` skill globally from this repository:

```bash
npx skills add agametis/fm-starter-ai --skill aga-fm-start -g
```

Then ask your agent to use it. The skill runs:

```bash
npx @agametis/create-app-for-fm@latest ai my-widget
```

You can also run this command directly. Open the generated folder in your agent-enabled editor, then invoke or ask for the `aga-fm-widget` skill.

## Start the guided widget workflow

The builder first tells you what information you will need and lets you continue or cancel. Prepare:

1. A brief description of the widget
2. A project name
3. Representative, anonymized input JSON
4. Whether the widget sends data back to FileMaker

The skill asks one question at a time, recommends the smallest suitable stack, proposes input/output contracts, and presents a plan with acceptance criteria. It does not modify the project until you approve that plan.

## Development

Install dependencies if the project creator has not already done so:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Enable the fixture from `src/sampleData.ts` by adding `data=test` to the displayed Vite URL, for example:

```text
http://localhost:5173/?data=test
```

Without that exact URL parameter, the widget communicates with FileMaker. It never silently falls back to sample data. In mock mode, Report Data and Report State show the target FM script and parameter below the controls, while the normal information area may still report that FileMaker is unavailable.

`index.html` declares UTF-8. For WebDirect, the build also uses Vite 8's supported Terser minifier with `terserOptions.format.ascii_only`. This escapes umlauts in compiled JavaScript labels such as `Löschen`, avoiding WebDirect data-URL decoding problems. The build finishes with an ASCII-only regression check.

## Stable bridge contract

The application uses these canonical, case-sensitive methods:

- `window.fmWidget.load(payload)` — load a JSON string or object into the widget
- `window.fmWidget.refresh()` — ask the widget to retrieve fresh data; the demo calls this automatically on startup and keeps the button for manual reloads
- `window.fmWidget.save()` — send the current editable input to FileMaker for processing via `fmWidget_handleEvent`
- `window.fmWidget.requestData()` — report the current editable input data to FileMaker
- `window.fmWidget.requestState()` — report `{ "dirty": true|false }` to FileMaker

For FileMaker's **Perform JavaScript in Web Viewer** step, use the documented global-function form through the thin adapters `fmWidgetLoad`, `fmWidgetRefresh`, `fmWidgetRequestData`, and `fmWidgetRequestState`.

The template uses these FileMaker scripts:

- `fmWidget_getData`
- `fmWidget_handleEvent`
- `fmWidget_upload`
- `fmWidget_reportData`
- `fmWidget_reportState`

`fmWidget_getData`, `fmWidget_handleEvent`, `fmWidget_reportData`, and `fmWidget_reportState` use FMGofer callbacks. A callback result message with `False` resolves the promise; an error message with `True` rejects it. The information area shows processing and then the resolved or rejected message. `.json()` is used only for scripts that intentionally return JSON, such as `fmWidget_getData`. Project-specific script steps and contracts are documented by the builder in `docs/FM-INTEGRATION.md`.

The included FileMaker file contains the five scripts above.

## Build and deploy

```bash
npm run type-check
npm run lint
npm test
npm run build
npm run deploy-to-fm
```

Configuration lives in `fm/fmConfig.js`. `$` means a local FileMaker file. The widget builder renames the included `.fmp12` file and updates the project identity only after the user approves the plan.

---

# FM Starter AI (Deutsch)

Eine KI-gestützte React- und TypeScript-Vorlage zur Entwicklung eines interaktiven Widgets für einen FileMaker Web Viewer.

## Funktionen der Vorlage

- React 19, TypeScript und Vite
- Eine einzelne HTML-Datei für die Einbettung in FileMaker
- `fm-gofer` für JavaScript-Anfragen an FileMaker mit Rückgabewert
- Eine kleine, stabile `window.fmWidget`-API für Aufrufe von FileMaker an JavaScript
- Ein expliziter Mock-Modus für die Entwicklung im Browser
- Werkzeuge für den Upload nach FileMaker
- Der projektlokale Agent Skill `aga-fm-widget` für Planung und Umsetzung

React, TypeScript und Vite bleiben immer die Grundlage. Weitere Bibliotheken werden nur empfohlen, wenn die Anforderungen des Widgets sie rechtfertigen.

## Voraussetzungen

- Node.js 24 oder neuer
- Git
- FileMaker Pro 19.4 oder neuer
- Im Web Viewer muss **JavaScript darf FileMaker-Scripts ausführen** aktiviert sein

## Projekt erstellen

Installieren Sie den portablen Skill `aga-fm-start` global aus diesem Repository:

```bash
npx skills add agametis/fm-starter-ai --skill aga-fm-start -g
```

Bitten Sie anschließend Ihren Agenten, den Skill zu verwenden. Er führt folgenden Befehl aus:

```bash
npx @agametis/create-app-for-fm@latest ai mein-widget
```

Der Befehl kann auch direkt ausgeführt werden. Öffnen Sie anschließend den erzeugten Ordner in Ihrem Agent-fähigen Editor und starten Sie den Skill `aga-fm-widget`.

## Geführten Widget-Workflow starten

Der Builder nennt zunächst alle benötigten Angaben und bietet Fortfahren oder Abbrechen an. Bereiten Sie Folgendes vor:

1. Eine kurze Beschreibung des Widgets
2. Einen Projektnamen
3. Repräsentative, anonymisierte Eingabedaten als JSON
4. Die Angabe, ob das Widget Daten an FileMaker zurücksendet

Der Skill stellt immer nur eine Frage, empfiehlt den kleinsten geeigneten Stack, schlägt Ein- und Ausgabeformate vor und zeigt einen Plan mit Abnahmekriterien. Dateien werden erst nach Bestätigung des Plans geändert.

## Entwicklung

Falls noch nicht geschehen, installieren Sie die Abhängigkeiten:

```bash
npm install
```

Starten Sie den Entwicklungsserver:

```bash
npm run dev
```

Aktivieren Sie die Beispieldaten aus `src/sampleData.ts` mit dem URL-Parameter `data=test`, zum Beispiel:

```text
http://localhost:5173/?data=test
```

Ohne diesen exakten URL-Parameter kommuniziert das Widget mit FileMaker. Beispieldaten werden niemals stillschweigend als Ersatz verwendet. Im Mock-Modus zeigen Report Data und Report State das FM-Zielscript und den Parameter unterhalb der Bedienelemente; der normale Infobereich darf weiterhin melden, dass FileMaker nicht verfügbar ist.

`index.html` deklariert UTF-8. Für WebDirect verwendet der Build zusätzlich den von Vite 8 unterstützten Terser-Minifier mit `terserOptions.format.ascii_only`. Dadurch werden Umlaute in kompilierten JavaScript-Beschriftungen wie `Löschen` escaped und Probleme mit der Data-URL-Dekodierung vermieden. Am Ende des Builds läuft eine ASCII-Regressionsprüfung.

## Fester Bridge-Vertrag

Die Anwendung verwendet diese groß-/kleinschreibungssensitiven Methoden:

- `window.fmWidget.load(payload)` — JSON-Text oder ein Objekt in das Widget laden
- `window.fmWidget.refresh()` — aktuelle Daten anfordern; die Demo ruft dies beim Start automatisch auf und behält den Button für manuelles Neuladen
- `window.fmWidget.save()` — die aktuelle Eingabe an FileMaker zur Verarbeitung über `fmWidget_handleEvent` senden
- `window.fmWidget.requestData()` — die aktuell bearbeiteten Eingabedaten an FileMaker melden
- `window.fmWidget.requestState()` — `{ "dirty": true|false }` an FileMaker melden

Für den FileMaker-Schritt **JavaScript in Web Viewer ausführen** dienen die dünnen globalen Adapter `fmWidgetLoad`, `fmWidgetRefresh`, `fmWidgetRequestData` und `fmWidgetRequestState`.

Die Vorlage verwendet diese FileMaker-Scripts:

- `fmWidget_getData`
- `fmWidget_handleEvent`
- `fmWidget_upload`
- `fmWidget_reportData`
- `fmWidget_reportState`

`fmWidget_getData`, `fmWidget_handleEvent`, `fmWidget_reportData` und `fmWidget_reportState` verwenden FMGofer-Callbacks. Eine Ergebnismeldung mit `False` löst das Promise erfolgreich auf; eine Fehlermeldung mit `True` weist es zurück. Der Infobereich zeigt die Verarbeitung und anschließend die Erfolgs- oder Fehlermeldung. `.json()` wird nur für Scripts verwendet, die tatsächlich JSON liefern, beispielsweise `fmWidget_getData`. Projektspezifische Script-Schritte und Verträge dokumentiert der Builder in `docs/FM-INTEGRATION.md`.

Die mitgelieferte FileMaker-Datei enthält die fünf oben genannten Scripts.

## Build und Deployment

```bash
npm run type-check
npm run lint
npm test
npm run build
npm run deploy-to-fm
```

Die Konfiguration befindet sich in `fm/fmConfig.js`. `$` steht für eine lokale FileMaker-Datei. Der Widget-Builder benennt die mitgelieferte `.fmp12`-Datei um und aktualisiert die Projektidentität erst nach Bestätigung des Plans.
