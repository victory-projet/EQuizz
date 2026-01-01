// backend/src/controllers/semestre.controller.js

const semestreService = require('../services/semestre.service');
const asyncHandler = require('../utils/asyncHandler');

class SemestreController {
  create = asyncHandler(async (req, res) => {
    console.log('📝 Creating semester with data:', req.body);
    
    // Validate required fields
    const { nom, numero, dateDebut, dateFin, annee_academique_id } = req.body;
    
    if (!nom || !numero || !dateDebut || !dateFin || !annee_academique_id) {
      return res.status(400).json({
        error: 'Champs requis manquants',
        required: ['nom', 'numero', 'dateDebut', 'dateFin', 'annee_academique_id'],
        received: req.body
      });
    }
    
    // Validate dates
    const startDate = new Date(dateDebut);
    const endDate = new Date(dateFin);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        error: 'Format de date invalide',
        dateDebut,
        dateFin
      });
    }
    
    if (startDate >= endDate) {
      return res.status(400).json({
        error: 'La date de début doit être antérieure à la date de fin'
      });
    }
    
    try {
      const semestre = await semestreService.create(req.body);
      console.log('✅ Semester created successfully:', semestre.id);
      res.status(201).json(semestre);
    } catch (error) {
      console.error('❌ Error creating semester:', error);
      
      if (error.message.includes('Année académique non trouvée')) {
        return res.status(404).json({
          error: 'Année académique non trouvée',
          annee_academique_id
        });
      }
      
      // Handle Sequelize validation errors
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Erreur de validation',
          details: error.errors.map(e => ({
            field: e.path,
            message: e.message,
            value: e.value
          }))
        });
      }
      
      // Handle unique constraint errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          error: 'Conflit de données',
          details: 'Un semestre avec ces caractéristiques existe déjà'
        });
      }
      
      throw error;
    }
  });

  findAllByAnnee = asyncHandler(async (req, res) => {
    const { anneeId } = req.params;
    const semestres = await semestreService.findAllByAnnee(anneeId);
    res.status(200).json(semestres);
  });

  findOne = asyncHandler(async (req, res) => {
    const semestre = await semestreService.findOne(req.params.id);
    res.status(200).json(semestre);
  });

  update = asyncHandler(async (req, res) => {
    const updatedSemestre = await semestreService.update(req.params.id, req.body);
    res.status(200).json(updatedSemestre);
  });

  delete = asyncHandler(async (req, res) => {
    const result = await semestreService.delete(req.params.id);
    res.status(200).json(result);
  });
}

module.exports = new SemestreController();