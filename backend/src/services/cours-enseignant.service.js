const db = require('../models');
const AppError = require('../utils/AppError');

class CoursEnseignantService {
  /**
   * Assigner un enseignant à un cours
   */
  async assignerEnseignant(coursId, enseignantId, role = 'TITULAIRE', estPrincipal = false) {
    // Vérifier que le cours existe
    const cours = await db.Cours.findByPk(coursId);
    if (!cours) {
      throw AppError.notFound('Cours non trouvé', 'COURS_NOT_FOUND');
    }

    // Vérifier que l'enseignant existe
    const enseignant = await db.Enseignant.findByPk(enseignantId);
    if (!enseignant) {
      throw AppError.notFound('Enseignant non trouvé', 'ENSEIGNANT_NOT_FOUND');
    }

    // Vérifier si l'association existe déjà
    const existingAssociation = await db.CoursEnseignant.findOne({
      where: { cours_id: coursId, enseignant_id: enseignantId }
    });

    if (existingAssociation) {
      throw AppError.badRequest('Cet enseignant est déjà assigné à ce cours', 'ALREADY_ASSIGNED');
    }

    // Si on veut définir comme principal, s'assurer qu'il n'y en a pas déjà un
    if (estPrincipal) {
      const principalExistant = await db.CoursEnseignant.findOne({
        where: { cours_id: coursId, estPrincipal: true }
      });

      if (principalExistant) {
        // Retirer le statut principal de l'ancien
        await principalExistant.update({ estPrincipal: false });
      }
    }

    // Créer l'association
    const association = await db.CoursEnseignant.create({
      cours_id: coursId,
      enseignant_id: enseignantId,
      role,
      estPrincipal
    });

    return association;
  }

  /**
   * Retirer un enseignant d'un cours
   */
  async retirerEnseignant(coursId, enseignantId) {
    const association = await db.CoursEnseignant.findOne({
      where: { cours_id: coursId, enseignant_id: enseignantId }
    });

    if (!association) {
      throw AppError.notFound('Association non trouvée', 'ASSOCIATION_NOT_FOUND');
    }

    await association.destroy();
    return { message: 'Enseignant retiré du cours avec succès' };
  }

  /**
   * Modifier le rôle d'un enseignant dans un cours
   */
  async modifierRole(coursId, enseignantId, nouveauRole, estPrincipal = false) {
    const association = await db.CoursEnseignant.findOne({
      where: { cours_id: coursId, enseignant_id: enseignantId }
    });

    if (!association) {
      throw AppError.notFound('Association non trouvée', 'ASSOCIATION_NOT_FOUND');
    }

    // Si on veut définir comme principal, s'assurer qu'il n'y en a pas déjà un
    if (estPrincipal && !association.estPrincipal) {
      const principalExistant = await db.CoursEnseignant.findOne({
        where: { 
          cours_id: coursId, 
          estPrincipal: true,
          enseignant_id: { [db.Sequelize.Op.ne]: enseignantId }
        }
      });

      if (principalExistant) {
        await principalExistant.update({ estPrincipal: false });
      }
    }

    await association.update({
      role: nouveauRole,
      estPrincipal
    });

    return association;
  }

  /**
   * Obtenir tous les enseignants d'un cours
   */
  async getEnseignantsByCours(coursId) {
    const cours = await db.Cours.findByPk(coursId, {
      include: [
        {
          model: db.Enseignant,
          through: {
            model: db.CoursEnseignant,
            attributes: ['role', 'estPrincipal', 'dateAssignation']
          },
          include: [
            {
              model: db.Utilisateur,
              attributes: ['nom', 'prenom', 'email']
            }
          ]
        }
      ]
    });

    if (!cours) {
      throw AppError.notFound('Cours non trouvé', 'COURS_NOT_FOUND');
    }

    return cours.Enseignants.map(enseignant => ({
      id: enseignant.id,
      nom: enseignant.Utilisateur.nom,
      prenom: enseignant.Utilisateur.prenom,
      email: enseignant.Utilisateur.email,
      role: enseignant.CoursEnseignant.role,
      estPrincipal: enseignant.CoursEnseignant.estPrincipal,
      dateAssignation: enseignant.CoursEnseignant.dateAssignation
    }));
  }

  /**
   * Obtenir tous les cours d'un enseignant
   */
  async getCoursByEnseignant(enseignantId) {
    const enseignant = await db.Enseignant.findByPk(enseignantId, {
      include: [
        {
          model: db.Cours,
          through: {
            model: db.CoursEnseignant,
            attributes: ['role', 'estPrincipal', 'dateAssignation']
          },
          include: [
            {
              model: db.Semestre,
              include: [{ model: db.AnneeAcademique }]
            }
          ]
        }
      ]
    });

    if (!enseignant) {
      throw AppError.notFound('Enseignant non trouvé', 'ENSEIGNANT_NOT_FOUND');
    }

    return enseignant.Cours.map(cours => ({
      id: cours.id,
      code: cours.code,
      nom: cours.nom,
      role: cours.CoursEnseignant.role,
      estPrincipal: cours.CoursEnseignant.estPrincipal,
      dateAssignation: cours.CoursEnseignant.dateAssignation,
      semestre: cours.Semestre ? {
        id: cours.Semestre.id,
        nom: cours.Semestre.nom,
        anneeAcademique: cours.Semestre.AnneeAcademique ? {
          id: cours.Semestre.AnneeAcademique.id,
          nom: cours.Semestre.AnneeAcademique.nom
        } : null
      } : null
    }));
  }

  /**
   * Assigner plusieurs enseignants à un cours en une fois
   */
  async assignerPlusieursEnseignants(coursId, enseignants) {
    // Vérifier que le cours existe
    const cours = await db.Cours.findByPk(coursId);
    if (!cours) {
      throw AppError.notFound('Cours non trouvé', 'COURS_NOT_FOUND');
    }

    const associations = [];
    let principalDefini = false;

    // Vérifier s'il y a déjà un enseignant principal
    const principalExistant = await db.CoursEnseignant.findOne({
      where: { cours_id: coursId, estPrincipal: true }
    });

    if (principalExistant) {
      principalDefini = true;
    }

    for (const enseignantData of enseignants) {
      const { enseignantId, role = 'TITULAIRE', estPrincipal = false } = enseignantData;

      // Vérifier que l'enseignant existe
      const enseignant = await db.Enseignant.findByPk(enseignantId);
      if (!enseignant) {
        throw AppError.notFound(`Enseignant ${enseignantId} non trouvé`, 'ENSEIGNANT_NOT_FOUND');
      }

      // Vérifier si l'association existe déjà
      const existingAssociation = await db.CoursEnseignant.findOne({
        where: { cours_id: coursId, enseignant_id: enseignantId }
      });

      if (existingAssociation) {
        continue; // Ignorer si déjà assigné
      }

      // Gérer le statut principal
      let estPrincipalFinal = estPrincipal;
      if (estPrincipal && principalDefini) {
        estPrincipalFinal = false; // Ne peut y avoir qu'un seul principal
      } else if (estPrincipal) {
        principalDefini = true;
      }

      const association = await db.CoursEnseignant.create({
        cours_id: coursId,
        enseignant_id: enseignantId,
        role,
        estPrincipal: estPrincipalFinal
      });

      associations.push(association);
    }

    return associations;
  }
}

module.exports = new CoursEnseignantService();