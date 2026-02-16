// Test de validation d'email sans base de données
// Testons juste la logique du validateur

console.log('🧪 Test de validation d\'email (logique)\n');

// Logique du validateur extrait du modèle
function validateEmail(value) {
  // Format spécial pour SuperAdmin : accepte @universitesaintjean.org
  const superAdminFormat = /^[a-zA-Z]+@universitesaintjean\.org$/;
  if (superAdminFormat.test(value)) {
    return { valid: true, type: 'SUPERADMIN' };
  }
  
  // Format standard pour les autres utilisateurs : prenom.nom@domaine
  // Accepte UNIQUEMENT les lettres non accentuées (a-z, A-Z) pour le nom/prénom
  const standardFormat = /^[a-zA-Z]+\.[a-zA-Z]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!standardFormat.test(value)) {
    return { 
      valid: false, 
      error: 'Le format de l\'email doit être prenom.nom@domaine.org (lettres non accentuées uniquement, sans chiffres) ou utilisateur@universitesaintjean.org pour SuperAdmin'
    };
  }
  
  return { valid: true, type: 'STANDARD' };
}

// Tests
const testCases = [
  { email: 'admin@universitesaintjean.org', expected: true, desc: 'SuperAdmin avec @universitesaintjean.org' },
  { email: 'marie.dupont@saintjeaningenieur.org', expected: true, desc: 'Standard email @saintjeaningenieur.org' },
  { email: 'jean.martin@cpge.org', expected: true, desc: 'Standard email @cpge.org' },
  { email: 'emma.silva@prepavogt.org', expected: true, desc: 'Standard email @prepavogt.org' },
  { email: 'lucas.petit@saintjeanmanagement.org', expected: true, desc: 'Standard email @saintjeanmanagement.org' },
  { email: 'marie@saintjeaningenieur.org', expected: false, desc: 'Format invalide (sans point)' },
  { email: 'super.admin@saintjeaningenieur.org', expected: false, desc: 'Ancien SuperAdmin format (should fail)' },
  { email: 'marie123.dupont@saintjeaningenieur.org', expected: false, desc: 'Format invalide (avec chiffres)' },
  { email: 'marie.dupont@invalid', expected: false, desc: 'Format invalide (domaine incomplet)' },
];

let passCount = 0;
let failCount = 0;

testCases.forEach(testCase => {
  const result = validateEmail(testCase.email);
  const passed = result.valid === testCase.expected;
  
  const symbol = passed ? '✅' : '❌';
  console.log(`${symbol} ${testCase.desc}`);
  console.log(`   Email: ${testCase.email}`);
  
  if (result.valid) {
    console.log(`   Résultat: Accepté (${result.type})`);
  } else {
    console.log(`   Résultat: Rejeté`);
    console.log(`   Raison: ${result.error}`);
  }
  
  if (passed) {
    passCount++;
  } else {
    failCount++;
  }
  console.log();
});

console.log(`\n📊 Résultats: ${passCount} passés, ${failCount} échoués`);

if (failCount === 0) {
  console.log('✅ Tous les tests de validation d\'email sont réussis!');
  process.exit(0);
} else {
  console.log('❌ Certains tests ont échoué');
  process.exit(1);
}
