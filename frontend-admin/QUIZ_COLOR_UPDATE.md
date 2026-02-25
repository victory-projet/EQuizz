# Mise à Jour des Couleurs - Section Quiz

## Palette Inversée pour la Section Quiz

### Répartition 60-30-10 Inversée
- **60% Blanc Cassé (#F5F5F5, #FFFFFF, #E8E8E8)** - Couleur dominante pour les fonds
- **30% Bleu Marine (#1b1464, #2a1f8f)** - Couleur secondaire pour textes et éléments importants
- **10% Jaune Orangé (#fbb03b, #fcc56b, #e89f2a)** - Couleur d'accent pour highlights

## Remplacements Effectués

### ✅ evaluation-create.component.scss
- Tous les dégradés remplacés par des aplats
- Background principal : #F5F5F5
- Cartes et modales : #FFFFFF
- Boutons primaires : #1b1464
- États actifs/complétés : #fbb03b
- Bordures : #E8E8E8

### ✅ question-form.component.scss
- Modal overlay : rgba(27, 20, 100, 0.5)
- Headers : #F5F5F5
- Labels : #1b1464
- Boutons primaires : #1b1464 (aplat)
- Option letters : #1b1464 (aplat)
- Info boxes : rgba(251, 176, 59, 0.1)

### 🔄 À Mettre à Jour

#### question-import.component.scss
Remplacements nécessaires :
```scss
// Ancien
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
// Nouveau
background: #1b1464;

// Ancien
background: linear-gradient(135deg, #10b981 0%, #059669 100%);
// Nouveau
background: #fbb03b;
```

#### evaluation-preview.component.scss
Remplacements nécessaires :
```scss
// Ancien
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
// Nouveau
background: #F5F5F5; // Pour le fond principal

// Ancien
background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
// Nouveau (progress bar)
background: #1b1464;

// Ancien
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
// Nouveau (question number)
background: #1b1464;
```

#### evaluation-publish.component.scss
Remplacements nécessaires :
```scss
// Ancien
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
// Nouveau
background: #1b1464;
```

#### excel-upload.component.scss
Remplacements nécessaires :
```scss
// Ancien
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
// Nouveau
background: #1b1464;
```

#### excel-preview.component.scss
Remplacements nécessaires :
```scss
// Ancien
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
// Nouveau
background: #1b1464;
```

## Principes d'Application

### Fonds (60%)
- Conteneurs principaux : #F5F5F5
- Cartes/Modales : #FFFFFF
- Headers/Footers : #F5F5F5
- Zones désactivées : #E8E8E8

### Éléments Principaux (30%)
- Titres : #1b1464
- Labels : #1b1464
- Boutons primaires : #1b1464
- Texte important : #1b1464
- Bordures actives : #1b1464
- Icons principaux : #1b1464

### Accents (10%)
- États complétés : #fbb03b
- Highlights : #fbb03b
- Badges importants : #fbb03b
- Hover states spéciaux : #fbb03b
- Info boxes : rgba(251, 176, 59, 0.1)

## Règles de Conversion

1. **Tous les dégradés → Aplats**
   - `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` → `#1b1464`
   - `linear-gradient(135deg, #10b981 0%, #059669 100%)` → `#fbb03b`

2. **Overlays**
   - `rgba(0, 0, 0, 0.5)` → `rgba(27, 20, 100, 0.5)`

3. **Focus States**
   - Border : `#1b1464`
   - Shadow : `0 0 0 3px rgba(27, 20, 100, 0.1)`

4. **Hover States**
   - Background : `#F5F5F5` ou `#E8E8E8`
   - Color : `#1b1464` ou `#fbb03b`

5. **Bordures**
   - Normales : `#E8E8E8`
   - Actives : `#1b1464`
   - Accents : `#fbb03b`

## Composants Mis à Jour

✅ evaluation-create.component.scss
✅ question-form.component.scss
⏳ question-import.component.scss
⏳ evaluation-preview.component.scss
⏳ evaluation-publish.component.scss
⏳ excel-upload.component.scss
⏳ excel-preview.component.scss
