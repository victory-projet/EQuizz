// backend/src/middlewares/upload.middleware.js

const multer = require('multer');

// On configure multer pour stocker le fichier en mémoire vive (RAM)
// C'est efficace pour les petits fichiers et évite d'écrire sur le disque.
const storage = multer.memoryStorage();

// On filtre pour n'accepter que les fichiers Excel
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    // Accepter le fichier (format .xlsx)
    cb(null, true);
  } else {
    // Rejeter le fichier
    cb(new Error('Format de fichier non valide. Seuls les fichiers .xlsx sont autorisés.'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;