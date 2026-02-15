// backend/src/services/etudiant.service.js

const db = require('../models');
const etudiantRepository = require('../repositories/etudiant.repository');
const AppError = require('../utils/AppError');
const { genererMatricule } = require('../utils/matriculeGenerator');

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
    const { nom, prenom, email, classe_id } = data;

    // Vérifier si l'email existe déjà
    const existingUser = await db.Utilisateur.findOne({ where: { email } });
    if (existingUser) {
      throw AppError.conflict('Cet email est déjà utilisé', 'EMAIL_EXISTS');
    }

    // Récupérer la classe pour obtenir l'école et l'année académique
    const classe = await db.Classe.findByPk(classe_id, {
      include: [
        { model: db.Ecole },
        { model: db.AnneeAcademique }
      ]
    });

    if (!classe) {
      throw AppError.notFound('Classe non trouvée', 'CLASS_NOT_FOUND');
    }

    const transaction = await db.sequelize.transaction();

    try {
      // Générer automatiquement le matricule
      const matricule = await genererMatricule(classe.ecole_id, classe.anneeAcademiqueId);

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

      // Créer l'entrée dans l'historique (première inscription)
      await db.HistoriqueEtudiant.create({
        etudiant_id: etudiant.id,
        matricule: matricule,
        ecole_id: classe.ecole_id,
        classe_id: classe_id,
        dateDebut: new Date(),
        dateFin: null,
        estPeriodeActuelle: true
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

    const { nom, prenom, email, idCarte } = data;

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

      // Mettre à jour l'idCarte si fourni
      if (idCarte !== undefined) {
        await etudiant.update({ idCarte }, { transaction });
      }

      await transaction.commit();

      return this.findOne(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Transfère un étudiant vers une nouvelle classe (même école ou autre école)
   * @param {string} id - UUID de l'étudiant
   * @param {string} nouvelleClasseId - UUID de la nouvelle classe
   * @param {Date} dateTransfert - Date du transfert (optionnel, par défaut maintenant)
   * @returns {Promise<Object>} - Étudiant mis à jour avec son historique
   */
  async transferer(id, nouvelleClasseId, dateTransfert = new Date()) {
    const etudiant = await db.Etudiant.findByPk(id, {
      include: [{ model: db.Classe }]
    });
    
    if (!etudiant) {
      throw AppError.notFound('Étudiant non trouvé', 'STUDENT_NOT_FOUND');
    }

    if (!nouvelleClasseId) {
      throw AppError.badRequest('La nouvelle classe est requise', 'CLASS_REQUIRED');
    }

    if (nouvelleClasseId === etudiant.classe_id) {
      throw AppError.badRequest('L\'étudiant est déjà dans cette classe', 'SAME_CLASS');
    }

    const nouvelleClasse = await db.Classe.findByPk(nouvelleClasseId, {
      include: [
        { model: db.Ecole },
        { model: db.AnneeAcademique }
      ]
    });

    if (!nouvelleClasse) {
      throw AppError.notFound('Nouvelle classe non trouvée', 'CLASS_NOT_FOUND');
    }

    const ancienneEcoleId = etudiant.Classe.ecole_id;
    const nouvelleEcoleId = nouvelleClasse.ecole_id;
    const estChangementEcole = ancienneEcoleId !== nouvelleEcoleId;

    const transaction = await db.sequelize.transaction();

    try {
      // Clôturer l'historique actuel
      await db.HistoriqueEtudiant.update(
        {
          dateFin: dateTransfert,
          estPeriodeActuelle: false
        },
        {
          where: {
            etudiant_id: id,
            estPeriodeActuelle: true
          },
          transaction
        }
      );

      let nouveauMatricule = etudiant.matricule;

      // Si changement d'école, générer un nouveau matricule
      if (estChangementEcole) {
        nouveauMatricule = await genererMatricule(
          nouvelleEcoleId,
          nouvelleClasse.anneeAcademiqueId
        );
      }

      // Mettre à jour l'étudiant
      await etudiant.update({
        matricule: nouveauMatricule,
        classe_id: nouvelleClasseId
      }, { transaction });

      // Créer une nouvelle entrée dans l'historique
      const nouvelHistorique = await db.HistoriqueEtudiant.create({
        etudiant_id: id,
        matricule: nouveauMatricule,
        ecole_id: nouvelleEcoleId,
        classe_id: nouvelleClasseId,
        dateDebut: dateTransfert,
        dateFin: null,
        estPeriodeActuelle: true
      }, { transaction });

      await transaction.commit();

      // Retourner l'étudiant avec son historique complet
      const etudiantMisAJour = await this.findOne(id);
      const historique = await this.getHistorique(id);

      return {
        etudiant: etudiantMisAJour,
        historique,
        transfert: {
          estChangementEcole,
          ancienMatricule: estChangementEcole ? etudiant.matricule : null,
          nouveauMatricule,
          dateTransfert
        }
      };
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

  /**
   * Récupère l'historique complet d'un étudiant
   * @param {string} id - UUID de l'étudiant
   * @returns {Promise<Array>} - Historique de l'étudiant
   */
  async getHistorique(id) {
    const etudiant = await db.Etudiant.findByPk(id);
    if (!etudiant) {
      throw AppError.notFound('Étudiant non trouvé', 'STUDENT_NOT_FOUND');
    }

    const historique = await db.HistoriqueEtudiant.findAll({
      where: { etudiant_id: id },
      include: [
        {
          model: db.Ecole,
          attributes: ['id', 'nom', 'adresse']
        },
        {
          model: db.Classe,
          attributes: ['id', 'nom', 'niveau']
        }
      ],
      order: [['dateDebut', 'DESC']]
    });

    return historique;
  }
}

module.exports = new EtudiantService();
