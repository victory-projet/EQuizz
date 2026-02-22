const db = require('./src/models');

async function testFullFlow() {
  try {
    console.log('🔍 Test du flux complet: Écoles → Classes → Étudiants\n');
    
    // 1. Charger les écoles
    console.log('1️⃣ Chargement des écoles...');
    const ecoles = await db.Ecole.findAll();
    console.log(`   ✅ ${ecoles.length} école(s) trouvée(s)`);
    ecoles.forEach(e => console.log(`      - ${e.nom} (ID: ${e.id})`));
    
    // 2. Charger les classes avec leurs écoles
    console.log('\n2️⃣ Chargement des classes...');
    const classes = await db.Classe.findAll({
      include: [{
        model: db.Ecole,
        as: 'Ecole'
      }]
    });
    console.log(`   ✅ ${classes.length} classe(s) trouvée(s)`);
    classes.forEach(c => {
      const classData = c.toJSON();
      console.log(`      - ${classData.nom}`);
      console.log(`        ecole_id: ${classData.ecole_id}`);
      console.log(`        Ecole: ${classData.Ecole ? classData.Ecole.nom : 'null'}`);
    });
    
    // 3. Charger les étudiants
    console.log('\n3️⃣ Chargement des étudiants...');
    const etudiants = await db.Utilisateur.findAll({
      where: { role: 'ETUDIANT' },
      include: [{
        model: db.Etudiant,
        as: 'Etudiant',
        include: [{
          model: db.Classe,
          as: 'Classe',
          include: [{
            model: db.Ecole,
            as: 'Ecole'
          }]
        }]
      }]
    });
    console.log(`   ✅ ${etudiants.length} étudiant(s) trouvé(s)`);
    etudiants.forEach(e => {
      const etudiantData = e.toJSON();
      const classe = etudiantData.Etudiant?.Classe;
      const ecole = classe?.Ecole;
      console.log(`      - ${etudiantData.prenom} ${etudiantData.nom}`);
      console.log(`        Classe: ${classe ? classe.nom : 'Non assigné'}`);
      console.log(`        École: ${ecole ? ecole.nom : 'Non assigné'}`);
    });
    
    // 4. Test du filtrage
    console.log('\n4️⃣ Test du filtrage par école...');
    if (ecoles.length > 0) {
      const ecoleId = ecoles[0].id;
      console.log(`   Filtrage par école: ${ecoles[0].nom} (${ecoleId})`);
      
      // Classes de cette école
      const classesFiltered = classes.filter(c => c.ecole_id === ecoleId);
      console.log(`   ✅ ${classesFiltered.length} classe(s) dans cette école`);
      
      // IDs des classes
      const classeIds = classesFiltered.map(c => c.id);
      
      // Étudiants dans ces classes
      const etudiantsFiltered = etudiants.filter(e => {
        const classeId = e.Etudiant?.Classe?.id;
        return classeId && classeIds.includes(classeId);
      });
      console.log(`   ✅ ${etudiantsFiltered.length} étudiant(s) dans cette école`);
    }
    
    console.log('\n✅ Test terminé avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

testFullFlow();
