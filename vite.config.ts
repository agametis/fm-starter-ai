import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vite.dev/config/
export default defineConfig({
	build: {
		// WebDirect can misinterpret UTF-8 literals in embedded data URLs.
		// Terser emits ASCII escapes so labels such as "Löschen" remain correct.
		minify: "terser",
		terserOptions: {
			format: {
				ascii_only: true,
			},
		},
	},
	plugins: [react(), viteSingleFile()],
});
