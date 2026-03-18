// backend/test-load-mysql.js
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/api';
const CONCURRENT_REQUESTS = 100;
const TOTAL_REQUESTS = 5000;

async function runLoadTest() {
  console.log(`🚀 Démarrage du test de charge sur MySQL...`);
  console.log(`📍 URL: ${BASE_URL}`);
  console.log(`👥 Requêtes simultanées: ${CONCURRENT_REQUESTS}`);
  console.log(`📊 Total requêtes: ${TOTAL_REQUESTS}`);

  let successCount = 0;
  let failCount = 0;
  const start = Date.now();

  const sendRequest = async () => {
    try {
      // Tester l'endpoint health qui touche souvent la DB si on l'étend, 
      // ou un endpoint public si disponible.
      await axios.get(`${BASE_URL}/academic/classes/public`);
      successCount++;
    } catch (error) {
      if (failCount === 0) {
        console.error('❌ Exemple d\'erreur:', error.message);
        if (error.response) console.error('📊 Status:', error.response.status);
      }
      failCount++;
    }
  };

  const batches = Math.ceil(TOTAL_REQUESTS / CONCURRENT_REQUESTS);
  for (let i = 0; i < batches; i++) {
    const batch = [];
    for (let j = 0; j < CONCURRENT_REQUESTS && (i * CONCURRENT_REQUESTS + j) < TOTAL_REQUESTS; j++) {
      batch.push(sendRequest());
    }
    await Promise.all(batch);
    if ((i + 1) % 5 === 0) {
      console.log(`⏳ Progression: ${((i + 1) * CONCURRENT_REQUESTS)} / ${TOTAL_REQUESTS}`);
    }
  }

  const duration = (Date.now() - start) / 1000;
  const rps = (TOTAL_REQUESTS / duration).toFixed(2);

  console.log('\n--- RÉSULTATS ---');
  console.log(`⏱ Durée totale: ${duration}s`);
  console.log(`📈 Requêtes par seconde: ${rps}`);
  console.log(`✅ Succès: ${successCount}`);
  console.log(`❌ Échecs: ${failCount}`);
  
  if (failCount > 0) {
    process.exit(1);
  }
}

runLoadTest().catch(err => {
  console.error('❌ Erreur fatale lors du test de charge:', err.message);
  process.exit(1);
});
