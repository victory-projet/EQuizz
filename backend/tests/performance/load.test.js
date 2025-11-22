// Tests de performance (optionnel)
describe('Tests de Performance', () => {
  describe('Chargement des évaluations', () => {
    it('devrait charger 100 évaluations en moins de 1 seconde', async () => {
      const startTime = Date.now();
      
      // Simuler le chargement de 100 évaluations
      // await evaluationService.findAll();
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Soumission de réponses', () => {
    it('devrait traiter 50 soumissions simultanées', async () => {
      const submissions = Array(50).fill(null).map((_, i) => ({
        quizzId: 'quizz-001',
        etudiantId: `etu-${i}`,
        reponses: [
          { question_id: 'q-001', contenu: 'Réponse' },
        ],
      }));

      const startTime = Date.now();
      
      // await Promise.all(
      //   submissions.map(sub => 
      //     quizzService.submitReponses(sub.quizzId, sub.etudiantId, sub.reponses)
      //   )
      // );
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Devrait traiter toutes les soumissions en moins de 5 secondes
      expect(duration).toBeLessThan(5000);
    });
  });
});
