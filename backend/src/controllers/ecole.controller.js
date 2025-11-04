// backend/src/controllers/ecole.controller.js

const ecoleService = require('../services/ecole.service');

class EcoleController {
  
  async create(req, res) {
    try {
      // On passe le corps de la requête au service
      const ecole = await ecoleService.create(req.body);
      // On répond avec le statut 201 (Created) et l'objet créé
      res.status(201).json(ecole);
    } catch (error) {
      // En cas d'erreur (ex: validation), on répond avec le statut 400 (Bad Request)
      res.status(400).json({ message: error.message });
    }
  }

  async findAll(req, res) {
    try {
      const ecoles = await ecoleService.findAll();
      // On répond avec le statut 200 (OK) et la liste des objets
      res.status(200).json(ecoles);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des écoles.' });
    }
  }

  async findOne(req, res) {
    try {
      const { id } = req.params; // On récupère l'ID depuis les paramètres de l'URL
      const ecole = await ecoleService.findOne(id);
      res.status(200).json(ecole);
    } catch (error) {
      // Le service lève une erreur si l'école n'est pas trouvée
      res.status(404).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedEcole = await ecoleService.update(id, data);
      res.status(200).json(updatedEcole);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await ecoleService.delete(id);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new EcoleController();