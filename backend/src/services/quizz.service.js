// backend/src/services/quizz.service.js

const db = require('../models');
const quizzRepository = require('../repositories/quizz.repository');
const etudiantRepository = require('../repositories/etudiant.repository');

class QuizzService {
  /**
   * Récupère la liste des évaluations actives pour l'étudiant authentifié.
   * @param {string} userId - L'ID de l'utilisateur (étudiant).
   */
  async getAvailableQuizzesForStudent(userId) {
    // 1. Trouver le profil de l'étudiant pour obtenir son ID de classe
    const etudiant = await etudiantRepository.findById(userId);
    if (!etudiant || !etudiant.classe_id) {
      throw new Error('Profil étudiant non trouvé ou non associé à une classe.');
    }

    // 2. Utiliser le repository pour trouver les évaluations correspondantes
    return quizzRepository.findAvailableEvaluationsForClass(etudiant.classe_id);
  }

  /**
   * Récupère le détail d'un quizz avec ses questions.
   * @param {string} quizzId - L'ID du quizz.
   */
  async getQuizzDetails(quizzId) {
    const quizz = await quizzRepository.findQuizzWithQuestionsById(quizzId);
    if (!quizz) {
      throw new Error('Quizz non trouvé.');
    }
    return quizz;
  }

  /**
   * Soumet les réponses pour un quizz de manière anonyme.
   * @param {string} quizzId - L'ID du quizz.
   * @param {Array<object>} reponses - Un tableau d'objets { question_id, contenu }.
   */
  async submitReponses(quizzId, reponses) {
    const transaction = await db.sequelize.transaction();
    try {
      // 1. Vérifier que le quizz existe
      const quizz = await db.Quizz.findByPk(quizzId, { transaction });
      if (!quizz) {
        throw new Error('Quizz non trouvé.');
      }

      // 2. Créer la SessionReponse anonyme
      //    Elle est liée à l'évaluation parente du quizz.
      const session = await db.SessionReponse.create({
        evaluation_id: quizz.evaluation_id,
      }, { transaction });

      // 3. Préparer toutes les réponses à insérer
      const reponsesToCreate = reponses.map(rep => ({
        contenu: rep.contenu,
        question_id: rep.question_id,
        session_reponse_id: session.id, // Lier chaque réponse à la session
      }));

      // 4. Insérer toutes les réponses en une seule fois (bulk create)
      await db.ReponseEtudiant.bulkCreate(reponsesToCreate, { transaction });

      // 5. Valider la transaction
      await transaction.commit();

      return { message: 'Vos réponses ont été soumises avec succès.' };
    } catch (error) {
      // En cas d'erreur, annuler toutes les opérations
      await transaction.rollback();
      throw error;
    }
  }
}


module.exports = new QuizzService();