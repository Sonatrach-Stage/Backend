import { extractTextFromFile } from "../src/utils/textExtractor.js";
import { createChunks } from "../src/utils/chunker.js";

const filePath = "./tests/test.pdf";

const pages = await extractTextFromFile(
  filePath,
  "application/pdf"
);

const chunks = createChunks(pages);

console.log("Nombre de pages :", pages.length);
console.log("Nombre de chunks :", chunks.length);

console.log("\nPREMIER CHUNK :");
console.log(chunks[0]);

console.log("\nDERNIER CHUNK :");
console.log(chunks[chunks.length - 1]);