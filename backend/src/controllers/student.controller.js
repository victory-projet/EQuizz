// backend/src/controllers/student.controller.js
const { Utilisateur, Etudiant, Classe } = require('../models');

class StudentController {
  async getMe(req, res) {
    try {
      // req.user est défini par le middleware authenticate
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
        return res.status(404).json({ message: 'Étudiant non trouvé' });
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
    } catch (error) {
      console.error('Erreur lors de la récupération des informations de l\'étudiant:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
}

module.exports = new StudentController();
