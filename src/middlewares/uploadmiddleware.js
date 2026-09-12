import multer from "multer";
import os from "os";

// =====================================================
// CONFIGURATION DU STOCKAGE TEMPORAIRE
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// =====================================================
// FILTRE DES TYPES DE FICHIERS
// =====================================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Format non supporté. Veuillez envoyer un fichier JPG, PNG ou PDF."
      ),
      false
    );
  }
};

// =====================================================
// CONFIGURATION DE MULTER
// =====================================================

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;