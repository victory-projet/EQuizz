const db = require('./src/models');

async function fixTable() {
  try {
    console.log('🔄 Modification de la table password_reset_tokens...');
    
    // Supprimer la table existante
    await db.sequelize.query('DROP TABLE IF EXISTS password_reset_tokens');
    
    // Recréer avec le bon type
    await db.sequelize.query(`
      CREATE TABLE password_reset_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        utilisateur_id VARCHAR(36) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        used_at TIMESTAMP NULL,
        ip_address VARCHAR(45),
        INDEX idx_token (token),
        INDEX idx_expires (expires_at),
        INDEX idx_user_id (utilisateur_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Table modifiée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

fixTable();
