// backend/src/services/enseignant.service.js

const db = require('../models');
const AppError = require('../utils/AppError');

class EnseignantService {
  async findAll() {
    return db.Enseignant.findAll({
      include: [
        {
          model: db.Utilisateur,
          attributes: ['nom', 'prenom', 'email', 'estActif']
        }
      ],
      order: [[db.Utilisateur, 'nom', 'ASC']]
    });
  }

  async findOne(id) {
    const enseignant = await db.Enseignant.findByPk(id, {
      include: [
        {
          model: db.Utilisateur,
          attributes: ['nom', 'prenom', 'email', 'estActif']
        },
        {
          model: db.Cours,
          attributes: ['id', 'code', 'nom']
        }
      ]
    });

    if (!enseignant) {
      throw AppError.notFound('Enseignant non trouvé', 'TEACHER_NOT_FOUND');
    }

    return enseignant;
  }

  async create(data) {
    const { nom, prenom, email, specialite, motDePasse } = data;

    // Vérifier si l'email existe déjà
    const existingUser = await db.Utilisateur.findOne({ where: { email } });
    if (existingUser) {
      throw AppError.conflict('Cet email est déjà utilisé', 'EMAIL_EXISTS');
    }

    const transaction = await db.sequelize.transaction();

    try {
      // Créer l'utilisateur
      const utilisateur = await db.Utilisateur.create({
        nom,
        prenom,
        email,
        motDePasseHash: motDePasse || 'Prof123!', // Mot de passe par défaut
        estActif: true
      }, { transaction });

      // Créer l'enseignant
      const enseignant = await db.Enseignant.create({
        id: utilisateur.id,
        specialite: specialite || 'Non spécifié'
      }, { transaction });

      await transaction.commit();

      return this.findOne(enseignant.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async update(id, data) {
    const enseignant = await db.Enseignant.findByPk(id);
    if (!enseignant) {
      throw AppError.notFound('Enseignant non trouvé', 'TEACHER_NOT_FOUND');
    }

    const { nom, prenom, email, specialite } = data;

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

      // Mettre à jour l'enseignant
      if (specialite) {
        await enseignant.update({ specialite }, { transaction });
      }

      await transaction.commit();

      return this.findOne(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async delete(id) {
    const enseignant = await db.Enseignant.findByPk(id);
    if (!enseignant) {
      throw AppError.notFound('Enseignant non trouvé', 'TEACHER_NOT_FOUND');
    }

    // Vérifier si l'enseignant a des cours assignés
    const coursCount = await db.Cours.count({ where: { enseignant_id: id } });
    if (coursCount > 0) {
      throw AppError.badRequest(
        'Impossible de supprimer cet enseignant car il a des cours assignés',
        'HAS_COURSES'
      );
    }

    const transaction = await db.sequelize.transaction();

    try {
      // Supprimer l'enseignant (cascade supprimera l'utilisateur)
      await enseignant.destroy({ transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new EnseignantService();
