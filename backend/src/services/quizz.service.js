// backend/src/services/quizz.service.js

const db = require('../models');
const quizzRepository = require('../repositories/quizz.repository');
const etudiantRepository = require('../repositories/etudiant.repository');
const xss = require('xss');

class QuizzService {
  /**
   * Récupère la liste des évaluations actives pour l'étudiant authentifié.
   * @param {string} userId - L'ID de l'utilisateur (étudiant).
   */
  async getAvailableQuizzesForStudent(userId) {
    const etudiant = await etudiantRepository.findById(userId);
    if (!etudiant || !etudiant.classe_id) {
      throw new Error('Profil étudiant non trouvé ou non associé à une classe.');
    }

    return quizzRepository.findAvailableEvaluationsForClass(etudiant.classe_id, userId);
  }

  /**
   * Récupère le détail d'un quizz avec ses questions et les réponses de l'étudiant si elles existent.
   * @param {string} quizzId - L'ID du quizz.
   * @param {string} etudiantId - L'ID de l'étudiant.
   */
  async getQuizzDetails(quizzId, etudiantId) {
    const quizz = await quizzRepository.findQuizzWithQuestionsById(quizzId);
    if (!quizz) {
      throw new Error('Quizz non trouvé.');
    }

    const quizzData = quizz.toJSON();

    // Chercher le token de l'étudiant pour cette évaluation
    const sessionToken = await db.SessionToken.findOne({
      where: {
        etudiant_id: etudiantId,
        evaluation_id: quizz.evaluation_id
      }
    });

    if (sessionToken) {
      // Chercher la session avec ce token
      const session = await db.SessionReponse.findOne({
        where: { tokenAnonyme: sessionToken.tokenAnonyme },
        include: [{
          model: db.ReponseEtudiant,
          attributes: ['id', 'question_id', 'contenu']
        }]
      });

      if (session) {
        quizzData.tokenAnonyme = session.tokenAnonyme;
        quizzData.statutSession = session.statut;
        quizzData.reponsesExistantes = session.ReponseEtudiants || [];
      } else {
        quizzData.tokenAnonyme = null;
        quizzData.statutSession = null;
        quizzData.reponsesExistantes = [];
      }
    } else {
      quizzData.tokenAnonyme = null;
      quizzData.statutSession = null;
      quizzData.reponsesExistantes = [];
    }

    return quizzData;
  }

  /**
   * Soumet les réponses pour un quizz de manière anonyme.
   * @param {string} quizzId - L'ID du quizz.
   * @param {string} etudiantId - L'ID de l'étudiant.
   * @param {Array<object>} reponses - Un tableau d'objets { question_id, contenu }.
   * @param {boolean} estFinal - Si true, marque la session comme terminée.
   */
  async submitReponses(quizzId, etudiantId, reponses, estFinal = true) {
    const transaction = await db.sequelize.transaction();
    try {
      // 1. Vérifier que le quizz existe
      const quizz = await db.Quizz.findByPk(quizzId, { transaction });
      if (!quizz) {
        throw new Error('Quizz non trouvé.');
      }

      // 2. Chercher ou créer le token anonyme pour cet étudiant
      let sessionToken = await db.SessionToken.findOne({
        where: {
          etudiant_id: etudiantId,
          evaluation_id: quizz.evaluation_id
        },
        transaction
      });

      if (!sessionToken) {
        sessionToken = await db.SessionToken.create({
          etudiant_id: etudiantId,
          evaluation_id: quizz.evaluation_id
        }, { transaction });
      }

      // 3. Chercher ou créer la SessionReponse avec le token anonyme
      let session = await db.SessionReponse.findOne({
        where: { tokenAnonyme: sessionToken.tokenAnonyme },
        transaction
      });

      if (!session) {
        session = await db.SessionReponse.create({
          quizz_id: quizzId,
          etudiant_id: etudiantId,
          tokenAnonyme: sessionToken.tokenAnonyme,
          statut: estFinal ? 'TERMINE' : 'EN_COURS',
          dateDebut: new Date(),
          dateFin: estFinal ? new Date() : null
        }, { transaction });
      } else {
        // Mettre à jour la session existante
        if (estFinal) {
          session.statut = 'TERMINE';
          session.dateFin = new Date();
          await session.save({ transaction });
        }
      }

      // 4. Supprimer les anciennes réponses si elles existent
      await db.ReponseEtudiant.destroy({
        where: { session_reponse_id: session.id },
        transaction
      });

      // 5. Préparer toutes les réponses à insérer (avec sanitisation XSS)
      const reponsesToCreate = reponses.map(rep => ({
        contenu: (typeof rep.contenu === 'string') ? xss(rep.contenu) : rep.contenu,
        question_id: rep.question_id,
        session_reponse_id: session.id,
      }));

      // 6. Insérer toutes les réponses
      const createdReponses = await db.ReponseEtudiant.bulkCreate(reponsesToCreate, { transaction, returning: true });

      // 7. Lancer l'analyse de sentiment en arrière-plan pour les réponses ouvertes
      const sentimentService = process.env.GOOGLE_AI_API_KEY
        ? require('./sentiment-gemini.service')
        : require('./sentiment.service');

      // Identifier les questions de type REPONSE_OUVERTE
      const openQuestions = await db.Question.findAll({
        where: {
          id: reponses.map(r => r.question_id),
          typeQuestion: 'REPONSE_OUVERTE'
        },
        transaction
      });

      const openQuestionIds = new Set(openQuestions.map(q => q.id));

      // 8. Valider la transaction avant l'analyse (pour éviter les verrous longs)
      await transaction.commit();

      // Analyser de manière asynchrone (ne bloque pas la réponse HTTP)
      createdReponses.forEach(rep => {
        if (openQuestionIds.has(rep.question_id) && rep.contenu) {
          sentimentService.analyzeAndSaveReponse(rep.id, rep.contenu).catch(err => {
            console.error(`Erreur analyse sentiment réponse ${rep.id}:`, err.message);
          });
        }
      });

      // 8. Envoyer notification de confirmation si soumission finale
      if (estFinal) {
        try {
          const notificationService = require('./notification.service');
          await notificationService.notifySubmissionConfirmation(etudiantId, quizz.evaluation_id);
        } catch (error) {
          console.error('Erreur lors de l\'envoi de la notification de confirmation:', error);
          // Ne pas faire échouer la soumission si la notification échoue
        }
      }

      return { 
        message: estFinal ? 'Vos réponses ont été soumises avec succès.' : 'Vos réponses ont été sauvegardées.',
        tokenAnonyme: session.tokenAnonyme,
        statut: session.statut
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new QuizzService();
