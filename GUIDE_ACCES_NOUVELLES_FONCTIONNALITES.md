# 🚀 Guide d'Accès aux Nouvelles Fonctionnalités

## 📋 Prérequis

1. **Services démarrés** :
   - Backend : `npm start` dans le dossier `backend/`
   - Frontend : `npm start` dans le dossier `frontend-admin/`

2. **Compte administrateur** créé et fonctionnel

## 🎯 Accès aux Fonctionnalités

### **Étape 1 : Connexion**
1. Ouvrez votre navigateur sur `http://localhost:4200`
2. Connectez-vous avec vos identifiants administrateur

### **Étape 2 : Navigation vers les Évaluations**
1. Dans le menu principal, cliquez sur **"Évaluations"**
2. Vous verrez la liste de toutes les évaluations

### **Étape 3 : Accès aux Nouvelles Fonctionnalités**

#### **Option A : Évaluation Existante**
1. **Cliquez** sur une évaluation existante dans la liste
2. Vous arrivez sur la page de détail avec **4 onglets** :

   - 📝 **Questions** : Gestion traditionnelle des questions
   - 🧠 **Analyse des Sentiments** : ⭐ NOUVELLE FONCTIONNALITÉ
   - 📊 **Rapports & Export** : ⭐ NOUVELLE FONCTIONNALITÉ  
   - 📈 **Statistiques** : Métriques améliorées

#### **Option B : Créer une Nouvelle Évaluation**
1. Cliquez sur **"+ Nouvelle Évaluation"**
2. Remplissez les informations requises
3. Ajoutez des questions
4. Publiez l'évaluation
5. Une fois publiée, les nouvelles fonctionnalités seront disponibles

## 🧠 Fonctionnalité : Analyse des Sentiments

### **Accès**
1. Ouvrez une évaluation
2. Cliquez sur l'onglet **"Analyse des Sentiments"**

### **Fonctionnalités Disponibles**
- **Sentiment Global** : Vue d'ensemble (Positif/Négatif/Neutre)
- **Score Moyen** : Valeur numérique du sentiment
- **Distribution** : Graphiques de répartition
- **Tendances** : Variation, polarisation, consistance
- **Insights Automatiques** : Recommandations intelligentes
- **Export des Données** : Sauvegarde en JSON

### **Utilisation**
```
✅ Automatique : L'analyse se lance dès l'ouverture de l'onglet
✅ Temps Réel : Mise à jour avec le bouton "Actualiser"
✅ Export : Bouton "Exporter les détails" pour sauvegarder
```

## 📊 Fonctionnalité : Rapports & Export

### **Accès**
1. Ouvrez une évaluation
2. Cliquez sur l'onglet **"Rapports & Export"**

### **Options d'Export**
- **Format** : Excel (.xlsx) ou PDF
- **Contenu Modulaire** :
  - ✅ Analyse des sentiments
  - ✅ Données graphiques
  - ✅ Réponses détaillées
  - ✅ Statistiques avancées

### **Aperçu du Rapport**
- **Métriques Clés** : Étudiants, taux de completion, temps moyen
- **Sentiment Global** : Indicateur visuel
- **Insights** : Recommandations automatiques

### **Utilisation**
```
1. Configurez les options d'export
2. Cliquez sur "Actualiser l'aperçu"
3. Vérifiez les données dans l'aperçu
4. Cliquez sur "Exporter EXCEL" ou "Exporter PDF"
5. Le fichier se télécharge automatiquement
```

## 📈 Fonctionnalité : Statistiques Améliorées

### **Accès**
1. Ouvrez une évaluation
2. Cliquez sur l'onglet **"Statistiques"**

### **Métriques Disponibles**
- **Nombre de Questions** : Total des questions créées
- **Date de Création** : Horodatage de l'évaluation
- **Statut Actuel** : Brouillon/Publiée/Clôturée
- **Note Informative** : Explication des statistiques futures

## 🔧 Résolution de Problèmes

### **Problème : Onglets non visibles**
**Solution** :
1. Vérifiez que les services sont démarrés
2. Actualisez la page (F5)
3. Videz le cache du navigateur

### **Problème : Analyse des sentiments vide**
**Cause** : Aucune réponse textuelle d'étudiants
**Solution** :
1. Assurez-vous que l'évaluation est publiée
2. Vérifiez qu'il y a des soumissions d'étudiants
3. Les réponses doivent contenir du texte (pas seulement des QCM)

### **Problème : Export ne fonctionne pas**
**Solution** :
1. Vérifiez la connexion réseau
2. Assurez-vous que le backend est accessible
3. Consultez la console du navigateur (F12) pour les erreurs

## 🎯 Cas d'Usage Recommandés

### **Pour Tester Rapidement**
1. Créez une évaluation de test
2. Ajoutez 2-3 questions ouvertes
3. Publiez l'évaluation
4. Simulez des réponses d'étudiants (via l'interface mobile ou directement en base)
5. Explorez les nouveaux onglets

### **Pour une Utilisation Réelle**
1. Utilisez une évaluation existante avec des réponses
2. Analysez les sentiments pour identifier les difficultés
3. Exportez des rapports pour les réunions pédagogiques
4. Utilisez les insights pour améliorer le contenu

## 📞 Support

### **Logs Utiles**
- **Backend** : Console où vous avez lancé `npm start`
- **Frontend** : Console du navigateur (F12 → Console)
- **Réseau** : Onglet Network dans les outils développeur

### **Endpoints API Disponibles**
```
GET /api/evaluations/:id/sentiment-analysis
GET /api/evaluations/:id/export?format=excel
GET /api/evaluations/:id/advanced-report
```

### **Test Manuel des Services**
Utilisez le script de test :
```bash
cd backend
node test-sentiment-features.js
```

---

**🎉 Félicitations !** Vous avez maintenant accès à des fonctionnalités d'analyse avancées qui vous permettront de mieux comprendre l'engagement et les sentiments de vos étudiants, tout en générant des rapports professionnels pour vos analyses pédagogiques.