import { useEffect, useRef, useState } from "react";

import { installFMWidgetApi, isMockMode } from "./fm/bridge";
import type { WidgetPayload } from "./fm/types";

function App() {
	const mockMode = isMockMode();
	const [payload, setPayload] = useState<WidgetPayload | null>(null);
	const [draft, setDraft] = useState("");
	const [baseline, setBaseline] = useState("");
	const [status, setStatus] = useState<
		"waiting" | "loading" | "ready" | "processing" | "success" | "error"
	>("waiting");
	const [feedback, setFeedback] = useState("");
	const [error, setError] = useState("");
	const [mockRequest, setMockRequest] = useState<{
		script: string;
		parameter: unknown;
	} | null>(null);
	const dirty = draft !== baseline;
	const dirtyRef = useRef(dirty);
	const draftRef = useRef(draft);
	const initialLoadStartedRef = useRef(false);

	dirtyRef.current = dirty;
	draftRef.current = draft;

	useEffect(() => {
		const applyPayload = (nextPayload: WidgetPayload) => {
			setPayload(nextPayload);
			setDraft(nextPayload.data.message);
			setBaseline(nextPayload.data.message);
			setError("");
			setFeedback("");
			setStatus("ready");
		};

		const uninstall = installFMWidgetApi({
			getData: () => ({ message: draftRef.current }),
			getDirty: () => dirtyRef.current,
			onLoad: applyPayload,
			onError: (nextError) => {
				setError(nextError.message);
				setFeedback("");
				setStatus("error");
			},
			onRefreshStart: () => {
				setError("");
				setFeedback("");
				setStatus("loading");
			},
			onRequestStart: (request, preview) => {
				if (mockMode) {
					setMockRequest(preview);
				}
				setError("");
				setFeedback(
					request === "data"
						? "FileMaker is processing the current input data..."
						: request === "state"
								? "FileMaker is processing the current widget state..."
								: "FileMaker is processing the save...",
				);
				setStatus("processing");
			},
			onRequestSuccess: (_request, message) => {
				setError("");
				setFeedback(message);
				setStatus("success");
			},
		});

		if (!initialLoadStartedRef.current) {
			initialLoadStartedRef.current = true;
			void window.fmWidget?.refresh();
		}

		return uninstall;
	}, [mockMode]);

	const title = payload?.meta?.title ?? "FM Widget Starter";

	return (
		<main className="app-shell">
			<header>
				<p className="eyebrow">React + TypeScript + FileMaker</p>
				<h1>{title}</h1>
				<p className="status" data-status={status}>
					{status === "waiting" && "Waiting for FM to load data."}
					{status === "loading" && "Loading data from FM..."}
					{status === "ready" &&
						(mockMode ? "Explicit mock mode" : "Connected to FM")}
					{status === "processing" && feedback}
					{status === "success" && feedback}
					{status === "error" && "FileMaker could not process the request."}
				</p>
			</header>

			{error && <p className="error-message">{error}</p>}

			<section className="card" aria-labelledby="message-label">
				<label id="message-label" htmlFor="message">
					Editable message
				</label>
				<textarea
					id="message"
					value={draft}
					placeholder="Load data from FM or start the explicit mock mode."
					onChange={(event) => {
						setDraft(event.target.value);
						if (status === "success") {
							setFeedback("");
							setStatus("ready");
						}
					}}
				/>
					<div className="actions">
					<button type="button" onClick={() => void window.fmWidget?.refresh()}>
						Refresh
					</button>
					<button type="button" onClick={() => void window.fmWidget?.save()}>
						Save
					</button>
					<button
						type="button"
						onClick={() => {
							setDraft("");
							setError("");
							setFeedback("");
							setStatus("ready");
						}}
					>
						Löschen
					</button>
					<button type="button" onClick={() => window.fmWidget?.requestData()}>
						Report data
					</button>
					<button type="button" onClick={() => window.fmWidget?.requestState()}>
						Report state
					</button>
				</div>
				<output className="dirty-state" aria-live="polite">
					Unsaved changes: <strong>{dirty ? "yes" : "no"}</strong>
				</output>
			</section>

			{mockMode && (
				<section className="mock-request" aria-live="polite">
					<p className="eyebrow">Mock mode</p>
					<h2>FileMaker request preview</h2>
					{mockRequest ? (
						<>
							<p>
								Target script: <code>{mockRequest.script}</code>
							</p>
							<pre>{JSON.stringify(mockRequest.parameter, null, 2)}</pre>
						</>
					) : (
						<p>Use Save, Report Data, or Report State to preview its FM payload.</p>
					)}
				</section>
			)}
		</main>
	);
}

export default App;
