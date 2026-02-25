# Guide de Migration des Couleurs

## Schéma de Couleurs 60-30-10

### Couleurs Principales (60% - Bleu Marine)
- `#1b1464` - Couleur primaire
- `#2a1f8f` - Couleur primaire claire
- `#120e4a` - Couleur primaire foncée

### Couleurs Secondaires (30% - Blanc/Blanc Cassé)
- `#FFFFFF` - Blanc
- `#F5F5F5` - Blanc cassé
- `#E8E8E8` - Gris clair

### Couleurs d'Accent (10% - Jaune Orangé)
- `#fbb03b` - Accent principal
- `#fcc56b` - Accent clair
- `#e89f2a` - Accent foncé

## Remplacements à Effectuer

### Gradients
Remplacer tous les gradients:
```scss
// Ancien
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// Nouveau
background: var(--color-primary, #1b1464);
```

### Couleurs de Texte
```scss
// Ancien
color: #667eea;

// Nouveau  
color: var(--color-primary, #1b1464);
```

### Hover States
```scss
// Ancien
border-color: #667eea;

// Nouveau
border-color: var(--color-primary, #1b1464);
```

### Badges et Accents
Pour les éléments qui nécessitent de se démarquer:
```scss
// Utiliser la couleur d'accent
background: var(--color-accent, #fbb03b);
color: var(--text-on-accent, #1b1464);
```

## Variables CSS Disponibles

Toutes les variables sont définies dans `src/styles.scss` et `src/styles/themes.scss`:

- `--color-primary`
- `--color-primary-light`
- `--color-primary-dark`
- `--color-secondary`
- `--color-secondary-light`
- `--color-accent`
- `--color-accent-light`
- `--color-accent-dark`
- `--color-danger`
- `--color-success`
- `--text-primary`
- `--text-secondary`
- `--sidebar-bg`
- `--sidebar-text`
- `--sidebar-hover`

## Composants Mis à Jour

✅ Sidebar
✅ Login Page
✅ Global Styles (buttons, forms, badges)
✅ Main Layout
✅ Dashboard (partiel)

## Composants à Mettre à Jour

- [ ] Evaluation Components
- [ ] Reports
- [ ] Profile
- [ ] Users/Teachers/Students
- [ ] Notifications
- [ ] Messages
- [ ] Excel Upload/Preview
- [ ] Question Form/Import
- [ ] Onboarding

## Instructions

Pour chaque composant SCSS:
1. Remplacer les gradients par des couleurs solides
2. Utiliser les variables CSS au lieu des valeurs en dur
3. Appliquer le ratio 60-30-10
4. Tester visuellement le composant
