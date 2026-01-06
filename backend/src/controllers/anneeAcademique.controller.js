const anneeAcademiqueService = require('../services/anneeAcademique.service');
const asyncHandler = require('../utils/asyncHandler');

class AnneeAcademiqueController {
  // GET /api/academic/annees-academiques
  findAll = asyncHandler(async (req, res) => {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      estActive: req.query.estActive,
      estArchive: req.query.estArchive
    };

    const anneesAcademiques = await anneeAcademiqueService.findAll(options);
    
    res.status(200).json({
      success: true,
      data: anneesAcademiques
    });
  });

  // GET /api/academic/annees-academiques/:id
  findOne = asyncHandler(async (req, res) => {
    const anneeAcademique = await anneeAcademiqueService.findById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: anneeAcademique
    });
  });

  // POST /api/academic/annees-academiques
  create = asyncHandler(async (req, res) => {
    const anneeAcademique = await anneeAcademiqueService.create(req.body);
    
    res.status(201).json({
      success: true,
      data: anneeAcademique,
      message: 'Année académique créée avec succès'
    });
  });

  // PUT /api/academic/annees-academiques/:id
  update = asyncHandler(async (req, res) => {
    const anneeAcademique = await anneeAcademiqueService.update(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      data: anneeAcademique,
      message: 'Année académique mise à jour avec succès'
    });
  });

  // DELETE /api/academic/annees-academiques/:id
  delete = asyncHandler(async (req, res) => {
    const result = await anneeAcademiqueService.delete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  });

  // PUT /api/academic/annees-academiques/:id/activate
  setActive = asyncHandler(async (req, res) => {
    const anneeAcademique = await anneeAcademiqueService.setActive(req.params.id);
    
    res.status(200).json({
      success: true,
      data: anneeAcademique,
      message: 'Année académique activée avec succès'
    });
  });

  // GET /api/academic/annees-academiques/active
  getActive = asyncHandler(async (req, res) => {
    const anneeAcademique = await anneeAcademiqueService.getActive();
    
    res.status(200).json({
      success: true,
      data: anneeAcademique
    });
  });
}

module.exports = new AnneeAcademiqueController();