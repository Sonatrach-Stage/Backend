import { GoogleGenAI } from "@google/genai";
/*
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
*/
const apiKey = process.env.GEMINI_API_KEY; if (!apiKey) { throw new Error("GEMINI_API_KEY est introuvable."); } 
console.log(
  "Embedding service - clé présente :",
  !!process.env.GEMINI_API_KEY
);
const ai = new GoogleGenAI({ apiKey: apiKey, });
export const generateEmbedding = async (text) => {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
  });

  return response.embeddings[0].values;
};