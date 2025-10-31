const db = require('../models');

class EtudiantRepository {
  async findStudentForClaim(matricule, email, classeId) {
    // La logique d'accès aux données
    return db.Etudiant.findOne({
      where: { matricule },
      include: [{
        model: db.Utilisateur,
        where: { email },
        required: true,
      }, {
        model: db.Classe,
        where: { id: classeId },
        required: true
      }]
    });
  }

  async setPassword(utilisateur, password) {
    utilisateur.motDePasseHash = password;
    return utilisateur.save();
  }
}

module.exports = new EtudiantRepository();