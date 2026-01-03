// Script pour réactiver les modèles push notifications après nettoyage DB
const fs = require('fs');
const path = require('path');

const modelsIndexPath = path.join(__dirname, 'src/models/index.js');

function enablePushModels() {
  try {
    console.log('🔄 Réactivation des modèles push notifications...');
    
    let content = fs.readFileSync(modelsIndexPath, 'utf8');
    
    // Réactiver les imports
    content = content.replace(
      '// Temporarily disabled to fix production DB index limit issue\n// const DeviceToken = require(\'./DeviceToken\');\n// const NotificationPreference = require(\'./NotificationPreference\');',
      'const DeviceToken = require(\'./DeviceToken\');\nconst NotificationPreference = require(\'./NotificationPreference\');'
    );
    
    // Réactiver les exports
    content = content.replace(
      '// Temporarily disabled to fix production DB index limit issue\n// db.DeviceToken = DeviceToken;\n// db.NotificationPreference = NotificationPreference;',
      'db.DeviceToken = DeviceToken;\ndb.NotificationPreference = NotificationPreference;'
    );
    
    // Réactiver les associations
    content = content.replace(
      '// --- 7. Push Notifications (temporarily disabled) ---\n// Utilisateur.hasMany(DeviceToken, { foreignKey: { name: \'utilisateur_id\', allowNull: false }, onDelete: \'CASCADE\' });\n// DeviceToken.belongsTo(Utilisateur, { foreignKey: \'utilisateur_id\' });\n\n// Utilisateur.hasOne(NotificationPreference, { foreignKey: { name: \'utilisateur_id\', allowNull: false }, onDelete: \'CASCADE\' });\n// NotificationPreference.belongsTo(Utilisateur, { foreignKey: \'utilisateur_id\' });',
      '// --- 7. Push Notifications ---\nUtilisateur.hasMany(DeviceToken, { foreignKey: { name: \'utilisateur_id\', allowNull: false }, onDelete: \'CASCADE\' });\nDeviceToken.belongsTo(Utilisateur, { foreignKey: \'utilisateur_id\' });\n\nUtilisateur.hasOne(NotificationPreference, { foreignKey: { name: \'utilisateur_id\', allowNull: false }, onDelete: \'CASCADE\' });\nNotificationPreference.belongsTo(Utilisateur, { foreignKey: \'utilisateur_id\' });'
    );
    
    fs.writeFileSync(modelsIndexPath, content);
    console.log('✅ Modèles push notifications réactivés avec succès');
    console.log('🔄 Redémarrez le serveur pour appliquer les changements');
    
  } catch (error) {
    console.error('❌ Erreur lors de la réactivation:', error.message);
  }
}

enablePushModels();