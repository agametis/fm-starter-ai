import { afterEach, describe, expect, it, vi } from "vitest";

const { performScriptMock } = vi.hoisted(() => ({
	performScriptMock: vi.fn(),
}));

vi.mock("fm-gofer", () => ({
	default: { PerformScript: performScriptMock },
}));

import {
	createDirtyStatePayload,
	installFMWidgetApi,
	isMockMode,
	parseWidgetPayload,
} from "./bridge";

afterEach(() => {
	performScriptMock.mockReset();
	vi.unstubAllGlobals();
});

describe("parseWidgetPayload", () => {
	it("accepts the documented meta and data contract", () => {
		expect(
			parseWidgetPayload(
				JSON.stringify({
					meta: { title: "Revenue" },
					data: { message: "Ready" },
				}),
			),
		).toEqual({
			meta: { title: "Revenue" },
			data: { message: "Ready" },
		});
	});

	it("preserves German umlauts in interface data", () => {
		const message = "Größe, Straße, Öl, Äpfel und Grüße";

		expect(parseWidgetPayload({ data: { message } }).data.message).toBe(
			message,
		);
	});

	it("rejects payloads that cannot drive the widget", () => {
		expect(() => parseWidgetPayload('{"data":{}}')).toThrow('"data.message"');
	});
});

describe("isMockMode", () => {
	it("enables mock data only for the data=test URL parameter", () => {
		expect(isMockMode("?data=test")).toBe(true);
		expect(isMockMode("?data=production")).toBe(false);
		expect(isMockMode("?view=test")).toBe(false);
	});
});

describe("FM processing feedback", () => {
	it("awaits FM processing when FileMaker requests current input data", async () => {
		const callbacks = installApi({ message: "Unsaved input" });
		mockFMResult("Data processed");

		const adapterResult = window.fmWidgetRequestData?.();

		expect(adapterResult).toBeUndefined();
		expect(performScriptMock).toHaveBeenCalledWith("fmWidget_reportData", {
			data: { message: "Unsaved input" },
		});
		expect(callbacks.onRequestStart).toHaveBeenCalledWith("data", {
			script: "fmWidget_reportData",
			parameter: { data: { message: "Unsaved input" } },
		});
		await vi.waitFor(() => {
			expect(callbacks.onRequestSuccess).toHaveBeenCalledWith(
				"data",
				"Data processed",
			);
		});
	});

	it("awaits FM processing when FileMaker requests dirty state", async () => {
		const callbacks = installApi({ message: "Draft" }, true);
		mockFMResult("State processed");

		await window.fmWidget?.requestState();

		expect(performScriptMock).toHaveBeenCalledWith("fmWidget_reportState", {
			dirty: true,
		});
		expect(callbacks.onRequestStart).toHaveBeenCalledWith("state", {
			script: "fmWidget_reportState",
			parameter: { dirty: true },
		});
		expect(callbacks.onRequestSuccess).toHaveBeenCalledWith(
			"state",
			"State processed",
		);
	});

	it("awaits FM processing when the user saves the current input", async () => {
		const callbacks = installApi({ message: "Unsaved input" });
		mockFMResult("Saved");

		await window.fmWidget?.save();

		expect(performScriptMock).toHaveBeenCalledWith("fmWidget_handleEvent", {
			data: { message: "Unsaved input" },
		});
		expect(callbacks.onRequestStart).toHaveBeenCalledWith("event", {
			script: "fmWidget_handleEvent",
			parameter: { data: { message: "Unsaved input" } },
		});
		expect(callbacks.onRequestSuccess).toHaveBeenCalledWith(
			"event",
			"Saved",
		);
	});

	it("reports an FM processing failure to the interface", async () => {
		const callbacks = installApi({ message: "Draft" });
		mockFMError("Validation failed");

		await window.fmWidget?.requestData();

		expect(callbacks.onError).toHaveBeenCalledWith(
			expect.objectContaining({ message: "Validation failed" }),
		);
		expect(callbacks.onRequestSuccess).not.toHaveBeenCalled();
	});
});

describe("createDirtyStatePayload", () => {
	it("reports only the dirty flag required by FM", () => {
		expect(createDirtyStatePayload(true)).toBe('{"dirty":true}');
	});
});

function installApi(data: { message: string }, dirty = false) {
	vi.stubGlobal("window", {
		FileMaker: { PerformScriptWithOption: vi.fn() },
	});

	const callbacks = {
		onError: vi.fn(),
		onLoad: vi.fn(),
		onRefreshStart: vi.fn(),
		onRequestStart: vi.fn(),
		onRequestSuccess: vi.fn(),
	};

	installFMWidgetApi({
		getData: () => data,
		getDirty: () => dirty,
		...callbacks,
	} as Parameters<typeof installFMWidgetApi>[0]);

	return callbacks;
}

function mockFMResult(message: string) {
	performScriptMock.mockReturnValue(Promise.resolve(message));
}

function mockFMError(message: string) {
	performScriptMock.mockReturnValue(Promise.reject(message));
}
