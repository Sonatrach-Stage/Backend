import { generateEmbedding } from "./embeddingService.js";
import DocumentChunk from "../../models/documentChunkModel.js";

export const semanticSearch = async (
  query,
  companyId,
  limit = 5
) => {

  console.log("Question :", query);
  console.log("Company ID :", companyId);

  // 1. Transformer la question en embedding
  const queryEmbedding = await generateEmbedding(query);

  console.log("Embedding de la question généré.");

  // 2. Recherche uniquement dans l'entreprise
  const results = await DocumentChunk.searchSimilar(
    queryEmbedding,
    companyId,
    limit
  );

  return results;
};