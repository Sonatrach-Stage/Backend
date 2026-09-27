import { semanticSearch } from "../src/services/ai/semanticSearchService.js";

const question =
  "Comment doit-on nommer les fonctions ?";

const results = await semanticSearch(question, 3);

console.log("\n===== RÉSULTATS =====");

results.forEach((result, index) => {
  console.log(`\n--- Résultat ${index + 1} ---`);

  console.log("ID :", result.id);
  console.log("Document :", result.document_id);
  console.log("Version :", result.version_id);
  console.log("Chunk :", result.chunk_number);
  console.log("Page :", result.page_number);
  console.log("Similarité :", result.similarity);

  console.log("Texte :");
  console.log(result.chunk_text);
});