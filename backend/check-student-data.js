// Script pour vérifier les données de l'étudiant dans la base de production
const { Sequelize } = require('sequelize');

// Configuration de la base de données de production
const sequelize = new Sequelize(
  'defaultdb',
  'avnadmin', 
  'AVNS_Xad0cJehM399ZU9M9Zu',
  {
    host: 'equizz-mysql-gillsimo08-1c72.e.aivencloud.com',
    port: 20530,
    dialect: 'mysql',
    logging: false, // Désactiver les logs SQL
  }
);

async function checkStudentData() {
  try {
    console.log('🔄 Connexion à la base de données de production...');
    await sequelize.authenticate();
    console.log('✅ Connexion établie\n');

    // 1. Vérifier combien d'utilisateurs existent
    const [userResults] = await sequelize.query('SELECT COUNT(*) as count FROM Utilisateur');
    console.log(`👥 Nombre d'utilisateurs: ${userResults[0].count}`);

    // 2. Vérifier combien d'étudiants existent
    const [studentResults] = await sequelize.query('SELECT COUNT(*) as count FROM Etudiant');
    console.log(`🎓 Nombre d'étudiants: ${studentResults[0].count}`);

    // 3. Vérifier combien de classes existent
    const [classResults] = await sequelize.query('SELECT COUNT(*) as count FROM Classe');
    console.log(`🏫 Nombre de classes: ${classResults[0].count}\n`);

    // 4. Chercher l'étudiant spécifique
    console.log('🔍 Recherche de l\'étudiant avec matricule 2223i032...');
    const [etudiantResults] = await sequelize.query(`
      SELECT 
        e.matricule,
        u.email,
        u.nom,
        u.prenom,
        u.motDePasseHash IS NOT NULL as hasPassword,
        c.id as classe_id,
        c.nom as classe_nom
      FROM Etudiant e
      JOIN Utilisateur u ON e.id = u.id
      JOIN Classe c ON e.classe_id = c.id
      WHERE e.matricule = '2223i032'
    `);

    if (etudiantResults.length === 0) {
      console.log('❌ Aucun étudiant trouvé avec le matricule 2223i032');
    } else {
      const etudiant = etudiantResults[0];
      console.log('✅ Étudiant trouvé:');
      console.log(`   Matricule: ${etudiant.matricule}`);
      console.log(`   Email: ${etudiant.email}`);
      console.log(`   Nom: ${etudiant.prenom} ${etudiant.nom}`);
      console.log(`   A un mot de passe: ${etudiant.hasPassword ? 'Oui' : 'Non'}`);
      console.log(`   Classe ID: ${etudiant.classe_id}`);
      console.log(`   Classe: ${etudiant.classe_nom}`);
    }

    // 5. Lister toutes les classes disponibles
    console.log('\n📋 Classes disponibles:');
    const [classListResults] = await sequelize.query('SELECT id, nom, niveau FROM Classe ORDER BY nom');
    classListResults.forEach(classe => {
      console.log(`   ID: ${classe.id} - ${classe.nom} (${classe.niveau})`);
    });

    // 6. Chercher tous les étudiants pour debug
    console.log('\n👥 Tous les étudiants:');
    const [allStudentsResults] = await sequelize.query(`
      SELECT 
        e.matricule,
        u.email,
        u.nom,
        u.prenom,
        c.nom as classe_nom
      FROM Etudiant e
      JOIN Utilisateur u ON e.id = u.id
      JOIN Classe c ON e.classe_id = c.id
      ORDER BY e.matricule
    `);
    
    allStudentsResults.forEach(etudiant => {
      console.log(`   ${etudiant.matricule} - ${etudiant.email} - ${etudiant.prenom} ${etudiant.nom} (${etudiant.classe_nom})`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkStudentData();