// backend/src/repositories/evaluation.repository.js

const db = require('../models');

class EvaluationRepository {
  async create(data, transaction) {
    return db.Evaluation.create(data, { transaction });
  }

  async findAll() {
    return db.Evaluation.findAll({
      include: [
        { 
          model: db.Cours,
          required: false // Allow evaluations without courses for debugging
        },
        { 
          model: db.Quizz, 
          include: [db.Question],
          required: false
        },
        { 
          model: db.Classe,
          required: false
        }
      ],
      order: [['dateDebut', 'DESC']]
    });
  }

  async findById(id) {
    return db.Evaluation.findByPk(id, {
      include: [
        { 
          model: db.Cours,
          required: false
        },
        { 
          model: db.Quizz, 
          include: [db.Question],
          required: false
        },
        { 
          model: db.Classe,
          required: false
        }
      ]
    });
  }

  async update(id, data) {
    const evaluation = await db.Evaluation.findByPk(id);
    if (evaluation) {
      return evaluation.update(data);
    }
    return null;
  }

  async delete(id) {
    // La suppression en cascade s'occupera de supprimer le Quizz associé
    return db.Evaluation.destroy({
      where: { id: id }
    });
  }

  async duplicate(id, adminId, transaction) {
    // Récupérer l'évaluation originale avec toutes ses relations
    const originalEvaluation = await db.Evaluation.findByPk(id, {
      include: [
        { model: db.Cours },
        { model: db.Quizz, include: [db.Question] },
        { model: db.Classe }
      ]
    });

    if (!originalEvaluation) {
      throw new Error('Évaluation non trouvée');
    }

    // Vérifier que l'évaluation est en statut BROUILLON
    if (originalEvaluation.statut !== 'BROUILLON') {
      throw new Error('Seules les évaluations en brouillon peuvent être dupliquées');
    }

    // Créer la nouvelle évaluation (copie)
    const evaluationData = {
      titre: `${originalEvaluation.titre} (Copie)`,
      description: originalEvaluation.description,
      dateDebut: originalEvaluation.dateDebut,
      dateFin: originalEvaluation.dateFin,
      statut: 'BROUILLON', // Toujours créer en brouillon
      administrateur_id: adminId, // Utiliser l'ID de l'admin connecté
      cours_id: originalEvaluation.cours_id,
      coursId: originalEvaluation.coursId,
      classeId: originalEvaluation.classeId
    };

    const newEvaluation = await db.Evaluation.create(evaluationData, { transaction });

    // Si l'évaluation originale a un quizz, le dupliquer aussi
    if (originalEvaluation.Quizz) {
      const quizzData = {
        titre: originalEvaluation.Quizz.titre,
        description: originalEvaluation.Quizz.description,
        evaluation_id: newEvaluation.id // Utiliser evaluation_id au lieu de evaluationId
      };

      const newQuizz = await db.Quizz.create(quizzData, { transaction });

      // Dupliquer les questions si elles existent
      if (originalEvaluation.Quizz.Questions && originalEvaluation.Quizz.Questions.length > 0) {
        const questionsData = originalEvaluation.Quizz.Questions.map(question => ({
          enonce: question.enonce,
          typeQuestion: question.typeQuestion,
          options: question.options,
          ordre: question.ordre,
          quizz_id: newQuizz.id // Utiliser quizz_id au lieu de quizzId
        }));

        await db.Question.bulkCreate(questionsData, { transaction });
      }

      // Mettre à jour l'évaluation avec l'ID du quizz
      await newEvaluation.update({ quizzId: newQuizz.id }, { transaction });
    }

    // Retourner l'évaluation complète avec ses relations
    return this.findById(newEvaluation.id);
  }
}

module.exports = new EvaluationRepository();