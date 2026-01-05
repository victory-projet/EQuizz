// Test script to check model imports
console.log('Testing model imports...');

try {
  console.log('1. Testing basic require...');
  const models = require('./src/models');
  console.log('✅ Models loaded successfully');
  
  console.log('2. Testing individual models...');
  const { Evaluation, Question, ReponseEtudiant, Etudiant, Classe, Enseignant, Cours, Utilisateur } = models;
  
  console.log('✅ Evaluation:', !!Evaluation);
  console.log('✅ Question:', !!Question);
  console.log('✅ ReponseEtudiant:', !!ReponseEtudiant);
  console.log('✅ Etudiant:', !!Etudiant);
  console.log('✅ Classe:', !!Classe);
  console.log('✅ Enseignant:', !!Enseignant);
  console.log('✅ Cours:', !!Cours);
  console.log('✅ Utilisateur:', !!Utilisateur);
  
  console.log('3. Testing Evaluation.findByPk...');
  Evaluation.findByPk('35943e5e-d4c0-42ad-ab3a-a18546e185ad')
    .then(eval => {
      console.log('✅ Evaluation found:', !!eval);
      if (eval) {
        console.log('   Title:', eval.titre);
      }
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Error finding evaluation:', err.message);
      process.exit(1);
    });
    
} catch (error) {
  console.error('❌ Error loading models:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}