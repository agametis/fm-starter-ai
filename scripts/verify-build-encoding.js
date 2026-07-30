import fs from "node:fs";
import path from "node:path";

const distUrl = new URL("../dist/index.html", import.meta.url);
const srcDir = path.join(import.meta.dirname, "..", "src");
const html = fs.readFileSync(distUrl, "utf8");

// 1. The actual WebDirect protection.
// WebDirect can misinterpret raw UTF-8 in the embedded data URL, so the built
// file must be pure ASCII. If terserOptions.format.ascii_only were lost, a
// label such as "Löschen" would appear here literally and fail this check.
const rawNonAscii = distinctNonAscii(html);

if (rawNonAscii.length > 0) {
	throw new Error(
		`The WebDirect build contains non-ASCII characters: ${rawNonAscii.join(" ")}\n` +
			"Confirm that vite.config.ts still sets terserOptions.format.ascii_only.",
	);
}

// 2. Mock mode must never reach production.
// The authoritative check is the forbid-dev-only-modules plugin in
// vite.config.ts, which inspects the Rollup module graph and therefore holds for
// any fixture shape. This marker check is a cheap second line of defence for
// fixture content that arrives by some other route, such as being pasted into a
// component. It only sees text, so never rely on it alone.
if (html.includes("__sampleDataModule")) {
	throw new Error(
		"The production build contains the development sample data module.\n" +
			"Import sample data only through a dynamic import behind import.meta.env.DEV.",
	);
}

// 3. Escape coverage for this project's own labels.
// Checks that non-ASCII text present in the source actually survived the build
// in escaped form. A character that is neither raw (impossible after check 1)
// nor escaped was dropped from the bundle entirely. This adapts to whatever UI
// the widget ends up with instead of asserting a fixed demo label.
const sourceCharacters = collectSourceNonAscii();
const missing = sourceCharacters.filter(
	(character) => !escapeAppearsIn(html, character),
);

if (missing.length > 0) {
	throw new Error(
		`These non-ASCII source characters are missing from the build: ${missing.join(" ")}\n` +
			"They are neither literal nor escaped, so that text was dropped from the bundle.",
	);
}

console.log(
	"Production build checks passed: output is ASCII-only and excludes sample data.",
);
console.log(
	sourceCharacters.length === 0
		? "Escape coverage not applicable: no non-ASCII text in the shipped source."
		: `Escaped as expected: ${sourceCharacters.join(" ")}`,
);

function distinctNonAscii(text) {
	return [
		...new Set(
			[...text].filter((character) => {
				const codePoint = character.codePointAt(0);
				return codePoint !== undefined && codePoint > 0x7f;
			}),
		),
	];
}

/**
 * Non-ASCII characters in shipped TypeScript source, excluding the
 * development-only fixture and tests. Comments are stripped first because
 * localized comments are expected and Terser removes them from the output.
 */
function collectSourceNonAscii() {
	const characters = new Set();

	for (const relativePath of shippedSourceFiles()) {
		if (relativePath === "sampleData.ts") continue;

		const source = fs.readFileSync(path.join(srcDir, relativePath), "utf8");
		for (const character of distinctNonAscii(stripComments(source))) {
			characters.add(character);
		}
	}

	return [...characters];
}

/** Relative paths of TypeScript files that end up in a production build. */
function shippedSourceFiles() {
	return fs
		.readdirSync(srcDir, { recursive: true })
		.map((entry) => String(entry).replaceAll(path.sep, "/"))
		.filter(
			(relativePath) =>
				/\.tsx?$/.test(relativePath) && !/\.test\.tsx?$/.test(relativePath),
		);
}

function stripComments(source) {
	return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/\/\/.*$/gm, "");
}

function escapeAppearsIn(html, character) {
	const codePoint = character.codePointAt(0);
	const candidates = [
		`\\u${codePoint.toString(16).padStart(4, "0")}`,
		...(codePoint <= 0xff ? [`\\x${codePoint.toString(16)}`] : []),
	];

	const lowerCaseHtml = html.toLowerCase();
	return candidates.some((candidate) =>
		lowerCaseHtml.includes(candidate.toLowerCase()),
	);
}
