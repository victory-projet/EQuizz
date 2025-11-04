// backend/src/services/evaluation.service.js

const db = require('../models');
const evaluationRepository = require('../repositories/evaluation.repository');
const coursRepository = require('../repositories/cours.repository');
const questionRepository = require('../repositories/question.repository');
const ExcelJS = require('exceljs'); 

class EvaluationService {
  /**
   * Crée une Évaluation et son Quizz associé dans une transaction.
   * @param {object} data - Données pour l'évaluation. Doit contenir cours_id.
   */
  async create(data) {

    const { classeIds, ...evaluationData } = data;
    if (!classeIds || !Array.isArray(classeIds) || classeIds.length === 0) {
      throw new Error('Au moins une classe doit être ciblée.');
    }

    const transaction = await db.sequelize.transaction();

    try {
      // 1. Valider que le cours associé existe
      const cours = await coursRepository.findById(data.cours_id);
      if (!cours) {
        throw new Error('Cours non trouvé. Impossible de créer l\'évaluation.');
      }

      // La méthode 'addClasses' est automatiquement fournie par Sequelize
      await evaluation.addClasses(classeIds, { transaction });

      // 2. Créer l'évaluation
      const evaluation = await evaluationRepository.create(data, transaction);

      // 3. Créer le Quizz vide associé à cette évaluation
      await db.Quizz.create({
        titre: `Quizz pour ${evaluation.titre}`,
        evaluation_id: evaluation.id
      }, { transaction });

      // 4. Si tout s'est bien passé, on valide la transaction
      await transaction.commit();
      
      // 5. On retourne l'évaluation complète avec son quizz
      return evaluationRepository.findById(evaluation.id);

    } catch (error) {
      // 6. En cas d'erreur, on annule toutes les opérations
      await transaction.rollback();
      throw error; // Propager l'erreur pour que le contrôleur la gère
    }
  }

  async findAll() {
    return evaluationRepository.findAll();
  }

  async findOne(id) {
    const evaluation = await evaluationRepository.findById(id);
    if (!evaluation) {
      throw new Error('Évaluation non trouvée.');
    }
    return evaluation;
  }

  async update(id, data) {
    const updatedEvaluation = await evaluationRepository.update(id, data);
    if (!updatedEvaluation) {
      throw new Error('Évaluation non trouvée.');
    }
    return updatedEvaluation;
  }

  async delete(id) {
    const result = await evaluationRepository.delete(id);
    if (result === 0) {
      throw new Error('Évaluation non trouvée.');
    }
    return { message: 'Évaluation supprimée avec succès.' };
  }

  /**
   * Ajoute une nouvelle question à un quizz.
   * @param {string} quizzId - L'ID du quizz auquel ajouter la question.
   * @param {object} questionData - Les données de la question (enonce, typeQuestion, options).
   */
  async addQuestionToQuizz(quizzId, questionData) {
    // On s'assure que le quizz existe (implicitement via la clé étrangère)
    // On ajoute l'ID du quizz aux données de la question avant de la créer.
    const dataToCreate = { ...questionData, quizz_id: quizzId };
    return questionRepository.create(dataToCreate);
  }

  /**
   * Met à jour une question existante.
   * @param {string} questionId - L'ID de la question à modifier.
   * @param {object} questionData - Les nouvelles données.
   */
  async updateQuestion(questionId, questionData) {
    const updatedQuestion = await questionRepository.update(questionId, questionData);
    if (!updatedQuestion) {
      throw new Error('Question non trouvée.');
    }
    return updatedQuestion;
  }

  /**
   * Supprime une question d'un quizz.
   * @param {string} questionId - L'ID de la question à supprimer.
   */
  async removeQuestion(questionId) {
    const result = await questionRepository.delete(questionId);
    if (result === 0) {
      throw new Error('Question non trouvée.');
    }
    return { message: 'Question supprimée avec succès.' };
  }

  /**
   * Importe des questions depuis un buffer de fichier Excel et les ajoute à un quizz.
   * @param {string} quizzId - L'ID du quizz.
   * @param {Buffer} fileBuffer - Le contenu du fichier Excel.
   */
  async importQuestionsFromExcel(quizzId, fileBuffer) {
    const workbook = new ExcelJS.Workbook(); 
    // Lire les données depuis le buffer en mémoire
    await workbook.xlsx.load(fileBuffer);

    const worksheet = workbook.worksheets[0]; // On prend la première feuille de calcul
    if (!worksheet) {
      throw new Error('Le fichier Excel est vide ou invalide.');
    }

    const questionsToCreate = [];
    
    // On parcourt chaque ligne de la feuille de calcul (en ignorant l'en-tête)
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Ignorer la ligne d'en-tête

      // On s'attend à 3 colonnes: Enonce, Type, Options
      const enonce = row.getCell(1).value;
      const typeQuestion = row.getCell(2).value;
      const optionsRaw = row.getCell(3).value;

      if (!enonce || !typeQuestion) {
        throw new Error(`Erreur à la ligne ${rowNumber}: Les colonnes 'Enonce' et 'Type' sont obligatoires.`);
      }

      let options = [];
      if (typeQuestion === 'CHOIX_MULTIPLE') {
        if (!optionsRaw) {
          throw new Error(`Erreur à la ligne ${rowNumber}: Les options sont obligatoires pour un CHOIX_MULTIPLE.`);
        }
        // Les options sont une chaîne de caractères séparées par des points-virgules
        options = optionsRaw.split(';').map(opt => opt.trim());
      }
      
      questionsToCreate.push({
        enonce,
        typeQuestion,
        options,
        quizz_id: quizzId
      });
    });

    if (questionsToCreate.length === 0) {
      throw new Error('Aucune question valide trouvée dans le fichier.');
    }

    // On insère toutes les questions en une seule fois pour de meilleures performances
    const createdQuestions = await db.Question.bulkCreate(questionsToCreate);
    
    return { count: createdQuestions.length, questions: createdQuestions };
  }
  
}

module.exports = new EvaluationService();