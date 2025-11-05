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

  async findById(id) {
    return db.Etudiant.findByPk(id, {
      attributes: ['id', 'matricule', 'idCarte', 'classe_id']
    });
  }
  
}

module.exports = new EtudiantRepository();