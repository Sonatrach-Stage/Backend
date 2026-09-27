
import "dotenv/config";
import { generateEmbedding } from "./embeddingService.js";

const text = "Le projet StageLink permet de gérer les stages universitaires.";

const embedding = await generateEmbedding(text);

console.log("Nombre de dimensions :", embedding.length);
console.log("Premières valeurs :", embedding.slice(0, 10));
