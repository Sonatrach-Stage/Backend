import { GoogleGenAI } from "@google/genai";

import DocumentChunk from "../../models/documentChunkModel.js";
import { generateContentWithRetry } from "./geminiService.js";
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY est introuvable."
  );
}

const ai = new GoogleGenAI({
  apiKey
});


export const summarizeDocument = async (
  documentId,
  companyId
) => {

  // ==========================================
  // 1. RÉCUPÉRER LES CHUNKS DU DOCUMENT
  // ==========================================

  const chunks =
    await DocumentChunk.findByDocument(
      documentId,
      companyId
    );

  // ==========================================
  // 2. VÉRIFIER QUE LE DOCUMENT EST DISPONIBLE
  // ==========================================

  if (!chunks.length) {

    const error = new Error(
      "Aucun document final approuvé trouvé."
    );

    error.statusCode = 404;

    throw error;
  }

  // ==========================================
  // 3. RÉCUPÉRER LES INFORMATIONS DU DOCUMENT
  // ==========================================

  const documentTitle =
    chunks[0].document_title;

  const authorName =
    chunks[0].author_name;

  // ==========================================
  // 4. CONSTRUIRE LE CONTENU DU DOCUMENT
  // ==========================================

  const documentContent = chunks
    .map(
      (chunk) => `
PAGE ${chunk.page_number ?? "inconnue"}

${chunk.chunk_text}
`
    )
    .join("\n--------------------\n");

  // ==========================================
  // 5. CONSTRUIRE LE PROMPT
  // ==========================================

  const prompt = `
Tu dois résumer un document académique
provenant de la base documentaire de StageLink.

Titre du document :
${documentTitle}

Auteur :
${authorName}


CONTENU DU DOCUMENT :

${documentContent}


Consignes :

1. Résume uniquement les informations présentes
   dans le document.

2. N'invente aucune information.

3. Si une information n'est pas présente,
   ne l'ajoute pas.

4. Identifie lorsque c'est possible :

   - le contexte
   - les objectifs
   - la problématique
   - la méthodologie
   - les technologies ou outils utilisés
   - les résultats
   - la conclusion

5. Si une de ces informations n'est pas présente,
   indique simplement :
   "Non précisé dans le document."

6. Fais un résumé clair et structuré.

7. Réponds avec la meme langue que le document si cest le francais tu reponds en français.
si c en anglais tu reponds en anglais ainsi de suite
`;

  // ==========================================
  // 6. APPEL GEMINI
  // ==========================================

const response =
  await generateContentWithRetry(
    ai,
    {
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "Tu es un assistant spécialisé dans " +
          "l'analyse de documents académiques. " +
          "Tu dois rester strictement fidèle " +
          "au contenu fourni et ne jamais inventer " +
          "d'informations."
      }
    }
  );

  // ==========================================
  // 7. SOURCES
  // ==========================================

  const sources = chunks.map(
    (chunk) => ({
      documentId:
        chunk.document_id,

      versionId:
        chunk.version_id,

      pageNumber:
        chunk.page_number,

      chunkNumber:
        chunk.chunk_number
    })
  );

  // ==========================================
  // 8. RETOURNER LE RÉSULTAT
  // ==========================================

  return {
    document: {
      id: chunks[0].document_id,
      title: documentTitle,
      author: authorName,
      versionId: chunks[0].version_id
    },

    summary: response.text,

    sources
  };
};