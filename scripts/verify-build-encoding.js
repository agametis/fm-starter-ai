import fs from "node:fs";

const html = fs.readFileSync(
	new URL("../dist/index.html", import.meta.url),
	"utf8",
);
const nonAsciiCharacters = [
	...new Set(
		[...html].filter((character) => {
			const codePoint = character.codePointAt(0);
			return codePoint !== undefined && codePoint > 0x7f;
		}),
	),
];

if (nonAsciiCharacters.length > 0) {
	throw new Error(
		`The WebDirect build contains non-ASCII characters: ${nonAsciiCharacters.join(" ")}`,
	);
}

if (!/L\\(?:x[fF]6|u00[fF]6)schen/.test(html)) {
	throw new Error('The "Löschen" WebDirect encoding regression check failed.');
}

if (html.includes("__sampleDataModule")) {
	throw new Error(
		"The production build contains the development sample data module.",
	);
}

console.log(
	"Production build checks passed: output is ASCII-only and excludes sample data.",
);
