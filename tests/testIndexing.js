import { extractTextFromFile } from "../src/utils/textExtractor.js";
import { createChunks } from "../src/utils/chunker.js";
import { indexDocumentChunks } from "../src/services/ai/embeddingIndexService.js";

const filePath = "./tests/test.pdf";

const documentId = 5;
const versionId = 15;
console.log( "GEMINI KEY présente :", !!process.env.GEMINI_API_KEY ); console.log( "GEMINI KEY début :", process.env.GEMINI_API_KEY?.slice(0, 5) );
const pages = await extractTextFromFile(
  filePath,
  "application/pdf"
);

const chunks = createChunks(pages);

console.log("Pages :", pages.length);
console.log("Chunks :", chunks.length);

const indexedChunks = await indexDocumentChunks({
  documentId,
  versionId,
  chunks,
});

console.log(
  "Chunks enregistrés :",
  indexedChunks.length
);