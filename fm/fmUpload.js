import open from "open";
import path from "node:path";

import { fmConfig } from "./fmConfig.js";

const __dirname = import.meta.dirname;
const { uploadScript, file, server, widgetName } = fmConfig;

const fileUrl = `fmp://${server}/${encodeURIComponent(file)}?script=${encodeURIComponent(uploadScript)}&param=`;
const htmlPath = path.join(__dirname, "..", "dist", "index.html");
const parameter = encodeURIComponent(
	JSON.stringify({ thePath: htmlPath, widgetName }),
);

open(fileUrl + parameter);
