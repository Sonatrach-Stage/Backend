import { generateEmbedding } from "./embeddingService.js";
import DocumentChunk from "../../models/documentChunkModel.js";

export const indexDocumentChunks = async ({
  documentId,
  versionId,
  chunks,
}) => {
  const indexedChunks = [];

  for (const chunk of chunks) {
    console.log(
      `Génération embedding chunk ${chunk.chunkNumber}...`
    );

    const embedding = await generateEmbedding(chunk.text);

    const savedChunk = await DocumentChunk.create({
      documentId,
      versionId,
      chunkText: chunk.text,
      chunkNumber: chunk.chunkNumber,
      pageNumber: chunk.pageNumber,
      embedding,
    });

    indexedChunks.push(savedChunk);

    console.log(
      `Chunk ${chunk.chunkNumber} enregistré.`
    );
  }

  return indexedChunks;
};