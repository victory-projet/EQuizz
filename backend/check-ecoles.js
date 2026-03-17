const db = require('./src/models');

async function checkEcoles() {
  try {
    console.log('🔍 Vérification des écoles dans la base de données...\n');
    
    const ecoles = await db.Ecole.findAll();
    
    console.log(`📊 Nombre d'écoles trouvées: ${ecoles.length}\n`);
    
    if (ecoles.length > 0) {
      console.log('📋 Liste des écoles:');
      ecoles.forEach(ecole => {
        console.log(`  - ID: ${ecole.id}, Nom: ${ecole.nom}`);
      });
    } else {
      console.log('⚠️  Aucune école trouvée dans la base de données');
    }
    
    console.log('\n🔍 Vérification des classes avec leurs écoles...\n');
    
    const classes = await db.Classe.findAll({
      include: [{
        model: db.Ecole,
        as: 'Ecole'
      }]
    });
    
    console.log(`📊 Nombre de classes trouvées: ${classes.length}\n`);
    
    if (classes.length > 0) {
      console.log('📋 Liste des classes avec leurs écoles:');
      classes.forEach(classe => {
        console.log(`  - Classe: ${classe.nom}, École: ${classe.Ecole ? classe.Ecole.nom : 'Non assignée'}, ecole_id: ${classe.ecole_id}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkEcoles();
