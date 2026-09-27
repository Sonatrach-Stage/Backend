import DocumentChunk from "../../models/documentChunkModel.js";

export const findSimilarProjects = async (
  documentId,
  companyId,
  limit = 5
) => {

  console.log(
    "Recherche de projets similaires..."
  );

  console.log(
    "Document ID :",
    documentId
  );

  console.log(
    "Company ID :",
    companyId
  );

  const similarProjects =
    await DocumentChunk.findSimilarDocuments(
      documentId,
      companyId,
      limit
    );

  return similarProjects;
};