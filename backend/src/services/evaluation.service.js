// backend/src/services/evaluation.service.js

const db = require('../models');
const { Op } = require('sequelize');
const evaluationRepository = require('../repositories/evaluation.repository');
const coursRepository = require('../repositories/cours.repository');
const questionRepository = require('../repositories/question.repository');
const notificationService = require('./notification.service');
const sentimentAnalysisService = require('./sentiment-analysis.service');
const reportExportService = require('./report-export.service');
const ExcelJS = require('exceljs');
const AppError = require('../utils/AppError'); 

class EvaluationService {
  /**
   * Crée une Évaluation et son Quizz associé dans une transaction.
   * @param {object} data - Données pour l'évaluation. Doit contenir cours_id.
   * @param {string} adminId - ID de l'administrateur qui crée l'évaluation.
   */
  async create(data, adminId) {
    const { classeIds, coursId, ...evaluationData } = data;
    
    // Mapper coursId vers cours_id pour la compatibilité backend
    if (coursId) {
      evaluationData.cours_id = coursId;
    }
    
    // Validation des données d'entrée
    if (!classeIds || !Array.isArray(classeIds) || classeIds.length === 0) {
      throw AppError.badRequest('Au moins une classe doit être ciblée.', 'CLASSES_REQUIRED');
    }

    if (!evaluationData.cours_id) {
      throw AppError.badRequest('Un cours doit être sélectionné pour créer l\'évaluation.', 'COURS_REQUIRED');
    }

    const transaction = await db.sequelize.transaction();

    try {
      const cours = await coursRepository.findById(evaluationData.cours_id);
      if (!cours) {
        throw AppError.notFound('Cours non trouvé. Impossible de créer l\'évaluation.', 'COURS_NOT_FOUND');
      }

      // Vérifier que l'utilisateur existe et récupérer son profil admin
      const utilisateur = await db.Utilisateur.findByPk(adminId, {
        include: [{ model: db.Administrateur }]
      });
      
      if (!utilisateur) {
        throw AppError.notFound('Utilisateur non trouvé.', 'USER_NOT_FOUND');
      }

      if (!utilisateur.Administrateur) {
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

  async findAll(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      statut = null,
      coursId = null,
      orderBy = 'createdAt',
      orderDirection = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    
    // Construire les conditions WHERE
    const whereConditions = {};
    
    if (statut && statut !== 'ALL') {
      whereConditions.statut = statut;
    }
    
    if (coursId) {
      whereConditions.cours_id = coursId;
    }
    
    // Recherche textuelle
    if (search) {
      whereConditions[Op.or] = [
        { titre: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await db.Evaluation.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: db.Cours,
          attributes: ['id', 'nom', 'code'],
          required: false
        },
        {
          model: db.Classe,
          attributes: ['id', 'nom'],
          through: { attributes: [] }, // Exclure les attributs de la table de liaison
          required: false
        },
        {
          model: db.Quizz,
          attributes: ['id'],
          include: [
            {
              model: db.Question,
              attributes: ['id'],
              required: false
            }
          ],
          required: false
        }
      ],
      order: [[orderBy, orderDirection]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    // Optimiser les données retournées
    const evaluations = rows.map(evaluation => ({
      id: evaluation.id,
      titre: evaluation.titre,
      description: evaluation.description,
      statut: evaluation.statut,
      dateDebut: evaluation.dateDebut,
      dateFin: evaluation.dateFin,
      dateCreation: evaluation.createdAt,
      cours: evaluation.Cours ? {
        id: evaluation.Cours.id,
        nom: evaluation.Cours.nom,
        code: evaluation.Cours.code
      } : null,
      classes: evaluation.Classes?.map(classe => ({
        id: classe.id,
        nom: classe.nom
      })) || [],
      questionCount: evaluation.Quizz?.Questions?.length || 0
    }));

    return {
      evaluations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: page * limit < count,
        hasPrevPage: page > 1
      }
    };
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
    try {
      const notificationService = require('./notification.service');
      await notificationService.notifyNewEvaluation(id);
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications de publication:', error);
      // Ne pas faire échouer la publication si les notifications échouent
    }

    return updatedEvaluation;
  }

  async delete(id) {
    console.log('🗑️ Service - Tentative de suppression de l\'évaluation ID:', id);
    
    // Vérifier d'abord que l'évaluation existe
    const evaluation = await evaluationRepository.findById(id);
    if (!evaluation) {
      console.log('❌ Service - Évaluation non trouvée:', id);
      throw AppError.notFound('Évaluation non trouvée.', 'EVALUATION_NOT_FOUND');
    }

    console.log('✅ Service - Évaluation trouvée:', {
      id: evaluation.id,
      titre: evaluation.titre,
      statut: evaluation.statut,
      hasQuizz: !!evaluation.Quizz
    });

    // Vérifier que l'évaluation peut être supprimée (pas de soumissions)
    if (evaluation.Quizz) {
      console.log('🔍 Service - Vérification des soumissions pour le quizz:', evaluation.Quizz.id);
      const submissionsCount = await db.SessionReponse.count({
        where: { quizz_id: evaluation.Quizz.id }
      });
      
      console.log('📊 Service - Nombre de soumissions trouvées:', submissionsCount);
      
      if (submissionsCount > 0) {
        console.log('❌ Service - Suppression bloquée: évaluation avec soumissions');
        throw AppError.badRequest(
          'Impossible de supprimer une évaluation qui a des soumissions d\'étudiants.', 
          'HAS_SUBMISSIONS'
        );
      }
    }

    console.log('🗑️ Service - Procédure de suppression...');
    const result = await evaluationRepository.delete(id);
    console.log('✅ Service - Résultat de la suppression:', result);
    
    if (result === 0) {
      console.log('❌ Service - Aucune ligne supprimée');
      throw AppError.notFound('Évaluation non trouvée.', 'EVALUATION_NOT_FOUND');
    }
    
    console.log('✅ Service - Suppression réussie');
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

  /**
   * Récupère toutes les questions d'un quizz.
   * @param {string} quizzId - L'ID du quizz.
   */
  async getQuestionsByQuizz(quizzId) {
    // Vérifier que le quizz existe
    const quizz = await db.Quizz.findByPk(quizzId);
    if (!quizz) {
      throw AppError.notFound('Quizz non trouvé.', 'QUIZZ_NOT_FOUND');
    }

    // Récupérer les questions du quizz
    const questions = await db.Question.findAll({
      where: { quizz_id: quizzId },
      order: [['createdAt', 'ASC']]
    });

    return questions;
  }

  async importQuestionsFromExcel(quizzId, fileBuffer) {
    // Validation de l'ID du quiz
    if (!quizzId || quizzId === 'null' || quizzId === 'undefined') {
      throw AppError.badRequest('ID du quiz requis et valide.', 'QUIZZ_ID_REQUIRED');
    }

    // Vérifier que le quiz existe
    const quizz = await db.Quizz.findByPk(quizzId);
    if (!quizz) {
      throw AppError.notFound('Quiz non trouvé.', 'QUIZZ_NOT_FOUND');
    }

    // Vérifier que l'évaluation n'est pas clôturée
    const evaluation = await evaluationRepository.findById(quizz.evaluation_id);
    if (evaluation && evaluation.statut === 'CLOTUREE') {
      throw AppError.badRequest('Impossible d\'importer des questions dans une évaluation clôturée.', 'EVALUATION_CLOSED');
    }

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
        quizz_id: parseInt(quizzId) // S'assurer que c'est un entier valide
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
      // Retourner l'évaluation existante au lieu de lancer une erreur
      return {
        ...evaluation,
        message: 'Cette évaluation est déjà clôturée.'
      };
    }

    // Mettre à jour le statut
    const updatedEvaluation = await evaluationRepository.update(id, { statut: 'CLOTUREE' });

    // Envoyer les notifications de clôture
    try {
      await notificationService.notifyEvaluationClosed(id);
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications de clôture:', error);
      // Ne pas faire échouer la clôture si les notifications échouent
    }

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
        reponse: rep.contenu,
        dateReponse: rep.createdAt
      }))
    }));
  }

  async duplicate(id, adminId) {
    const transaction = await db.sequelize.transaction();

    try {
      const duplicatedEvaluation = await evaluationRepository.duplicate(id, adminId, transaction);
      await transaction.commit();
      return duplicatedEvaluation;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Analyse les sentiments des réponses d'une évaluation
   * @param {string} id - ID de l'évaluation
   * @returns {object} Analyse des sentiments
   */
  async analyzeSentiments(id) {
    const evaluation = await evaluationRepository.findById(id);
    if (!evaluation) {
      throw AppError.notFound('Évaluation non trouvée.', 'EVALUATION_NOT_FOUND');
    }

    const submissions = await this.getSubmissions(id);
    
    // Collecter toutes les réponses textuelles
    const textResponses = [];
    submissions.forEach(submission => {
      if (submission.reponses) {
        submission.reponses.forEach(reponse => {
          if (reponse.reponse && typeof reponse.reponse === 'string' && reponse.reponse.length > 5) {
            textResponses.push({
              contenu: reponse.reponse,
              id: `${submission.id}_${reponse.questionId}`,
              studentId: submission.etudiant.id,
              questionId: reponse.questionId,
              submissionId: submission.id
            });
          }
        });
      }
    });

    if (textResponses.length === 0) {
      return {
        globalSentiment: 'NEUTRE',
        averageScore: 0,
        distribution: { POSITIF: 0, NEGATIF: 0, NEUTRE: 0 },
        totalResponses: 0,
        message: 'Aucune réponse textuelle trouvée pour l\'analyse des sentiments.'
      };
    }

    return sentimentAnalysisService.analyzeEvaluationResponses(textResponses);
  }

  /**
   * Exporte un rapport complet d'évaluation
   * @param {string} id - ID de l'évaluation
   * @param {string} format - Format d'export ('excel' ou 'pdf')
   * @param {object} options - Options d'export
   * @returns {Buffer} Buffer du fichier exporté
   */
  async exportReport(id, format = 'excel', options = {}) {
    const evaluation = await evaluationRepository.findById(id);
    if (!evaluation) {
      throw AppError.notFound('Évaluation non trouvée.', 'EVALUATION_NOT_FOUND');
    }

    const submissions = await this.getSubmissions(id);

    switch (format.toLowerCase()) {
      case 'excel':
        return await reportExportService.exportEvaluationToExcel(evaluation, submissions, options);
      case 'pdf':
        return await reportExportService.exportEvaluationToPDF(evaluation, submissions, options);
      default:
        throw AppError.badRequest('Format d\'export non supporté. Utilisez "excel" ou "pdf".', 'INVALID_FORMAT');
    }
  }

  /**
   * Génère un rapport d'analyse avancé avec sentiments
   * @param {string} id - ID de l'évaluation
   * @returns {object} Rapport d'analyse complet
   */
  async generateAdvancedReport(id) {
    const evaluation = await evaluationRepository.findById(id);
    if (!evaluation) {
      throw AppError.notFound('Évaluation non trouvée.', 'EVALUATION_NOT_FOUND');
    }

    const submissions = await this.getSubmissions(id);
    const sentimentAnalysis = await this.analyzeSentiments(id);

    // Statistiques générales
    const totalSubmissions = submissions.length;
    const completedSubmissions = submissions.filter(s => s.estTermine);
    const completionRate = totalSubmissions > 0 ? (completedSubmissions.length / totalSubmissions) * 100 : 0;

    // Analyse temporelle
    const submissionTimes = completedSubmissions
      .filter(s => s.dateDebut && s.dateFin)
      .map(s => {
        const start = new Date(s.dateDebut);
        const end = new Date(s.dateFin);
        return (end - start) / (1000 * 60); // en minutes
      });

    const avgCompletionTime = submissionTimes.length > 0 
      ? submissionTimes.reduce((sum, time) => sum + time, 0) / submissionTimes.length 
      : 0;

    // Distribution par classe
    const classeDistribution = submissions.reduce((dist, submission) => {
      const classe = submission.etudiant.classe || 'Non assigné';
      dist[classe] = (dist[classe] || 0) + 1;
      return dist;
    }, {});

    // Analyse des questions
    const questionAnalysis = evaluation.Quizz?.Questions?.map(question => {
      const responses = submissions.reduce((acc, submission) => {
        const response = submission.reponses?.find(r => r.questionId === question.id);
        if (response) {
          acc.push(response.reponse);
        }
        return acc;
      }, []);

      return {
        id: question.id,
        enonce: question.enonce,
        type: question.typeQuestion,
        responseCount: responses.length,
        responseRate: totalSubmissions > 0 ? (responses.length / totalSubmissions) * 100 : 0,
        responses: responses.slice(0, 5) // Échantillon des réponses
      };
    }) || [];

    return {
      evaluation: {
        id: evaluation.id,
        titre: evaluation.titre,
        statut: evaluation.statut,
        cours: evaluation.Cours?.nom,
        dateCreation: evaluation.createdAt,
        nombreQuestions: evaluation.Quizz?.Questions?.length || 0
      },
      statistics: {
        totalSubmissions,
        completedSubmissions: completedSubmissions.length,
        completionRate: Math.round(completionRate * 100) / 100,
        avgCompletionTime: Math.round(avgCompletionTime * 100) / 100,
        classeDistribution
      },
      sentimentAnalysis,
      questionAnalysis,
      insights: this.generateInsights(submissions, sentimentAnalysis, completionRate),
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Génère des insights automatiques basés sur les données
   * @param {Array} submissions - Soumissions des étudiants
   * @param {object} sentimentAnalysis - Analyse des sentiments
   * @param {number} completionRate - Taux de completion
   * @returns {Array} Liste d'insights
   */
  generateInsights(submissions, sentimentAnalysis, completionRate) {
    const insights = [];

    // Insight sur le taux de completion
    if (completionRate > 90) {
      insights.push({
        type: 'HIGH_ENGAGEMENT',
        level: 'SUCCESS',
        message: 'Excellent taux de participation (>90%). Les étudiants sont très engagés.',
        recommendation: 'Continuez avec ce type d\'évaluation.'
      });
    } else if (completionRate < 50) {
      insights.push({
        type: 'LOW_ENGAGEMENT',
        level: 'WARNING',
        message: 'Taux de participation faible (<50%). Les étudiants semblent désengagés.',
        recommendation: 'Considérez réviser le format ou la difficulté de l\'évaluation.'
      });
    }

    // Insight sur les sentiments
    if (sentimentAnalysis.globalSentiment === 'POSITIF') {
      insights.push({
        type: 'POSITIVE_FEEDBACK',
        level: 'SUCCESS',
        message: 'Les réponses expriment globalement un sentiment positif.',
        recommendation: 'Les étudiants semblent satisfaits du contenu.'
      });
    } else if (sentimentAnalysis.globalSentiment === 'NEGATIF') {
      insights.push({
        type: 'NEGATIVE_FEEDBACK',
        level: 'ERROR',
        message: 'Les réponses expriment des sentiments négatifs.',
        recommendation: 'Investiguer les sources de frustration des étudiants.'
      });
    }

    // Insight sur la distribution des sentiments
    if (sentimentAnalysis.distribution) {
      const total = sentimentAnalysis.totalResponses;
      const polarization = (sentimentAnalysis.distribution.POSITIF + sentimentAnalysis.distribution.NEGATIF) / total;
      
      if (polarization > 0.8) {
        insights.push({
          type: 'HIGH_POLARIZATION',
          level: 'INFO',
          message: 'Les opinions sont très polarisées avec peu de réponses neutres.',
          recommendation: 'Analyser les facteurs qui divisent les étudiants.'
        });
      }
    }

    // Insight sur les temps de completion
    const completedSubmissions = submissions.filter(s => s.estTermine && s.dateDebut && s.dateFin);
    if (completedSubmissions.length > 0) {
      const times = completedSubmissions.map(s => {
        const start = new Date(s.dateDebut);
        const end = new Date(s.dateFin);
        return (end - start) / (1000 * 60);
      });
      
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      
      if (avgTime < 5) {
        insights.push({
          type: 'QUICK_COMPLETION',
          level: 'WARNING',
          message: 'Temps de completion très rapide (<5 min). Les étudiants ont peut-être répondu trop vite.',
          recommendation: 'Vérifier la qualité des réponses ou ajuster la complexité.'
        });
      } else if (avgTime > 60) {
        insights.push({
          type: 'SLOW_COMPLETION',
          level: 'INFO',
          message: 'Temps de completion élevé (>60 min). L\'évaluation peut être trop longue.',
          recommendation: 'Considérer réduire le nombre de questions ou simplifier.'
        });
      }
    }

    return insights;
  }
  
}

module.exports = new EvaluationService();