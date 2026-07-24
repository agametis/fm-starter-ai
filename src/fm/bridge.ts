import FMGofer from "fm-gofer";

import type { WidgetPayload } from "./types";

const FM_SCRIPTS = {
	getData: "fmWidget_getData",
	handleEvent: "fmWidget_handleEvent",
	reportData: "fmWidget_reportData",
	reportState: "fmWidget_reportState",
} as const;

type FMRequestKind = "data" | "state" | "event";

interface FMRequestPreview {
	script: string;
	parameter: unknown;
}

interface FMWidgetApi {
	load: (payload: string | WidgetPayload) => void;
	refresh: () => Promise<void>;
	requestData: () => Promise<void>;
	requestState: () => Promise<void>;
	save: () => Promise<void>;
}

interface InstallApiOptions {
	getData: () => WidgetPayload["data"];
	getDirty: () => boolean;
	onLoad: (payload: WidgetPayload) => void;
	onError: (error: Error) => void;
	onRefreshStart: () => void;
	onRequestStart: (request: FMRequestKind, preview: FMRequestPreview) => void;
	onRequestSuccess: (request: FMRequestKind, message: string) => void;
}

declare global {
	interface Window {
		fmWidget?: FMWidgetApi;
		fmWidgetLoad?: FMWidgetApi["load"];
		fmWidgetRefresh?: () => void;
		fmWidgetRequestData?: () => void;
		fmWidgetRequestState?: () => void;
	}
}

export function isMockMode(search = window.location.search): boolean {
	return (
		import.meta.env.DEV && new URLSearchParams(search).get("data") === "test"
	);
}

export function parseWidgetPayload(
	input: string | WidgetPayload,
): WidgetPayload {
	let parsed: unknown = input;
	if (typeof input === "string") {
		try {
			parsed = JSON.parse(input);
		} catch {
			throw new Error("The widget payload must contain valid JSON.");
		}
	}

	if (!parsed || typeof parsed !== "object") {
		throw new Error("The widget payload must be a JSON object.");
	}

	const candidate = parsed as Partial<WidgetPayload>;
	if (
		!candidate.data ||
		typeof candidate.data !== "object" ||
		typeof candidate.data.message !== "string"
	) {
		throw new Error(
			'The widget payload must contain a string at "data.message".',
		);
	}

	return {
		meta: candidate.meta,
		data: { message: candidate.data.message },
	};
}

export function createDirtyStatePayload(dirty: boolean): string {
	return JSON.stringify({ dirty });
}

async function fetchWidgetPayload(): Promise<WidgetPayload> {
	if (import.meta.env.DEV && isMockMode()) {
		const { samplePayload } = await import("../sampleData");
		return samplePayload;
	}

	return FMGofer.PerformScript(FM_SCRIPTS.getData).json<WidgetPayload>();
}

function processInFM(script: string, parameter: unknown): Promise<string> {
	if (!window.FileMaker) {
		return Promise.reject(new Error("FileMaker is unavailable."));
	}

	return FMGofer.PerformScript(script, parameter);
}

export function installFMWidgetApi(options: InstallApiOptions): () => void {
	const api: FMWidgetApi = {
		load(payload) {
			try {
				options.onLoad(parseWidgetPayload(payload));
			} catch (error) {
				options.onError(normalizeError(error));
			}
		},
		async refresh() {
			options.onRefreshStart();
			try {
				options.onLoad(parseWidgetPayload(await fetchWidgetPayload()));
			} catch (error) {
				options.onError(normalizeError(error));
			}
		},
		async requestData() {
			const parameter = { data: options.getData() };
			options.onRequestStart("data", {
				script: FM_SCRIPTS.reportData,
				parameter,
			});
			try {
				const result = await processInFM(FM_SCRIPTS.reportData, parameter);
				options.onRequestSuccess("data", result);
			} catch (error) {
				options.onError(normalizeError(error));
			}
		},
		async requestState() {
			const parameter = { dirty: options.getDirty() };
			options.onRequestStart("state", {
				script: FM_SCRIPTS.reportState,
				parameter,
			});
			try {
				const result = await processInFM(FM_SCRIPTS.reportState, parameter);
				options.onRequestSuccess("state", result);
			} catch (error) {
				options.onError(normalizeError(error));
			}
		},
		async save() {
			const parameter = { data: options.getData() };
			options.onRequestStart("event", {
				script: FM_SCRIPTS.handleEvent,
				parameter,
			});
			try {
				const result = await processInFM(FM_SCRIPTS.handleEvent, parameter);
				options.onRequestSuccess("event", result);
			} catch (error) {
				options.onError(normalizeError(error));
			}
		},
	};

	window.fmWidget = api;
	window.fmWidgetLoad = api.load;
	window.fmWidgetRefresh = () => {
		void api.refresh();
	};
	window.fmWidgetRequestData = () => {
		void api.requestData();
	};
	window.fmWidgetRequestState = () => {
		void api.requestState();
	};

	return () => {
		if (window.fmWidget === api) {
			window.fmWidget = undefined;
			window.fmWidgetLoad = undefined;
			window.fmWidgetRefresh = undefined;
			window.fmWidgetRequestData = undefined;
			window.fmWidgetRequestState = undefined;
		}
	};
}

function normalizeError(error: unknown): Error {
	return error instanceof Error ? error : new Error(String(error));
}
