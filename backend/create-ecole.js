// Script pour créer une école
const db = require('./src/models');

async function createEcole() {
  try {
    console.log('🏫 Création d\'une école...\n');

    const ecole = await db.Ecole.create({
      nom: 'Saint Jean Ingenieur',
      estActive: true
    });

    console.log('✅ École créée avec succès!');
    console.log(`   ID: ${ecole.id}`);
    console.log(`   Nom: ${ecole.nom}`);
    console.log(`   Active: ${ecole.estActive}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

createEcole();
