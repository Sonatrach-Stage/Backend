import { askRAG } from "../src/services/ai/ragService.js";

const question =
  "Comment doit-on nommer les fonctions dans le projet ?";

const result = await askRAG(question);

console.log("\n==============================");
console.log("RÉPONSE DU RAG");
console.log("==============================\n");

console.log(result.answer);

console.log("\n==============================");
console.log("SOURCES");
console.log("==============================\n");

console.log(result.sources);