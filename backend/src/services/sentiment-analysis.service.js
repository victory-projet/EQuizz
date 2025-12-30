// backend/src/services/sentiment-analysis.service.js

const natural = require('natural');
const AppError = require('../utils/AppError');

class SentimentAnalysisService {
  constructor() {
    // Initialiser l'analyseur de sentiment pour le français
    this.tokenizer = new natural.WordTokenizer();
    
    // Dictionnaire de mots-clés pour l'analyse contextuelle
    this.positiveKeywords = [
      'excellent', 'parfait', 'génial', 'super', 'formidable', 'fantastique',
      'merveilleux', 'extraordinaire', 'remarquable', 'impressionnant',
      'satisfait', 'content', 'heureux', 'ravi', 'enchanté', 'comblé',
      'facile', 'clair', 'compréhensible', 'utile', 'pratique', 'efficace',
      'intéressant', 'captivant', 'motivant', 'enrichissant', 'constructif'
    ];
    
    this.negativeKeywords = [
      'terrible', 'horrible', 'affreux', 'nul', 'mauvais', 'décevant',
      'frustrant', 'ennuyeux', 'difficile', 'compliqué', 'confus',
      'insatisfait', 'mécontent', 'déçu', 'fâché', 'énervé', 'agacé',
      'inutile', 'inefficace', 'problématique', 'défaillant', 'inadéquat',
      'incompréhensible', 'flou', 'ambigu', 'vague', 'imprécis'
    ];
    
    this.neutralKeywords = [
      'correct', 'acceptable', 'moyen', 'standard', 'normal', 'ordinaire',
      'passable', 'convenable', 'suffisant', 'adéquat', 'raisonnable'
    ];
    
    // Mots de négation en français
    this.negationWords = [
      'ne', 'pas', 'non', 'jamais', 'rien', 'aucun', 'aucune', 'nullement',
      'point', 'guère', 'plus', 'sans', 'ni'
    ];
  }

  /**
   * Analyse le sentiment d'un texte
   * @param {string} text - Le texte à analyser
   * @returns {object} Résultat de l'analyse avec score et classification
   */
  analyzeSentiment(text) {
    if (!text || typeof text !== 'string') {
      throw AppError.badRequest('Texte invalide pour l\'analyse de sentiment.', 'INVALID_TEXT');
    }

    const cleanText = this.preprocessText(text);
    const tokens = this.tokenizer.tokenize(cleanText);
    
    if (!tokens || tokens.length === 0) {
      return {
        score: 0,
        classification: 'NEUTRE',
        confidence: 0,
        details: {
          wordCount: 0,
          positiveWords: [],
          negativeWords: [],
          neutralWords: [],
          emotions: {}
        }
      };
    }

    // Analyse basée sur les mots-clés
    const keywordAnalysis = this.analyzeKeywords(tokens);
    
    // Analyse de la négation
    const negationAnalysis = this.analyzeNegation(tokens);
    
    // Analyse des émotions
    const emotionAnalysis = this.analyzeEmotions(tokens);
    
    // Calcul du score final
    const finalScore = this.calculateFinalScore(keywordAnalysis, negationAnalysis);
    
    // Classification
    const classification = this.classifySentiment(finalScore);
    
    // Calcul de la confiance
    const confidence = this.calculateConfidence(keywordAnalysis, tokens.length);

    return {
      score: Math.round(finalScore * 100) / 100,
      classification,
      confidence: Math.round(confidence * 100) / 100,
      details: {
        wordCount: tokens.length,
        positiveWords: keywordAnalysis.positiveWords,
        negativeWords: keywordAnalysis.negativeWords,
        neutralWords: keywordAnalysis.neutralWords,
        emotions: emotionAnalysis,
        hasNegation: negationAnalysis.hasNegation,
        negationImpact: negationAnalysis.impact
      }
    };
  }

  /**
   * Analyse les sentiments de plusieurs réponses d'évaluation
   * @param {Array} responses - Tableau des réponses à analyser
   * @returns {object} Analyse globale des sentiments
   */
  analyzeEvaluationResponses(responses) {
    if (!Array.isArray(responses) || responses.length === 0) {
      return {
        globalSentiment: 'NEUTRE',
        averageScore: 0,
        distribution: { POSITIF: 0, NEGATIF: 0, NEUTRE: 0 },
        totalResponses: 0,
        detailedAnalysis: []
      };
    }

    const analyses = responses.map(response => {
      const analysis = this.analyzeSentiment(response.contenu || response.text || response);
      return {
        ...analysis,
        responseId: response.id || null,
        studentId: response.studentId || null
      };
    });

    // Calculs statistiques
    const totalScore = analyses.reduce((sum, analysis) => sum + analysis.score, 0);
    const averageScore = totalScore / analyses.length;

    const distribution = analyses.reduce((dist, analysis) => {
      dist[analysis.classification]++;
      return dist;
    }, { POSITIF: 0, NEGATIF: 0, NEUTRE: 0 });

    // Sentiment global basé sur la moyenne
    const globalSentiment = this.classifySentiment(averageScore);

    // Analyse des tendances
    const trends = this.analyzeTrends(analyses);

    return {
      globalSentiment,
      averageScore: Math.round(averageScore * 100) / 100,
      distribution,
      totalResponses: responses.length,
      detailedAnalysis: analyses,
      trends,
      insights: this.generateInsights(analyses, distribution)
    };
  }

  /**
   * Préprocesse le texte pour l'analyse
   * @param {string} text - Texte à préprocesser
   * @returns {string} Texte nettoyé
   */
  preprocessText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/gi, ' ') // Supprimer la ponctuation
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim();
  }

  /**
   * Analyse basée sur les mots-clés
   * @param {Array} tokens - Tokens du texte
   * @returns {object} Résultat de l'analyse par mots-clés
   */
  analyzeKeywords(tokens) {
    const positiveWords = [];
    const negativeWords = [];
    const neutralWords = [];

    tokens.forEach(token => {
      if (this.positiveKeywords.includes(token)) {
        positiveWords.push(token);
      } else if (this.negativeKeywords.includes(token)) {
        negativeWords.push(token);
      } else if (this.neutralKeywords.includes(token)) {
        neutralWords.push(token);
      }
    });

    const positiveScore = positiveWords.length * 1.0;
    const negativeScore = negativeWords.length * -1.0;
    const neutralScore = neutralWords.length * 0.1;

    return {
      positiveWords,
      negativeWords,
      neutralWords,
      score: positiveScore + negativeScore + neutralScore
    };
  }

  /**
   * Analyse l'impact de la négation
   * @param {Array} tokens - Tokens du texte
   * @returns {object} Analyse de la négation
   */
  analyzeNegation(tokens) {
    let hasNegation = false;
    let negationPositions = [];

    tokens.forEach((token, index) => {
      if (this.negationWords.includes(token)) {
        hasNegation = true;
        negationPositions.push(index);
      }
    });

    // Impact de la négation sur le score
    const impact = hasNegation ? -0.3 : 0;

    return {
      hasNegation,
      negationPositions,
      impact
    };
  }

  /**
   * Analyse les émotions dans le texte
   * @param {Array} tokens - Tokens du texte
   * @returns {object} Analyse des émotions
   */
  analyzeEmotions(tokens) {
    const emotions = {
      joie: 0,
      tristesse: 0,
      colere: 0,
      peur: 0,
      surprise: 0,
      degout: 0
    };

    const emotionKeywords = {
      joie: ['heureux', 'content', 'ravi', 'joyeux', 'satisfait', 'enchanté'],
      tristesse: ['triste', 'déçu', 'malheureux', 'déprimé', 'abattu'],
      colere: ['énervé', 'fâché', 'furieux', 'irrité', 'agacé', 'indigné'],
      peur: ['peur', 'anxieux', 'inquiet', 'stressé', 'angoissé'],
      surprise: ['surpris', 'étonné', 'stupéfait', 'ébahi'],
      degout: ['dégoûté', 'écœuré', 'répugné', 'révulsé']
    };

    tokens.forEach(token => {
      Object.keys(emotionKeywords).forEach(emotion => {
        if (emotionKeywords[emotion].includes(token)) {
          emotions[emotion]++;
        }
      });
    });

    return emotions;
  }

  /**
   * Calcule le score final en combinant les analyses
   * @param {object} keywordAnalysis - Analyse des mots-clés
   * @param {object} negationAnalysis - Analyse de la négation
   * @returns {number} Score final
   */
  calculateFinalScore(keywordAnalysis, negationAnalysis) {
    let score = keywordAnalysis.score;
    
    // Appliquer l'impact de la négation
    if (negationAnalysis.hasNegation) {
      score += negationAnalysis.impact;
    }

    // Normaliser le score entre -1 et 1
    return Math.max(-1, Math.min(1, score));
  }

  /**
   * Classifie le sentiment basé sur le score
   * @param {number} score - Score de sentiment
   * @returns {string} Classification
   */
  classifySentiment(score) {
    if (score > 0.1) return 'POSITIF';
    if (score < -0.1) return 'NEGATIF';
    return 'NEUTRE';
  }

  /**
   * Calcule la confiance de l'analyse
   * @param {object} keywordAnalysis - Analyse des mots-clés
   * @param {number} totalWords - Nombre total de mots
   * @returns {number} Score de confiance
   */
  calculateConfidence(keywordAnalysis, totalWords) {
    const significantWords = keywordAnalysis.positiveWords.length + 
                           keywordAnalysis.negativeWords.length;
    
    if (totalWords === 0) return 0;
    
    const ratio = significantWords / totalWords;
    return Math.min(1, ratio * 2); // Confiance basée sur la densité de mots significatifs
  }

  /**
   * Analyse les tendances dans les réponses
   * @param {Array} analyses - Analyses individuelles
   * @returns {object} Tendances identifiées
   */
  analyzeTrends(analyses) {
    const scores = analyses.map(a => a.score);
    const classifications = analyses.map(a => a.classification);

    return {
      scoreVariation: this.calculateVariation(scores),
      dominantSentiment: this.findDominantSentiment(classifications),
      polarization: this.calculatePolarization(scores),
      consistency: this.calculateConsistency(classifications)
    };
  }

  /**
   * Calcule la variation des scores
   * @param {Array} scores - Scores à analyser
   * @returns {number} Variation
   */
  calculateVariation(scores) {
    if (scores.length < 2) return 0;
    
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Trouve le sentiment dominant
   * @param {Array} classifications - Classifications à analyser
   * @returns {string} Sentiment dominant
   */
  findDominantSentiment(classifications) {
    const counts = classifications.reduce((acc, classification) => {
      acc[classification] = (acc[classification] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  /**
   * Calcule la polarisation des sentiments
   * @param {Array} scores - Scores à analyser
   * @returns {number} Niveau de polarisation
   */
  calculatePolarization(scores) {
    const extremeScores = scores.filter(score => Math.abs(score) > 0.5);
    return extremeScores.length / scores.length;
  }

  /**
   * Calcule la consistance des classifications
   * @param {Array} classifications - Classifications à analyser
   * @returns {number} Score de consistance
   */
  calculateConsistency(classifications) {
    const uniqueClassifications = new Set(classifications).size;
    return 1 - (uniqueClassifications - 1) / 2; // Normaliser entre 0 et 1
  }

  /**
   * Génère des insights basés sur l'analyse
   * @param {Array} analyses - Analyses individuelles
   * @param {object} distribution - Distribution des sentiments
   * @returns {Array} Insights générés
   */
  generateInsights(analyses, distribution) {
    const insights = [];
    const total = analyses.length;

    // Insight sur la distribution
    if (distribution.POSITIF / total > 0.7) {
      insights.push({
        type: 'POSITIVE_MAJORITY',
        message: 'La majorité des réponses expriment un sentiment positif.',
        confidence: 'HIGH'
      });
    } else if (distribution.NEGATIF / total > 0.7) {
      insights.push({
        type: 'NEGATIVE_MAJORITY',
        message: 'La majorité des réponses expriment un sentiment négatif.',
        confidence: 'HIGH'
      });
    }

    // Insight sur la polarisation
    const scores = analyses.map(a => a.score);
    const polarization = this.calculatePolarization(scores);
    
    if (polarization > 0.5) {
      insights.push({
        type: 'HIGH_POLARIZATION',
        message: 'Les opinions sont très polarisées avec des sentiments extrêmes.',
        confidence: 'MEDIUM'
      });
    }

    // Insight sur la confiance moyenne
    const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / total;
    
    if (avgConfidence < 0.3) {
      insights.push({
        type: 'LOW_CONFIDENCE',
        message: 'L\'analyse de sentiment a une confiance faible, les textes peuvent être ambigus.',
        confidence: 'LOW'
      });
    }

    return insights;
  }
}

module.exports = new SentimentAnalysisService();