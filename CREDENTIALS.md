# Identifiants de Connexion - EQuizz

Ce document contient tous les identifiants de connexion pour la plateforme EQuizz.

## 🔐 Superadministrateur

Le superadministrateur a accès complet à toutes les fonctionnalités de la plateforme.

- **Email**: `super.admin@universitesaintjean.org`
- **Mot de passe**: `admin123`
- **Rôle**: SUPER-ADMIN
- **Accès**: Frontend Admin (http://localhost:4200)

### Permissions
- ✅ Gestion complète des utilisateurs (superadmins, admins, enseignants, étudiants)
- ✅ Gestion des écoles et classes
- ✅ Gestion des cours et évaluations
- ✅ Accès aux rapports et statistiques
- ✅ Configuration système

## 📧 Format des Emails

### Superadministrateurs
```
prenom.nom@universitesaintjean.org
```

### Autres Utilisateurs (Enseignants, Étudiants)
```
prenom.nom@saintjeaningenieur.org
```

### Règles de Validation
- ✅ Uniquement des lettres non accentuées (a-z, A-Z)
- ❌ Pas de chiffres
- ❌ Pas de caractères spéciaux (sauf le point entre prénom et nom)
- ✅ Domaine obligatoire: `@universitesaintjean.org` (superadmins) ou `@saintjeaningenieur.org` (autres)

### Exemples Valides
- ✅ `super.admin@universitesaintjean.org` (superadmin)
- ✅ `jean.dupont@saintjeaningenieur.org` (enseignant/étudiant)
- ✅ `marie.martin@saintjeaningenieur.org` (enseignant/étudiant)

### Exemples Invalides
- ❌ `jean.dupont123@saintjeaningenieur.org` (contient des chiffres)
- ❌ `jean-dupont@saintjeaningenieur.org` (tiret non autorisé)
- ❌ `jean.dupont@gmail.com` (mauvais domaine)
- ❌ `jeandupont@saintjeaningenieur.org` (pas de point entre prénom et nom)

## 🔧 Création de Nouveaux Comptes

### Via Script (Backend)

Pour créer ou réinitialiser le compte superadmin:

```bash
cd backend
node create-admin.js
```

### Via Interface Admin

1. Se connecter avec le compte superadmin
2. Aller dans "Gestion des Utilisateurs"
3. Cliquer sur "Nouvel Utilisateur"
4. Remplir le formulaire avec un email valide
5. Sélectionner le rôle approprié

## 🔄 Réinitialisation du Mot de Passe

### Pour le Superadmin

Si vous avez oublié le mot de passe du superadmin:

```bash
cd backend
node create-admin.js
```

Ce script réinitialisera le mot de passe à `admin123` et l'email à `super.admin@universitesaintjean.org`.

### Pour les Autres Utilisateurs

1. Se connecter avec le compte superadmin
2. Aller dans "Gestion des Utilisateurs"
3. Trouver l'utilisateur
4. Cliquer sur "Réinitialiser le mot de passe"

## 🔒 Sécurité

### Recommandations

- ⚠️ **Changez le mot de passe par défaut** en production
- ⚠️ Utilisez des mots de passe forts (min. 8 caractères, majuscules, minuscules, chiffres, caractères spéciaux)
- ⚠️ Ne partagez jamais vos identifiants
- ⚠️ Déconnectez-vous après chaque session

### Politique de Mot de Passe

- Longueur minimale: 8 caractères
- Doit contenir au moins:
  - 1 lettre majuscule
  - 1 lettre minuscule
  - 1 chiffre
  - 1 caractère spécial (recommandé)

## 📝 Notes

- Les identifiants sont stockés de manière sécurisée dans la base de données
- Les mots de passe sont hashés avec bcrypt (10 rounds)
- Les tokens JWT expirent après 8 heures
- Les refresh tokens expirent après 7 jours

## 🆘 Support

En cas de problème avec les identifiants:

1. Vérifiez que le backend est démarré
2. Vérifiez que la base de données est accessible
3. Essayez de réinitialiser le mot de passe avec le script
4. Consultez les logs du backend pour plus d'informations

Pour toute question, contactez l'équipe de développement.
