const jwtService = require('./src/services/jwt.service');
const db = require('./src/models');

async function testJwtService() {
  try {
    console.log('🔐 Test direct du service JWT...\n');

    // 1. Récupérer un utilisateur de test
    const utilisateur = await db.Utilisateur.findOne({
      where: { email: 'celestin.simo@saintjeaningenieur.org' },
      include: [
        { model: db.Administrateur, as: 'Administrateur' },
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
      return;
    }

    console.log('✅ Utilisateur trouvé:', utilisateur.nom, utilisateur.prenom);

    // 2. Tester la génération de tokens
    console.log('\n2. Test de génération des tokens...');
    const tokens = jwtService.generateTokenPair(utilisateur);
    
    console.log('✅ Access token généré:', tokens.accessToken.substring(0, 30) + '...');
    console.log('✅ Refresh token généré:', tokens.refreshToken.substring(0, 30) + '...');

    // 3. Tester la vérification des tokens
    console.log('\n3. Test de vérification des tokens...');
    
    const accessDecoded = jwtService.verifyToken(tokens.accessToken);
    console.log('✅ Access token vérifié:', { id: accessDecoded.id, email: accessDecoded.email, type: accessDecoded.type });

    const refreshDecoded = jwtService.verifyRefreshToken(tokens.refreshToken);
    console.log('✅ Refresh token vérifié:', { id: refreshDecoded.id, email: refreshDecoded.email, type: refreshDecoded.type });

    // 4. Tester la génération de nouveaux tokens avec le refresh token
    console.log('\n4. Test de génération de nouveaux tokens...');
    const newTokens = jwtService.generateTokenPair(utilisateur);
    
    console.log('✅ Nouveaux tokens générés');
    console.log('Nouveau access token:', newTokens.accessToken.substring(0, 30) + '...');
    console.log('Nouveau refresh token:', newTokens.refreshToken.substring(0, 30) + '...');

    // 5. Tester avec un token invalide
    console.log('\n5. Test avec un token invalide...');
    try {
      jwtService.verifyRefreshToken('invalid-token');
      console.log('❌ La vérification d\'un token invalide devrait échouer');
    } catch (error) {
      console.log('✅ Erreur attendue avec token invalide:', error.message);
    }

    console.log('\n🎉 Tous les tests du service JWT sont passés !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    process.exit(0);
  }
}

testJwtService();