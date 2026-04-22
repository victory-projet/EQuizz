// seed-cours-classes.js
// Crée 3 cours et 3 classes par école

const db = require('./src/models');

const SEMESTRE_ID = '1f3d2a63-71d7-4cc0-8796-ee9922c5a0ba';
const ANNEE_ID    = 'f4062c79-b065-4cd1-9c9a-cebfa6dda8b5';

const ENSEIGNANTS = [
  '1399bb7c-9096-4a84-8351-b41a4925e968',
  '4e0d766d-75d4-4d7c-afd4-d3ab85e94227',
  '57a55cb6-ee95-4af5-b589-64b863b09c14',
  '6556aaf2-bb1d-4ac8-a637-2144b7254199',
  '69a418bb-73a1-4585-a7e6-12d9e92582a8',
  '7410cf90-b435-4c9c-b2f8-ee563c9cbdf9',
  'b31c1b5b-1aff-4f75-a55d-67a47899b03c',
  'dfb6a32e-1e05-4122-8807-266c236579b0',
  'e0f5edd2-ba65-4fd5-b1ff-fe569951479c',
  'fd2318a1-4bfa-40e0-a38c-7600d41fa649',
];

// Données par école : [prefix_code, prefix_classe, niveau, cours[]]
const ECOLES_DATA = {
  '265d535d-a92d-4e5e-b5a1-34051edf5b0f': {
    nom: 'Prepavogt',
    prefix: 'PV',
    classes: [
      { nom: 'PREPA1 MP', niveau: 'PREPA1' },
      { nom: 'PREPA2 PC', niveau: 'PREPA2' },
      { nom: 'PREPA1 PSI', niveau: 'PREPA1' },
    ],
    cours: [
      { code: 'PV-MAT101', nom: 'Mathématiques Supérieures' },
      { code: 'PV-PHY101', nom: 'Physique Générale' },
      { code: 'PV-CHI101', nom: 'Chimie Organique' },
    ]
  },
  'bf900265-8cf3-4705-931f-3724bab2f2e8': {
    nom: 'Saint Jean Ingenieur',
    prefix: 'SJI',
    classes: [
      { nom: 'ING2 ISI FR', niveau: 'ING2' },
      { nom: 'ING3 ISI EN', niveau: 'ING3' },
      { nom: 'ING5 GC FR', niveau: 'ING5' },
    ],
    cours: [
      { code: 'SJI-INF201', nom: 'Algorithmique Avancée' },
      { code: 'SJI-INF202', nom: 'Réseaux Informatiques' },
      { code: 'SJI-GC201', nom: 'Résistance des Matériaux' },
    ]
  },
  'd10d1c09-ef4a-4503-a189-4dad0ec5b1da': {
    nom: 'CPGE',
    prefix: 'CPGE',
    classes: [
      { nom: 'CPGE1 MPSI', niveau: 'CPGE1' },
      { nom: 'CPGE2 MP*', niveau: 'CPGE2' },
      { nom: 'CPGE1 PCSI', niveau: 'CPGE1' },
    ],
    cours: [
      { code: 'CPGE-MAT201', nom: 'Analyse et Algèbre' },
      { code: 'CPGE-PHY201', nom: 'Électromagnétisme' },
      { code: 'CPGE-INF201', nom: 'Informatique pour Tous' },
    ]
  },
  'dcd255e1-5f0c-4958-aa16-d15b6e8fc182': {
    nom: 'Saint Jean Management',
    prefix: 'SJM',
    classes: [
      { nom: 'BTS1 CG', niveau: 'BTS1' },
      { nom: 'BTS2 MUC', niveau: 'BTS2' },
      { nom: 'LICENCE3 GES', niveau: 'L3' },
    ],
    cours: [
      { code: 'SJM-GES101', nom: 'Gestion Financière' },
      { code: 'SJM-MKT101', nom: 'Marketing Stratégique' },
      { code: 'SJM-DRT101', nom: 'Droit des Affaires' },
    ]
  }
};

async function seed() {
  await db.sequelize.authenticate();
  console.log('✅ Connecté à la base de données\n');

  let enseignantIdx = 0;
  const results = [];

  for (const [ecoleId, data] of Object.entries(ECOLES_DATA)) {
    console.log(`\n📚 École: ${data.nom}`);

    // Créer les cours
    const coursCreated = [];
    for (const c of data.cours) {
      const existing = await db.Cours.findOne({ where: { code: c.code } });
      if (existing) {
        console.log(`  ⚠️  Cours ${c.code} existe déjà, ignoré`);
        coursCreated.push(existing);
        continue;
      }
      const cours = await db.Cours.create({
        code: c.code,
        nom: c.nom,
        ecole_id: ecoleId,
        semestre_id: SEMESTRE_ID,
        enseignant_id: ENSEIGNANTS[enseignantIdx % ENSEIGNANTS.length],
      });
      enseignantIdx++;
      console.log(`  ✅ Cours créé: ${cours.code} - ${cours.nom}`);
      coursCreated.push(cours);
    }

    // Créer les classes
    for (const cl of data.classes) {
      const existing = await db.Classe.findOne({ where: { nom: cl.nom } });
      if (existing) {
        console.log(`  ⚠️  Classe "${cl.nom}" existe déjà, ignorée`);
        continue;
      }
      const classe = await db.Classe.create({
        nom: cl.nom,
        niveau: cl.niveau,
        ecole_id: ecoleId,
        annee_academique_id: ANNEE_ID,
      });
      console.log(`  ✅ Classe créée: ${classe.nom}`);

      // Associer tous les cours de l'école à cette classe
      await classe.addCours(coursCreated);
    }

    results.push(data.nom);
  }

  console.log('\n🎉 Seed terminé pour:', results.join(', '));
  process.exit(0);
}

seed().catch(e => {
  console.error('❌ Erreur:', e.message);
  process.exit(1);
});
