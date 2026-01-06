const db = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ErrorHandler = require('../middlewares/errorHandler.middleware');
const ResponseFormatter = require('../utils/ResponseFormatter');

class CoursController {
  findAll = asyncHandler(async (req, res) => {
    // Paramètres de pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Paramètres de recherche
    const search = req.query.search || '';
    const whereClause = { estArchive: false };
    
    if (search) {
      whereClause[db.Sequelize.Op.or] = [
        { nom: { [db.Sequelize.Op.like]: `%${search}%` } },
        { code: { [db.Sequelize.Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: cours } = await db.Cours.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.AnneeAcademique,
          required: false
        },
        {
          model: db.Enseignant,
          through: { attributes: [] },
          include: [{
            model: db.Utilisateur,
            attributes: ['nom', 'prenom', 'email']
          }]
        }
      ],
      order: [['nom', 'ASC']],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    // Format compatible avec le frontend Angular
    return ResponseFormatter.compatibilityFormat(res, cours, {
      currentPage: page,
      totalPages,
      totalItems: count,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }, 'cours');
  });

  findOne = asyncHandler(async (req, res) => {
    const cours = await db.Cours.findByPk(req.params.id, {
      include: [
        {
          model: db.AnneeAcademique,
          required: false
        },
        {
          model: db.Classe,
          through: { attributes: [] }
        },
        {
          model: db.Enseignant,
          through: { attributes: [] },
          include: [{
            model: db.Utilisateur,
            attributes: ['nom', 'prenom', 'email']
          }]
        }
      ]
    });

    if (!cours) {
      throw ErrorHandler.createError('Cours non trouvé.', 404, 'NOT_FOUND');
    }

    return ResponseFormatter.success(res, cours, 'Cours récupéré avec succès');
  });

  create = asyncHandler(async (req, res) => {
    const { enseignantIds, ...coursData } = req.body;
    
    const cours = await db.Cours.create(coursData);
    
    // Associer les enseignants si fournis
    if (enseignantIds && enseignantIds.length > 0) {
      await cours.setEnseignants(enseignantIds);
    }
    
    // Récupérer le cours avec ses relations
    const coursComplet = await db.Cours.findByPk(cours.id, {
      include: [
        {
          model: db.Enseignant,
          through: { attributes: [] },
          include: [{
            model: db.Utilisateur,
            attributes: ['nom', 'prenom', 'email']
          }]
        }
      ]
    });
    
    return ResponseFormatter.created(res, coursComplet, 'Cours créé avec succès');
  });

  update = asyncHandler(async (req, res) => {
    const { enseignantIds, ...coursData } = req.body;
    
    const [updated] = await db.Cours.update(coursData, {
      where: { id: req.params.id }
    });

    if (!updated) {
      throw ErrorHandler.createError('Cours non trouvé.', 404, 'NOT_FOUND');
    }

    const cours = await db.Cours.findByPk(req.params.id);
    
    // Mettre à jour les associations avec les enseignants si fournis
    if (enseignantIds !== undefined) {
      await cours.setEnseignants(enseignantIds);
    }
    
    // Récupérer le cours avec ses relations
    const coursComplet = await db.Cours.findByPk(req.params.id, {
      include: [
        {
          model: db.Enseignant,
          through: { attributes: [] },
          include: [{
            model: db.Utilisateur,
            attributes: ['nom', 'prenom', 'email']
          }]
        }
      ]
    });
    
    return ResponseFormatter.success(res, coursComplet, 'Cours mis à jour avec succès');
  });

  delete = asyncHandler(async (req, res) => {
    // Soft delete - marquer comme archivé
    const [updated] = await db.Cours.update(
      { estArchive: true },
      { where: { id: req.params.id } }
    );

    if (!updated) {
      throw ErrorHandler.createError('Cours non trouvé.', 404, 'NOT_FOUND');
    }

    return ResponseFormatter.success(res, null, 'Cours archivé avec succès.');
  });

  // Nouvelle méthode pour gérer les enseignants d'un cours
  addEnseignant = asyncHandler(async (req, res) => {
    const { enseignantId } = req.body;
    const cours = await db.Cours.findByPk(req.params.id);
    
    if (!cours) {
      throw ErrorHandler.createError('Cours non trouvé.', 404, 'NOT_FOUND');
    }
    
    const enseignant = await db.Enseignant.findByPk(enseignantId);
    if (!enseignant) {
      throw ErrorHandler.createError('Enseignant non trouvé.', 404, 'NOT_FOUND');
    }
    
    await cours.addEnseignant(enseignant);
    
    res.status(200).json({ message: 'Enseignant ajouté au cours avec succès.' });
  });

  removeEnseignant = asyncHandler(async (req, res) => {
    const { enseignantId } = req.params;
    const cours = await db.Cours.findByPk(req.params.id);
    
    if (!cours) {
      throw ErrorHandler.createError('Cours non trouvé.', 404, 'NOT_FOUND');
    }
    
    const enseignant = await db.Enseignant.findByPk(enseignantId);
    if (!enseignant) {
      throw ErrorHandler.createError('Enseignant non trouvé.', 404, 'NOT_FOUND');
    }
    
    await cours.removeEnseignant(enseignant);
    
    res.status(200).json({ message: 'Enseignant retiré du cours avec succès.' });
  });
}

module.exports = new CoursController();