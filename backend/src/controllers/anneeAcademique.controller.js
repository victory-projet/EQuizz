// backend/src/controllers/anneeAcademique.controller.js

const anneeAcademiqueService = require('../services/anneeAcademique.service');

class AnneeAcademiqueController {
  async create(req, res) {
    try {
      const annee = await anneeAcademiqueService.create(req.body);
      res.status(201).json(annee);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findAll(req, res) {
    try {
      const annees = await anneeAcademiqueService.findAll();
      res.status(200).json(annees);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des années académiques.' });
    }
  }

  async findOne(req, res) {
    try {
      const annee = await anneeAcademiqueService.findOne(req.params.id);
      res.status(200).json(annee);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updatedAnnee = await anneeAcademiqueService.update(req.params.id, req.body);
      res.status(200).json(updatedAnnee);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await anneeAcademiqueService.delete(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new AnneeAcademiqueController();