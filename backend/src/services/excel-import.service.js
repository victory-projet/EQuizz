// backend/src/services/excel-import.service.js

const ExcelJS = require('exceljs');
const db = require('../models');
const { genererMatriculeUniv } = require('../utils/matriculeGenerator');

class ExcelImportService {
  // ─── IMPORT METHODS ──────────────────────────────────────────────────────────

  async importEcoles(buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet('Ecoles') || workbook.worksheets[0];
    const results = { success: 0, errors: [], created: [], updated: [] };
    const dateImport = new Date();

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const nom = row.getCell(1).value?.toString().trim();
      if (!nom) continue;
      try {
        const [ecole, created] = await db.Ecole.findOrCreate({
          where: { nom },
          defaults: { nom, dateImport }
        });
        if (!created) { await ecole.update({ dateImport }); results.updated.push(nom); }
        else { results.created.push(nom); }
        results.success++;
      } catch (error) {
        results.errors.push({ row: i, nom, error: error.message });
      }
    }
    return results;
  }

  async importClasses(buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet('Classes') || workbook.worksheets[0];
    const results = { success: 0, errors: [], created: [], updated: [] };
    const dateImport = new Date();

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const nom          = row.getCell(1).value?.toString().trim();
      const niveau       = row.getCell(2).value?.toString().trim();
      const anneeName    = row.getCell(3).value?.toString().trim();
      const ecoleName    = row.getCell(4).value?.toString().trim();
      if (!nom || !niveau) continue;
      try {
        let anneeAcademiqueId = null;
        if (anneeName) {
          const annee = await db.AnneeAcademique.findOne({ where: { nom: anneeName } });
          anneeAcademiqueId = annee?.id;
        }
        let ecoleId = null;
        if (ecoleName) {
          const ecole = await db.Ecole.findOne({ where: { nom: ecoleName } });
          ecoleId = ecole?.id;
        }
        const [classe, created] = await db.Classe.findOrCreate({
          where: { nom },
          defaults: { nom, niveau, anneeAcademiqueId, ecole_id: ecoleId, dateImport }
        });
        if (!created) { await classe.update({ niveau, anneeAcademiqueId, ecole_id: ecoleId, dateImport }); results.updated.push(nom); }
        else { results.created.push(nom); }
        results.success++;
      } catch (error) {
        results.errors.push({ row: i, nom, error: error.message });
      }
    }
    return results;
  }

  async importEtudiants(buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet('Etudiants') || workbook.worksheets[0];
    const results = { success: 0, errors: [], created: [], updated: [] };
    const dateImport = new Date();

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const matricule  = row.getCell(1).value?.toString().trim();
      const nom        = row.getCell(2).value?.toString().trim();
      const prenom     = row.getCell(3).value?.toString().trim();
      const email      = row.getCell(4).value?.toString().trim().toLowerCase();
      const classeName = row.getCell(5).value?.toString().trim();
      const idCarte    = row.getCell(6).value?.toString().trim();
      if (!matricule || !nom || !prenom || !email) continue;
      try {
        const transaction = await db.sequelize.transaction();
        try {
          let classeId = null;
          if (classeName) {
            const classe = await db.Classe.findOne({ where: { nom: classeName }, transaction });
            classeId = classe?.id;
          }
          const [utilisateur, userCreated] = await db.Utilisateur.findOrCreate({
            where: { email },
            defaults: { nom, prenom, email, motDePasseHash: matricule, role: 'ETUDIANT', dateImport },
            transaction
          });
          if (!userCreated) { await utilisateur.update({ nom, prenom, dateImport }, { transaction }); }

          const existingEtudiant = await db.Etudiant.findOne({ where: { matricule }, transaction });
          if (existingEtudiant) {
            await existingEtudiant.update({ idCarte, classe_id: classeId, dateImport }, { transaction });
            results.updated.push(matricule);
          } else {
            const matriculeUniv = await genererMatriculeUniv();
            await db.Etudiant.create({ id: utilisateur.id, matricule, matriculeUniv, idCarte, classe_id: classeId, dateImport }, { transaction });
            results.created.push(matricule);
          }
          await transaction.commit();
          results.success++;
        } catch (innerError) {
          await transaction.rollback();
          throw innerError;
        }
      } catch (error) {
        results.errors.push({ row: i, matricule, error: error.message });
      }
    }
    return results;
  }

  async importEnseignants(buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet('Enseignants') || workbook.worksheets[0];
    const results = { success: 0, errors: [], created: [], updated: [] };
    const dateImport = new Date();

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const nom        = row.getCell(1).value?.toString().trim();
      const prenom     = row.getCell(2).value?.toString().trim();
      const email      = row.getCell(3).value?.toString().trim().toLowerCase();
      const specialite = row.getCell(4).value?.toString().trim();
      if (!nom || !prenom || !email) continue;
      try {
        const transaction = await db.sequelize.transaction();
        try {
          const [utilisateur, userCreated] = await db.Utilisateur.findOrCreate({
            where: { email },
            defaults: { nom, prenom, email, motDePasseHash: 'Enseignant123!', role: 'ENSEIGNANT', dateImport },
            transaction
          });
          if (!userCreated) { await utilisateur.update({ nom, prenom, dateImport }, { transaction }); }

          const [enseignant, enseignantCreated] = await db.Enseignant.findOrCreate({
            where: { id: utilisateur.id },
            defaults: { id: utilisateur.id, specialite, dateImport },
            transaction
          });
          if (!enseignantCreated) { await enseignant.update({ specialite, dateImport }, { transaction }); results.updated.push(email); }
          else { results.created.push(email); }
          await transaction.commit();
          results.success++;
        } catch (innerError) {
          await transaction.rollback();
          throw innerError;
        }
      } catch (error) {
        results.errors.push({ row: i, email, error: error.message });
      }
    }
    return results;
  }

  async importCours(buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet('Cours') || workbook.worksheets[0];
    const results = { success: 0, errors: [], created: [], updated: [] };
    const dateImport = new Date();

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const code            = row.getCell(1).value?.toString().trim();
      const nom             = row.getCell(2).value?.toString().trim();
      const enseignantEmail = row.getCell(3).value?.toString().trim().toLowerCase();
      const semestreName    = row.getCell(4).value?.toString().trim();
      if (!code || !nom) continue;
      try {
        let enseignantId = null;
        if (enseignantEmail) {
          const utilisateur = await db.Utilisateur.findOne({ where: { email: enseignantEmail } });
          if (utilisateur) {
            const enseignant = await db.Enseignant.findByPk(utilisateur.id);
            enseignantId = enseignant?.id;
          }
        }
        let semestreId = null;
        if (semestreName) {
          const semestre = await db.Semestre.findOne({ where: { nom: semestreName } });
          semestreId = semestre?.id;
        }
        const [cours, created] = await db.Cours.findOrCreate({
          where: { code },
          defaults: { code, nom, enseignant_id: enseignantId, semestre_id: semestreId, dateImport }
        });
        if (!created) { await cours.update({ nom, enseignant_id: enseignantId, semestre_id: semestreId, dateImport }); results.updated.push(code); }
        else { results.created.push(code); }
        results.success++;
      } catch (error) {
        results.errors.push({ row: i, code, error: error.message });
      }
    }
    return results;
  }
}

module.exports = new ExcelImportService();
