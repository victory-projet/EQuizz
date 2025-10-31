// backend/src/controllers/cours.controller.js

const coursService = require('../services/cours.service');

class CoursController {
  async create(req, res) {
    try {
      const cours = await coursService.create(req.body);
      res.status(201).json(cours);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findAll(req, res) {
    try {
      const coursList = await coursService.findAll();
      res.status(200).json(coursList);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des cours." });
    }
  }

  async findOne(req, res) {
    try {
      const cours = await coursService.findOne(req.params.id);
      res.status(200).json(cours);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updatedCours = await coursService.update(req.params.id, req.body);
      res.status(200).json(updatedCours);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await coursService.delete(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new CoursController();