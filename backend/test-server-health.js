// Test de santé du serveur
const http = require('http');

function testServer() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    timeout: 5000
  };

  console.log('🔍 Test de connexion au serveur...\n');

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        console.log('✅ Serveur accessible sur le port 3000');
        console.log(`   Status: ${res.statusCode}`);
        if (data) {
          console.log(`   Réponse: ${data}`);
        }
        process.exit(0);
      } else {
        console.log(`⚠️  Serveur répond avec le code: ${res.statusCode}`);
        process.exit(1);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Impossible de se connecter au serveur:', error.message);
    console.log('\n💡 Assurez-vous que le serveur est démarré avec: npm run dev');
    process.exit(1);
  });

  req.on('timeout', () => {
    console.error('❌ Timeout de connexion au serveur');
    req.destroy();
    process.exit(1);
  });

  req.end();
}

testServer();
