import "dotenv/config";

import { generateEmbedding } from "./embeddingService.js";
import { cosineSimilarity } from "../../utils/cosineSimilarity.js";

const textA =
  "Le projet utilise Node.js pour développer le backend.";

const textB =
  "Le serveur de l'application est développé avec Node.js.";

const textC =
  "L'étudiant a effectué son stage durant trois mois.";

const embeddingA = await generateEmbedding(textA);
const embeddingB = await generateEmbedding(textB);
const embeddingC = await generateEmbedding(textC);

const similarityAB = cosineSimilarity(embeddingA, embeddingB);
const similarityAC = cosineSimilarity(embeddingA, embeddingC);

console.log("Similarité A ↔ B :", similarityAB);
console.log("Similarité A ↔ C :", similarityAC);