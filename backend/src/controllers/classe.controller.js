const db = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ErrorHandler = require('../middlewares/errorHandler.middleware');
const ResponseFormatter = require('../utils/ResponseFormatter');

class ClasseController {
  findAll = asyncHandler(async (req, res) => {
    // Paramètres de pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Paramètres de recherche
    const search = req.query.search || '';
    const whereClause = {};
    
    if (search) {
      whereClause[db.Sequelize.Op.or] = [
        { nom: { [db.Sequelize.Op.like]: `%${search}%` } },
        { niveau: { [db.Sequelize.Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: classes } = await db.Classe.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.AnneeAcademique,
          required: false
        },
        {
          model: db.Etudiant,
          attributes: ['id'],
          required: false
        }
      ],
      order: [['niveau', 'ASC'], ['nom', 'ASC']],
      limit,
      offset
    });

    // Calculer l'effectif pour chaque classe
    const classesWithEffectif = classes.map(classe => ({
      ...classe.toJSON(),
      effectif: classe.Etudiants ? classe.Etudiants.length : 0
    }));

    const totalPages = Math.ceil(count / limit);

    // Format compatible avec le frontend Angular
    return ResponseFormatter.compatibilityFormat(res, classesWithEffectif, {
      currentPage: page,
      totalPages,
      totalItems: count,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }, 'classes');
  });

  findOne = asyncHandler(async (req, res) => {
    const classe = await db.Classe.findByPk(req.params.id, {
      include: [
        {
          model: db.AnneeAcademique,
          required: false
        },
        {
          model: db.Etudiant,
          include: [{ model: db.Utilisateur }]
        },
        {
          model: db.Cours,
          through: { attributes: [] }
        }
      ]
    });

    if (!classe) {
      throw ErrorHandler.createError('Classe non trouvée.', 404, 'NOT_FOUND');
    }

    const classeWithEffectif = {
      ...classe.toJSON(),
      effectif: classe.Etudiants ? classe.Etudiants.length : 0
    };

    return ResponseFormatter.success(res, classeWithEffectif, 'Classe récupérée avec succès');
  });

  create = asyncHandler(async (req, res) => {
    const classe = await db.Classe.create(req.body);
    return ResponseFormatter.created(res, classe, 'Classe créée avec succès');
  });

  update = asyncHandler(async (req, res) => {
    const [updated] = await db.Classe.update(req.body, {
      where: { id: req.params.id }
    });

    if (!updated) {
      throw ErrorHandler.createError('Classe non trouvée.', 404, 'NOT_FOUND');
    }

    const classe = await db.Classe.findByPk(req.params.id);
    return ResponseFormatter.success(res, classe, 'Classe mise à jour avec succès');
  });

  delete = asyncHandler(async (req, res) => {
    const deleted = await db.Classe.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      throw ErrorHandler.createError('Classe non trouvée.', 404, 'NOT_FOUND');
    }

    return ResponseFormatter.deleted(res, 'Classe supprimée avec succès.');
  });
}

module.exports = new ClasseController();