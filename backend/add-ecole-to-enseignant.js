/**
 * Migration : Ajoute ecole_id à la table enseignant
 * Usage : node add-ecole-to-enseignant.js
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
    const qi = db.sequelize.getQueryInterface();
    const desc = await qi.describeTable('enseignant');

    if (desc.ecole_id) {
      console.log('ℹ️  ecole_id existe déjà dans enseignant');
      process.exit(0);
    }

    await qi.addColumn('enseignant', 'ecole_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'ecoles', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    console.log('✅ Colonne ecole_id ajoutée à la table enseignant');
    process.exit(0);
  } catch (err) {
    console.error('❌', err.message);
    process.exit(1);
  }
}

migrate();
