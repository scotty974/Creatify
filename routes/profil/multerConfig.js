// routes/profil/media/multerConfig.js
import multer from "multer";
import path from "path";

// Configuration de stockage avec multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Définir le dossier où les fichiers seront stockés
    cb(null, "uploads/media"); // Dossier où les fichiers seront stockés
  },
  filename: (req, file, cb) => {
    // Générer un nom unique pour chaque fichier
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Nom unique avec extension
  },
});

// Filtrer les fichiers pour accepter les images et les vidéos (jpg, png, mp4)
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif|mp4/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  
  if (extname && mimeType) {
    return cb(null, true); // Accepter le fichier
  } else {
    cb(new Error("Seuls les formats d'images (jpg, png, gif) et les vidéos (mp4) sont acceptés."));
  }
};

// Middleware multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB par fichier
  fileFilter: fileFilter,
});

export default upload;
