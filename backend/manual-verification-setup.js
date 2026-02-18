// backend/manual-verification-setup.js
const db = require('./src/models');
const bcrypt = require('bcryptjs');

async function setup() {
    try {
        console.log('🔄 Initialisation des données pour la vérification manuelle...');

        // 1. Sync DB
        await db.sequelize.sync({ alter: true });
        console.log('✅ Base de données synchronisée');

        // 2. Créer l'administrateur
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const [user, userCreated] = await db.Utilisateur.findOrCreate({
            where: { email: 'super.admin@saintjeaningenieur.org' },
            defaults: {
                nom: 'Admin',
                prenom: 'Super',
                motDePasseHash: hashedPassword,
                estActif: true
            }
        });

        await db.Administrateur.findOrCreate({
            where: { id: user.id },
            defaults: {
                id: user.id
            }
        });
        console.log('✅ Administrateur prêt');

        // 3. Créer une École
        const [ecole, ecoleCreated] = await db.Ecole.findOrCreate({
            where: { nom: 'Ecole de Test' },
            defaults: {}
        });
        console.log('✅ École prête:', ecole.nom);

        // 4. Créer une Année Académique
        const [annee, anneeCreated] = await db.AnneeAcademique.findOrCreate({
            where: { libelle: '2024-2025' },
            defaults: {
                dateDebut: '2024-09-01',
                dateFin: '2025-08-31',
                estCourante: true
            }
        });
        console.log('✅ Année Académique prête:', annee.libelle);

        // 5. Créer une Classe
        const [classe, classeCreated] = await db.Classe.findOrCreate({
            where: { nom: 'L1-INFO' },
            defaults: {
                niveau: '1',
                ecole_id: ecole.id,
                anneeAcademiqueId: annee.id
            }
        });
        console.log('✅ Classe prête:', classe.nom);

        console.log('\n🚀 Données de base prêtes pour la vérification !');
        console.log('-------------------------------------------');
        console.log('Admin Email: super.admin@saintjeaningenieur.org');
        console.log('Admin Password: admin123');
        console.log('École ID:', ecole.id);
        console.log('Classe ID:', classe.id);
        console.log('-------------------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors du setup:', error);
        process.exit(1);
    }
}

setup();
