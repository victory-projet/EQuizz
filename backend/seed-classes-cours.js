/**
 * Seed : Crée 3 classes et 3 cours par école
 * Usage : node seed-classes-cours.js
 */
const path = require('path');
const fs = require('fs');
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) require('dotenv').config({ path: envPath });

const db = require('./src/models');

const DATA = {
  'Prepavogt': {
    classes: [
      { nom: 'PREPA1 MPSI', niveau: 'PREPA1' },
      { nom: 'PREPA2 PSI', niveau: 'PREPA2' },
      { nom: 'PREPA1 PCSI', niveau: 'PREPA1' }
    ],
    cours: [
      { code: 'PV-MATH1', nom: 'Mathématiques Supérieures' },
      { code: 'PV-PHYS1', nom: 'Physique-Chimie Avancée' },
      { code: 'PV-INFO1', nom: 'Informatique & Algorithmique' }
    ]
  },
  'Saint Jean Ingenieur': {
    classes: [
      { nom: 'ING1 GC', niveau: 'ING1' },
      { nom: 'ING2 ISI', niveau: 'ING2' },
      { nom: 'ING3 RT', niveau: 'ING3' }
    ],
    cours: [
      { code: 'SJI-INFO301', nom: 'Programmation Orientée Objet' },
      { code: 'SJI-RESEAU201', nom: 'Réseaux & Télécommunications' },
      { code: 'SJI-BDD401', nom: 'Bases de Données Avancées' }
    ]
  },
  'CPGE': {
    classes: [
      { nom: 'CPGE MP', niveau: 'CPGE' },
      { nom: 'CPGE PC', niveau: 'CPGE' },
      { nom: 'CPGE TSI', niveau: 'CPGE' }
    ],
    cours: [
      { code: 'CPGE-MATH1', nom: 'Analyse & Algèbre' },
      { code: 'CPGE-SI1', nom: 'Sciences de l\'Ingénieur' },
      { code: 'CPGE-PHYS1', nom: 'Thermodynamique & Optique' }
    ]
  },
  'Saint Jean Management': {
    classes: [
      { nom: 'MGT1 GRH', niveau: 'MGT1' },
      { nom: 'MGT2 FINANCE', niveau: 'MGT2' },
      { nom: 'MGT3 MARKETING', niveau: 'MGT3' }
    ],
    cours: [
      { code: 'SJM-COMPTA1', nom: 'Comptabilité Générale' },
      { code: 'SJM-MKTG1', nom: 'Marketing & Communication' },
      { code: 'SJM-MGMT1', nom: 'Management des Organisations' }
    ]
  }
};

async function seed() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connexion établie\n');

    const ecoles = await db.Ecole.findAll({ attributes: ['id', 'nom'] });
    const ecoleMap = Object.fromEntries(ecoles.map(e => [e.nom, e.id]));

    for (const [ecoleName, data] of Object.entries(DATA)) {
      const ecoleId = ecoleMap[ecoleName];
      if (!ecoleId) { console.warn(`⚠️  École "${ecoleName}" non trouvée, ignorée`); continue; }

      console.log(`\n📚 ${ecoleName}`);

      // Classes
      for (const c of data.classes) {
        const [classe, created] = await db.Classe.findOrCreate({
          where: { nom: c.nom },
          defaults: { ...c, ecole_id: ecoleId }
        });
        if (!created) await classe.update({ ecole_id: ecoleId });
        console.log(`  ${created ? '✅' : '↩️ '} Classe: ${c.nom}`);
      }

      // Cours
      for (const c of data.cours) {
        const [cours, created] = await db.Cours.findOrCreate({
          where: { code: c.code },
          defaults: { ...c, ecole_id: ecoleId }
        });
        if (!created) await cours.update({ ecole_id: ecoleId });
        console.log(`  ${created ? '✅' : '↩️ '} Cours: ${c.code} — ${c.nom}`);
      }
    }

    console.log('\n🎉 Seed terminé');
    process.exit(0);
  } catch (err) {
    console.error('❌', err.message);
    process.exit(1);
  }
}

seed();
