// Test complet de création d'utilisateurs (Admin, Enseignant, Étudiant)
const bcrypt = require('bcryptjs');
const db = require('./src/models');

async function testUserCreation() {
  try {
    console.log('🧪 Test de création des utilisateurs...\n');

    // Connexion à la base de données
    await db.sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie\n');

    // 1. TEST CRÉATION ADMINISTRATEUR
    console.log('1️⃣ Test création Administrateur...');
    
    const adminEmail = 'test.admin@saintjeaningenieur.org';
    const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);

    // Supprimer l'admin de test s'il existe
    await db.Utilisateur.destroy({ where: { email: adminEmail }, force: true });

    const adminUser = await db.Utilisateur.create({
      nom: 'Admin',
      prenom: 'Test',
      email: adminEmail,
      motDePasseHash: hashedPasswordAdmin,
      estActif: true
    }, { hooks: false });

    const adminProfile = await db.Administrateur.create({
      id: adminUser.id,
      profil: 'https://example.com/admin-profile'
    });

    console.log('✅ Administrateur créé avec succès');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Profil: ${adminProfile.profil}\n`);

    // 2. TEST CRÉATION ENSEIGNANT
    console.log('2️⃣ Test création Enseignant...');
    
    const enseignantEmail = 'jean.dupont@saintjeaningenieur.org';
    const hashedPasswordEnseignant = await bcrypt.hash('enseignant123', 10);

    // Supprimer l'enseignant de test s'il existe
    await db.Utilisateur.destroy({ where: { email: enseignantEmail }, force: true });

    const enseignantUser = await db.Utilisateur.create({
      nom: 'Dupont',
      prenom: 'Jean',
      email: enseignantEmail,
      motDePasseHash: hashedPasswordEnseignant,
      estActif: true
    }, { hooks: false });

    const enseignantProfile = await db.Enseignant.create({
      id: enseignantUser.id,
      specialite: 'Informatique'
    });

    console.log('✅ Enseignant créé avec succès');
    console.log(`   ID: ${enseignantUser.id}`);
    console.log(`   Email: ${enseignantUser.email}`);
    console.log(`   Spécialité: ${enseignantProfile.specialite}\n`);

    // 3. TEST CRÉATION ÉTUDIANT
    console.log('3️⃣ Test création Étudiant...');
    
    const etudiantEmail = 'marie.martin@saintjeaningenieur.org';
    const hashedPasswordEtudiant = await bcrypt.hash('etudiant123', 10);

    // Supprimer l'étudiant de test s'il existe
    await db.Utilisateur.destroy({ where: { email: etudiantEmail }, force: true });

    // Créer une école et une classe pour l'étudiant
    let ecole = await db.Ecole.findOne({ where: { nom: 'École Test' } });
    if (!ecole) {
      ecole = await db.Ecole.create({
        nom: 'École Test',
        adresse: '123 Rue Test',
        telephone: '0123456789',
        email: 'contact@ecole-test.com'
      });
    }

    // Créer une année académique
    let anneeAcademique = await db.AnneeAcademique.findOne({ where: { libelle: '2024-2025' } });
    if (!anneeAcademique) {
      anneeAcademique = await db.AnneeAcademique.create({
        libelle: '2024-2025',
        dateDebut: new Date('2024-09-01'),
        dateFin: new Date('2025-06-30'),
        estCourante: true
      });
    }

    // Créer une classe
    let classe = await db.Classe.findOne({ where: { nom: 'L3 Informatique' } });
    if (!classe) {
      classe = await db.Classe.create({
        nom: 'L3 Informatique',
        niveau: 'L3',
        ecole_id: ecole.id,
        anneeAcademiqueId: anneeAcademique.id
      });
    }

    const etudiantUser = await db.Utilisateur.create({
      nom: 'Martin',
      prenom: 'Marie',
      email: etudiantEmail,
      motDePasseHash: hashedPasswordEtudiant,
      estActif: true
    }, { hooks: false });

    const etudiantProfile = await db.Etudiant.create({
      id: etudiantUser.id,
      matricule: 'E2024001',
      classe_id: classe.id
    });

    console.log('✅ Étudiant créé avec succès');
    console.log(`   ID: ${etudiantUser.id}`);
    console.log(`   Email: ${etudiantUser.email}`);
    console.log(`   Matricule: ${etudiantProfile.matricule}`);
    console.log(`   Classe: ${classe.nom}\n`);

    // 4. TEST DES ASSOCIATIONS
    console.log('4️⃣ Test des associations...');

    // Test association Cours-Enseignant
    console.log('   Test création Cours et association avec Enseignant...');
    
    // Créer un semestre
    let semestre = await db.Semestre.findOne({ where: { nom: 'Semestre 1' } });
    if (!semestre) {
      semestre = await db.Semestre.create({
        nom: 'Semestre 1',
        numero: 1,
        dateDebut: new Date('2024-09-01'),
        dateFin: new Date('2025-01-31'),
        annee_academique_id: anneeAcademique.id
      });
    }

    const cours = await db.Cours.create({
      code: 'INF301',
      nom: 'Bases de Données',
      estArchive: false,
      anneeAcademiqueId: anneeAcademique.id,
      semestreId: semestre.id
    });

    // Associer l'enseignant au cours via CoursEnseignant
    const coursEnseignant = await db.CoursEnseignant.create({
      cours_id: cours.id,
      enseignant_id: enseignantProfile.id,
      role: 'TITULAIRE',
      estPrincipal: true
    });

    console.log('✅ Cours créé et associé à l\'enseignant');
    console.log(`   Cours: ${cours.nom} (${cours.code})`);
    console.log(`   Enseignant: ${enseignantUser.prenom} ${enseignantUser.nom}`);
    console.log(`   Rôle: ${coursEnseignant.role}\n`);

    // 5. TEST DE RÉCUPÉRATION AVEC ASSOCIATIONS
    console.log('5️⃣ Test de récupération avec associations...');

    // Récupérer le cours avec ses enseignants
    const coursAvecEnseignants = await db.Cours.findByPk(cours.id, {
      include: [
        {
          model: db.Enseignant,
          through: { attributes: ['role', 'estPrincipal'] },
          include: [{ model: db.Utilisateur }]
        }
      ]
    });

    console.log('✅ Cours récupéré avec enseignants:');
    console.log(`   Cours: ${coursAvecEnseignants.nom}`);
    coursAvecEnseignants.Enseignants.forEach(ens => {
      console.log(`   - Enseignant: ${ens.Utilisateur.prenom} ${ens.Utilisateur.nom} (${ens.CoursEnseignant.role})`);
    });

    // Récupérer l'étudiant avec sa classe
    const etudiantAvecClasse = await db.Etudiant.findByPk(etudiantProfile.id, {
      include: [
        { model: db.Utilisateur },
        { 
          model: db.Classe,
          include: [{ model: db.Ecole }]
        }
      ]
    });

    console.log('\n✅ Étudiant récupéré avec classe:');
    console.log(`   Étudiant: ${etudiantAvecClasse.Utilisateur.prenom} ${etudiantAvecClasse.Utilisateur.nom}`);
    console.log(`   Classe: ${etudiantAvecClasse.Classe.nom}`);
    console.log(`   École: ${etudiantAvecClasse.Classe.Ecole.nom}\n`);

    // 6. NETTOYAGE
    console.log('6️⃣ Nettoyage des données de test...');
    await db.CoursEnseignant.destroy({ where: { id: coursEnseignant.id }, force: true });
    await db.Cours.destroy({ where: { id: cours.id }, force: true });
    await db.Utilisateur.destroy({ where: { email: 'test.admin@saintjeaningenieur.org' }, force: true });
    await db.Utilisateur.destroy({ where: { email: 'jean.dupont@saintjeaningenieur.org' }, force: true });
    await db.Utilisateur.destroy({ where: { email: 'marie.martin@saintjeaningenieur.org' }, force: true });
    console.log('✅ Données de test nettoyées\n');

    console.log('🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !');
    console.log('✅ Création d\'administrateurs: OK');
    console.log('✅ Création d\'enseignants: OK');
    console.log('✅ Création d\'étudiants: OK');
    console.log('✅ Associations Cours-Enseignant: OK');
    console.log('✅ Récupération avec associations: OK');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await db.sequelize.close();
  }
}

testUserCreation();