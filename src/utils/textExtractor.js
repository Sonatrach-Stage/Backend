import fs from "fs/promises";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export const extractTextFromFile = async (filePath, mimetype) => {
  const buffer = await fs.readFile(filePath);

  // PDF
  if (mimetype === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
const result = await parser.getText();

await parser.destroy();

return result.text;
  }

  // DOCX
  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // DOC
  if (mimetype === "application/msword") {
    return "";
  }

  // PPT / PPTX
  if (
    mimetype === "application/vnd.ms-powerpoint" ||
    mimetype ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return "";
  }

  return "";
};