// backend/src/controllers/student.controller.js
const { Utilisateur, Etudiant, Classe } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ErrorHandler = require('../middlewares/errorHandler.middleware');

class StudentController {
  getMe = asyncHandler(async (req, res) => {
    const utilisateur = await Utilisateur.findByPk(req.user.id, {
      include: [
        {
          model: Etudiant,
          include: [
            {
              model: Classe,
              attributes: ['id', 'nom', 'niveau']
            }
          ]
        }
      ]
    });

    if (!utilisateur || !utilisateur.Etudiant) {
      throw ErrorHandler.createError('Étudiant non trouvé', 404, 'NOT_FOUND');
    }

    res.status(200).json({
      id: utilisateur.id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      matricule: utilisateur.Etudiant.matricule,
      idCarte: utilisateur.Etudiant.idCarte,
      classe: utilisateur.Etudiant.Classe ? {
        id: utilisateur.Etudiant.Classe.id,
        nom: utilisateur.Etudiant.Classe.nom,
        niveau: utilisateur.Etudiant.Classe.niveau
      } : null
    });
  });
}

module.exports = new StudentController();
