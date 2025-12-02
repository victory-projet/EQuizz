// backend/src/services/etudiant.service.js

const db = require('../models');
const etudiantRepository = require('../repositories/etudiant.repository');
const AppError = require('../utils/AppError');

class EtudiantService {
  async findAll() {
    return db.Etudiant.findAll({
      include: [
        {
          model: db.Utilisateur,
          attributes: ['nom', 'prenom', 'email', 'estActif']
        },
        {
          model: db.Classe,
          attributes: ['nom', 'niveau']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async findOne(id) {
    const etudiant = await db.Etudiant.findByPk(id, {
      include: [
        {
          model: db.Utilisateur,
          attributes: ['nom', 'prenom', 'email', 'estActif']
        },
        {
          model: db.Classe,
          attributes: ['nom', 'niveau']
        }
      ]
    });

    if (!etudiant) {
      throw AppError.notFound('Étudiant non trouvé', 'STUDENT_NOT_FOUND');
    }

    return etudiant;
  }

  async create(data) {
    const { nom, prenom, email, matricule, classe_id } = data;

    // Vérifier si l'email existe déjà
    const existingUser = await db.Utilisateur.findOne({ where: { email } });
    if (existingUser) {
      throw AppError.conflict('Cet email est déjà utilisé', 'EMAIL_EXISTS');
    }

    // Vérifier si le matricule existe déjà
    const existingMatricule = await db.Etudiant.findOne({ where: { matricule } });
    if (existingMatricule) {
      throw AppError.conflict('Ce matricule est déjà utilisé', 'MATRICULE_EXISTS');
    }

    const transaction = await db.sequelize.transaction();

    try {
      // Créer l'utilisateur
      const utilisateur = await db.Utilisateur.create({
        nom,
        prenom,
        email,
        motDePasseHash: null, // Sera défini lors de l'activation du compte
        estActif: true
      }, { transaction });

      // Créer l'étudiant
      const etudiant = await db.Etudiant.create({
        id: utilisateur.id,
        matricule,
        classe_id
      }, { transaction });

      await transaction.commit();

      return this.findOne(etudiant.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async update(id, data) {
    const etudiant = await db.Etudiant.findByPk(id);
    if (!etudiant) {
      throw AppError.notFound('Étudiant non trouvé', 'STUDENT_NOT_FOUND');
    }

    const { nom, prenom, email, matricule, classe_id } = data;

    const transaction = await db.sequelize.transaction();

    try {
      // Mettre à jour l'utilisateur
      if (nom || prenom || email) {
        const utilisateur = await db.Utilisateur.findByPk(id);
        await utilisateur.update({
          nom: nom || utilisateur.nom,
          prenom: prenom || utilisateur.prenom,
          email: email || utilisateur.email
        }, { transaction });
      }

      // Mettre à jour l'étudiant
      await etudiant.update({
        matricule: matricule || etudiant.matricule,
        classe_id: classe_id !== undefined ? classe_id : etudiant.classe_id
      }, { transaction });

      await transaction.commit();

      return this.findOne(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async delete(id) {
    const etudiant = await db.Etudiant.findByPk(id);
    if (!etudiant) {
      throw AppError.notFound('Étudiant non trouvé', 'STUDENT_NOT_FOUND');
    }

    const transaction = await db.sequelize.transaction();

    try {
      // Supprimer l'étudiant (cascade supprimera l'utilisateur)
      await etudiant.destroy({ transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new EtudiantService();
