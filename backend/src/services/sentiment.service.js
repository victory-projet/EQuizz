// backend/src/services/sentiment.service.js

const Sentiment = require('sentiment');
const db = require('../models');

class SentimentService {
  constructor() {
    this.sentiment = new Sentiment();
  }

  /**
   * Analyse le sentiment d'un texte
   * @param {string} text - Le texte à analyser
   * @returns {object} - { score, sentiment, comparative }
   */
  analyzeText(text) {
    if (!text || typeof text !== 'string') {
      return { score: 0, sentiment: 'NEUTRE', comparative: 0 };
    }

    const result = this.sentiment.analyze(text);
    
    // Normaliser le score entre -1 et 1
    const normalizedScore = Math.max(-1, Math.min(1, result.comparative));
    
    // Déterminer le sentiment
    let sentimentLabel;
    if (normalizedScore > 0.1) {
      sentimentLabel = 'POSITIF';
    } else if (normalizedScore < -0.1) {
      sentimentLabel = 'NEGATIF';
    } else {
      sentimentLabel = 'NEUTRE';
    }

    return {
      score: normalizedScore,
      sentiment: sentimentLabel,
      comparative: result.comparative
    };
  }

  /**
   * Analyse et sauvegarde le sentiment d'une réponse étudiant
   * @param {string} reponseEtudiantId - L'ID de la réponse
   * @param {string} texte - Le texte de la réponse
   */
  async analyzeAndSaveReponse(reponseEtudiantId, texte) {
    const analysis = this.analyzeText(texte);
    
    // Vérifier si une analyse existe déjà
    const existingAnalysis = await db.AnalyseReponse.findOne({
      where: { reponse_etudiant_id: reponseEtudiantId }
    });

    if (existingAnalysis) {
      // Mettre à jour
      await existingAnalysis.update({
        score: analysis.score,
        sentiment: analysis.sentiment
      });
      return existingAnalysis;
    } else {
      // Créer
      return db.AnalyseReponse.create({
        reponse_etudiant_id: reponseEtudiantId,
        score: analysis.score,
        sentiment: analysis.sentiment
      });
    }
  }

  /**
   * Analyse toutes les réponses ouvertes d'une évaluation
   * @param {string} evaluationId - L'ID de l'évaluation
   */
  async analyzeEvaluationReponses(evaluationId) {
    // Récupérer toutes les réponses ouvertes de cette évaluation
    const reponses = await db.ReponseEtudiant.findAll({
      include: [
        {
          model: db.Question,
          where: { typeQuestion: 'REPONSE_OUVERTE' },
          include: [
            {
              model: db.Quizz,
              include: [
                {
                  model: db.Evaluation,
                  where: { id: evaluationId }
                }
              ]
            }
          ]
        }
      ]
    });

    const results = [];
    for (const reponse of reponses) {
      if (reponse.contenu) {
        const analysis = await this.analyzeAndSaveReponse(
          reponse.id,
          reponse.contenu
        );
        results.push(analysis);
      }
    }

    return results;
  }

  /**
   * Extrait les mots-clés les plus fréquents d'un ensemble de textes
   * @param {Array<string>} texts - Tableau de textes
   * @param {number} limit - Nombre de mots-clés à retourner
   */
  extractKeywords(texts, limit = 20) {
    const wordFrequency = {};
    const stopWords = new Set([
      'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'mais',
      'est', 'sont', 'a', 'ont', 'pour', 'dans', 'sur', 'avec', 'par', 'ce',
      'cette', 'ces', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles',
      'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'in',
      'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'it', 'this',
      'that', 'these', 'those'
    ]);

    texts.forEach(text => {
      if (!text) return;
      
      const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));

      words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
    });

    return Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word, count]) => ({ word, count }));
  }
}

module.exports = new SentimentService();
