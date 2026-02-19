// backend/src/repositories/utilisateur.repository.js
const db = require('../models');
const { Op } = require('sequelize'); // Opérateur pour les requêtes complexes

class UtilisateurRepository {
  async findByLogin(loginIdentifier) {
    // Cette méthode recherche un utilisateur soit par email, soit via le matricule de l'étudiant associé.
    return db.Utilisateur.findOne({
      where: {
        [Op.or]: [ // Utilise l'opérateur OR
          { email: loginIdentifier },
          { '$Etudiant.matricule$': loginIdentifier } // Recherche dans le modèle associé
        ]
      },
      include: [{
        model: db.Etudiant,
        attributes: ['matricule', 'idCarte'], // Inclure tous les attributs nécessaires
        include: [{
          model: db.Classe,
          attributes: ['id', 'nom', 'niveau']
        }],
        required: false, // On met 'false' car un admin n'a pas de profil étudiant
      }, {
        model: db.Administrateur, // On inclut le profil Admin
        required: false,
        include: [{
          model: db.Ecole,
          attributes: ['id', 'nom'],
          required: false
        }]
      }, {
        model: db.Enseignant, // On inclut le profil Enseignant
        attributes: ['specialite'],
        required: false,
      }]
    });
  }

  async findByEmail(email) {
    return db.Utilisateur.findOne({
      where: { email }
    });
  }
}

module.exports = new UtilisateurRepository();
