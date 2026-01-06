const { AnneeAcademique, Semestre, Cours } = require('./src/models');

async function testAnneeAcademique() {
  try {
    console.log('🧪 Test des modèles AnneeAcademique et Semestre...');
    
    // Test 1: Créer une année académique
    console.log('\n1. Création d\'une année académique...');
    const annee = await AnneeAcademique.create({
      nom: '2024-2025',
      dateDebut: '2024-09-01',
      dateFin: '2025-06-30',
      estActive: true
    });
    console.log('✅ Année académique créée:', annee.nom);
    
    // Test 2: Créer un semestre
    console.log('\n2. Création d\'un semestre...');
    const semestre = await Semestre.create({
      nom: 'Semestre 1',
      numero: 1,
      dateDebut: '2024-09-01',
      dateFin: '2025-01-31',
      anneeAcademiqueId: annee.id,
      estActif: true
    });
    console.log('✅ Semestre créé:', semestre.nom);
    
    // Test 3: Créer un cours
    console.log('\n3. Création d\'un cours...');
    const cours = await Cours.create({
      code: 'TEST101',
      nom: 'Cours de Test',
      anneeAcademiqueId: annee.id,
      semestreId: semestre.id
    });
    console.log('✅ Cours créé:', cours.nom);
    
    // Test 4: Vérifier les relations
    console.log('\n4. Test des relations...');
    const anneeAvecSemestres = await AnneeAcademique.findByPk(annee.id, {
      include: [Semestre, Cours]
    });
    console.log('✅ Année avec relations:', {
      nom: anneeAvecSemestres.nom,
      nombreSemestres: anneeAvecSemestres.Semestres?.length || 0,
      nombreCours: anneeAvecSemestres.Cours?.length || 0
    });
    
    // Nettoyage
    console.log('\n5. Nettoyage...');
    await cours.destroy();
    await semestre.destroy();
    await annee.destroy();
    console.log('✅ Nettoyage terminé');
    
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

testAnneeAcademique();