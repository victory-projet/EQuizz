/**
 * Migration : Ajoute la colonne ecole_id à la table cours
 * Usage : node add-ecole-to-cours.js
 */
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) require('dotenv').config({ path: envPath });

const { Sequelize } = require('sequelize');
const db = require('./src/models');

async function migrate() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connexion établie');

    const qi = db.sequelize.getQueryInterface();
    const tableDesc = await qi.describeTable('cours');

    if (tableDesc.ecole_id) {
      console.log('ℹ️  La colonne ecole_id existe déjà dans la table cours');
      process.exit(0);
    }

    await qi.addColumn('cours', 'ecole_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'ecoles', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    console.log('✅ Colonne ecole_id ajoutée à la table cours');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur migration:', err.message);
    process.exit(1);
  }
}

migrate();
