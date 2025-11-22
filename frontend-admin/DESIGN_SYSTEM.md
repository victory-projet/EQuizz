# 🎨 EQUIZZ Design System

## Vue d'ensemble

Le système de design EQUIZZ est basé sur une palette de couleurs professionnelle centrée sur **#3A5689**, avec une approche moderne et accessible.

## 🎨 Palette de couleurs

### Couleur principale
- **Primary**: `#3A5689` - Bleu professionnel et élégant
- **Primary Dark**: `#2d4268` - Pour les dégradés et états hover
- **Primary Light**: `#5b80b7` - Pour les accents et highlights
- **Primary Lighter**: `#9fb5d5` - Pour les backgrounds subtils
- **Primary Lightest**: `#e8edf5` - Pour les surfaces légères

### Couleurs sémantiques
- **Success**: `#10b981` - Vert pour les actions positives
- **Warning**: `#f59e0b` - Orange pour les alertes
- **Danger**: `#ef4444` - Rouge pour les erreurs
- **Info**: `#3b82f6` - Bleu pour les informations

### Couleurs de texte
- **Text Primary**: `#1e293b` - Texte principal
- **Text Secondary**: `#64748b` - Texte secondaire
- **Text Tertiary**: `#94a3b8` - Texte tertiaire

### Backgrounds
- **BG Primary**: `#ffffff` - Fond blanc
- **BG Secondary**: `#f8fafc` - Fond gris très clair
- **BG Tertiary**: `#f1f5f9` - Fond gris clair

## 🔤 Typographie

### Police principale
- **Famille**: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- **Poids**: 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold), 800 (Extra-Bold)

### Hiérarchie
- **H1**: 2.25rem (36px) - Extra-Bold (800)
- **H2**: 1.875rem (30px) - Bold (700)
- **H3**: 1.5rem (24px) - Bold (700)
- **Body**: 1rem (16px) - Regular (400)
- **Small**: 0.875rem (14px) - Regular (400)

## 📐 Espacements

```scss
--spacing-xs: 0.25rem (4px)
--spacing-sm: 0.5rem (8px)
--spacing-md: 1rem (16px)
--spacing-lg: 1.5rem (24px)
--spacing-xl: 2rem (32px)
--spacing-2xl: 3rem (48px)
```

## 🔲 Border Radius

```scss
--radius-sm: 6px
--radius-md: 10px
--radius-lg: 14px
--radius-xl: 20px
--radius-full: 9999px
```

## 🌑 Ombres

```scss
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
```

## ⚡ Transitions

```scss
--transition-fast: 150ms ease
--transition-base: 250ms ease
--transition-slow: 350ms ease
```

## 🎯 Composants

### Boutons

#### Primary Button
```html
<button class="btn btn-primary">
  <mat-icon>add</mat-icon>
  Action
</button>
```

#### Secondary Button
```html
<button class="btn btn-secondary">
  Action
</button>
```

#### Outline Button
```html
<button class="btn btn-outline">
  Action
</button>
```

### Cards

```html
<div class="card">
  <!-- Contenu -->
</div>

<div class="card card-elevated">
  <!-- Contenu avec ombre plus prononcée -->
</div>
```

### Badges

```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-danger">Danger</span>
```

## 🎭 Animations

### Classes d'animation
- `.animate-fade-in` - Apparition en fondu
- `.animate-slide-in-up` - Glissement vers le haut
- `.animate-slide-in-down` - Glissement vers le bas
- `.animate-scale-in` - Zoom progressif

### Animations personnalisées
```scss
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## 🖼️ Assets

### Logo
- **Fichier**: `/assets/logo1.png`
- **Usage**: Header, Login, Branding
- **Format**: PNG avec transparence

### Image de fond
- **Fichier**: `/assets/iusj.webp`
- **Usage**: Background du login (opacity: 0.08)
- **Format**: WebP optimisé

## 🎨 Icônes

### Material Icons
Utilisation de Material Icons pour tous les icônes de l'interface :

```html
<mat-icon>dashboard</mat-icon>
<mat-icon>person</mat-icon>
<mat-icon>settings</mat-icon>
<mat-icon>notifications</mat-icon>
```

### Icônes courantes
- **Dashboard**: `dashboard`
- **Quiz**: `assignment`
- **Classes**: `groups`
- **Utilisateurs**: `person`
- **Paramètres**: `settings`
- **Notifications**: `notifications`
- **Déconnexion**: `logout`
- **Recherche**: `search`
- **Ajouter**: `add_circle`
- **Modifier**: `edit`
- **Supprimer**: `delete`
- **Voir**: `visibility`

## 📱 Responsive Design

### Breakpoints
```scss
// Mobile
@media (max-width: 768px) { }

// Tablet
@media (min-width: 769px) and (max-width: 1024px) { }

// Desktop
@media (min-width: 1025px) { }
```

### Comportements
- **Mobile**: Sidebar réduite, navigation simplifiée
- **Tablet**: Layout adaptatif, grilles flexibles
- **Desktop**: Expérience complète, toutes les fonctionnalités

## ♿ Accessibilité

### Focus
Tous les éléments interactifs ont un état focus visible :
```scss
*:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
```

### Contraste
- Ratio minimum de 4.5:1 pour le texte normal
- Ratio minimum de 3:1 pour le texte large

### Navigation au clavier
- Tous les éléments interactifs sont accessibles au clavier
- Ordre de tabulation logique
- Skip links pour la navigation rapide

## 🎯 Bonnes pratiques

### 1. Utiliser les variables CSS
```scss
// ✅ Bon
background: var(--primary-color);

// ❌ Éviter
background: #3A5689;
```

### 2. Transitions cohérentes
```scss
// ✅ Bon
transition: all var(--transition-base);

// ❌ Éviter
transition: all 0.3s;
```

### 3. Espacements standardisés
```scss
// ✅ Bon
padding: var(--spacing-md);

// ❌ Éviter
padding: 15px;
```

### 4. Ombres appropriées
```scss
// ✅ Bon
box-shadow: var(--shadow-md);

// ❌ Éviter
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
```

## 🚀 Exemples d'utilisation

### Page de connexion
- Dégradé de fond avec la couleur principale
- Logo centré avec effet de survol
- Champs de formulaire avec icônes Material
- Bouton avec effet de shimmer
- Carte d'identifiants de test stylisée

### Dashboard
- Header avec logo et menu utilisateur
- Sidebar avec navigation Material Icons
- Cartes d'actions rapides avec hover effects
- Statistiques avec badges colorés
- Graphiques et tableaux modernes

### Composants partagés
- Header fixe avec backdrop blur
- Sidebar avec indicateur d'élément actif
- Modales avec animations fluides
- Toasts pour les notifications
- Loading spinners personnalisés

## 📚 Ressources

- [Material Icons](https://fonts.google.com/icons)
- [Roboto Font](https://fonts.google.com/specimen/Roboto)
- [Angular Material](https://material.angular.io/)

---

**Version**: 1.0.0  
**Dernière mise à jour**: Novembre 2025  
**Maintenu par**: Équipe EQUIZZ
