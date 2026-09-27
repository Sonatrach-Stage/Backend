
import "dotenv/config";
import { testGemini } from "./geminiService.js";

const result = await testGemini();

console.log("🤖 Réponse Gemini :");
console.log(result);

