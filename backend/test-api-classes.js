const db = require('./src/models');

async function testClassesAPI() {
  try {
    console.log('🔍 Test de l\'API classes - Vérification du format de réponse\n');
    
    // Simuler ce que l'API retourne
    const classes = await db.Classe.findAll({
      include: [
        {
          model: db.Ecole,
          as: 'Ecole'
        },
        {
          model: db.AnneeAcademique,
          as: 'AnneeAcademique'
        }
      ]
    });
    
    console.log(`📊 Nombre de classes: ${classes.length}\n`);
    
    if (classes.length > 0) {
      const firstClass = classes[0].toJSON();
      console.log('📋 Exemple de classe (format JSON):');
      console.log(JSON.stringify(firstClass, null, 2));
      
      console.log('\n🔍 Vérification des champs importants:');
      console.log(`  - id: ${firstClass.id}`);
      console.log(`  - nom: ${firstClass.nom}`);
      console.log(`  - ecole_id: ${firstClass.ecole_id}`);
      console.log(`  - ecoleId: ${firstClass.ecoleId}`);
      console.log(`  - Ecole: ${firstClass.Ecole ? firstClass.Ecole.nom : 'null'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

testClassesAPI();
