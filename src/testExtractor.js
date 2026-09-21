import { extractTextFromFile } from "./utils/textExtractor";

const filePath = "file:///C:/Users/utilisateur/Desktop/kassou.pdf";

const text = await extractTextFromFile(
  filePath,
  "application/pdf"
);

console.log("========== TEXTE EXTRAIT ==========");
console.log(text);
console.log("====================================");