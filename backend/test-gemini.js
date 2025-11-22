// backend/test-gemini.js
// Script de test pour l'analyse de sentiments avec Gemini

require('dotenv').config();

const sentimentGemini = require('./src/services/sentiment-gemini.service');

async function testGemini() {
  console.log('🧪 Test de l\'analyse de sentiments avec Gemini\n');

  const testCases = [
    {
      text: "Ce cours est vraiment excellent! Le professeur explique très bien et les exemples sont pertinents.",
      expected: "POSITIF"
    },
    {
      text: "Le cours est intéressant mais parfois un peu difficile à suivre.",
      expected: "NEUTRE"
    },
    {
      text: "Je trouve ce cours ennuyeux et les explications ne sont pas claires.",
      expected: "NEGATIF"
    },
    {
      text: "Cours génial, j'ai beaucoup appris. Le prof est passionné et ça se ressent!",
      expected: "POSITIF"
    },
    {
      text: "Trop de théorie, pas assez de pratique. C'est dommage.",
      expected: "NEGATIF"
    }
  ];

  console.log('📊 Analyse de 5 commentaires...\n');

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`Test ${i + 1}/${testCases.length}`);
    console.log(`Texte: "${testCase.text}"`);
    console.log(`Attendu: ${testCase.expected}`);

    try {
      const result = await sentimentGemini.analyzeText(testCase.text);
      
      console.log(`Résultat: ${result.sentiment} (score: ${result.score.toFixed(2)})`);
      console.log(`Explication: ${result.explanation}`);
      
      const isCorrect = result.sentiment === testCase.expected;
      console.log(isCorrect ? '✅ CORRECT' : '⚠️ DIFFÉRENT');
      
    } catch (error) {
      console.error('❌ Erreur:', error.message);
    }
    
    console.log('---\n');
    
    // Petit délai pour éviter rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Test extraction de mots-clés
  console.log('\n📝 Test extraction de mots-clés...\n');
  
  const comments = [
    "Le cours est excellent, très intéressant",
    "J'ai beaucoup appris, le prof est passionné",
    "Cours intéressant mais difficile",
    "Excellent contenu, bien expliqué",
    "Le professeur est très pédagogue"
  ];

  try {
    const keywords = await sentimentGemini.extractKeywords(comments, 5);
    console.log('Mots-clés extraits:');
    keywords.forEach(kw => {
      console.log(`  - ${kw.word}: ${kw.count} occurrences`);
    });
  } catch (error) {
    console.error('❌ Erreur extraction mots-clés:', error.message);
  }

  // Test génération de résumé
  console.log('\n📄 Test génération de résumé...\n');
  
  try {
    const summary = await sentimentGemini.generateSummary(comments);
    console.log('Résumé généré:');
    console.log(`"${summary}"`);
  } catch (error) {
    console.error('❌ Erreur génération résumé:', error.message);
  }

  console.log('\n✅ Tests terminés!');
}

// Exécuter les tests
testGemini().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
