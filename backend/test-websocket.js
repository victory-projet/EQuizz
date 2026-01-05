// backend/test-websocket.js
// Script de test pour les WebSockets

const io = require('socket.io-client');

// Configuration
const SERVER_URL = 'http://localhost:3000';
const TEST_TOKEN = 'votre-jwt-token-ici'; // Remplacez par un vrai token

console.log('🧪 Test des WebSockets...');

// Créer une connexion client
const socket = io(SERVER_URL, {
  auth: {
    token: TEST_TOKEN
  },
  transports: ['websocket', 'polling']
});

// Événements de connexion
socket.on('connect', () => {
  console.log('✅ Connecté au serveur WebSocket');
  console.log('Socket ID:', socket.id);
  
  // Test des événements
  testEvents();
});

socket.on('connect_error', (error) => {
  console.error('❌ Erreur de connexion:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('👋 Déconnecté:', reason);
});

// Écouter les notifications
socket.on('new-notification', (data) => {
  console.log('📬 Nouvelle notification reçue:', data);
});

socket.on('new-evaluation', (data) => {
  console.log('📝 Nouvelle évaluation reçue:', data);
});

socket.on('evaluation-closed', (data) => {
  console.log('🔒 Évaluation clôturée:', data);
});

socket.on('system-notification', (data) => {
  console.log('🔔 Notification système:', data);
});

socket.on('test-notification', (data) => {
  console.log('🧪 Notification de test:', data);
});

socket.on('notification-count', (data) => {
  console.log('📊 Nombre de notifications:', data);
});

socket.on('error', (error) => {
  console.error('❌ Erreur WebSocket:', error);
});

function testEvents() {
  console.log('🔄 Test des événements...');
  
  // Test 1: Rejoindre une évaluation
  setTimeout(() => {
    console.log('📝 Test: Rejoindre évaluation 123');
    socket.emit('join-evaluation', '123');
  }, 1000);
  
  // Test 2: Demander le nombre de notifications
  setTimeout(() => {
    console.log('📊 Test: Demander le nombre de notifications');
    socket.emit('get-notification-count');
  }, 2000);
  
  // Test 3: Marquer une notification comme lue
  setTimeout(() => {
    console.log('✅ Test: Marquer notification comme lue');
    socket.emit('mark-notification-read', '456');
  }, 3000);
  
  // Test 4: Quitter l'évaluation
  setTimeout(() => {
    console.log('🚪 Test: Quitter évaluation 123');
    socket.emit('leave-evaluation', '123');
  }, 4000);
  
  // Fermer la connexion après les tests
  setTimeout(() => {
    console.log('🔚 Fin des tests, fermeture de la connexion');
    socket.disconnect();
    process.exit(0);
  }, 5000);
}

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non gérée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée:', reason);
  process.exit(1);
});