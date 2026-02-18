// backend/create-test-excel.js
const ExcelJS = require('exceljs');

async function createExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Etudiants');

    worksheet.columns = [
        { header: 'Nom', key: 'nom' },
        { header: 'Prenom', key: 'prenom' },
        { header: 'Email', key: 'email' },
        { header: 'Matricule', key: 'matricule' },
        { header: 'Classe', key: 'classeNom' }
    ];

    // 1. Update existing student (discovered by matricule)
    worksheet.addRow({
        nom: 'Verification',
        prenom: 'Manuelle Modifiee',
        email: 'manuelle.verification@saintjeaningenieur.org',
        matricule: 'MANUAL-001',
        classeNom: 'L1-INFO'
    });

    // 2. Create new student
    worksheet.addRow({
        nom: 'Excel',
        prenom: 'Import',
        email: 'excel.import@saintjeaningenieur.org',
        matricule: 'EXCEL-001',
        classeNom: 'L1-INFO'
    });

    await workbook.xlsx.writeFile('verification-import.xlsx');
    console.log('✅ File verification-import.xlsx created');
}

createExcel();
