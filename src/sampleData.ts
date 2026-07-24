import type { WidgetPayload } from "./fm/types";

export const samplePayload: WidgetPayload & {
	__sampleDataModule: true;
} = {
	__sampleDataModule: true,
	meta: {
		title: "FM Widget Starter (Test Mode)",
	},
	data: {
		message: "Mock-Daten mit Umlauten: Größe, Straße, Öl, Äpfel und Grüße.",
	},
};
