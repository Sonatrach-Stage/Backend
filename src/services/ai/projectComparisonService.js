import { GoogleGenAI } from "@google/genai";

import DocumentChunk
  from "../../models/documentChunkModel.js";

import {
  generateContentWithRetry
} from "./geminiService.js";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY est introuvable."
  );
}

const ai = new GoogleGenAI({
  apiKey
});

export const compareProjects = async (
  documentId1,
  documentId2,
  companyId
) => {

  // ==========================================
  // RÉCUPÉRER LE PREMIER DOCUMENT
  // ==========================================

  const project1 =
    await DocumentChunk.findByDocument(
      documentId1,
      companyId
    );

  // ==========================================
  // RÉCUPÉRER LE DEUXIÈME DOCUMENT
  // ==========================================

  const project2 =
    await DocumentChunk.findByDocument(
      documentId2,
      companyId
    );

  // ==========================================
  // VÉRIFIER LES DOCUMENTS
  // ==========================================

  if (!project1.length) {
    const error = new Error(
      "Le premier document n'existe pas ou n'est pas approuvé."
    );

    error.statusCode = 404;

    throw error;
  }

  if (!project2.length) {
    const error = new Error(
      "Le deuxième document n'existe pas ou n'est pas approuvé."
    );

    error.statusCode = 404;

    throw error;
  }

  // ==========================================
  // INFORMATIONS DES DOCUMENTS
  // ==========================================

  const document1 = {
    id: project1[0].document_id,
    title: project1[0].document_title,
    author: project1[0].author_name
  };

  const document2 = {
    id: project2[0].document_id,
    title: project2[0].document_title,
    author: project2[0].author_name
  };

  // ==========================================
  // CONSTRUIRE LE CONTENU DU PROJET 1
  // ==========================================

  const content1 = project1
    .map(
      (chunk) => `
PAGE ${chunk.page_number ?? "inconnue"}

${chunk.chunk_text}
`
    )
    .join("\n--------------------\n");

  // ==========================================
  // CONSTRUIRE LE CONTENU DU PROJET 2
  // ==========================================

  const content2 = project2
    .map(
      (chunk) => `
PAGE ${chunk.page_number ?? "inconnue"}

${chunk.chunk_text}
`
    )
    .join("\n--------------------\n");

  // ==========================================
  // PROMPT
  // ==========================================

  const prompt = `
Tu dois comparer deux projets académiques
provenant de la base documentaire de StageLink.

========================
PROJET 1
========================

Titre :
${document1.title}

Auteur :
${document1.author}

Contenu :

${content1}


========================
PROJET 2
========================

Titre :
${document2.title}

Auteur :
${document2.author}

Contenu :

${content2}


========================
CONSIGNES
========================

Compare les deux projets uniquement à partir
des informations présentes dans leurs documents.

N'invente aucune information.

Présente la comparaison avec les sections suivantes :

1. Objectifs
2. Problématique
3. Méthodologie
4. Technologies et outils
5. Fonctionnalités
6. Résultats
7. Points communs
8. Différences

Pour chaque section, indique :

- ce qui est présent dans le projet 1
- ce qui est présent dans le projet 2
- les points communs ou différences lorsqu'ils
  peuvent être déterminés.

Si une information n'est pas présente dans
l'un des documents, indique :

"Non précisé dans le document."

Réponds avec la meme langue que le document si cest en francais tu reponds en français.
si cest en anglais tu reponds en anglais ...

Reste strictement fidèle aux documents.
`;

  // ==========================================
  // APPEL GEMINI
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
            "la comparaison de projets académiques. " +
            "Tu dois être strictement fidèle aux " +
            "documents fournis et ne jamais inventer " +
            "d'informations."
        }
      }
    );

  // ==========================================
  // RÉPONSE
  // ==========================================

  return {
    project1: document1,

    project2: document2,

    comparison: response.text
  };
};