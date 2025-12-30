# 📋 Guide de Cohérence - Exports et Gestion des Brouillons

## 🎯 Problèmes Identifiés et Solutions

### 1. **Incohérence des Boutons d'Export PDF**

#### **Problème**
- Boutons d'export PDF différents selon les pages
- Implémentations multiples pour la même fonctionnalité
- Interface utilisateur incohérente

#### **Solution : Composant d'Export Uniforme**
```typescript
// Nouveau composant : export-button.component.ts
<app-export-button 
  [config]="{
    formats: ['excel', 'pdf'],
    showFormatSelector: true,
    buttonText: 'Exporter'
  }"
  [loading]="isExporting"
  (export)="onExport($event)">
</app-export-button>
```

#### **Utilisation Standardisée**
```html
<!-- Pour un seul format -->
<app-export-button 
  [config]="{ formats: ['pdf'], buttonText: 'Exporter PDF' }"
  (export)="exportPDF()">
</app-export-button>

<!-- Pour plusieurs formats -->
<app-export-button 
  [config]="{ 
    formats: ['excel', 'pdf', 'json'], 
    showFormatSelector: true 
  }"
  (export)="onExport($event)">
</app-export-button>
```

### 2. **Gestion des Brouillons Améliorée**

#### **Problème**
- Évaluations perdues si l'utilisateur ferme la page
- Pas de sauvegarde automatique pendant la création
- Brouillons créés seulement après validation complète

#### **Solution : Sauvegarde Automatique Continue**

##### **Sauvegarde Déclenchée par :**
1. **Saisie de titre** (dès les premiers caractères)
2. **Timer automatique** (toutes les 30 secondes)
3. **Changement de champ** (après 3 secondes d'inactivité)
4. **Navigation** (avant de quitter la page)

##### **Workflow de Sauvegarde**
```
Utilisateur commence à taper
         ↓
   Titre ≥ 1 caractère ?
         ↓ OUI
   Créer brouillon automatiquement
         ↓
   Continuer la saisie
         ↓
   Sauvegarde auto toutes les 30s
         ↓
   Validation et passage à l'étape suivante
         ↓
   Brouillon devient évaluation complète
```

## 🔧 Implémentation Technique

### **Composant d'Export Uniforme**

#### **Fonctionnalités**
- ✅ Support multi-formats (Excel, PDF, JSON)
- ✅ Bouton simple ou menu déroulant
- ✅ Indicateur de chargement
- ✅ Icônes cohérentes
- ✅ Styles Material Design

#### **Configuration Flexible**
```typescript
interface ExportConfig {
  formats: ExportFormat[];           // Formats disponibles
  defaultFormat?: ExportFormat;      // Format par défaut
  showFormatSelector?: boolean;      // Afficher le sélecteur
  buttonText?: string;               // Texte du bouton
  buttonColor?: 'primary' | 'accent' | 'warn';
}
```

### **Sauvegarde Automatique des Brouillons**

#### **Fonctionnalités**
- ✅ Sauvegarde dès la première saisie
- ✅ Timer automatique (30 secondes)
- ✅ Sauvegarde sur changement (3 secondes de délai)
- ✅ Indicateur visuel de sauvegarde
- ✅ Gestion des erreurs de sauvegarde
- ✅ Nettoyage des timers

#### **États de Sauvegarde**
```typescript
// Indicateurs visuels
lastSaved = signal<Date | null>(null);     // Dernière sauvegarde
autoSaveEnabled = signal(true);            // Sauvegarde activée
draftEvaluationId = signal<string | null>(null); // ID du brouillon
```

## 🎨 Interface Utilisateur Cohérente

### **Boutons d'Export Standardisés**

#### **Contexte : Page de Rapport**
```html
<app-export-button 
  [config]="{ formats: ['pdf'], buttonColor: 'primary' }"
  (export)="exportReport($event)">
</app-export-button>
```

#### **Contexte : Évaluation Complète**
```html
<app-export-button 
  [config]="{ 
    formats: ['excel', 'pdf'], 
    showFormatSelector: true,
    buttonText: 'Exporter Rapport'
  }"
  (export)="exportEvaluation($event)">
</app-export-button>
```

#### **Contexte : Données Brutes**
```html
<app-export-button 
  [config]="{ 
    formats: ['excel', 'json'], 
    buttonText: 'Exporter Données'
  }"
  (export)="exportData($event)">
</app-export-button>
```

### **Indicateurs de Brouillon**

#### **Statut Visuel**
```html
<!-- Indicateur de sauvegarde -->
@if (lastSaved()) {
  <div class="auto-save-indicator">
    <mat-icon>cloud_done</mat-icon>
    Sauvegardé à {{ lastSaved()!.toLocaleTimeString() }}
  </div>
}

<!-- Badge de statut -->
<span class="status-badge draft">
  <mat-icon>edit</mat-icon>
  Brouillon
</span>
```

## 📊 Workflow Utilisateur Optimisé

### **Création d'Évaluation**
```
1. Utilisateur ouvre "Créer Évaluation"
2. Commence à taper le titre
3. 🔄 Brouillon créé automatiquement
4. Continue la saisie
5. 🔄 Sauvegarde auto toutes les 30s
6. Valide et passe à l'étape suivante
7. 🔄 Brouillon mis à jour
8. Ajoute des questions
9. 🔄 Sauvegarde continue
10. Publie l'évaluation
11. ✅ Statut passe de BROUILLON à PUBLIEE
```

### **Gestion des Interruptions**
```
Utilisateur ferme la page
         ↓
   Brouillon existe ?
         ↓ OUI
   Proposer de reprendre
         ↓
   "Reprendre le brouillon" ou "Nouveau"
         ↓
   Charger les données sauvegardées
```

## 🔍 Avantages de la Cohérence

### **Pour les Utilisateurs**
- ✅ **Interface prévisible** : Même bouton d'export partout
- ✅ **Pas de perte de données** : Sauvegarde automatique
- ✅ **Feedback visuel** : Indicateurs de statut clairs
- ✅ **Workflow fluide** : Pas d'interruption forcée

### **Pour les Développeurs**
- ✅ **Code réutilisable** : Composant d'export uniforme
- ✅ **Maintenance simplifiée** : Une seule implémentation
- ✅ **Tests centralisés** : Logique d'export testée une fois
- ✅ **Évolutivité** : Facile d'ajouter de nouveaux formats

## 🎯 Standards d'Implémentation

### **Règles pour les Exports**
1. **Utiliser le composant uniforme** `<app-export-button>`
2. **Formats cohérents** : excel, pdf, json
3. **Icônes standardisées** : table_chart, picture_as_pdf, code
4. **Feedback utilisateur** : Indicateur de chargement
5. **Gestion d'erreurs** : Messages explicites

### **Règles pour les Brouillons**
1. **Sauvegarde dès la première saisie**
2. **Timer automatique** toutes les 30 secondes
3. **Indicateur visuel** de dernière sauvegarde
4. **Statut BROUILLON** jusqu'à publication
5. **Récupération** en cas d'interruption

## 🔮 Évolutions Futures

### **Exports Avancés**
- Templates d'export personnalisables
- Planification d'exports automatiques
- Historique des exports
- Partage direct par email

### **Brouillons Collaboratifs**
- Sauvegarde cloud en temps réel
- Historique des versions
- Collaboration multi-utilisateurs
- Commentaires et suggestions

---

**Résultat** : Une application cohérente où les exports sont uniformes et les brouillons sont sauvegardés automatiquement, offrant une expérience utilisateur fluide et sécurisée.