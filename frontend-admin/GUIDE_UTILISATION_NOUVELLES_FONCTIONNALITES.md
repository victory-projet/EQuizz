# 📖 Guide d'Utilisation - Nouvelles Fonctionnalités EQuizz

**Version:** 2.0  
**Date:** 17 novembre 2025

---

## 🎯 Vue d'Ensemble

Ce guide vous explique comment utiliser les 5 nouvelles fonctionnalités majeures ajoutées à la plateforme EQuizz.

---

## 1. 👥 Gestion des Utilisateurs

### Accès
```
Menu: Administration → Utilisateurs
URL: /users
```

### Créer un Utilisateur

1. Cliquez sur **"Nouvel Utilisateur"**
2. Remplissez le formulaire:
   - Email (obligatoire)
   - Prénom et Nom (obligatoires)
   - Rôle: Étudiant / Enseignant / Administrateur
   - Mot de passe (obligatoire pour création)
   - Classe (si étudiant)
   - Statut: Actif / Inactif
3. Cliquez sur **"Créer"**

### Modifier un Utilisateur

1. Dans la liste, cliquez sur l'icône ✏️
2. Modifiez les informations
3. Cliquez sur **"Enregistrer"**

### Assigner une Classe à un Étudiant

**Méthode 1:** Lors de la création
- Sélectionnez la classe dans le formulaire

**Méthode 2:** Après création
- Cliquez sur l'icône 🏫 dans la ligne de l'étudiant
- Sélectionnez la classe
- Cliquez sur **"Assigner"**

### Activer/Désactiver un Compte

- Cliquez sur l'icône 🔒 (actif) ou 🔓 (inactif)
- Le statut change immédiatement

### Filtres et Recherche

- **Recherche:** Tapez dans la barre de recherche (nom, email)
- **Filtres:** Cliquez sur les onglets (Tous, Administrateurs, Enseignants, Étudiants)

---

## 2. 📊 Visualisation des Réponses

### Accès
```
Menu: Quiz → Gestion des Quiz → [Sélectionner un quiz] → Voir les réponses
URL: /quiz/:id/responses
```

### Consulter les Réponses

1. Allez dans **"Gestion des Quiz"**
2. Sélectionnez un quiz **clôturé**
3. Cliquez sur **"Voir les réponses"**

### Statistiques Affichées

- **Total réponses:** Nombre d'étudiants ayant répondu
- **Score moyen:** Moyenne des scores en pourcentage
- **Taux de réussite:** Pourcentage d'étudiants ayant réussi (≥50%)
- **Durée moyenne:** Temps moyen de complétion

### Filtrer les Réponses

**Par recherche:**
- Tapez le nom ou l'email de l'étudiant

**Par classe:**
- Sélectionnez une classe dans le menu déroulant

**Par statut:**
- Tous / Réussi (≥50%) / Échoué (<50%)

### Voir les Détails d'une Réponse

1. Cliquez sur **"👁️ Voir détails"**
2. Une fenêtre modale s'ouvre avec:
   - Informations de l'étudiant
   - Score détaillé
   - Toutes les questions et réponses
   - Correction automatique pour les QCM
   - Réponses textuelles pour les questions ouvertes

### Exporter les Résultats

**Export PDF:**
- Cliquez sur **"📄 PDF"**
- Le rapport se télécharge automatiquement

**Export Excel:**
- Cliquez sur **"📊 Excel"**
- Le fichier .xlsx se télécharge

---

## 3. 📧 Notifications Automatiques

### Fonctionnement Automatique

Les notifications sont envoyées **automatiquement** lors de:

1. **Publication d'un quiz**
   - Tous les étudiants des classes concernées reçoivent une notification
   - Message: "Nouveau quiz disponible: [Titre]"

2. **Rappel avant date limite** (si configuré)
   - Notification envoyée X jours avant la date limite
   - Message: "Rappel: Quiz [Titre] à compléter"

3. **Clôture d'un quiz**
   - Notification envoyée à tous les participants
   - Message: "Quiz clôturé: [Titre]"

4. **Résultats disponibles**
   - Notification quand les résultats sont publiés
   - Message: "Résultats disponibles: [Titre]"

### Consulter l'Historique

```
Menu: Administration → Notifications
URL: /notifications
```

**Informations affichées:**
- Type de notification
- Nombre de destinataires
- Date et heure d'envoi
- Statut (Envoyée / Échouée / En attente)

### Statistiques

Le tableau de bord affiche:
- Total de notifications envoyées
- Notifications réussies
- Notifications échouées
- Notifications en attente

### Envoyer une Notification Personnalisée

```typescript
// Dans le code (pour les développeurs)
autoNotificationService.sendCustomNotification(
  ['email1@example.com', 'email2@example.com'],
  'Sujet du message',
  'Corps du message'
);
```

---

## 4. ☁️ Nuage de Mots-Clés

### Accès
```
Menu: Rapports → Analytics → Onglet "Analyse des sentiments"
URL: /analytics (onglet Sentiment)
```

### Visualisation

1. Allez dans **"Rapports et Analyses"**
2. Cliquez sur l'onglet **"😊 Analyse des sentiments"**
3. Scrollez vers le bas
4. Le nuage de mots s'affiche automatiquement

### Interprétation

- **Taille des mots:** Plus un mot est grand, plus il est fréquent
- **Couleurs:** Aléatoires pour meilleure lisibilité
- **Survol:** Passez la souris pour voir le nombre d'occurrences

### Top 10 des Mots

En dessous du nuage, vous trouverez:
- Classement des 10 mots les plus fréquents
- Nombre d'occurrences pour chaque mot
- Badges colorés pour le rang

### Utilisation

Le nuage de mots permet de:
- Identifier les concepts clés dans les réponses
- Repérer les thèmes récurrents
- Analyser le vocabulaire utilisé
- Détecter les incompréhensions (mots inattendus)

---

## 5. 😊 Analyse des Sentiments

### Accès
```
Menu: Rapports → Analytics → Onglet "Analyse des sentiments"
URL: /analytics (onglet Sentiment)
```

### Vue d'Ensemble

Le tableau de bord affiche:
- **Sentiment Positif:** Pourcentage de commentaires positifs
- **Sentiment Neutre:** Pourcentage de commentaires neutres
- **Sentiment Négatif:** Pourcentage de commentaires négatifs

### Distribution Visuelle

Une barre de progression colorée montre la répartition:
- 🟢 Vert: Positif
- 🟡 Jaune: Neutre
- 🔴 Rouge: Négatif

### Commentaires Récents

Liste des derniers commentaires avec:
- Nom de l'étudiant
- Titre du quiz
- Texte du commentaire
- Badge de sentiment (Positif / Neutre / Négatif)
- Score de confiance (%)
- Date du commentaire

### Interprétation

**Sentiment Positif (😊):**
- Étudiants satisfaits
- Quiz bien conçu
- Difficulté appropriée

**Sentiment Neutre (😐):**
- Commentaires factuels
- Pas d'émotion particulière
- Suggestions d'amélioration

**Sentiment Négatif (😞):**
- Étudiants en difficulté
- Quiz trop difficile
- Questions mal formulées
- **Action:** Revoir le quiz ou apporter du soutien

---

## 🔧 Configuration Avancée

### Pour les Développeurs

#### Intégrer une API d'Analyse de Sentiment

```typescript
// Dans sentiment-analysis.component.ts
import { SentimentAnalysisAPI } from './api/sentiment-api';

analyzeSentiment(text: string): Observable<SentimentResult> {
  return this.sentimentAPI.analyze(text);
}
```

#### Intégrer un Service d'Emailing

```typescript
// Dans auto-notification.service.ts
import { SendGridService } from '@sendgrid/mail';

private sendEmail(notification: EmailNotification): Observable<boolean> {
  return this.sendGridService.send({
    to: notification.to,
    subject: notification.subject,
    html: notification.body
  });
}
```

#### Personnaliser le Word Cloud

```typescript
// Dans word-cloud.component.ts
private colors = [
  '#7571f9', // Violet
  '#a29bfe', // Violet clair
  '#6c5ce7', // Violet foncé
  // Ajoutez vos couleurs
];

private minSize = 16; // Taille minimale
private maxSize = 64; // Taille maximale
```

---

## 📊 Cas d'Usage Pratiques

### Scénario 1: Nouveau Semestre

1. **Créer les utilisateurs**
   - Importer la liste des étudiants
   - Créer les comptes enseignants
   - Assigner les étudiants aux classes

2. **Créer les quiz**
   - Utiliser l'import Excel pour gagner du temps
   - Configurer les dates limites

3. **Publier et notifier**
   - Publier le quiz
   - Les notifications sont envoyées automatiquement

### Scénario 2: Analyse Post-Évaluation

1. **Consulter les réponses**
   - Aller dans "Voir les réponses"
   - Filtrer par classe

2. **Analyser les performances**
   - Vérifier le score moyen
   - Identifier les étudiants en difficulté

3. **Analyser les sentiments**
   - Consulter l'analyse de sentiment
   - Lire les commentaires négatifs
   - Identifier les problèmes

4. **Exporter les résultats**
   - Générer un rapport PDF
   - Partager avec l'équipe pédagogique

### Scénario 3: Suivi des Notifications

1. **Vérifier l'envoi**
   - Aller dans "Historique des notifications"
   - Vérifier que toutes sont envoyées

2. **Gérer les échecs**
   - Identifier les notifications échouées
   - Renvoyer manuellement si nécessaire

---

## ❓ FAQ

### Q: Les notifications sont-elles vraiment envoyées par email ?
**R:** Actuellement, les notifications sont simulées. Pour la production, il faut intégrer un service d'emailing (SendGrid, AWS SES, etc.).

### Q: Puis-je modifier une notification après envoi ?
**R:** Non, les notifications sont envoyées immédiatement. Vous pouvez consulter l'historique mais pas modifier.

### Q: Comment désactiver les notifications automatiques ?
**R:** Actuellement, elles sont automatiques. Pour les désactiver, commentez le code dans `publish-quiz.use-case.ts`.

### Q: Le nuage de mots analyse-t-il vraiment les réponses ?
**R:** Actuellement, il utilise des données simulées. Pour la production, il faut analyser les vraies réponses ouvertes.

### Q: Puis-je exporter les données en CSV ?
**R:** Pas encore, mais vous pouvez ouvrir le fichier Excel et l'enregistrer en CSV.

---

## 🆘 Support

Pour toute question ou problème:
1. Consultez ce guide
2. Vérifiez la console du navigateur (F12)
3. Contactez l'équipe de développement

---

**Guide créé par:** Kiro AI Assistant  
**Dernière mise à jour:** 17 novembre 2025
