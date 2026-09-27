import { GoogleGenAI } from "@google/genai";

import { semanticSearch } from "./semanticSearchService.js";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY est introuvable."
  );
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
});


export const askRAG = async (
  question,
  companyId,
  history = []
) => {

  // ==========================================
  // 1. RECHERCHE SÉMANTIQUE
  // ==========================================

  const chunks = await semanticSearch(
    question,
    companyId,
    3
  );


  // ==========================================
  // 2. AUCUN DOCUMENT PERTINENT
  // ==========================================

  if (!chunks.length) {
    return {
      answer:
        "Je n'ai trouvé aucune information pertinente dans les documents.",
      sources: []
    };
  }


  // ==========================================
  // 3. CONTEXTE DOCUMENTAIRE
  // ==========================================

  const context = chunks
    .map(
      (chunk, index) => `
SOURCE ${index + 1}

Document : ${chunk.document_title}
Auteur : ${chunk.author_name}
Page : ${chunk.page_number ?? "inconnue"}

Contenu :
${chunk.chunk_text}
`
    )
    .join(
      "\n--------------------\n"
    );


  // ==========================================
  // 4. HISTORIQUE
  // ==========================================

  const conversationHistory = history
    .map(
      (message) =>
        `${message.role === "user"
          ? "Utilisateur"
          : "Assistant"} : ${message.content}`
    )
    .join("\n");


  // ==========================================
  // 5. PROMPT
  // ==========================================

  const prompt = `
Historique de la conversation :

${conversationHistory || "Aucun historique."}


Question actuelle :

${question}


Informations récupérées depuis la base documentaire
de StageLink :

${context}


Instructions :

Utilise l'historique uniquement pour comprendre
le contexte de la conversation.

Pour les informations factuelles, utilise uniquement
les documents fournis dans le contexte documentaire.

Si les documents ne permettent pas de répondre,
dis clairement que l'information n'est pas disponible
dans la base documentaire.

N'invente aucune information.

Réponds exactement dans la même langue que la question.

Réponds de manière claire et concise.
`;


  // ==========================================
  // 6. GEMINI
  // ==========================================

  const response =
    await ai.models.generateContent({

      model: "gemini-2.5-flash",

      contents: prompt,

      config: {
        systemInstruction:
          "Tu es l'assistant documentaire intelligent " +
          "de StageLink. Tu aides les utilisateurs à " +
          "explorer la base documentaire de leur entreprise. " +
          "Tu ne dois jamais inventer d'informations."
      }

    });


  // ==========================================
  // 7. SOURCES
  // ==========================================

  const sources = chunks.map(
    (chunk, index) => ({

      sourceNumber: index + 1,

      documentId:
        chunk.document_id,

      versionId:
        chunk.version_id,

      documentTitle:
        chunk.document_title,

      authorName:
        chunk.author_name,

      pageNumber:
        chunk.page_number,

      similarity:
        Number(chunk.similarity),

      excerpt:
        chunk.chunk_text.length > 250
          ? chunk.chunk_text.slice(0, 250) + "..."
          : chunk.chunk_text

    })
  );


  return {
    answer: response.text,
    sources
  };
};