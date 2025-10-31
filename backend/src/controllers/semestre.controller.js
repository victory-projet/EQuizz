// backend/src/controllers/semestre.controller.js

const semestreService = require('../services/semestre.service');

class SemestreController {
  async create(req, res) {
    try {
      const semestre = await semestreService.create(req.body);
      res.status(201).json(semestre);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Ce contrôleur récupère les semestres d'une année spécifique
  async findAllByAnnee(req, res) {
    try {
      const { anneeId } = req.params;
      const semestres = await semestreService.findAllByAnnee(anneeId);
      res.status(200).json(semestres);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des semestres." });
    }
  }

  async findOne(req, res) {
    try {
      const semestre = await semestreService.findOne(req.params.id);
      res.status(200).json(semestre);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updatedSemestre = await semestreService.update(req.params.id, req.body);
      res.status(200).json(updatedSemestre);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await semestreService.delete(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new SemestreController();