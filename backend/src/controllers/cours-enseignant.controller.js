const coursEnseignantService = require('../services/cours-enseignant.service');
const asyncHandler = require('../utils/asyncHandler');

class CoursEnseignantController {
  /**
   * Assigner un enseignant à un cours
   * POST /api/cours/:coursId/enseignants
   */
  assignerEnseignant = asyncHandler(async (req, res) => {
    const { coursId } = req.params;
    const { enseignantId, role, estPrincipal } = req.body;

    const association = await coursEnseignantService.assignerEnseignant(
      coursId, 
      enseignantId, 
      role, 
      estPrincipal
    );

    res.status(201).json({
      message: 'Enseignant assigné au cours avec succès',
      association
    });
  });

  /**
   * Retirer un enseignant d'un cours
   * DELETE /api/cours/:coursId/enseignants/:enseignantId
   */
  retirerEnseignant = asyncHandler(async (req, res) => {
    const { coursId, enseignantId } = req.params;

    const result = await coursEnseignantService.retirerEnseignant(coursId, enseignantId);

    res.status(200).json(result);
  });

  /**
   * Modifier le rôle d'un enseignant dans un cours
   * PUT /api/cours/:coursId/enseignants/:enseignantId
   */
  modifierRole = asyncHandler(async (req, res) => {
    const { coursId, enseignantId } = req.params;
    const { role, estPrincipal } = req.body;

    const association = await coursEnseignantService.modifierRole(
      coursId, 
      enseignantId, 
      role, 
      estPrincipal
    );

    res.status(200).json({
      message: 'Rôle modifié avec succès',
      association
    });
  });

  /**
   * Obtenir tous les enseignants d'un cours
   * GET /api/cours/:coursId/enseignants
   */
  getEnseignantsByCours = asyncHandler(async (req, res) => {
    const { coursId } = req.params;

    const enseignants = await coursEnseignantService.getEnseignantsByCours(coursId);

    res.status(200).json({
      enseignants,
      total: enseignants.length
    });
  });

  /**
   * Obtenir tous les cours d'un enseignant
   * GET /api/enseignants/:enseignantId/cours
   */
  getCoursByEnseignant = asyncHandler(async (req, res) => {
    const { enseignantId } = req.params;

    const cours = await coursEnseignantService.getCoursByEnseignant(enseignantId);

    res.status(200).json({
      cours,
      total: cours.length
    });
  });

  /**
   * Assigner plusieurs enseignants à un cours
   * POST /api/cours/:coursId/enseignants/bulk
   */
  assignerPlusieursEnseignants = asyncHandler(async (req, res) => {
    const { coursId } = req.params;
    const { enseignants } = req.body;

    if (!Array.isArray(enseignants) || enseignants.length === 0) {
      return res.status(400).json({
        error: 'Le tableau des enseignants est requis et ne peut pas être vide'
      });
    }

    const associations = await coursEnseignantService.assignerPlusieursEnseignants(
      coursId, 
      enseignants
    );

    res.status(201).json({
      message: `${associations.length} enseignant(s) assigné(s) au cours avec succès`,
      associations
    });
  });
}

module.exports = new CoursEnseignantController();