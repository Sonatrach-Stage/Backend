const MAX_WORDS = 800;

export const createChunks = (pages) => {
  const chunks = [];

  let currentText = "";
  let currentPage = null;
  let chunkNumber = 1;

  for (const page of pages) {
    const words = page.text.split(/\s+/).filter(Boolean);

    for (const word of words) {
      // Si on commence un nouveau chunk
      if (!currentText) {
        currentPage = page.pageNumber;
      }

      currentText += `${word} `;

      // Quand le chunk atteint la taille maximale
      const wordCount = currentText.trim().split(/\s+/).length;

      if (wordCount >= MAX_WORDS) {
        chunks.push({
          chunkNumber,
          pageNumber: currentPage,
          text: currentText.trim(),
        });

        chunkNumber++;
        currentText = "";
        currentPage = null;
      }
    }
  }

  // Ajouter le dernier chunk s'il reste du texte
  if (currentText.trim()) {
    chunks.push({
      chunkNumber,
      pageNumber: currentPage,
      text: currentText.trim(),
    });
  }

  return chunks;
};