const ExcelJS = require('exceljs');
const path = require('path');

async function createExempleImport() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Etudiants');

  worksheet.columns = [
    { header: 'Nom', key: 'nom', width: 20 },
    { header: 'Prenom', key: 'prenom', width: 20 },
    { header: 'Email', key: 'email', width: 40 },
    { header: 'Matricule', key: 'matricule', width: 15 },
    { header: 'IdCarte', key: 'idCarte', width: 15 },
    { header: 'Classe', key: 'classe', width: 20 },
    { header: 'Action', key: 'action', width: 10 }
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  worksheet.addRow({
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@saintjeaningenieur.org',
    matricule: '2025001',
    idCarte: 'CARD001',
    classe: 'L1-INFO',
    action: 'CREATE'
  });

  worksheet.addRow({
    nom: 'Martin',
    prenom: 'Marie',
    email: 'marie.martin@saintjeaningenieur.org',
    matricule: '2025002',
    idCarte: 'CARD002',
    classe: 'L1-INFO',
    action: 'UPSERT'
  });

  worksheet.addRow({
    nom: 'Durand',
    prenom: 'Paul',
    email: 'paul.durand@saintjeaningenieur.org',
    matricule: '',
    idCarte: '',
    classe: 'L2-MATH',
    action: 'CREATE'
  });

  const filePath = path.join(__dirname, 'exemple-import-etudiants.xlsx');
  await workbook.xlsx.writeFile(filePath);
  
  console.log('✅ Fichier exemple créé:', filePath);
}

createExempleImport().catch(console.error);
