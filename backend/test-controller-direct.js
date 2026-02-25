require('dotenv').config();
const db = require('./src/models');
const authController = require('./src/controllers/auth.controller');

async function testController() {
  console.log('🧪 Test direct du contrôleur getCurrentUser\n');
  
  try {
    // ID du superadmin
    const userId = '4b25b83f-79d1-444a-9aaa-30f5947bdc9c';
    
    console.log('1️⃣ Chargement de l\'utilisateur...');
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
    
    console.log('✅ Utilisateur chargé');
    
    console.log('\n2️⃣ Simulation de la requête...');
    const req = { user: utilisateur };
    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        console.log('\n✅ Réponse du contrôleur:');
        console.log(JSON.stringify(data, null, 2));
        return this;
      }
    };
    
    await authController.getCurrentUser(req, res);
    
    console.log('\n✅ Test terminé avec succès!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  }
}

testController();
