// Test script to check if all route imports work
console.log('Testing route imports...\n');

const routes = [
  './src/routes/auth.routes',
  './src/routes/academic.routes',
  './src/routes/evaluation.routes',
  './src/routes/student.routes',
  './src/routes/init.routes',
  './src/routes/report.routes',
  './src/routes/notification.routes',
  './src/routes/push-notification.routes',
  './src/routes/dashboard.routes',
  './src/routes/utilisateur.routes',
  './src/routes/question.routes'
];

for (const route of routes) {
  try {
    require(route);
    console.log(`✅ ${route} - OK`);
  } catch (error) {
    console.log(`❌ ${route} - ERROR: ${error.message}`);
  }
}

console.log('\nTesting models...');
try {
  const db = require('./src/models');
  console.log('✅ Models - OK');
} catch (error) {
  console.log(`❌ Models - ERROR: ${error.message}`);
}