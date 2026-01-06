const { AnneeAcademique, Semestre, Cours } = require('./src/models');

async function testCleanAndCreate() {
  try {
    console.log('🧪 Test avec nettoyage préalable...');
    
    // Nettoyer d'abord
    console.log('\n🧹 Nettoyage des données de test...');
    await AnneeAcademique.destroy({ where: { nom: { [require('sequelize').Op.like]: '%test%' } } });
    await AnneeAcademique.destroy({ where: { nom: '2024-2025' } });
    console.log('✅ Nettoyage terminé');
    
    // Test 1: Créer une année académique
    console.log('\n1. Création d\'une année académique...');
    const annee = await AnneeAcademique.create({
      nom: 'Test-2024-2025',
      dateDebut: '2024-09-01',
      dateFin: '2025-06-30',
      estActive: true
    });
    console.log('✅ Année académique créée:', {
      id: annee.id,
      nom: annee.nom,
      estActive: annee.estActive
    });
    
    // Test 2: Créer un semestre
    console.log('\n2. Création d\'un semestre...');
    const semestre = await Semestre.create({
      nom: 'Semestre 1 Test',
      numero: 1,
      dateDebut: '2024-09-01',
      dateFin: '2025-01-31',
      anneeAcademiqueId: annee.id,
      estActif: true
    });
    console.log('✅ Semestre créé:', {
      id: semestre.id,
      nom: semestre.nom,
      numero: semestre.numero
    });
    
    // Test 3: Créer un cours
    console.log('\n3. Création d\'un cours...');
    const cours = await Cours.create({
      code: 'TEST101',
      nom: 'Cours de Test',
      anneeAcademiqueId: annee.id,
      semestreId: semestre.id
    });
    console.log('✅ Cours créé:', {
      id: cours.id,
      code: cours.code,
      nom: cours.nom
    });
    
    // Test 4: Vérifier les relations
    console.log('\n4. Test des relations...');
    const anneeAvecRelations = await AnneeAcademique.findByPk(annee.id, {
      include: [
        { model: Semestre, as: 'Semestres' },
        { model: Cours, as: 'Cours' }
      ]
    });
    
    console.log('✅ Année avec relations:', {
      nom: anneeAvecRelations.nom,
      nombreSemestres: anneeAvecRelations.Semestres?.length || 0,
      nombreCours: anneeAvecRelations.Cours?.length || 0
    });
    
    // Nettoyage final
    console.log('\n5. Nettoyage final...');
    await cours.destroy();
    await semestre.destroy();
    await annee.destroy();
    console.log('✅ Nettoyage terminé');
    
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

testCleanAndCreate();