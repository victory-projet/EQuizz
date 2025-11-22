// backend/tests/unit/services/sentiment.service.test.js

const sentimentService = require('../../../src/services/sentiment.service');

describe('SentimentService', () => {
  
  describe('analyzeText', () => {
    
    it('devrait analyser un texte positif', () => {
      // Arrange
      const text = "This course is excellent and very interesting!";

      // Act
      const result = sentimentService.analyzeText(text);

      // Assert
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('sentiment');
      expect(result.sentiment).toBe('POSITIF');
      expect(result.score).toBeGreaterThan(0);
    });

    it('devrait analyser un texte négatif', () => {
      // Arrange
      const text = "This course is terrible and boring.";

      // Act
      const result = sentimentService.analyzeText(text);

      // Assert
      expect(result.sentiment).toBe('NEGATIF');
      expect(result.score).toBeLessThan(0);
    });

    it('devrait analyser un texte neutre', () => {
      // Arrange
      const text = "The course covers various topics.";

      // Act
      const result = sentimentService.analyzeText(text);

      // Assert
      expect(result.sentiment).toBe('NEUTRE');
      expect(Math.abs(result.score)).toBeLessThanOrEqual(0.1);
    });

    it('devrait gérer un texte vide', () => {
      // Act
      const result = sentimentService.analyzeText('');

      // Assert
      expect(result.sentiment).toBe('NEUTRE');
      expect(result.score).toBe(0);
    });

    it('devrait gérer null', () => {
      // Act
      const result = sentimentService.analyzeText(null);

      // Assert
      expect(result.sentiment).toBe('NEUTRE');
      expect(result.score).toBe(0);
    });
  });

  describe('extractKeywords', () => {
    
    it('devrait extraire les mots-clés d\'un ensemble de textes', () => {
      // Arrange
      const texts = [
        "The course is excellent and interesting",
        "Very interesting content and excellent teacher",
        "Excellent course with great examples"
      ];

      // Act
      const keywords = sentimentService.extractKeywords(texts, 5);

      // Assert
      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords.length).toBeLessThanOrEqual(5);
      expect(keywords[0]).toHaveProperty('word');
      expect(keywords[0]).toHaveProperty('count');
      
      // "excellent" devrait être le mot le plus fréquent
      expect(keywords[0].word).toBe('excellent');
      expect(keywords[0].count).toBe(3);
    });

    it('devrait filtrer les stop words', () => {
      // Arrange
      const texts = ["The course is very good"];

      // Act
      const keywords = sentimentService.extractKeywords(texts, 10);

      // Assert
      const words = keywords.map(k => k.word);
      expect(words).not.toContain('the');
      expect(words).not.toContain('is');
      // Note: "very" peut être inclus car il a 4 caractères et n'est pas dans tous les stop words
      expect(words).toContain('course');
      expect(words).toContain('good');
    });

    it('devrait gérer un tableau vide', () => {
      // Act
      const keywords = sentimentService.extractKeywords([], 5);

      // Assert
      expect(keywords).toEqual([]);
    });
  });
});
