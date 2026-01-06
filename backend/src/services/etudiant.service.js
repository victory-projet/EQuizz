// backend/src/services/etudiant.service.js

const db = require('../models');
const { Op } = require('sequelize');
const etudiantRepository = require('../repositories/etudiant.repository');
const AppError = require('../utils/AppError');

class EtudiantService {
  async findAll(options = {}) {
    const {
      page = 1,
      limit = 50,
      search = '',
      classeId = null,
      estActif = null,
      orderBy = 'createdAt',
      orderDirection = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    
    // Construire les conditions WHERE
    const whereConditions = {};
    const userWhereConditions = {};
    
    if (classeId) {
      whereConditions.classe_id = classeId;
    }
    
    if (estActif !== null) {
      userWhereConditions.estActif = estActif;
    }
    
    // Recherche textuelle
    if (search) {
      userWhereConditions[Op.or] = [
        { nom: { [Op.iLike]: `%${search}%` } },
        { prenom: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
      
      // Ajouter la recherche par matricule
      whereConditions[Op.or] = [
        { matricule: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await db.Etudiant.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: db.Utilisateur,
          attributes: ['nom', 'prenom', 'email', 'estActif'],
          where: Object.keys(userWhereConditions).length > 0 ? userWhereConditions : undefined
        },
        {
          model: db.Classe,
          attributes: ['id', 'nom', 'niveau'],
          required: false
        }
      ],
      order: [[db.Utilisateur, orderBy, orderDirection]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true // Important pour le count avec les includes
    });

    return {
      etudiants: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: page * limit < count,
        hasPrevPage: page > 1
      }
    };
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
