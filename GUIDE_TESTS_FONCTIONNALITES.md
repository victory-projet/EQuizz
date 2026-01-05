# 🧪 Guide des Tests de Fonctionnalités

## 📋 Vue d'ensemble

Ce guide explique comment tester toutes les fonctionnalités demandées pour vérifier qu'elles sont correctement implémentées et fonctionnelles.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js installé
- Serveur backend démarré (`npm start` dans le dossier `backend`)
- Base de données configurée et accessible

### Exécution des tests

#### Windows
```bash
# Double-cliquez sur le fichier ou exécutez :
test-all-features.bat
```

#### Linux/Mac
```bash
# Rendez le script exécutable et lancez-le :
chmod +x test-all-features.sh
./test-all-features.sh
```

#### Manuel
```bash
cd backend
npm install axios colors
node run-all-tests.js
```

## 🧪 Tests Individuels

### 1. Test Mot de passe oublié
```bash
node test-forgot-password.js
```

**Fonctionnalités testées :**
- ✅ Endpoint `/auth/forgot-password` existe
- ✅ Validation email invalide
- ✅ Gestion email inexistant (sécurisé)
- ✅ Endpoint validation token
- ✅ Endpoint reset password
- ✅ Validation mots de passe différents

### 2. Test Pagination
```bash
node test-pagination.js
```

**Fonctionnalités testées :**
- ✅ Pagination étudiants par défaut
- ✅ Paramètres page et limit
- ✅ Pagination notifications
- ✅ Gestion paramètres invalides
- ✅ Limite maximale respectée
- ✅ Métadonnées complètes

### 3. Test Association Cours-Enseignant
```bash
node test-cours-enseignant.js
```

**Fonctionnalités testées :**
- ✅ Assignation enseignant à cours
- ✅ Récupération enseignants par cours
- ✅ Récupération cours par enseignant
- ✅ Modification de rôles
- ✅ Assignation multiple
- ✅ Validation des données

### 4. Test Rapports Avancés
```bash
node test-advanced-reports.js
```

**Fonctionnalités testées :**
- ✅ Génération rapport avancé
- ✅ Analyse des sentiments
- ✅ Réponses anonymes
- ✅ Données pour graphiques QCM
- ✅ Filtres par classe/enseignant
- ✅ Export Excel/PDF
- ✅ Statistiques de comparaison

### 5. Test Gestion des Étudiants
```bash
node test-student-management.js
```

**Fonctionnalités testées :**
- ✅ Création d'étudiants
- ✅ Modification d'étudiants
- ✅ Suppression d'étudiants
- ✅ Activation/Désactivation
- ✅ Recherche et filtres
- ✅ Validation des données
- ✅ Pagination

## 📊 Interprétation des Résultats

### Codes de Statut
- ✅ **PASS** : Test réussi, fonctionnalité opérationnelle
- ❌ **FAIL** : Test échoué, problème détecté
- ⚠️ **WARNING** : Test partiellement réussi ou données manquantes

### Taux de Réussite
- **90-100%** : 🎉 Excellent - Système prêt pour la production
- **70-89%** : ⚠️ Bon - Quelques ajustements nécessaires
- **<70%** : ❌ Attention - Corrections importantes requises

## 🔧 Résolution des Problèmes

### Erreurs Communes

#### 1. Erreur de connexion
```
❌ FAIL: Endpoint existe - connect ECONNREFUSED
```
**Solution :** Vérifiez que le serveur backend est démarré

#### 2. Erreur d'authentification
```
❌ FAIL: Test nécessitant auth - 401 Unauthorized
```
**Solution :** Vérifiez les credentials de test ou créez un compte admin

#### 3. Données de test manquantes
```
⚠️ Données de test manquantes - endpoint supposé fonctionnel
```
**Solution :** Créez des données de test (cours, enseignants, étudiants)

#### 4. Erreur de base de données
```
❌ FAIL: Création - Database connection error
```
**Solution :** Vérifiez la configuration de la base de données

### Configuration des Données de Test

#### Créer un compte admin de test
```sql
INSERT INTO Utilisateur (nom, prenom, email, motDePasseHash, role, estActif) 
VALUES ('Admin', 'Test', 'admin@test.com', '$2b$10$...', 'ADMIN', true);
```

#### Créer des données de référence
```sql
-- Classe de test
INSERT INTO Classe (nom, niveau) VALUES ('Test Class', 'L1');

-- Cours de test
INSERT INTO Cours (nom, description) VALUES ('Test Course', 'Cours de test');
```

## 📈 Tests Frontend

### Tests Manuels Interface

#### 1. Mot de passe oublié
1. Aller sur `/login`
2. Cliquer "Mot de passe oublié ?"
3. Saisir un email valide
4. Vérifier le message de confirmation

#### 2. Pagination
1. Aller sur `/students` ou `/users`
2. Vérifier les contrôles de pagination
3. Tester le changement de page
4. Tester le changement d'éléments par page

#### 3. Gestion des étudiants
1. Aller sur `/students`
2. Cliquer "Nouvel Étudiant"
3. Remplir le formulaire
4. Vérifier la création
5. Tester la modification et suppression

#### 4. Rapports avancés
1. Aller sur une évaluation
2. Onglet "Rapports & Export"
3. Vérifier les graphiques QCM
4. Tester les filtres
5. Tester l'export Excel/PDF

## 🎯 Checklist de Validation

### Backend ✅
- [ ] Tous les endpoints répondent
- [ ] Authentification fonctionne
- [ ] Validation des données
- [ ] Gestion des erreurs
- [ ] Pagination implémentée
- [ ] Export fonctionnel

### Frontend ✅
- [ ] Interfaces utilisateur complètes
- [ ] Formulaires fonctionnels
- [ ] Validation côté client
- [ ] Gestion des erreurs
- [ ] Notifications utilisateur
- [ ] Navigation fluide

### Intégration ✅
- [ ] Communication Backend ↔ Frontend
- [ ] Gestion des tokens
- [ ] Synchronisation des données
- [ ] Performance acceptable
- [ ] Sécurité respectée

## 📚 Ressources Supplémentaires

### Logs et Debugging
- Logs backend : `backend/logs/`
- Console navigateur : F12 → Console
- Network tab : F12 → Network

### Documentation API
- Swagger/OpenAPI : `http://localhost:3000/api-docs`
- Postman collection : `backend/docs/postman/`

### Support
- Issues GitHub : Créer une issue avec les logs d'erreur
- Documentation : Consulter les guides dans `/docs/`

---

**Note :** Ces tests vérifient le bon fonctionnement des fonctionnalités principales. Pour des tests plus approfondis, consultez la suite de tests unitaires et d'intégration.