const reportController = require('./src/controllers/report.controller');

// Mock de l'objet response
const mockRes = {
  json: (data) => {
    console.log('📊 Réponse JSON:', JSON.stringify(data, null, 2));
    return mockRes;
  },
  status: (code) => {
    console.log(`📋 Status: ${code}`);
    return mockRes;
  }
};

// Mock de l'objet request
const mockReq = {
  query: {},
  params: {}
};

async function testControllerDirect() {
  try {
    console.log('🔍 Test direct du contrôleur...\n');

    console.log('1️⃣ Test getFilterOptions...');
    await reportController.getFilterOptions(mockReq, mockRes);

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testControllerDirect();