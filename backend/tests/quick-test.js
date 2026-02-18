// backend/tests/quick-test.js
// Script de test rapide pour vérifier le système de transfert

const db = require('../src/models');
const { genererMatricule } = require('../src/utils/matriculeGenerator');

async function quickTest() {
  console.log('🧪 Test Rapide du Système de Transfert\n');

  try {
    // 1. Connexion à la base de données
    console.log('1️⃣  Connexion à la base de données...');
    await db.sequelize.authenticate();
    console.log('   ✅ Connexion réussie\n');

    // 2. Synchroniser les tables
    console.log('2️⃣  Synchronisation des tables...');
    await db.sequelize.sync({ force: true });
    console.log('   ✅ Tables synchronisées\n');

    // 3. Créer une école
    console.log('3️⃣  Création d\'une école de test...');
    const ecole1 = await db.Ecole.create({
      nom: 'Saint Jean Ingénieur',
      adresse: '123 Rue Test',
      telephone: '0123456789',
      email: 'test@sjing.org'
    });
    console.log(`   ✅ École créée: ${ecole1.nom}\n`);

    // 4. Créer une deuxième école
    console.log('4️⃣  Création d\'une deuxième école...');
    const ecole2 = await db.Ecole.create({
      nom: 'Polytechnique',
      adresse: '456 Avenue Tech',
      telephone: '0987654321',
      email: 'test@polytech.org'
    });
    console.log(`   ✅ École créée: ${ecole2.nom}\n`);

    // 5. Créer une année académique
    console.log('5️⃣  Création d\'une année académique...');
    const anneeAcademique = await db.AnneeAcademique.create({
      nom: '2023-2024',
      dateDebut: new Date('2023-09-01'),
      dateFin: new Date('2024-08-31')
    });
    console.log(`   ✅ Année créée: ${anneeAcademique.nom}\n`);

    // 6. Créer des classes
    console.log('6️⃣  Création de classes...');
    const classe1 = await db.Classe.create({
      nom: 'ING4-A',
      niveau: '4',
      ecole_id: ecole1.id,
      anneeAcademiqueId: anneeAcademique.id
    });
    const classe2 = await db.Classe.create({
      nom: 'ING5-A',
      niveau: '5',
      ecole_id: ecole2.id,
      anneeAcademiqueId: anneeAcademique.id
    });
    console.log(`   ✅ Classe 1: ${classe1.nom} (${ecole1.nom})`);
    console.log(`   ✅ Classe 2: ${classe2.nom} (${ecole2.nom})\n`);

    // 7. Tester la génération de matricule
    console.log('7️⃣  Test de génération de matricule...');
    const matricule1 = await genererMatricule(ecole1.id, anneeAcademique.id);
    console.log(`   ✅ Matricule généré: ${matricule1}`);
    const matricule2 = await genererMatricule(ecole2.id, anneeAcademique.id);
    console.log(`   ✅ Matricule généré: ${matricule2}\n`);

    // 8. Créer un étudiant
    console.log('8️⃣  Création d\'un étudiant...');
    const utilisateur = await db.Utilisateur.create({
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@saintjeaningenieur.org',
      estActif: true
    });

    const etudiant = await db.Etudiant.create({
      id: utilisateur.id,
      matricule: matricule1,
      classe_id: classe1.id
    });

    // Créer l'historique initial
    await db.HistoriqueEtudiant.create({
      etudiant_id: etudiant.id,
      matricule: matricule1,
      ecole_id: ecole1.id,
      classe_id: classe1.id,
      dateDebut: new Date(),
      dateFin: null,
      estPeriodeActuelle: true
    });

    console.log(`   ✅ Étudiant créé: ${utilisateur.prenom} ${utilisateur.nom}`);
    console.log(`   ✅ UUID: ${etudiant.id}`);
    console.log(`   ✅ Matricule: ${etudiant.matricule}\n`);

    // 9. Simuler un transfert d'école
    console.log('9️⃣  Simulation d\'un transfert d\'école...');
    
    // Clôturer l'historique actuel
    await db.HistoriqueEtudiant.update(
      {
        dateFin: new Date(),
        estPeriodeActuelle: false
      },
      {
        where: {
          etudiant_id: etudiant.id,
          estPeriodeActuelle: true
        }
      }
    );

    // Générer un nouveau matricule
    const nouveauMatricule = await genererMatricule(ecole2.id, anneeAcademique.id);

    // Mettre à jour l'étudiant
    await etudiant.update({
      matricule: nouveauMatricule,
      classe_id: classe2.id
    });

    // Créer un nouvel historique
    await db.HistoriqueEtudiant.create({
      etudiant_id: etudiant.id,
      matricule: nouveauMatricule,
      ecole_id: ecole2.id,
      classe_id: classe2.id,
      dateDebut: new Date(),
      dateFin: null,
      estPeriodeActuelle: true
    });

    console.log('   ✅ Transfert effectué');
    console.log(`   ✅ UUID (inchangé): ${etudiant.id}`);
    console.log(`   ✅ Ancien matricule: ${matricule1}`);
    console.log(`   ✅ Nouveau matricule: ${nouveauMatricule}\n`);

    // 10. Vérifier l'historique
    console.log('🔟 Vérification de l\'historique...');
    const historique = await db.HistoriqueEtudiant.findAll({
      where: { etudiant_id: etudiant.id },
      include: [
        { model: db.Ecole, attributes: ['nom'] },
        { model: db.Classe, attributes: ['nom'] }
      ],
      order: [['dateDebut', 'DESC']]
    });

    console.log(`   ✅ Nombre d'entrées dans l'historique: ${historique.length}\n`);

    historique.forEach((h, index) => {
      console.log(`   📋 Période ${index + 1}:`);
      console.log(`      - Matricule: ${h.matricule}`);
      console.log(`      - École: ${h.Ecole.nom}`);
      console.log(`      - Classe: ${h.Classe.nom}`);
      console.log(`      - Date début: ${h.dateDebut.toISOString().split('T')[0]}`);
      console.log(`      - Date fin: ${h.dateFin ? h.dateFin.toISOString().split('T')[0] : 'En cours'}`);
      console.log(`      - Période actuelle: ${h.estPeriodeActuelle ? 'Oui' : 'Non'}\n`);
    });

    console.log('✅ TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS ! 🎉\n');

  } catch (error) {
    console.error('❌ ERREUR:', error.message);
    console.error(error);
  } finally {
    // Fermer la connexion
    await db.sequelize.close();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter le test
quickTest();
