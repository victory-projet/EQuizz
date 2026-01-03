# Correction de l'Erreur de Transaction

## Problème Résolu
Erreur "Transaction cannot be rolled back because it has been finished with state: rollback" lors de l'initialisation de la base de données.

## Causes Identifiées
1. **Double sync** - `sequelize.sync()` appelé dans `seedDatabase()` alors qu'il est déjà fait dans `app.js`
2. **Double rollback** - Transaction rollback appelée puis exception levée (qui cause un autre rollback)
3. **Gestion d'erreur incorrecte** - Exception levée au lieu de retourner un résultat

## Corrections Apportées

### 1. Suppression du sync redondant
```javascript
// AVANT (problématique)
await db.sequelize.sync();
const userCount = await db.Utilisateur.count();

// APRÈS (corrigé)
const userCount = await db.Utilisateur.count();
```

### 2. Gestion propre des données existantes
```javascript
// AVANT (problématique)
if (userCount > 0) {
  await transaction.rollback();
  throw new Error('La base de données contient déjà des données.');
}

// APRÈS (corrigé)
if (userCount > 0) {
  await transaction.rollback();
  return {
    success: false,
    message: 'La base de données contient déjà des données.',
    skipSeed: true
  };
}
```

### 3. Amélioration de la gestion dans app.js
```javascript
const result = await seedDatabase();
if (result.success) {
  console.log('✅ Données d\'initialisation chargées automatiquement.');
} else if (result.skipSeed) {
  console.log('ℹ️  Initialisation ignorée - données déjà présentes.');
}
```

### 4. Test des modèles push notifications
Ajout de `DeviceToken` et `NotificationPreference` dans l'endpoint de test pour vérifier que les nouvelles tables fonctionnent.

## Résultat Attendu
- ✅ Serveur démarre sans erreur MySQL
- ✅ Migrations appliquées correctement
- ✅ Tables push notifications créées
- ✅ Initialisation automatique si DB vide
- ✅ Pas d'erreur de transaction

## Test à Effectuer
1. **Test de l'API** : `GET /api/init/test`
2. **Initialisation manuelle** : `POST /api/init/seed` (si nécessaire)
3. **Test push notifications** : Vérifier que les tables existent et sont accessibles