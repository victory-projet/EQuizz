require('dotenv').config();
const db = require('./src/models');

async function testMiddleware() {
  console.log('🧪 Test direct du chargement utilisateur\n');
  
  try {
    // ID du superadmin
    const userId = '4b25b83f-79d1-444a-9aaa-30f5947bdc9c';
    
    console.log('1️⃣ Chargement de l\'utilisateur avec associations...');
    const utilisateur = await db.Utilisateur.findByPk(userId, {
      include: [
        { model: db.Superadministrateur, as: 'Superadministrateur' },
        { model: db.Enseignant, as: 'Enseignant' },
        { 
          model: db.Etudiant, 
          as: 'Etudiant',
          include: [{ model: db.Classe, as: 'Classe' }]
        }
      ]
    });
    
    if (!utilisateur) {
      console.log('❌ Utilisateur non trouvé');
      process.exit(1);
    }
    
    console.log('✅ Utilisateur trouvé:');
    console.log('ID:', utilisateur.id);
    console.log('Nom:', utilisateur.nom);
    console.log('Prénom:', utilisateur.prenom);
    console.log('Email:', utilisateur.email);
    console.log('Est actif:', utilisateur.estActif);
    console.log('CreatedAt:', utilisateur.createdAt);
    console.log('UpdatedAt:', utilisateur.updatedAt);
    
    console.log('\n2️⃣ Vérification des associations:');
    console.log('Superadministrateur:', utilisateur.Superadministrateur ? 'OUI' : 'NON');
    console.log('Enseignant:', utilisateur.Enseignant ? 'OUI' : 'NON');
    console.log('Etudiant:', utilisateur.Etudiant ? 'OUI' : 'NON');
    
    console.log('\n3️⃣ Détermination du rôle:');
    let role = 'ETUDIANT';
    if (utilisateur.Superadministrateur) {
      role = 'SUPER-ADMIN';
      console.log('✅ Rôle détecté: SUPER-ADMIN');
    } else if (utilisateur.Enseignant) {
      role = 'ENSEIGNANT';
      console.log('Rôle détecté: ENSEIGNANT');
    } else if (utilisateur.Etudiant) {
      role = 'ETUDIANT';
      console.log('Rôle détecté: ETUDIANT');
    }
    
    console.log('\n✅ Test terminé avec succès!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  }
}

testMiddleware();
