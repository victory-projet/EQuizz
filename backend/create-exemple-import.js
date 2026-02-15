const ExcelJS = require('exceljs');
const path = require('path');

async function createExempleImport() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Etudiants');

  // Nouveau format sans colonne Action
  worksheet.columns = [
    { header: 'Nom', key: 'nom', width: 20 },
    { header: 'Prenom', key: 'prenom', width: 20 },
    { header: 'Email', key: 'email', width: 40 },
    { header: 'Matricule', key: 'matricule', width: 20 },
    { header: 'IdCarte', key: 'idCarte', width: 15 },
    { header: 'Classe', key: 'classe', width: 20 }
  ];

  // Style de l'en-tête
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Exemples de données avec le nouveau format de matricule
  worksheet.addRow({
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@saintjeaningenieur.org',
    matricule: 'SJING-2024-001', // Format moderne
    idCarte: 'CARD001',
    classe: 'L1-INFO'
  });

  worksheet.addRow({
    nom: 'Martin',
    prenom: 'Marie',
    email: 'marie.martin@saintjeaningenieur.org',
    matricule: 'SJING-2024-002', // Format moderne
    idCarte: 'CARD002',
    classe: 'L1-INFO'
  });

  worksheet.addRow({
    nom: 'Durand',
    prenom: 'Paul',
    email: 'paul.durand@saintjeaningenieur.org',
    matricule: '', // Vide → génération automatique
    idCarte: '',
    classe: 'L2-MATH'
  });

  worksheet.addRow({
    nom: 'Bernard',
    prenom: 'Sophie',
    email: 'sophie.bernard@saintjeaningenieur.org',
    matricule: '', // Vide → génération automatique
    idCarte: 'CARD004',
    classe: 'L1-INFO'
  });

  worksheet.addRow({
    nom: 'Moreau',
    prenom: 'Pierre',
    email: 'pierre.moreau@saintjeaningenieur.org',
    matricule: '2025001', // Format legacy accepté
    idCarte: 'CARD005',
    classe: 'L3-TECH'
  });

  // Ajouter des commentaires explicatifs
  worksheet.getCell('D1').note = 'Matricule optionnel. Format moderne: ECOLE-ANNEE-NUMERO (ex: SJING-2024-001). Si vide, génération automatique.';
  worksheet.getCell('F1').note = 'Nom de la classe. Si non fourni, utilise la classe par défaut de l\'API.';

  const filePath = path.join(__dirname, 'exemple-import-etudiants.xlsx');
  await workbook.xlsx.writeFile(filePath);
  
  console.log('✅ Fichier exemple créé:', filePath);
  console.log('📋 Format: 6 colonnes (Nom, Prenom, Email, Matricule, IdCarte, Classe)');
  console.log('🔄 Logique automatique: Création ou mise à jour selon matricule/email existant');
  console.log('🎯 Matricules vides → génération automatique au format ECOLE-ANNEE-NUMERO');
}

createExempleImport().catch(console.error);
