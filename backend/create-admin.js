// Script pour créer un utilisateur administrateur de test
const bcrypt = require('bcryptjs');
const db = require('./src/models');

async function createAdmin() {
  try {
    // Connexion à la base de données
    await db.sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Vérifier si l'utilisateur existe déjà
    let user = await db.Utilisateur.findOne({ where: { email: 'super.admin@saintjeaningenieur.org' } });
    
    if (user) {
      console.log('ℹ️  Utilisateur existe déjà, mise à jour du mot de passe...');
      // Mettre à jour le mot de passe directement dans la base sans passer par le hook
      await db.Utilisateur.update(
        { motDePasseHash: hashedPassword },
        { 
          where: { email: 'super.admin@saintjeaningenieur.org' },
          hooks: false // Désactiver les hooks pour éviter le double hash
        }
      );
      user = await db.Utilisateur.findOne({ where: { email: 'super.admin@saintjeaningenieur.org' } });
      console.log('✅ Mot de passe mis à jour');
    } else {
      // Créer l'utilisateur directement avec le mot de passe hashé
      user = await db.Utilisateur.create({
        nom: 'Admin',
        prenom: 'Super',
        email: 'super.admin@saintjeaningenieur.org',
        motDePasseHash: hashedPassword,
        estActif: true
      }, { hooks: false }); // Désactiver les hooks pour éviter le double hash
      console.log('✅ Utilisateur créé');
    }

    console.log('✅ Utilisateur administrateur créé avec succès !');
    console.log('📧 Email: super.admin@saintjeaningenieur.org');
    console.log('🔑 Mot de passe: admin123');
    console.log('👤 ID:', user.id);

    // Créer un administrateur associé
    const admin = await db.Administrateur.findOne({ where: { id: user.id } });
    
    if (admin) {
      console.log('ℹ️  Profil administrateur existe déjà');
    } else {
      await db.Administrateur.create({
        id: user.id, // L'ID de l'admin doit être le même que l'ID de l'utilisateur
        nom: 'Admin',
        prenom: 'Super',
        email: 'super.admin@saintjeaningenieur.org'
      });
      console.log('✅ Profil administrateur créé');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

createAdmin();
