import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

/**
 * Development-only modules that must never contribute code to a production
 * build. Paths are matched against the end of each bundled module id.
 */
const DEV_ONLY_MODULES = ["src/sampleData.ts"];

/**
 * Fails a production build if a development-only module ends up in the emitted
 * bundle. This inspects the Rollup module graph rather than searching the output
 * for known strings, so it holds for any fixture shape — including data made
 * only of numbers, booleans, or identifiers that no text search would catch.
 *
 * A module that is present but fully tree-shaken (no rendered code) is allowed:
 * that is the expected result of the dynamic import behind `import.meta.env.DEV`.
 */
function forbidDevOnlyModules(patterns: string[]): Plugin {
	return {
		name: "forbid-dev-only-modules",
		apply: "build",
		generateBundle(_options, bundle) {
			const leaked = new Set<string>();

			for (const chunk of Object.values(bundle)) {
				if (chunk.type !== "chunk") continue;

				for (const [id, module] of Object.entries(chunk.modules ?? {})) {
					const normalizedId = id.replaceAll("\\", "/");
					const match = patterns.find((pattern) =>
						normalizedId.endsWith(pattern),
					);
					if (match && module.renderedLength > 0) {
						leaked.add(`${match} (${module.renderedLength} bytes)`);
					}
				}
			}

			if (leaked.size > 0) {
				this.error(
					`Development-only modules reached the production bundle:\n` +
						[...leaked].map((entry) => `  ${entry}`).join("\n") +
						"\nImport them only through a dynamic import behind import.meta.env.DEV.",
				);
			}
		},
	};
}

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
	plugins: [react(), viteSingleFile(), forbidDevOnlyModules(DEV_ONLY_MODULES)],
});
