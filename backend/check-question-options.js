// Script pour vérifier et corriger le format des options des questions
require('dotenv').config();
const db = require('./src/models');

async function checkAndFixQuestionOptions() {
  try {
    console.log('🔍 Vérification des options des questions...\n');

    const questions = await db.Question.findAll();
    
    let totalQuestions = questions.length;
    let questionsWithIssues = 0;
    let questionsFixed = 0;

    console.log(`📊 Total de questions: ${totalQuestions}\n`);

    for (const question of questions) {
      const rawOptions = question.getDataValue('options');
      
      console.log(`Question ${question.id}:`);
      console.log(`  Type: ${question.typeQuestion}`);
      console.log(`  Options (raw):`, typeof rawOptions, rawOptions);
      
      if (question.typeQuestion === 'CHOIX_MULTIPLE') {
        let needsFix = false;
        let fixedOptions = [];

        // Vérifier si options est une chaîne
        if (typeof rawOptions === 'string') {
          console.log(`  ⚠️  Options est une chaîne, tentative de parsing...`);
          questionsWithIssues++;
          needsFix = true;
          
          try {
            fixedOptions = JSON.parse(rawOptions);
            if (!Array.isArray(fixedOptions)) {
              fixedOptions = [];
            }
          } catch (e) {
            console.log(`  ❌ Erreur de parsing:`, e.message);
            fixedOptions = [];
          }
        } 
        // Vérifier si options n'est pas un tableau
        else if (!Array.isArray(rawOptions)) {
          console.log(`  ⚠️  Options n'est pas un tableau:`, rawOptions);
          questionsWithIssues++;
          needsFix = true;
          fixedOptions = [];
        }
        // Options est déjà un tableau
        else {
          console.log(`  ✅ Options est déjà un tableau valide`);
          fixedOptions = rawOptions;
        }

        // Corriger si nécessaire
        if (needsFix) {
          await question.update({ options: fixedOptions });
          questionsFixed++;
          console.log(`  ✅ Options corrigées:`, fixedOptions);
        }
      } else {
        console.log(`  ℹ️  Question de type REPONSE_OUVERTE, pas d'options nécessaires`);
      }
      
      console.log('');
    }

    console.log('\n📈 Résumé:');
    console.log(`  Total de questions: ${totalQuestions}`);
    console.log(`  Questions avec problèmes: ${questionsWithIssues}`);
    console.log(`  Questions corrigées: ${questionsFixed}`);
    console.log(`  Questions OK: ${totalQuestions - questionsWithIssues}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkAndFixQuestionOptions();
