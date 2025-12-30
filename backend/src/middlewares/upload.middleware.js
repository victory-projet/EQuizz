// backend/src/middlewares/upload.middleware.js

const multer = require('multer');

// On configure multer pour stocker le fichier en mémoire vive (RAM)
// C'est efficace pour les petits fichiers et évite d'écrire sur le disque.
const storage = multer.memoryStorage();

// On filtre pour n'accepter que les fichiers Excel
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    // Accepter le fichier
    cb(null, true);
  } else {
    // Rejeter le fichier
    cb(new Error('Format de fichier non valide. Seuls les fichiers .xlsx et .xls sont autorisés.'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;