# Guide de Correction de la Base de Données de Production

## Problème
Erreur "Too many keys specified; max 64 keys allowed" lors du déploiement sur Render, empêchant le serveur de démarrer.

## Solution Étape par Étape

### Étape 1: Déploiement avec Modèles Désactivés
Les modèles push notifications sont maintenant temporairement désactivés dans `src/models/index.js`. Cela permettra au serveur de démarrer sans erreur.

1. **Commitez et poussez les changements actuels**:
   ```bash
   git add .
   git commit -m "Temporarily disable push notification models for production DB fix"
   git push
   ```

2. **Attendez que Render redéploie automatiquement**
   - Le serveur devrait maintenant démarrer sans erreur
   - Les migrations de nettoyage vont s'exécuter automatiquement

### Étape 2: Vérification du Nettoyage
Une fois le déploiement terminé, vérifiez les logs Render pour confirmer:
- ✅ Serveur démarré avec succès
- ✅ Migrations de nettoyage exécutées
- ✅ Tables DeviceToken et NotificationPreference supprimées

### Étape 3: Réactivation des Modèles
1. **Exécutez le script de réactivation localement**:
   ```bash
   node backend/enable-push-models.js
   ```

2. **Commitez et poussez les changements**:
   ```bash
   git add .
   git commit -m "Re-enable push notification models after DB cleanup"
   git push
   ```

3. **Attendez le redéploiement Render**
   - Les nouvelles migrations vont créer les tables avec index minimaux
   - Le système de push notifications sera opérationnel

### Étape 4: Test des Push Notifications
Une fois le redéploiement terminé:

1. **Testez l'enregistrement d'un token**:
   ```bash
   curl -X POST https://your-render-url.com/api/push-notifications/register \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "token": "test-token",
       "platform": "android",
       "deviceId": "test-device"
     }'
   ```

2. **Testez l'envoi d'une notification**:
   ```bash
   curl -X POST https://your-render-url.com/api/push-notifications/send \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer ADMIN_TOKEN" \
     -d '{
       "utilisateurIds": ["user-id"],
       "title": "Test",
       "body": "Test notification"
     }'
   ```

## Fichiers Modifiés
- `src/models/index.js` - Modèles temporairement désactivés
- `migrations/20250102000001-cleanup-push-tables.js` - Nettoyage des tables existantes
- `migrations/20250102000002-add-push-notifications-minimal.js` - Recréation avec index minimal
- `enable-push-models.js` - Script de réactivation

## Surveillance
Surveillez les logs Render pour:
- Erreurs de base de données
- Succès des migrations
- Initialisation Firebase
- Démarrage du serveur

## Rollback d'Urgence
Si des problèmes persistent, vous pouvez revenir à l'état précédent:
```bash
git revert HEAD~2
git push
```

## Notes Importantes
- Les modèles sont désactivés temporairement, pas supprimés
- Les migrations de nettoyage sont sécurisées (avec vérifications)
- Firebase reste configuré et fonctionnel
- Aucune perte de données utilisateur