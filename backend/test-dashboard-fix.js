// Test pour vérifier si l'erreur de colonne enseignant_id est résolue
const db = require('./src/models');

async function testDashboardQueries() {
  try {
    console.log('🧪 Test des requêtes dashboard...');

    // Test 1: Requête des alertes (ligne 77 du dashboard controller)
    console.log('\n1. Test des évaluations proches de la fin...');
    const evaluationsProcheFin = await db.Evaluation.findAll({
      where: {
        statut: 'PUBLIEE',
        dateFin: {
          [db.Sequelize.Op.gte]: new Date(),
          [db.Sequelize.Op.lte]: new Date(Date.now() + 48 * 60 * 60 * 1000)
        }
      },
      include: [{ model: db.Cours, required: false }],
      limit: 3
    });
    console.log('✅ Requête 1 réussie:', evaluationsProcheFin.length, 'résultats');

    // Test 2: Requête des activités récentes (ligne 234 du dashboard controller)
    console.log('\n2. Test des évaluations récentes...');
    const recentEvaluations = await db.Evaluation.findAll({
      limit: 4,
      order: [['createdAt', 'DESC']],
      include: [
        { model: db.Cours, required: false },
        { 
          model: db.Administrateur, 
          include: [{ model: db.Utilisateur }] 
        }
      ]
    });
    console.log('✅ Requête 2 réussie:', recentEvaluations.length, 'résultats');

    // Test 3: Vérifier les associations CoursEnseignant
    console.log('\n3. Test des associations CoursEnseignant...');
    const coursAvecEnseignants = await db.Cours.findAll({
      include: [
        {
          model: db.Enseignant,
          through: { attributes: ['role', 'estPrincipal'] }
        }
      ],
      limit: 3
    });
    console.log('✅ Requête 3 réussie:', coursAvecEnseignants.length, 'cours trouvés');

    console.log('\n🎉 Tous les tests sont passés ! L\'erreur enseignant_id est résolue.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    process.exit(1);
  } finally {
    await db.sequelize.close();
  }
}

testDashboardQueries();