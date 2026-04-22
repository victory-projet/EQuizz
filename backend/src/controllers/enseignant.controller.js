// backend/src/controllers/enseignant.controller.js

const enseignantService = require('../services/enseignant.service');
const asyncHandler = require('../utils/asyncHandler');

class EnseignantController {
  findAll = asyncHandler(async (req, res) => {
    // Filtrer par école si l'utilisateur est un admin (pas super-admin)
    const ecoleId = req.user.role === 'admin'
      ? (req.user.Administrateur?.ecole_id || req.user.Administrateur?.dataValues?.ecole_id)
      : null;
    const enseignants = await enseignantService.findAll(ecoleId);
    res.status(200).json(enseignants);
  });

  findOne = asyncHandler(async (req, res) => {
    const enseignant = await enseignantService.findOne(req.params.id);
    res.status(200).json(enseignant);
  });

  create = asyncHandler(async (req, res) => {
    const data = { ...req.body };
    // Pour un admin d'école, rattacher automatiquement à son école
    if (req.user?.role === 'admin') {
      const ecoleId = req.user?.Administrateur?.ecole_id
        || req.user?.Administrateur?.dataValues?.ecole_id
        || req.user?.Administrateur?.Ecole?.id;
      if (ecoleId) data.ecole_id = ecoleId;
    }
    if (!data.ecole_id && data.ecoleId) data.ecole_id = data.ecoleId;
    const enseignant = await enseignantService.create(data);
    res.status(201).json(enseignant);
  });

  update = asyncHandler(async (req, res) => {
    const enseignant = await enseignantService.update(req.params.id, req.body);
    res.status(200).json(enseignant);
  });

  delete = asyncHandler(async (req, res) => {
    await enseignantService.delete(req.params.id);
    res.status(200).json({ message: 'Enseignant supprimé avec succès' });
  });
}

module.exports = new EnseignantController();
