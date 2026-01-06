const { AnneeAcademique } = require('./src/models');

async function testDetailedError() {
  try {
    console.log('🧪 Test détaillé avec gestion d\'erreur...');
    
    const annee = await AnneeAcademique.create({
      nom: '2024-2025',
      dateDebut: '2024-09-01',
      dateFin: '2025-06-30',
      estActive: true
    });
    
    console.log('✅ Année académique créée:', annee.toJSON());
    
  } catch (error) {
    console.error('❌ Erreur détaillée:');
    console.error('Message:', error.message);
    console.error('Name:', error.name);
    console.error('SQL:', error.sql);
    console.error('Parameters:', error.parameters);
    console.error('Original:', error.original);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

testDetailedError();