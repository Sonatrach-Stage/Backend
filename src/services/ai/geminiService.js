import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const testGemini = async () => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explique en une phrase ce qu'est un stage universitaire.",
  });

  return response.text;
};
const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const RETRYABLE_STATUS_CODES = [
  429,
  500,
  502,
  503,
  504
];

export const generateContentWithRetry = async (
  ai,
  options,
  maxAttempts = 3
) => {

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {

    try {

      console.log(
        `Gemini : tentative ${attempt}/${maxAttempts}`
      );

      const response =
        await ai.models.generateContent(options);

      console.log(
        `Gemini : succès à la tentative ${attempt}`
      );

      return response;

    } catch (error) {

      lastError = error;

      const statusCode =
        error?.status ||
        error?.statusCode ||
        error?.code;

      const shouldRetry =
        RETRYABLE_STATUS_CODES.includes(
          Number(statusCode)
        );

      console.log(
        `Gemini : erreur à la tentative ${attempt}`,
        statusCode
      );

      // Si l'erreur n'est pas temporaire,
      // on arrête immédiatement.
      if (!shouldRetry) {
        throw error;
      }

      // Si c'était la dernière tentative,
      // on arrête.
      if (attempt === maxAttempts) {
        break;
      }

      // Backoff exponentiel :
      // tentative 1 → 2 secondes
      // tentative 2 → 4 secondes
      const delay = 2000 * 2 ** (attempt - 1);

      console.log(
        `Gemini : nouvelle tentative dans ${delay / 1000}s...`
      );

      await sleep(delay);
    }
  }

  throw lastError;
};