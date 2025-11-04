// backend/src/controllers/classe.controller.js

const classeService = require('../services/classe.service');

class ClasseController {
  async create(req, res) {
    try {
      const classe = await classeService.create(req.body);
      res.status(201).json(classe);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findAll(req, res) {
    try {
      const classes = await classeService.findAll();
      res.status(200).json(classes);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des classes.' });
    }
  }

  async findOne(req, res) {
    try {
      const classe = await classeService.findOne(req.params.id);
      res.status(200).json(classe);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updatedClasse = await classeService.update(req.params.id, req.body);
      res.status(200).json(updatedClasse);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await classeService.delete(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // --- Contrôleurs pour la relation Plusieurs-à-Plusieurs ---

  async addCoursToClasse(req, res) {
    try {
      const { classeId, coursId } = req.params;
      const result = await classeService.addCoursToClasse(classeId, coursId);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async removeCoursFromClasse(req, res) {
    try {
      const { classeId, coursId } = req.params;
      const result = await classeService.removeCoursFromClasse(classeId, coursId);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new ClasseController();