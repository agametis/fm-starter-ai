# FM Starter AI

[Deutsche Version](#fm-starter-ai-deutsch)

An AI-assisted React and TypeScript template for building one interactive widget for a FileMaker Web Viewer.

## Quick start

Install the general `aga-fm-start` skill globally:

```bash
npx skills@latest add agametis/fm-starter-ai --skill aga-fm-start -g
```

Then open your AI coding environment, choose any agent, and send this prompt:

```text
Use the aga-fm-start skill to create a FileMaker Web Viewer widget.
```

## What the template provides

- React 19, TypeScript, and Vite
- A single-file production build for embedding in FileMaker
- `fm-gofer` for awaited JavaScript-to-FileMaker requests
- A small, stable `window.fmWidget` API for FileMaker-to-JavaScript calls
- An explicit browser mock mode—never an automatic production fallback
- FileMaker upload tooling
- The project-local `aga-fm-widget` Agent Skill for guided planning and implementation

The builder keeps React, TypeScript, and Vite as the foundation. It recommends additional libraries only when the widget requirements justify them.

## How agents find the builder

`.claude/skills/` is the canonical source for this project's skills. Three layers make it reachable from any agent, so you never have to install anything into the project:

- Hosts that read `.claude/skills/` register `aga-fm-widget` directly and offer `/aga-fm-widget`. `.agents/skills/` contains a committed copy for Codex, Cline, Warp, Zed, Amp, and Replit. Keep both trees identical: make skill changes in `.claude/skills/`, then copy them into `.agents/skills/`.
- `AGENTS.md` and `CLAUDE.md` in the project root tell any agent to read the canonical file before building or changing the widget.
- If neither applies, say: *read `.claude/skills/aga-fm-widget/SKILL.md` and follow it*. The path always works.

The top-level `skills/aga-fm-start/` is separate. It is the standalone skill installed globally with the `skills` package, as shown in the [Quick start](#quick-start), and it stays outside `.claude/skills/` because it scaffolds new projects rather than building widgets inside one.

`AGENTS.md` also repeats the fixed FileMaker script names and the bridge API, so an agent that never opens the skill still has the contract.

## Requirements

- Node.js 24 or newer
- Git
- FileMaker Pro 19.4 or newer
- A Web Viewer with **Allow JavaScript to perform FileMaker scripts** enabled

## Create a project

The global installation command is listed in the [Quick start](#quick-start). Then ask your agent to use the skill. The skill runs:

```bash
npx @agametis/create-app-for-fm@latest ai my-widget
```

You can also run this command directly. Open the generated folder in your agent-enabled editor, then start the builder as described in [How agents find the builder](#how-agents-find-the-builder).

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

Without that exact URL parameter, the widget communicates with FileMaker. It never silently falls back to sample data. Mock mode is development-only: production builds disable it and exclude `src/sampleData.ts` from the generated `dist/index.html`. In mock mode, Report Data and Report State show the target FM script and parameter below the controls, while the normal information area may still report that FileMaker is unavailable.

`index.html` declares UTF-8. For WebDirect, the build also uses Vite 8's supported Terser minifier with `terserOptions.format.ascii_only`. This escapes umlauts in compiled JavaScript labels such as `Löschen`, avoiding WebDirect data-URL decoding problems.

Two mechanisms keep a production build honest.

The `forbid-dev-only-modules` plugin in `vite.config.ts` fails the build if `src/sampleData.ts` contributes any code to the bundle. It inspects the Rollup module graph, so it holds for **any** fixture shape — including data made only of numbers or booleans, which no text search would catch. A module that is present but fully tree-shaken is allowed, since that is the expected result of the dynamic import behind `import.meta.env.DEV`.

`scripts/verify-build-encoding.js` then checks the output: it must be pure ASCII, the sample-data marker must be absent, and any non-ASCII text in your own source must appear escaped rather than having been dropped. The last check reads your source instead of asserting a fixed label, so it keeps working after you replace the demo UI. The marker check is only a text-level second line of defence — the plugin is the authoritative one.

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

## Schnellstart

Installiere den allgemeinen Skill `aga-fm-start` global:

```bash
npx skills@latest add agametis/fm-starter-ai --skill aga-fm-start -g
```

oder

```bash
npx skills@latest add agametis/fm-starter-ai \
  --skill aga-fm-start \
  --agent pi \
  --agent codex \
  --agent claude-code \
  --yes
```

für spezifische Agenten.

Öffne anschließend eine KI Programmierumgebung deiner Wahl, wähle einen beliebigen Agenten und sende diesen Prompt:

```text
Verwende den Skill `aga-fm-start`, um ein FileMaker-Web-Viewer-Widget zu erstellen.
```

## Funktionen der Vorlage

- React 19, TypeScript und Vite
- Eine einzelne HTML-Datei für die Einbettung in FileMaker
- `fm-gofer` für JavaScript-Anfragen an FileMaker mit Rückgabewert
- Eine kleine, stabile `window.fmWidget`-API für Aufrufe von FileMaker an JavaScript
- Ein expliziter Mock-Modus für die Entwicklung im Browser
- Werkzeuge für den Upload nach FileMaker
- Der projektlokale Agent Skill `aga-fm-widget` für Planung und Umsetzung

React, TypeScript und Vite bleiben immer die Grundlage. Weitere Bibliotheken werden nur empfohlen, wenn die Anforderungen des Widgets sie rechtfertigen.

## Wie Agenten den Builder finden

`.claude/skills/` ist die maßgebliche Quelle für die Skills dieses Projekts. Drei Ebenen machen sie für jeden Agenten erreichbar, ohne dass im Projekt etwas installiert werden muss:

- Hosts, die `.claude/skills/` lesen, registrieren `aga-fm-widget` direkt und bieten `/aga-fm-widget` an. `.agents/skills/` enthält eine versionierte Kopie für Codex, Cline, Warp, Zed, Amp und Replit. Halte beide Verzeichnisbäume identisch: Ändere Skills zuerst in `.claude/skills/` und kopiere die Änderungen anschließend nach `.agents/skills/`.
- `AGENTS.md` und `CLAUDE.md` im Projektstamm weisen jeden Agenten an, die maßgebliche Datei zu lesen, bevor er das Widget erstellt oder ändert.
- Falls beides nicht greift, genügt der Satz: *Lies `.claude/skills/aga-fm-widget/SKILL.md` und folge der Datei.* Der Pfad funktioniert immer.

Der Skill `skills/aga-fm-start/` auf oberster Ebene ist davon getrennt. Er wird wie im [Schnellstart](#schnellstart) beschrieben global mit dem Paket `skills` installiert und liegt bewusst außerhalb von `.claude/skills/`, weil er neue Projekte erzeugt und nicht Widgets innerhalb eines Projekts baut.

`AGENTS.md` wiederholt außerdem die festen FileMaker-Scriptnamen und die Bridge-API. So kennt auch ein Agent den Vertrag, der den Skill nie öffnet.

## Voraussetzungen

- Node.js 24 oder neuer
- Git
- FileMaker Pro 19.4 oder neuer
- Im Web Viewer muss **JavaScript darf FileMaker-Scripts ausführen** aktiviert sein

## Projekt erstellen

Der globale Installationsbefehl steht im [Schnellstart](#schnellstart). Der Skill führt folgenden Befehl aus:

```bash
npx @agametis/create-app-for-fm@latest ai mein-widget
```

Du kannst den Befehl auch direkt ausführen. Öffne anschließend den erzeugten Ordner in deinem Agent-fähigen Editor und starte den Builder wie unter [Wie Agenten den Builder finden](#wie-agenten-den-builder-finden) beschrieben.

## Geführten Widget-Workflow starten

Der Builder nennt zunächst alle benötigten Angaben und bietet Fortfahren oder Abbrechen an. Halte Folgendes bereit:

1. Eine kurze Beschreibung des Widgets
2. Einen Projektnamen
3. Repräsentative, anonymisierte Eingabedaten als JSON
4. Die Angabe, ob das Widget Daten an FileMaker zurücksendet

Der Skill stellt immer nur eine Frage, empfiehlt den kleinsten geeigneten Stack, schlägt Ein- und Ausgabeformate vor und zeigt einen Plan mit Abnahmekriterien. Dateien werden erst nach Bestätigung des Plans geändert.

## Entwicklung

Falls noch nicht geschehen, installiere die Abhängigkeiten:

```bash
npm install
```

Starte den Entwicklungsserver:

```bash
npm run dev
```

Aktiviere die Beispieldaten aus `src/sampleData.ts` mit dem URL-Parameter `data=test`, zum Beispiel:

```text
http://localhost:5173/?data=test
```

Ohne diesen exakten URL-Parameter kommuniziert das Widget mit FileMaker. Beispieldaten werden niemals stillschweigend als Ersatz verwendet. Der Mock-Modus ist ausschließlich für die Entwicklung verfügbar: Produktions-Builds deaktivieren ihn und schließen `src/sampleData.ts` aus der erzeugten Datei `dist/index.html` aus. Im Mock-Modus zeigen Report Data und Report State das FM-Zielscript und den Parameter unterhalb der Bedienelemente; der normale Infobereich darf weiterhin melden, dass FileMaker nicht verfügbar ist.

`index.html` deklariert UTF-8. Für WebDirect verwendet der Build zusätzlich den von Vite 8 unterstützten Terser-Minifier mit `terserOptions.format.ascii_only`. Dadurch werden Umlaute in kompilierten JavaScript-Beschriftungen wie `Löschen` escaped und Probleme mit der Data-URL-Dekodierung vermieden.

Zwei Mechanismen sichern den Produktions-Build ab.

Das Plugin `forbid-dev-only-modules` in `vite.config.ts` lässt den Build fehlschlagen, wenn `src/sampleData.ts` Code zum Bundle beiträgt. Es prüft den Rollup-Modulgraphen und funktioniert daher für **jede** Struktur der Beispieldaten — auch für Daten, die nur aus Zahlen oder Booleschen Werten bestehen und die keine Textsuche finden würde. Ein Modul, das enthalten, aber vollständig entfernt wurde, ist erlaubt: Genau das ist das erwartete Ergebnis des dynamischen Imports hinter `import.meta.env.DEV`.

Anschließend prüft `scripts/verify-build-encoding.js` die Ausgabe: Sie muss reines ASCII sein, der Marker der Beispieldaten darf nicht enthalten sein, und nicht-ASCII-Text aus dem eigenen Quellcode muss escaped erscheinen, statt verloren zu gehen. Die letzte Prüfung liest den Quellcode, statt eine feste Beschriftung zu erwarten, und funktioniert deshalb weiter, nachdem die Demo-Oberfläche ersetzt wurde. Die Marker-Prüfung ist nur eine zusätzliche Absicherung auf Textebene — maßgeblich ist das Plugin.

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
