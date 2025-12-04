// backend/src/services/evaluation.service.js

const db = require('../models');
const evaluationRepository = require('../repositories/evaluation.repository');
const coursRepository = require('../repositories/cours.repository');
const questionRepository = require('../repositories/question.repository');
const ExcelJS = require('exceljs');
const AppError = require('../utils/AppError');

class EvaluationService {
  /**
   * Crée une Évaluation et son Quizz associé dans une transaction.
   * @param {object} data - Données pour l'évaluation. Doit contenir cours_id.
   * @param {string} adminId - ID de l'administrateur qui crée l'évaluation.
   */
  async create(data, adminId) {
    const { classeIds, ...evaluationData } = data;
    if (!classeIds || !Array.isArray(classeIds) || classeIds.length === 0) {
      throw AppError.badRequest('Au moins une classe doit être ciblée.', 'CLASSES_REQUIRED');
    }

    const transaction = await db.sequelize.transaction();

    try {
      const cours = await coursRepository.findById(evaluationData.cours_id);
      if (!cours) {
        throw AppError.notFound('Cours non trouvé. Impossible de créer l\'évaluation.', 'COURS_NOT_FOUND');
      }

      // Récupérer l'administrateur associé à l'utilisateur
      const admin = await db.Administrateur.findOne({ where: { id: adminId } });
      if (!admin) {
        throw AppError.forbidden('Seuls les administrateurs peuvent créer des évaluations.', 'ADMIN_REQUIRED');
      }

      // Ajouter l'ID de l'administrateur aux données
      evaluationData.administrateur_id = adminId;

      const evaluation = await evaluationRepository.create(evaluationData, transaction);
      await evaluation.addClasses(classeIds, { transaction });

      await db.Quizz.create({
        titre: `Quizz pour ${evaluation.titre}`,
        evaluation_id: evaluation.id
      }, { transaction });

      await transaction.commit();
      return evaluationRepository.findById(evaluation.id);

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findAll() {
    return evaluationRepository.findAll();
  }

  async findOne(id) {
    const evaluation = await evaluationRepository.findById(id);
    if (!evaluation) {
      throw AppError.notFound('Évaluation non trouvée.', 'EVALUATION_NOT_FOUND');
    }
    return evaluation;
  }

  async update(id, data) {
    const updatedEvaluation = await evaluationRepository.update(id, data);
    if (!updatedEvaluation) {
      throw AppError.notFound('Évaluation non trouvée.', 'EVALUATION_NOT_FOUND');
    }
    return updatedEvaluation;
  }

  async publish(id) {
    const evaluation = await evaluationRepository.findById(id);
    if (!evaluation) {
      throw AppError.notFound('Évaluation non trouvée.', 'EVALUATION_NOT_FOUND');
    }

    if (evaluation.statut !== 'BROUILLON') {
      throw AppError.badRequest('Seules les évaluations en brouillon peuvent être publiées.', 'INVALID_STATUS');
    }

    // Vérifier qu'il y a au moins une question
    const questions = await db.Question.count({ where: { quizz_id: evaluation.Quizz.id } });
    if (questions === 0) {
      throw AppError.badRequest('Impossible de publier une évaluation sans questions.', 'NO_QUESTIONS');
    }

    // Mettre à jour le statut
    const updatedEvaluation = await evaluationRepository.update(id, { statut: 'PUBLIEE' });

    // Envoyer les notifications
    const notificationService = require('./notification.service');
    await notificationService.notifyNewEvaluation(id);

    return updatedEvaluation;
  }

  async delete(id) {
    const result = await evaluationRepository.update(id, { estArchive: true });
    if (!result) {
      throw AppError.notFound('Évaluation non trouvée.', 'EVALUATION_NOT_FOUND');
    }
    return { message: 'Évaluation archivée avec succès.' };
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
      throw AppError.notFound('Question non trouvée.', 'QUESTION_NOT_FOUND');
    }
    return updatedQuestion;
  }

  async removeQuestion(questionId) {
    const result = await questionRepository.delete(questionId);
    if (result === 0) {
      throw AppError.notFound('Question non trouvée.', 'QUESTION_NOT_FOUND');
    }
    return { message: 'Question supprimée avec succès.' };
  }

  async importQuestionsFromExcel(quizzId, fileBuffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw AppError.badRequest('Le fichier Excel est vide ou invalide.', 'INVALID_EXCEL_FILE');
    }

    const questionsToCreate = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;

      const enonce = row.getCell(1).value;
      const typeQuestion = row.getCell(2).value;
      const optionsRaw = row.getCell(3).value;

      if (!enonce || !typeQuestion) {
        throw AppError.badRequest(`Erreur à la ligne ${rowNumber}: Les colonnes 'Enonce' et 'Type' sont obligatoires.`, 'INVALID_EXCEL_DATA');
      }

      let options = [];
      if (typeQuestion === 'CHOIX_MULTIPLE') {
        if (!optionsRaw) {
          throw AppError.badRequest(`Erreur à la ligne ${rowNumber}: Les options sont obligatoires pour un CHOIX_MULTIPLE.`, 'MISSING_OPTIONS');
        }
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
      throw AppError.badRequest('Aucune question valide trouvée dans le fichier.', 'NO_VALID_QUESTIONS');
    }

    const createdQuestions = await db.Question.bulkCreate(questionsToCreate);
    return { count: createdQuestions.length, questions: createdQuestions };
  }

  async close(id) {
    const evaluation = await evaluationRepository.findById(id);
    if (!evaluation) {
      throw AppError.notFound('Évaluation non trouvée.', 'EVALUATION_NOT_FOUND');
    }

    if (evaluation.statut === 'CLOTUREE') {
      throw AppError.badRequest('Cette évaluation est déjà clôturée.', 'ALREADY_CLOSED');
    }

    // Mettre à jour le statut
    const updatedEvaluation = await evaluationRepository.update(id, { statut: 'CLOTUREE' });

    // Envoyer les notifications de clôture
    const notificationService = require('./notification.service');
    await notificationService.notifyEvaluationClosed(id);

    return updatedEvaluation;
  }

  async getSubmissions(id) {
    const evaluation = await evaluationRepository.findById(id);
    if (!evaluation) {
      throw AppError.notFound('Évaluation non trouvée.', 'EVALUATION_NOT_FOUND');
    }

    // Récupérer les sessions de réponse avec les détails
    const sessions = await db.SessionReponse.findAll({
      where: { quizz_id: evaluation.Quizz.id },
      include: [
        {
          model: db.Etudiant,
          include: [
            {
              model: db.Utilisateur,
              attributes: ['nom', 'prenom', 'email']
            },
            {
              model: db.Classe,
              attributes: ['nom']
            }
          ]
        },
        {
          model: db.ReponseEtudiant,
          include: [
            {
              model: db.Question,
              attributes: ['enonce', 'typeQuestion', 'options']
            }
          ]
        }
      ],
      order: [['dateDebut', 'DESC']]
    });

    // Formater les données
    return sessions.map(session => ({
      id: session.id,
      etudiant: {
        id: session.Etudiant.id,
        nom: session.Etudiant.Utilisateur.nom,
        prenom: session.Etudiant.Utilisateur.prenom,
        email: session.Etudiant.Utilisateur.email,
        matricule: session.Etudiant.matricule,
        classe: session.Etudiant.Classe?.nom
      },
      dateDebut: session.dateDebut,
      dateFin: session.dateFin,
      estTermine: session.estTermine,
      reponses: session.ReponseEtudiants.map(rep => ({
        questionId: rep.question_id,
        question: rep.Question.enonce,
        reponse: rep.reponseTexte,
        dateReponse: rep.createdAt
      }))
    }));
  }

}

module.exports = new EvaluationService();