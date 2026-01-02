// backend/src/services/sentiment-gemini.service.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../models');

class SentimentGeminiService {
  constructor() {
    // Initialiser Gemini avec la clé API
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ GOOGLE_AI_API_KEY non définie. Analyse de sentiments désactivée.');
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    }
  }

  /**
   * Analyse le sentiment d'un texte avec Gemini
   * @param {string} text - Le texte à analyser
   * @returns {object} - { score, sentiment, explanation }
   */
  async analyzeText(text) {
    if (!this.genAI) {
      console.warn('⚠️ Gemini non configuré, retour sentiment neutre');
      return { score: 0, sentiment: 'NEUTRE', explanation: 'API non configurée' };
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return { score: 0, sentiment: 'NEUTRE', explanation: 'Texte vide' };
    }

    try {
      const prompt = `
Analyse le sentiment de ce commentaire d'étudiant sur un cours.

Commentaire: "${text}"

Réponds UNIQUEMENT au format JSON suivant (sans markdown, sans backticks):
{
  "score": <nombre entre -1 et 1>,
  "sentiment": "<POSITIF, NEUTRE ou NEGATIF>",
  "explanation": "<courte explication en français>"
}

Règles:
- score > 0.3 → POSITIF
- score < -0.3 → NEGATIF
- sinon → NEUTRE
- Considère le contexte éducatif français
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const textResponse = response.text();

      // Parser la réponse JSON
      const cleanedResponse = textResponse
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const analysis = JSON.parse(cleanedResponse);

      // Valider et normaliser
      const score = Math.max(-1, Math.min(1, parseFloat(analysis.score) || 0));
      let sentiment = analysis.sentiment?.toUpperCase();

      // Vérifier cohérence score/sentiment
      if (score > 0.3 && sentiment !== 'POSITIF') sentiment = 'POSITIF';
      else if (score < -0.3 && sentiment !== 'NEGATIF') sentiment = 'NEGATIF';
      else if (score >= -0.3 && score <= 0.3 && sentiment !== 'NEUTRE') sentiment = 'NEUTRE';

      return {
        score,
        sentiment,
        explanation: analysis.explanation || 'Analyse effectuée'
      };

    } catch (error) {
      console.error('❌ Erreur analyse Gemini:', error.message);
      
      // Fallback: analyse simple basique
      const lowerText = text.toLowerCase();
      const positiveWords = ['excellent', 'bien', 'super', 'génial', 'intéressant', 'bon'];
      const negativeWords = ['mauvais', 'nul', 'ennuyeux', 'difficile', 'incompréhensible'];
      
      let score = 0;
      positiveWords.forEach(word => {
        if (lowerText.includes(word)) score += 0.3;
      });
      negativeWords.forEach(word => {
        if (lowerText.includes(word)) score -= 0.3;
      });
      
      score = Math.max(-1, Math.min(1, score));
      
      let sentiment = 'NEUTRE';
      if (score > 0.3) sentiment = 'POSITIF';
      else if (score < -0.3) sentiment = 'NEGATIF';

      return {
        score,
        sentiment,
        explanation: 'Analyse de secours (erreur API)'
      };
    }
  }

  /**
   * Analyse et sauvegarde le sentiment d'une réponse étudiant
   * @param {string} reponseEtudiantId - L'ID de la réponse
   * @param {string} texte - Le texte de la réponse
   */
  async analyzeAndSaveReponse(reponseEtudiantId, texte) {
    const analysis = await this.analyzeText(texte);
    
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

    console.log(`📊 Analyse de ${reponses.length} réponses avec Gemini...`);

    const results = [];
    for (const reponse of reponses) {
      if (reponse.contenu) {
        try {
          const analysis = await this.analyzeAndSaveReponse(
            reponse.id,
            reponse.contenu
          );
          results.push(analysis);
          
          // Petit délai pour éviter rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ Erreur analyse réponse ${reponse.id}:`, error.message);
        }
      }
    }

    console.log(`✅ ${results.length} réponses analysées avec succès`);
    return results;
  }

  /**
   * Extrait les mots-clés les plus fréquents avec Gemini
   * @param {Array<string>} texts - Tableau de textes
   * @param {number} limit - Nombre de mots-clés à retourner
   */
  async extractKeywords(texts, limit = 20) {
    if (!this.genAI || texts.length === 0) {
      return this._extractKeywordsBasic(texts, limit);
    }

    try {
      const combinedText = texts.join('\n---\n');
      
      const prompt = `
Analyse ces commentaires d'étudiants et extrais les ${limit} mots-clés ou expressions les plus importants.

Commentaires:
${combinedText}

Réponds UNIQUEMENT au format JSON (sans markdown):
{
  "keywords": [
    {"word": "mot-clé", "count": nombre_occurrences},
    ...
  ]
}

Règles:
- Ignore les mots vides (le, la, de, etc.)
- Groupe les synonymes
- Compte les occurrences réelles
- Maximum ${limit} mots-clés
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const cleanedResponse = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const data = JSON.parse(cleanedResponse);
      return data.keywords || [];

    } catch (error) {
      console.error('❌ Erreur extraction mots-clés Gemini:', error.message);
      return this._extractKeywordsBasic(texts, limit);
    }
  }

  /**
   * Extraction basique de mots-clés (fallback)
   */
  _extractKeywordsBasic(texts, limit = 20) {
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

  /**
   * Génère un résumé des commentaires avec Gemini
   * @param {Array<string>} texts - Tableau de textes
   */
  async generateSummary(texts) {
    if (!this.genAI || texts.length === 0) {
      return 'Aucun commentaire à résumer.';
    }

    try {
      const combinedText = texts.slice(0, 50).join('\n---\n'); // Limiter à 50 commentaires
      
      const prompt = `
Résume ces commentaires d'étudiants sur un cours en 3-4 phrases.
Mets en avant les points principaux (positifs et négatifs).

Commentaires:
${combinedText}

Réponds en français, de manière concise et professionnelle.
`;

      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();

    } catch (error) {
      console.error('❌ Erreur génération résumé:', error.message);
      return 'Résumé non disponible.';
    }
  }
}

module.exports = new SentimentGeminiService();
