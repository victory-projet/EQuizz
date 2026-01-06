# Guide de Test - Formulaire d'Évaluation

## 🎯 **Objectif**
Valider que le formulaire d'évaluation fonctionne correctement avec le backend et offre une excellente expérience utilisateur.

## 🧪 **Tests Automatisés**

### 1. **Validation de l'intégration**
```bash
# Depuis la racine du projet
node validate-integration.js
```
Ce script vérifie :
- ✅ Présence de tous les fichiers requis
- ✅ Configuration des dépendances
- ✅ Configuration de la base de données
- ✅ Syntaxe TypeScript
- ✅ Routes backend configurées

### 2. **Test de la base de données**
```bash
cd backend
node test-form-integration.js
```
Teste :
- ✅ Connexion à la base de données
- ✅ Récupération des cours et classes
- ✅ Création d'évaluations
- ✅ Associations avec les classes

### 3. **Démarrage rapide**
```bash
# Depuis la racine du projet
node quick-start.js
```
Lance automatiquement :
- 🖥️ Backend sur http://localhost:8080
- 🌐 Frontend sur http://localhost:4200

## 🖱️ **Tests Manuels - Interface Utilisateur**

### **Étape 1 : Accès au formulaire**
1. Ouvrir http://localhost:4200
2. Se connecter avec un compte administrateur
3. Naviguer vers "Évaluations"
4. Cliquer sur "Créer un Quiz"

**✅ Résultat attendu :** Le formulaire s'affiche avec les 3 étapes visibles

### **Étape 2 : Test des champs obligatoires**
1. Essayer de soumettre le formulaire vide
2. Vérifier les messages d'erreur

**✅ Résultat attendu :**
- Messages d'erreur clairs pour chaque champ
- Champs surlignés en rouge
- Compteur d'erreurs affiché

### **Étape 3 : Validation des dates**
1. Saisir une date de début dans le passé
2. Saisir une date de fin antérieure à la date de début

**✅ Résultat attendu :**
- "La date de début doit être dans le futur"
- "La date de fin doit être postérieure à la date de début"

### **Étape 4 : Chargement des données**
1. Vérifier que la liste des cours se charge
2. Vérifier que la liste des classes se charge

**✅ Résultat attendu :**
- Dropdown des cours rempli
- Grille des classes affichée avec effectifs

### **Étape 5 : Sélection multiple des classes**
1. Cliquer sur plusieurs classes
2. Vérifier le compteur de classes sélectionnées

**✅ Résultat attendu :**
- Classes sélectionnées surlignées
- Compteur mis à jour : "X classe(s) sélectionnée(s)"

### **Étape 6 : Auto-sauvegarde**
1. Remplir partiellement le formulaire
2. Attendre 30 secondes
3. Recharger la page

**✅ Résultat attendu :**
- Message "Auto-sauvegarde effectuée" dans la console
- Données restaurées au rechargement

### **Étape 7 : Soumission réussie**
1. Remplir tous les champs correctement
2. Sélectionner au moins une classe
3. Cliquer sur "Créer en brouillon"

**✅ Résultat attendu :**
- Spinner de chargement
- Message de succès
- Redirection vers la liste des évaluations

## ⌨️ **Tests des Raccourcis Clavier**

### **Raccourcis disponibles :**
- `Ctrl/Cmd + S` : Sauvegarder le formulaire
- `Escape` : Annuler et retourner à la liste
- `Alt + →` : Étape suivante
- `Alt + ←` : Étape précédente

### **Test des raccourcis :**
1. Remplir le formulaire
2. Tester chaque raccourci
3. Vérifier le comportement

**✅ Résultat attendu :** Chaque raccourci fonctionne comme prévu

## 📱 **Tests Responsive**

### **Tailles d'écran à tester :**
- 📱 Mobile (320px - 768px)
- 📟 Tablette (768px - 1024px)
- 🖥️ Desktop (1024px+)

### **Points de vérification :**
1. **Mobile :**
   - Étapes empilées verticalement
   - Champs en pleine largeur
   - Boutons adaptés au tactile

2. **Tablette :**
   - Grille des classes adaptée
   - Navigation fluide entre étapes

3. **Desktop :**
   - Grille 2 colonnes pour les champs
   - Toutes les fonctionnalités accessibles

## 🔍 **Tests d'Accessibilité**

### **Navigation au clavier :**
1. Utiliser uniquement la touche `Tab`
2. Vérifier que tous les éléments sont accessibles
3. Tester les lecteurs d'écran (si disponible)

### **Contraste et lisibilité :**
1. Vérifier le contraste des couleurs
2. Tester avec différentes tailles de police
3. Vérifier les focus indicators

## 🚨 **Tests d'Erreur**

### **Erreurs réseau :**
1. Couper la connexion réseau
2. Essayer de soumettre le formulaire

**✅ Résultat attendu :** Message d'erreur réseau approprié

### **Erreurs serveur :**
1. Arrêter le backend
2. Essayer de charger le formulaire

**✅ Résultat attendu :** Fallback vers les données mockées

### **Données corrompues :**
1. Modifier localStorage avec des données invalides
2. Recharger la page

**✅ Résultat attendu :** Gestion gracieuse des erreurs

## 📊 **Métriques de Performance**

### **Temps de chargement :**
- ⏱️ Chargement initial : < 2 secondes
- ⏱️ Chargement des cours/classes : < 1 seconde
- ⏱️ Soumission du formulaire : < 3 secondes

### **Utilisation mémoire :**
- 📊 Pas de fuites mémoire détectées
- 📊 Nettoyage des observables RxJS

## ✅ **Checklist de Validation**

### **Fonctionnalités de base :**
- [ ] Affichage du formulaire en 3 étapes
- [ ] Validation en temps réel
- [ ] Messages d'erreur contextuels
- [ ] Chargement des cours depuis l'API
- [ ] Chargement des classes depuis l'API
- [ ] Sélection multiple des classes
- [ ] Soumission vers le backend
- [ ] Gestion des erreurs réseau

### **Expérience utilisateur :**
- [ ] Interface intuitive et moderne
- [ ] Animations fluides
- [ ] Feedback visuel approprié
- [ ] Auto-sauvegarde fonctionnelle
- [ ] Raccourcis clavier
- [ ] Design responsive
- [ ] Accessibilité

### **Intégration backend :**
- [ ] Routes `/api/cours` et `/api/classes` fonctionnelles
- [ ] Création d'évaluations via `/api/evaluations`
- [ ] Gestion des UUID
- [ ] Association avec les classes
- [ ] Validation côté serveur

## 🐛 **Problèmes Connus et Solutions**

### **Problème : Connexion MySQL**
**Solution :** Utiliser `node setup-mysql.js` ou SQLite avec `node test-with-sqlite.js`

### **Problème : Données non chargées**
**Solution :** Vérifier que le backend est démarré et les routes configurées

### **Problème : Erreurs TypeScript**
**Solution :** Vérifier les imports et les types dans les services

## 📝 **Rapport de Test**

Après chaque session de test, documenter :
- ✅ Tests réussis
- ❌ Tests échoués
- 🐛 Bugs découverts
- 💡 Améliorations suggérées

### **Template de rapport :**
```
Date: [DATE]
Testeur: [NOM]
Version: [VERSION]

Tests réussis: X/Y
Bugs critiques: X
Bugs mineurs: X
Suggestions: X

Détails:
- [Description des problèmes]
- [Suggestions d'amélioration]
```

## 🚀 **Prochaines Étapes**

Après validation complète :
1. **Déploiement en staging**
2. **Tests utilisateurs**
3. **Optimisations de performance**
4. **Documentation utilisateur**
5. **Formation des administrateurs**

## ✅ **Corrections TypeScript Récentes**

### **Erreurs corrigées :**
- [x] **Signals Angular** : Correction de `currentStep === 1` → `currentStep() === 1`
- [x] **NgFor avec signals** : `availableCourses` → `availableCourses()`
- [x] **Composants manquants** : Création de `EvaluationSubmissionsComponent` et `EvaluationResultsComponent`
- [x] **Services manquants** : Création de `EvaluationUseCase` et entités associées
- [x] **Types de questions** : Harmonisation `'CHOIX_MULTIPLE'` → `'QCM'`
- [x] **Types optionnels** : Gestion des propriétés `undefined` avec `!`
- [x] **Templates manquants** : Création de `import-manager.component.html`

### **Modules créés :**
- `frontend-admin/src/app/core/usecases/evaluation.usecase.ts`
- `frontend-admin/src/app/core/domain/entities/evaluation.entity.ts`
- `frontend-admin/src/app/presentation/features/evaluations/evaluation-submissions/`
- `frontend-admin/src/app/presentation/features/evaluations/evaluation-results/`

### **Validation :**
```bash
# Vérifier qu'il n'y a plus d'erreurs TypeScript
cd frontend-admin
npm run build
```

**✅ Résultat attendu :** Compilation sans erreurs TypeScript