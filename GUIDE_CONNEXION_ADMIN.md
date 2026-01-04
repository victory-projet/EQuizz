# Guide de Connexion Administrateur

## ✅ Serveur Backend

Le serveur backend fonctionne correctement sur `http://localhost:3000`

### Vérifications effectuées :
- ✅ Base de données connectée
- ✅ Tables créées et synchronisées  
- ✅ Utilisateurs initialisés (8 utilisateurs trouvés)
- ✅ API d'authentification fonctionnelle
- ✅ Génération de tokens JWT

## 🔑 Identifiants de Connexion

### Administrateur Principal
- **Email** : `super.admin@saintjeaningenieur.org`
- **Mot de passe** : `Admin123!`
- **Rôle** : ADMIN

### Autres Utilisateurs Disponibles

#### Enseignants
1. **Marie Dupont**
   - Email : `marie.dupont@saintjeaningenieur.org`
   - Mot de passe : `Prof123!`
   - Spécialité : Informatique

2. **Jean Martin**
   - Email : `jean.martin@saintjeaningenieur.org`
   - Mot de passe : `Prof123!`
   - Spécialité : Mathématiques

#### Étudiants
- Plusieurs étudiants sont créés avec des mots de passe générés automatiquement

## 🔧 Tests Effectués

### 1. Test de la Base de Données
```bash
node check-db-structure.js
```
- ✅ 23 tables créées
- ✅ Structure correcte de la table Utilisateur
- ✅ 8 utilisateurs présents

### 2. Test de l'Authentification
```bash
node test-auth-api.js
```
- ✅ Service d'authentification fonctionnel
- ✅ Vérification des mots de passe
- ✅ Génération de tokens JWT
- ✅ Vérification des rôles

### 3. Test de l'API HTTP
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"super.admin@saintjeaningenieur.org","motDePasse":"Admin123!"}'
```
- ✅ Retourne un token JWT valide
- ✅ Status 200 OK

## 🚀 Démarrage du Serveur

```bash
cd backend
npm start
```

Le serveur démarre sur le port 3000 avec les messages :
- ✅ Connexion à la base de données établie
- ✅ Base de données synchronisée  
- ✅ 8 utilisateurs trouvés (base initialisée)
- ✅ Serveur démarré sur le port 3000

## 🌐 Frontend

Pour se connecter au frontend :
1. Ouvrir l'interface web
2. Utiliser les identifiants admin :
   - Email : `super.admin@saintjeaningenieur.org`
   - Mot de passe : `Admin123!`

## 🔍 Diagnostic des Erreurs

Si la connexion échoue :

1. **Vérifier que le backend tourne** :
   ```bash
   curl http://localhost:3000/api/test
   ```

2. **Tester l'authentification directement** :
   ```bash
   node test-auth-api.js
   ```

3. **Vérifier les logs du serveur** pour voir les erreurs

4. **Vérifier la console du navigateur** pour les erreurs frontend

## 📝 Notes Importantes

- Le mot de passe contient une majuscule, des chiffres et un caractère spécial : `Admin123!`
- L'email doit être exact : `super.admin@saintjeaningenieur.org`
- Le serveur utilise CORS pour autoriser les requêtes depuis le frontend
- Les mots de passe sont hashés avec bcrypt (salt rounds: 10)

## 🛠️ Formulaire de Questions

Une fois connecté, vous pouvez accéder au formulaire de création de questions que nous avons développé :

### Composants créés :
- `QuestionFormComponent` : Formulaire de création/édition
- `QuestionManagementComponent` : Gestion complète des questions  
- Support pour 2 types de questions :
  - Choix multiples (minimum 2 options)
  - Réponse ouverte

### Fonctionnalités :
- ✅ Validation en temps réel
- ✅ Aperçu de la question
- ✅ Gestion dynamique des options
- ✅ Interface responsive
- ✅ Intégration avec l'API backend