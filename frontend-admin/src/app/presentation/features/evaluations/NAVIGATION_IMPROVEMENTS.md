 Améliorations de la Navigation des Évaluations

## Problèmes identifiés

1. **Redondance** : Les boutons "Voir" et "Rapport" menaient vers des fonctionnalités similaires
2. **Confusion** : La page "Voir" utilisait le même composant que l'édition
3. **Design incohérent** : Styles différents du reste de l'application

## Solutions implémentées

### 1. Navigation simplifiée et logique

**Avant :**
- Brouillons : Modifier | Publier
- En cours : Voir | Fermer  
- Clôturées : Voir | Rapport

**Après :**
- Brouillons : Modifier | Publier
- En cours : Soumissions | Fermer
- Clôturées : Résultats | Exporter

### 2. Routes restructurées

```typescript
// Nouvelles routes plus claires
/evaluations/:id/edit        // Édition uniquement
/evaluations/:id/submissions // Suivi en temps réel
/evaluations/:id/results     // Résultats et analyses
```

### 3. Logique d'interaction améliorée

- **Clic sur la carte** : Action contextuelle selon le statut
  - Brouillon → Édition
  - En cours → Soumissions
  - Clôturée → Résultats

- **Boutons spécialisés** :
  - "Soumissions" : Voir qui a répondu en temps réel
  - "Résultats" : Analyses et statistiques complètes
  - "Exporter" : Télécharger les données

### 4. Design cohérent

- Couleurs harmonisées avec le système de design
- Icônes plus représentatives des actions
- Boutons avec styles unifiés

## Avantages

1. **Moins de confusion** : Chaque bouton a un rôle clair
2. **Workflow optimisé** : Actions logiques selon le statut
3. **Maintenance simplifiée** : Moins de redondance de code
4. **UX améliorée** : Navigation plus intuitive

## Composants à créer

Pour compléter cette amélioration, il faudra créer :

1. `EvaluationSubmissionsComponent` - Suivi des soumissions en temps réel
2. `EvaluationResultsComponent` - Analyses et résultats détaillés

Ces composants auront un design cohérent avec le reste de l'application.