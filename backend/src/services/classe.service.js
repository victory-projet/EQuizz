// backend/src/services/classe.service.js

const classeRepository = require('../repositories/classe.repository');
const ecoleRepository = require('../repositories/ecole.repository');
const coursRepository = require('../repositories/cours.repository');
const db = require('../models');
const AppError = require('../utils/AppError');

class ClasseService {
  async create(data) {
    let ecoleId = data.ecole_id;
    
    if (!ecoleId) {
      // Fallback : première école disponible (findAll retourne {count, rows})
      const result = await ecoleRepository.findAll();
      const ecoles = result.rows || result;
      if (ecoles && ecoles.length > 0) {
        ecoleId = ecoles[0].id;
      }
    }
    
    if (!ecoleId) {
      throw new Error('École non trouvée. Impossible de créer la classe.');
    }

    // Vérifier si une classe avec ce nom existe déjà dans la même école
    const existing = await db.Classe.scope('all').findOne({ where: { nom: data.nom, ecole_id: ecoleId } });
    if (existing) {
      throw AppError.conflict(`Une classe avec le nom "${data.nom}" existe déjà dans cette école.`, 'DUPLICATE_ERROR');
    }
    
    return classeRepository.create({ ...data, ecole_id: ecoleId });
  }

  async findAll(includeArchived = false, ecoleId = null) {
    const scope = includeArchived ? 'all' : 'defaultScope';
    const options = {
      include: [
        { model: db.Ecole },
        { model: db.AnneeAcademique },
        { model: db.Cours },
        { model: db.Etudiant }
      ],
      order: [['nom', 'ASC']]
    };

    if (ecoleId) {
      options.where = { ecole_id: ecoleId };
    }

    if (includeArchived) {
      return classeRepository.findAllWithScope('all', options);
    }
    return classeRepository.findAll(options);
  }

  async findOne(id) {
    const classe = await classeRepository.findById(id);
    if (!classe) {
      throw new Error('Classe non trouvée.');
    }
    return classe;
  }

  async update(id, data) {
    const updatedClasse = await classeRepository.update(id, data);
    if (!updatedClasse) {
      throw new Error('Classe non trouvée.');
    }
    return updatedClasse;
  }

  async delete(id) {
    const result = await classeRepository.delete(id);
    if (result === 0) {
      throw new Error('Classe non trouvée.');
    }
    return { message: 'Classe supprimée avec succès.' };
  }

  // --- Méthodes d'archivage ---

  async archive(id) {
    const classe = await classeRepository.findByIdWithScope(id, 'all');
    if (!classe) {
      throw new Error('Classe non trouvée.');
    }
    
    const updatedClasse = await classeRepository.update(id, { estArchive: true });
    return updatedClasse;
  }

  async restore(id) {
    const classe = await classeRepository.findByIdWithScope(id, 'all');
    if (!classe) {
      throw new Error('Classe non trouvée.');
    }
    
    const updatedClasse = await classeRepository.update(id, { estArchive: false });
    return updatedClasse;
  }

  // --- Logique pour la relation Plusieurs-à-Plusieurs ---

  async addCoursToClasse(classeId, coursId, anneeAcademiqueId = null) {
    const classe = await classeRepository.findById(classeId);
    if (!classe) {
      throw new Error('Classe non trouvée.');
    }
    const cours = await coursRepository.findById(coursId);
    if (!cours) {
      throw new Error('Cours non trouvé.');
    }
    // Passer anneeAcademiqueId comme attribut de la table de jonction
    await classe.addCours(cours, { through: { anneeAcademiqueId: anneeAcademiqueId || null } });
    return { message: 'Cours ajouté à la classe avec succès.' };
  }

  async removeCoursFromClasse(classeId, coursId) {
    const classe = await classeRepository.findById(classeId);
    if (!classe) {
      throw new Error('Classe non trouvée.');
    }
    const cours = await coursRepository.findById(coursId);
    if (!cours) {
      throw new Error('Cours non trouvé.');
    }
    // La méthode removeCours est aussi ajoutée par Sequelize
    await classe.removeCours(cours);
    return { message: 'Cours retiré de la classe avec succès.' };
  }

  async addEtudiantToClasse(classeId, etudiantId) {
    const classe = await classeRepository.findById(classeId);
    if (!classe) {
      throw new Error('Classe non trouvée.');
    }
    const etudiantRepository = require('../repositories/etudiant.repository');
    const etudiant = await etudiantRepository.findById(etudiantId);
    if (!etudiant) {
      throw new Error('Étudiant non trouvé.');
    }
    // Mettre à jour la classe_id de l'étudiant
    await etudiant.update({ classe_id: classeId });
    return { message: 'Étudiant ajouté à la classe avec succès.' };
  }

  async removeEtudiantFromClasse(classeId, etudiantId) {
    const classe = await classeRepository.findById(classeId);
    if (!classe) {
      throw new Error('Classe non trouvée.');
    }
    const etudiantRepository = require('../repositories/etudiant.repository');
    const etudiant = await etudiantRepository.findById(etudiantId);
    if (!etudiant) {
      throw new Error('Étudiant non trouvé.');
    }
    // Retirer la classe_id de l'étudiant
    await etudiant.update({ classe_id: null });
    return { message: 'Étudiant retiré de la classe avec succès.' };
  }
}

module.exports = new ClasseService();