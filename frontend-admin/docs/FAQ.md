ng serve --o
# FAQ - Questions Fréquemment Posées

Réponses aux questions les plus fréquentes sur l'utilisation d'EQuizz Admin.

## 📋 Table des Matières

- [Général](#-général)
- [Connexion & Compte](#-connexion--compte)
- [Évaluations](#-évaluations)
- [Utilisateurs](#-utilisateurs)
- [Rapports](#-rapports)
- [Technique](#-technique)

## 🌐 Général

### Qu'est-ce qu'EQuizz Admin ?

EQuizz Admin est une plateforme web permettant aux administrateurs de créer, gérer et analyser des évaluations des enseignements. Elle facilite la collecte de feedback des étudiants sur les cours et les enseignants.

### Quels navigateurs sont supportés ?

- ✅ Google Chrome (recommandé) - version 90+
- ✅ Microsoft Edge - version 90+
- ✅ Mozilla Firefox - version 88+
- ✅ Safari - version 14+

### L'application est-elle disponible sur mobile ?

Oui ! L'application est entièrement responsive et fonctionne sur :
- 📱 Smartphones (iOS et Android)
- 📱 Tablettes
- 💻 Ordinateurs de bureau

Certaines fonctionnalités complexes (création d'évaluations) sont optimisées pour desktop.

### Mes données sont-elles sécurisées ?

Oui, absolument :
- 🔒 Connexion HTTPS sécurisée
- 🔒 Authentification par token JWT
- 🔒 Données chiffrées en base de données
- 🔒 Sauvegardes quotidiennes
- 🔒 Conformité RGPD

## 🔐 Connexion & Compte

### J'ai oublié mon mot de passe, que faire ?

1. Cliquez sur **Mot de passe oublié ?** sur la page de connexion
2. Entrez votre adresse email
3. Consultez votre boîte mail (vérifiez les spams)
4. Cliquez sur le lien de réinitialisation
5. Créez un nouveau mot de passe

Le lien est valide pendant 24 heures.

### Comment changer mon mot de passe ?

1. Connectez-vous à votre compte
2. Cliquez sur votre avatar en haut à droite
3. Sélectionnez **Profil**
4. Section **Sécurité**
5. Cliquez sur **Changer le mot de passe**
6. Entrez votre mot de passe actuel et le nouveau
7. Cliquez sur **Enregistrer**

### Quelles sont les exigences pour le mot de passe ?

Votre mot de passe doit contenir :
- ✅ Au moins 8 caractères
- ✅ Au moins une lettre majuscule
- ✅ Au moins une lettre minuscule
- ✅ Au moins un chiffre
- ✅ Au moins un caractère spécial (@, #, $, etc.)

### Je ne peux pas me connecter, pourquoi ?

Vérifiez :
1. **Email correct** : Pas de faute de frappe
2. **Mot de passe correct** : Attention à la casse
3. **Compte actif** : Contactez l'administrateur
4. **Navigateur à jour** : Mettez à jour votre navigateur
5. **Cookies activés** : Vérifiez les paramètres

Si le problème persiste, contactez support@equizz.com

### Puis-je avoir plusieurs comptes ?

Non, chaque utilisateur ne peut avoir qu'un seul compte par adresse email. Si vous avez besoin de plusieurs rôles, contactez l'administrateur système.

## 📝 Évaluations

### Comment créer une évaluation ?

1. Cliquez sur **Évaluations** dans le menu
2. Cliquez sur **+ Nouvelle Évaluation**
3. Remplissez les informations (titre, cours, dates)
4. Ajoutez vos questions
5. Prévisualisez
6. Publiez ou enregistrez comme brouillon

Voir le [Guide Utilisateur](./USER_GUIDE_ADMIN.md#créer-une-évaluation) pour plus de détails.

### Puis-je modifier une évaluation après publication ?

**Avant les premières réponses** : Oui, vous pouvez modifier librement.

**Après les premières réponses** : Non, pour garantir l'intégrité des données. Vous devez :
- Clôturer l'évaluation actuelle
- Créer une nouvelle évaluation avec les modifications

### Combien de questions puis-je ajouter ?

Il n'y a pas de limite technique, mais nous recommandons :
- ✅ **10-15 questions** pour un bon taux de complétion
- ⚠️ **15-25 questions** acceptable
- ❌ **Plus de 25 questions** risque de fatigue des répondants

### Quels types de questions sont disponibles ?

1. **Choix Multiple** :
   - Une seule réponse
   - Plusieurs réponses possibles

2. **Échelle** :
   - Échelle de Likert (1-5, 1-7, etc.)
   - Échelle personnalisée

3. **Texte Libre** :
   - Réponse courte
   - Réponse longue

4. **Oui/Non** :
   - Question binaire

### Comment rendre une évaluation anonyme ?

1. Lors de la création/modification
2. Cochez **Évaluation anonyme**
3. Les réponses ne seront pas liées aux étudiants
4. Seules les statistiques agrégées seront disponibles

⚠️ **Attention** : Cette option ne peut pas être modifiée après publication.

### Puis-je dupliquer une évaluation ?

Oui :
1. Accédez à l'évaluation à dupliquer
2. Cliquez sur **Actions** → **Dupliquer**
3. Modifiez les informations (titre, dates, etc.)
4. Enregistrez

### Comment programmer une évaluation ?

1. Lors de la création, définissez :
   - **Date de début** : Quand l'évaluation devient accessible
   - **Date de fin** : Quand elle se clôture automatiquement

2. Publiez l'évaluation

Elle sera automatiquement accessible et clôturée aux dates définies.

### Les étudiants peuvent-ils modifier leurs réponses ?

**Pendant la période d'évaluation** : Oui, tant qu'ils n'ont pas cliqué sur "Soumettre définitivement".

**Après soumission** : Non, les réponses sont définitives.

## 👥 Utilisateurs

### Comment ajouter un étudiant ?

**Méthode 1 - Individuelle** :
1. **Étudiants** → **+ Nouvel Étudiant**
2. Remplissez le formulaire
3. Enregistrez

**Méthode 2 - Import Excel** :
1. **Étudiants** → **Importer**
2. Téléchargez le modèle
3. Remplissez le fichier
4. Importez

### Comment importer plusieurs utilisateurs ?

1. Téléchargez le modèle Excel
2. Remplissez les colonnes :
   - Nom
   - Prénom
   - Email
   - Matricule (pour étudiants)
   - Classe (pour étudiants)
3. Importez le fichier
4. Vérifiez les données
5. Confirmez

Format accepté : `.xlsx`, `.xls`, `.csv`

### Que faire si un email est déjà utilisé ?

L'email doit être unique. Si un email existe déjà :
1. Vérifiez qu'il ne s'agit pas d'un doublon
2. Utilisez un email alternatif
3. Contactez l'administrateur pour fusionner les comptes

### Comment désactiver un utilisateur ?

1. Accédez à la fiche de l'utilisateur
2. Cliquez sur **Désactiver**
3. Confirmez

L'utilisateur ne pourra plus se connecter mais ses données sont conservées.

### Comment réactiver un utilisateur ?

1. Filtrez par **Utilisateurs inactifs**
2. Sélectionnez l'utilisateur
3. Cliquez sur **Réactiver**

### Puis-je supprimer un utilisateur ?

Oui, mais :
- ⚠️ **Action irréversible**
- ⚠️ **Toutes les données associées seront supprimées**
- ✅ **Recommandation** : Désactiver plutôt que supprimer

### Comment assigner un cours à un enseignant ?

1. Accédez à **Enseignants**
2. Sélectionnez l'enseignant
3. Section **Cours Assignés**
4. Cliquez sur **+ Assigner un cours**
5. Sélectionnez le cours et les classes
6. Enregistrez

## 📊 Rapports

### Quand les rapports sont-ils disponibles ?

Les rapports sont disponibles :
- ✅ **En temps réel** pendant l'évaluation
- ✅ **Immédiatement** après clôture

### Comment exporter un rapport ?

1. Accédez au rapport
2. Cliquez sur **Exporter**
3. Choisissez le format :
   - **Excel** : Données brutes + graphiques
   - **PDF** : Rapport formaté pour impression

### Que contient un rapport ?

**Statistiques Globales** :
- Taux de participation
- Nombre de répondants
- Temps moyen de complétion

**Par Question** :
- Distribution des réponses
- Moyenne (pour échelles)
- Graphiques

**Réponses Textuelles** :
- Toutes les réponses ouvertes
- Nuage de mots-clés

**Analyse** :
- Tendances
- Comparaisons
- Recommandations

### Puis-je comparer plusieurs évaluations ?

Oui :
1. Accédez à **Rapports**
2. Cliquez sur **Comparer**
3. Sélectionnez les évaluations à comparer
4. Choisissez les critères de comparaison
5. Générez le rapport comparatif

### Comment interpréter les graphiques ?

**Graphique en Barres** :
- Hauteur = Nombre de réponses
- Compare les différentes options

**Graphique Circulaire** :
- Pourcentage de chaque réponse
- Vue d'ensemble de la distribution

**Graphique Linéaire** :
- Évolution dans le temps
- Tendances

**Nuage de Mots** :
- Taille = Fréquence du mot
- Mots-clés principaux

### Les rapports sont-ils anonymes ?

Cela dépend du paramètre de l'évaluation :

**Évaluation Anonyme** :
- ✅ Statistiques agrégées uniquement
- ❌ Pas de données individuelles

**Évaluation Non Anonyme** :
- ✅ Statistiques agrégées
- ✅ Données individuelles (avec nom)

## 🔧 Technique

### L'application est lente, que faire ?

1. **Vérifiez votre connexion internet**
2. **Videz le cache du navigateur** :
   - Chrome : Ctrl+Shift+Delete
   - Firefox : Ctrl+Shift+Delete
3. **Fermez les onglets inutiles**
4. **Redémarrez le navigateur**
5. **Essayez un autre navigateur**

Si le problème persiste, contactez le support.

### J'ai une erreur "Session expirée"

Votre session a expiré après 24h d'inactivité. Reconnectez-vous.

### Les graphiques ne s'affichent pas

1. Vérifiez que JavaScript est activé
2. Désactivez les bloqueurs de publicité
3. Videz le cache
4. Essayez un autre navigateur

### Comment signaler un bug ?

1. Cliquez sur **Aide** → **Signaler un problème**
2. Décrivez le problème :
   - Que faisiez-vous ?
   - Qu'attendiez-vous ?
   - Que s'est-il passé ?
3. Ajoutez des captures d'écran
4. Envoyez

Notre équipe vous répondra sous 48h.

### Puis-je utiliser l'application hors ligne ?

Non, l'application nécessite une connexion internet. Cependant :
- ✅ Les rapports exportés peuvent être consultés hors ligne
- ✅ Mode PWA en développement pour version future

### Comment mettre à jour l'application ?

L'application se met à jour automatiquement. Vous serez notifié des nouvelles fonctionnalités.

Pour forcer une mise à jour :
1. Videz le cache (Ctrl+Shift+Delete)
2. Rechargez la page (Ctrl+F5)

## 📞 Support

### Comment contacter le support ?

- **Email** : support@equizz.com
- **Téléphone** : +33 1 23 45 67 89
- **Chat** : Disponible dans l'application (icône en bas à droite)
- **Horaires** : Lundi-Vendredi, 9h-18h

### Quel est le délai de réponse ?

- **Urgent** : 2-4 heures
- **Normal** : 24-48 heures
- **Bas** : 3-5 jours ouvrés

### Proposer une amélioration

Nous adorons vos suggestions !

1. **Aide** → **Suggérer une amélioration**
2. Décrivez votre idée
3. Expliquez le bénéfice
4. Envoyez

Nous étudions toutes les suggestions et vous tenons informé.

## 📚 Ressources

- [Guide Utilisateur Complet](./USER_GUIDE_ADMIN.md)
- [Guide d'Installation](./INSTALLATION.md)
- [Tutoriels Vidéo](https://youtube.com/equizz)
- [Blog](https://blog.equizz.com)

---

**Votre question n'est pas listée ? Contactez-nous à support@equizz.com**
