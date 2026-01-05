# Guide de Dépannage - Création de Quiz

## Erreur 400 (Bad Request) lors de la création

### Symptômes
```
POST https://equizz-backend.onrender.com/api/evaluations 400 (Bad Request)
⚠️ Erreur lors de la sauvegarde automatique: Référence invalide à une ressource
```

### Causes Possibles et Solutions

#### 1. **Cours non sélectionné ou invalide**
**Problème :** `coursId` est vide, `0`, ou pointe vers un cours inexistant.

**Solution :**
```typescript
// Vérifier que coursId n'est pas vide
if (!this.formData.coursId || this.formData.coursId === '' || this.formData.coursId === 0) {
  this.errorMessage.set('Le cours est requis');
  return false;
}
```

**Vérification :**
- Le cours existe-t-il dans la base de données ?
- L'ID du cours est-il correct (UUID vs Number) ?

#### 2. **Classes non sélectionnées**
**Problème :** `classeIds` est vide ou non défini.

**Solution :**
```typescript
// Vérifier que au moins une classe est sélectionnée
if (!this.formData.classeIds || this.formData.classeIds.length === 0) {
  this.errorMessage.set('Au moins une classe est requise');
  return false;
}
```

#### 3. **Utilisateur non administrateur**
**Problème :** L'utilisateur connecté n'a pas les droits d'administrateur.

**Vérification backend :**
```javascript
// Dans evaluation.service.js
if (!utilisateur.Administrateur) {
  throw AppError.forbidden('Seuls les administrateurs peuvent créer des évaluations.', 'ADMIN_REQUIRED');
}
```

**Solution :** Vérifier les permissions utilisateur dans la base de données.

#### 4. **Données de dates invalides**
**Problème :** Dates mal formatées ou logiquement incorrectes.

**Solution :**
```typescript
// Validation des dates
if (new Date(this.formData.dateDebut) >= new Date(this.formData.dateFin)) {
  this.errorMessage.set('La date de fin doit être après la date de début');
  return false;
}
```

### Corrections Apportées

#### 1. **Initialisation du formulaire**
```typescript
// AVANT (problématique)
formData = {
  coursId: 0, // Problème : 0 n'est pas un UUID valide
  classeIds: []
};

// APRÈS (corrigé)
formData = {
  coursId: '' as string | number, // Accepte UUID ou number
  classeIds: [] as (number | string)[]
};
```

#### 2. **Validation améliorée**
```typescript
// Validation plus stricte
if (!this.formData.coursId || this.formData.coursId === '' || this.formData.coursId === 0) {
  this.errorMessage.set('Le cours est requis');
  return false;
}
```

#### 3. **Sauvegarde automatique conditionnelle**
```typescript
// Ne pas sauvegarder automatiquement si données incomplètes
if (!this.formData.coursId || this.formData.coursId === '' || this.formData.coursId === 0) {
  console.log('⚠️ Sauvegarde automatique ignorée - cours manquant');
  return;
}
```

#### 4. **Gestion d'erreurs améliorée**
```typescript
// Messages d'erreur spécifiques
if (errorMsg.includes('Cours non trouvé')) {
  errorMsg = 'Le cours sélectionné n\'existe pas. Veuillez en choisir un autre.';
} else if (errorMsg.includes('CLASSES_REQUIRED')) {
  errorMsg = 'Au moins une classe doit être sélectionnée.';
}
```

### Tests de Validation

#### Test 1: Vérification des données de base
```bash
node test-evaluation-creation.js --basic
```

#### Test 2: Création complète (avec token admin)
```bash
# Configurer TEST_CONFIG.adminToken puis :
node test-evaluation-creation.js
```

### Checklist de Dépannage

- [ ] **Cours sélectionné** : Un cours est-il sélectionné dans le dropdown ?
- [ ] **Classes sélectionnées** : Au moins une classe est-elle cochée ?
- [ ] **Dates valides** : Date de fin > Date de début ?
- [ ] **Titre renseigné** : Le titre n'est-il pas vide ?
- [ ] **Permissions** : L'utilisateur est-il administrateur ?
- [ ] **Connexion réseau** : Le backend est-il accessible ?

### Logs de Debug

#### Frontend (Console)
```javascript
console.log('📝 Création d\'évaluation - Données du formulaire:', this.formData);
console.log('📤 Envoi au backend:', evaluationData);
```

#### Backend (Serveur)
```javascript
console.log('📥 Données reçues:', data);
console.log('👤 Utilisateur:', adminId);
console.log('📚 Cours trouvé:', cours);
```

### Solutions Rapides

#### Problème : Sauvegarde automatique en boucle
**Solution :** Désactiver temporairement l'auto-save
```typescript
this.autoSaveEnabled.set(false);
```

#### Problème : Cours/Classes non chargés
**Solution :** Vérifier les endpoints
```typescript
// Vérifier que les endpoints répondent
this.academicUseCase.getCours().subscribe(cours => console.log('Cours:', cours));
this.academicUseCase.getClasses().subscribe(classes => console.log('Classes:', classes));
```

#### Problème : Token expiré
**Solution :** Renouveler l'authentification
```typescript
// Vérifier le token dans localStorage/sessionStorage
console.log('Token:', localStorage.getItem('authToken'));
```

### Prévention

1. **Validation côté client** avant envoi
2. **Messages d'erreur explicites** pour l'utilisateur
3. **Logs détaillés** pour le debug
4. **Tests automatisés** pour les cas d'usage courants
5. **Fallbacks** pour les données manquantes

### Contact Support

Si le problème persiste après avoir suivi ce guide :
1. Copier les logs de la console (F12)
2. Noter les étapes exactes pour reproduire
3. Vérifier la version du backend/frontend
4. Tester avec un autre compte administrateur