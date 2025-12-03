# Guide Utilisateur Administrateur - EQuizz

Bienvenue dans le guide utilisateur de la plateforme EQuizz Admin. Ce guide vous accompagne dans l'utilisation de toutes les fonctionnalités de l'application.

## 📋 Table des Matières

- [Connexion](#-connexion)
- [Dashboard](#-dashboard)
- [Gestion des Évaluations](#-gestion-des-évaluations)
- [Gestion des Utilisateurs](#-gestion-des-utilisateurs)
- [Rapports](#-rapports)
- [Paramètres](#-paramètres)

## 🔐 Connexion

### Première Connexion

1. Ouvrez votre navigateur et accédez à l'URL de l'application
2. Entrez vos identifiants :
   - **Email** : votre adresse email professionnelle
   - **Mot de passe** : fourni par l'administrateur système

3. Cliquez sur **Se connecter**

### Mot de Passe Oublié

1. Cliquez sur **Mot de passe oublié ?**
2. Entrez votre adresse email
3. Consultez votre boîte mail
4. Cliquez sur le lien de réinitialisation
5. Créez un nouveau mot de passe

### Déconnexion

1. Cliquez sur votre avatar en haut à droite
2. Sélectionnez **Déconnexion**

## 📊 Dashboard

Le dashboard est votre page d'accueil. Il affiche une vue d'ensemble de l'activité.

### Vue d'Ensemble

**Statistiques Principales** :
- Nombre total d'étudiants
- Nombre total d'enseignants
- Nombre total de cours
- Nombre d'évaluations actives

**Graphiques** :
- Répartition des évaluations par statut
- Taux de participation par cours
- Évolution de la participation dans le temps

### Filtres

**Filtrer par Année Académique** :
1. Cliquez sur le dropdown "Année"
2. Sélectionnez l'année souhaitée (ex: 2025-2026)
3. Les données se mettent à jour automatiquement

**Filtrer par Semestre** :
1. Cliquez sur le dropdown "Semestre"
2. Choisissez :
   - Toute l'année
   - Semestre 1
   - Semestre 2

### Alertes

Les alertes importantes s'affichent en haut du dashboard :
- 🔴 **Rouge** : Action urgente requise
- 🟡 **Jaune** : Attention nécessaire
- 🔵 **Bleu** : Information

## 📝 Gestion des Évaluations

### Créer une Évaluation

1. **Accéder à la création** :
   - Cliquez sur **Évaluations** dans le menu
   - Cliquez sur **+ Nouvelle Évaluation**

2. **Informations Générales** :
   - **Titre** : Nom de l'évaluation (ex: "Évaluation Cours Java - S1 2025")
   - **Description** : Objectif de l'évaluation
   - **Cours** : Sélectionnez le cours concerné
   - **Classes** : Sélectionnez une ou plusieurs classes

3. **Période** :
   - **Date de début** : Quand l'évaluation devient accessible
   - **Date de fin** : Quand l'évaluation se clôture
   - **Anonymat** : Cochez si les réponses doivent être anonymes

4. **Questions** :
   
   **Ajouter une Question à Choix Multiple** :
   - Cliquez sur **+ Ajouter une question**
   - Sélectionnez **Choix Multiple**
   - Entrez la question
   - Ajoutez les options de réponse
   - Cochez si plusieurs réponses sont possibles

   **Ajouter une Question Ouverte** :
   - Sélectionnez **Texte Libre**
   - Entrez la question
   - Définissez le nombre de caractères max (optionnel)

   **Ajouter une Échelle** :
   - Sélectionnez **Échelle**
   - Entrez la question
   - Définissez l'échelle (ex: 1 à 5)
   - Ajoutez des labels (ex: "Pas du tout d'accord" → "Tout à fait d'accord")

5. **Prévisualisation** :
   - Cliquez sur **Prévisualiser**
   - Vérifiez l'apparence et le contenu
   - Retournez à l'édition si nécessaire

6. **Enregistrement** :
   - **Enregistrer comme brouillon** : Sauvegarde sans publier
   - **Publier** : Rend l'évaluation accessible aux étudiants

### Modifier une Évaluation

1. Accédez à la liste des évaluations
2. Cliquez sur l'évaluation à modifier
3. Cliquez sur **Modifier**
4. Effectuez vos modifications
5. Cliquez sur **Enregistrer**

⚠️ **Attention** : Une évaluation publiée ne peut plus être modifiée si des réponses ont été soumises.

### Clôturer une Évaluation

1. Accédez à l'évaluation
2. Cliquez sur **Clôturer**
3. Confirmez l'action

Une fois clôturée, les étudiants ne peuvent plus répondre.

### Supprimer une Évaluation

1. Accédez à l'évaluation
2. Cliquez sur **Supprimer**
3. Confirmez l'action

⚠️ **Attention** : Cette action est irréversible.

## 👥 Gestion des Utilisateurs

### Étudiants

**Ajouter un Étudiant** :
1. Cliquez sur **Étudiants** dans le menu
2. Cliquez sur **+ Nouvel Étudiant**
3. Remplissez le formulaire :
   - Nom
   - Prénom
   - Email
   - Matricule
   - Classe
4. Cliquez sur **Enregistrer**

**Importer des Étudiants** :
1. Cliquez sur **Importer**
2. Téléchargez le modèle Excel
3. Remplissez le fichier avec les données
4. Importez le fichier
5. Vérifiez les données
6. Confirmez l'import

**Modifier un Étudiant** :
1. Cliquez sur l'étudiant dans la liste
2. Modifiez les informations
3. Cliquez sur **Enregistrer**

**Désactiver un Étudiant** :
1. Cliquez sur l'étudiant
2. Cliquez sur **Désactiver**
3. Confirmez

### Enseignants

**Ajouter un Enseignant** :
1. Cliquez sur **Enseignants** dans le menu
2. Cliquez sur **+ Nouvel Enseignant**
3. Remplissez le formulaire :
   - Nom
   - Prénom
   - Email
   - Spécialité
4. Cliquez sur **Enregistrer**

**Assigner des Cours** :
1. Accédez à la fiche de l'enseignant
2. Section **Cours Assignés**
3. Cliquez sur **+ Assigner un cours**
4. Sélectionnez le cours et les classes
5. Cliquez sur **Enregistrer**

### Classes

**Créer une Classe** :
1. Cliquez sur **Classes** dans le menu
2. Cliquez sur **+ Nouvelle Classe**
3. Remplissez :
   - Nom de la classe (ex: "L3 Informatique A")
   - Année académique
   - Niveau
4. Cliquez sur **Enregistrer**

**Gérer les Étudiants d'une Classe** :
1. Accédez à la classe
2. Section **Étudiants**
3. Ajoutez ou retirez des étudiants
4. Cliquez sur **Enregistrer**

## 📈 Rapports

### Consulter un Rapport

1. Cliquez sur **Rapports** dans le menu
2. Sélectionnez l'évaluation
3. Le rapport s'affiche avec :
   - Taux de participation
   - Statistiques par question
   - Réponses détaillées
   - Graphiques

### Filtrer les Résultats

**Par Classe** :
1. Sélectionnez une classe dans le dropdown
2. Les résultats se filtrent automatiquement

**Par Enseignant** :
1. Sélectionnez un enseignant
2. Voir uniquement ses cours

**Par Période** :
1. Sélectionnez une plage de dates
2. Les résultats se mettent à jour

### Exporter un Rapport

**Export Excel** :
1. Cliquez sur **Exporter**
2. Sélectionnez **Excel**
3. Le fichier se télécharge automatiquement

**Export PDF** :
1. Cliquez sur **Exporter**
2. Sélectionnez **PDF**
3. Le fichier se génère et se télécharge

**Contenu de l'Export** :
- Statistiques globales
- Détail par question
- Réponses individuelles (si non anonyme)
- Graphiques

### Imprimer un Rapport

1. Cliquez sur **Imprimer**
2. Configurez les options d'impression
3. Cliquez sur **Imprimer**

## ⚙️ Paramètres

### Profil

**Modifier votre Profil** :
1. Cliquez sur votre avatar
2. Sélectionnez **Profil**
3. Modifiez vos informations
4. Cliquez sur **Enregistrer**

**Changer votre Mot de Passe** :
1. Section **Sécurité**
2. Cliquez sur **Changer le mot de passe**
3. Entrez :
   - Mot de passe actuel
   - Nouveau mot de passe
   - Confirmation
4. Cliquez sur **Enregistrer**

### Notifications

**Configurer les Notifications** :
1. Accédez aux **Paramètres**
2. Section **Notifications**
3. Activez/Désactivez :
   - Notifications par email
   - Notifications dans l'application
   - Alertes importantes
4. Cliquez sur **Enregistrer**

## 🔍 Recherche

### Recherche Globale

1. Cliquez sur la barre de recherche en haut
2. Tapez votre recherche
3. Les résultats s'affichent par catégorie :
   - Évaluations
   - Étudiants
   - Enseignants
   - Cours

### Filtres Avancés

Dans chaque section, utilisez les filtres :
- **Statut** : Actif, Inactif, Tous
- **Date** : Période personnalisée
- **Catégorie** : Type spécifique

## 📱 Version Mobile

### Navigation Mobile

- **Menu** : Cliquez sur l'icône hamburger (☰)
- **Retour** : Utilisez la flèche de retour
- **Actions** : Swipe pour révéler les actions

### Fonctionnalités Mobiles

✅ **Disponible** :
- Consultation du dashboard
- Visualisation des rapports
- Gestion des utilisateurs
- Recherche

⚠️ **Limité** :
- Création d'évaluations (recommandé sur desktop)
- Import de fichiers Excel

## ❓ FAQ

### Comment réinitialiser le mot de passe d'un utilisateur ?

1. Accédez à la fiche de l'utilisateur
2. Cliquez sur **Réinitialiser le mot de passe**
3. Un email est envoyé à l'utilisateur

### Puis-je modifier une évaluation après publication ?

Oui, mais seulement si aucune réponse n'a été soumise. Sinon, vous devez créer une nouvelle évaluation.

### Comment voir qui a répondu à une évaluation ?

1. Accédez au rapport de l'évaluation
2. Section **Participants**
3. Liste des répondants (si non anonyme)

### Que faire si un étudiant ne peut pas accéder à une évaluation ?

1. Vérifiez que l'étudiant est dans la bonne classe
2. Vérifiez les dates de l'évaluation
3. Vérifiez que l'évaluation est publiée
4. Contactez le support si le problème persiste

### Comment exporter toutes les données ?

1. Accédez à **Paramètres**
2. Section **Export de données**
3. Sélectionnez la période
4. Cliquez sur **Exporter tout**

## 📞 Support

### Contacter le Support

- **Email** : support@equizz.com
- **Téléphone** : +33 1 23 45 67 89
- **Horaires** : Lundi-Vendredi, 9h-18h

### Signaler un Bug

1. Cliquez sur **Aide** dans le menu
2. Sélectionnez **Signaler un problème**
3. Décrivez le problème
4. Ajoutez des captures d'écran si possible
5. Envoyez

### Demander une Fonctionnalité

1. Accédez à **Aide**
2. Sélectionnez **Suggérer une amélioration**
3. Décrivez votre suggestion
4. Envoyez

## 🎓 Tutoriels Vidéo

- [Créer sa première évaluation](https://youtube.com/watch?v=xxx)
- [Gérer les utilisateurs](https://youtube.com/watch?v=xxx)
- [Analyser les rapports](https://youtube.com/watch?v=xxx)
- [Exporter les données](https://youtube.com/watch?v=xxx)

## 📚 Ressources Supplémentaires

- [Guide de Démarrage Rapide](./QUICK_START.md)
- [Bonnes Pratiques](./BEST_PRACTICES.md)
- [Glossaire](./GLOSSARY.md)

---

**Besoin d'aide ? Contactez-nous à support@equizz.com**
