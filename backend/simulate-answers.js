require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function runSimulation() {
  try {
    console.log('1. Seeding de la Base de données...');
    // await axios.post(`${BASE_URL}/init/reset`); // Commented out as we ran node reset-database.js
    const seedRes = await axios.post(`${BASE_URL}/init/seed`);
    console.log('✅ Base de données réinitialisée et peuplée avec succès !');

    // Mettre à jour manuellement la dateFin pour forcer l'évaluation à être valide
    // car le backend tourne peut-être avec l'ancienne version en mémoire.
    const db = require('./src/models');
    await db.Evaluation.update(
      { dateFin: new Date('2027-12-31T23:59:59'), dateDebut: new Date('2024-01-01') },
      { where: {} }
    );
    console.log("✅ Dates de l'évaluation corrigées dans la base !");

    const students = [
      { email: 'gills.sims@saintjeaningenieur.org', pwd: 'Etudiant123!' },
      { email: 'lucas.petit@saintjeaningenieur.org', pwd: 'Etudiant123!' },
      { email: 'emma.takam@saintjeaningenieur.org', pwd: 'Etudiant123!' }
    ];

    for (const [index, student] of students.entries()) {
      console.log(`\n2.${index+1} Connexion de l'étudiant: ${student.email}`);
      const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: student.email,
        motDePasse: student.pwd
      });
      const token = loginRes.data.token;

      // Obtenir les évaluations disponibles
      const quizzesRes = await axios.get(`${BASE_URL}/student/quizzes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const availableQuizzes = quizzesRes.data;
      if (!availableQuizzes || availableQuizzes.length === 0) {
        console.log('⚠️ Aucun quizz trouvé pour cet étudiant. On continue.');
        continue;
      }
      
      // On prend l'ID du Quizz encapsulé dans l'évaluation
      const evaluation = availableQuizzes[0];
      const quizzToAnswerId = evaluation.Quizz ? evaluation.Quizz.id : (evaluation.quizz_id || evaluation.quizzId);
      
      if (!quizzToAnswerId) {
        console.log("⚠️ L'évaluation n'est pas associée à un quizz.");
        continue;
      }

      console.log(`📡 Récupération des détails du quizz ID: ${quizzToAnswerId}`);
      const detailsRes = await axios.get(`${BASE_URL}/student/quizzes/${quizzToAnswerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const quizzDetails = detailsRes.data;
      const questions = quizzDetails.Questions || quizzDetails.questions || [];
      if (questions.length === 0) {
         console.log('⚠️ Aucune question trouvée dans ce quizz!');
         continue;
      }

      console.log(`📝 Soumission des réponses pour ${questions.length} questions...`);
      const reponsesToSubmit = questions.map(q => {
        let answer = '';
        if (q.typeQuestion === 'REPONSE_OUVERTE') {
          const suggestions = [
            "Le cours est excellent, merci !", 
            "Les explications sont claires, mais j'aimerais plus d'exercices pratiques.", 
            "Parfait, rien à dire."
          ];
          answer = suggestions[index % suggestions.length];
        } else if (q.options && Array.isArray(q.options) && q.options.length > 0) {
          // On choisit une des deux premières options (généralement positives)
          answer = q.options[index % Math.min(2, q.options.length)];
        } else {
           answer = 'Très bien';
        }
        return {
          question_id: q.id,
          contenu: answer
        };
      });

      const submitRes = await axios.post(`${BASE_URL}/student/quizzes/${quizzToAnswerId}/submit`, {
        reponses: reponsesToSubmit,
        estFinal: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log(`✅ ${submitRes.data.message}`);
    }

    console.log('\n🎉 Simulation terminée avec succès !');
    console.log('👉 Allez maintenant sur http://localhost:4200 pour voir les statistiques réelles !');

  } catch (error) {
    console.error('❌ Erreur lors de la simulation:', error?.response?.data || error?.message || error);
  }
}

runSimulation();
