// tests/performance/stress-test.js
const axios = require('axios');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

/**
 * CONFIGURATION DU TEST
 */
const CONFIG = {
  baseUrl: 'http://localhost:3000/api',
  totalUsers: 1000, 
  concurrentWorkers: 5,
  requestsPerUser: 1,
  timeout: 10000,
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAzYjU1OTJiLTM1NTUtNGFiYy1iMDIxLTQ0NTU5NDIzODlkMSIsInJvbGUiOiJFVFVESUFOVCIsImlhdCI6MTc3Mzc3OTY4MCwiZXhwIjoxNzczODY2MDgwfQ.EXBF3ojgaSqg4rO6On5ade_hNzt0NIkjkBuPa6GiJUs',
  quizzId: 'b009e625-f923-455d-a53a-112d982bcdff',
  questionId: 'ce7ce516-b1a2-4cbe-956a-2fdcf9efa76a'
};

async function simulateUser(userId) {
  try {
    const headers = { Authorization: `Bearer ${CONFIG.token}` };
    
    // 1. Consultation des quizz
    await axios.get(`${CONFIG.baseUrl}/student/quizzes`, { headers, timeout: CONFIG.timeout });
    
    // 2. Soumission d'une réponse
    await axios.post(`${CONFIG.baseUrl}/student/quizzes/${CONFIG.quizzId}/submit`, {
      reponses: [{ question_id: CONFIG.questionId, contenu: 'Réponse de test stress performant' }],
      estFinal: true
    }, { headers, timeout: CONFIG.timeout });

    return true;
  } catch (error) {
    return false;
  }
}

async function runWorker(count) {
  let successCount = 0;
  let failureCount = 0;
  
  for (let i = 0; i < count; i++) {
    const success = await simulateUser(i);
    if (success) successCount++;
    else failureCount++;
    
    // Délai pour SQLite (évite Busy)
    await new Promise(resolve => setTimeout(resolve, 5));
  }
  
  return { successCount, failureCount };
}

if (isMainThread) {
  console.log(`🚀 Démarrage du Stress Test : ${CONFIG.totalUsers} utilisateurs...`);
  const startTime = Date.now();
  
  const usersPerWorker = Math.ceil(CONFIG.totalUsers / CONFIG.concurrentWorkers);
  const workers = [];
  
  for (let i = 0; i < CONFIG.concurrentWorkers; i++) {
    const worker = new Worker(__filename, {
      workerData: { count: usersPerWorker }
    });
    workers.push(new Promise((resolve) => {
      worker.on('message', resolve);
    }));
  }
  
  Promise.all(workers).then((results) => {
    const totalSuccess = results.reduce((acc, r) => acc + r.successCount, 0);
    const totalFailure = results.reduce((acc, r) => acc + r.failureCount, 0);
    const duration = (Date.now() - startTime) / 1000;
    
    console.log(`\n--- RÉSULTATS DU STRESS TEST ---`);
    console.log(`Durée totale : ${duration.toFixed(2)}s`);
    console.log(`Succès : ${totalSuccess}`);
    console.log(`Échecs : ${totalFailure}`);
    console.log(`Requêtes/sec : ${((totalSuccess + totalFailure) * 2 / duration).toFixed(2)}`);
    console.log(`--------------------------------\n`);
    process.exit(0);
  });
} else {
  runWorker(workerData.count).then(result => {
    parentPort.postMessage(result);
  });
}
