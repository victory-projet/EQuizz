# Guide des Styles des Modals

## 🎨 Palette de couleurs

### Couleurs principales
```scss
$primary: #3a5689;      // Bleu principal
$success: #10b981;      // Vert succès
$error: #ef4444;        // Rouge erreur
$warning: #f59e0b;      // Orange avertissement
$info: #3b82f6;         // Bleu information
```

### Couleurs neutres
```scss
$gray-50: #f9fafb;
$gray-100: #f3f4f6;
$gray-200: #e5e7eb;
$gray-300: #d1d5db;
$gray-400: #9ca3af;
$gray-500: #6b7280;
$gray-600: #4b5563;
$gray-700: #374151;
$gray-800: #1f2937;
$gray-900: #111827;
```

---

## 📐 Dimensions et espacements

### Tailles des modals
```scss
.modal-small {
  max-width: 400px;
}

.modal-medium {
  max-width: 600px;
}

.modal-large {
  max-width: 900px;
}
```

### Espacements
```scss
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 12px;
$spacing-lg: 16px;
$spacing-xl: 24px;
$spacing-2xl: 32px;
```

---

## 🎭 Animations

### Entrée du modal
```scss
@keyframes slideUp {
  from {
    transform: translateY(30px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

// Utilisation
animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Fade du backdrop
```scss
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

// Utilisation
animation: fadeIn 0.2s ease;
```

### Sortie du modal
```scss
@keyframes slideOut {
  from {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateY(30px) scale(0.95);
    opacity: 0;
  }
}
```

---

## 🖼️ Structure des modals

### Modal de base
```html
<div class="modal-backdrop">
  <div class="modal-container">
    <div class="modal-header">
      <h2>Titre</h2>
      <button class="close-btn">×</button>
    </div>
    <div class="modal-body">
      Contenu
    </div>
    <div class="modal-footer">
      <button>Action</button>
    </div>
  </div>
</div>
```

### Styles de base
```scss
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(to bottom, #ffffff, #fafbfc);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #fafbfc;
}
```

---

## 🎯 Types de modals

### Modal d'erreur
```scss
.error-modal {
  .modal-header {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border-bottom: 2px solid #ef4444;
  }
  
  .icon-wrapper {
    background: #ef4444;
    color: white;
  }
}
```

### Modal d'avertissement
```scss
.warning-modal {
  .modal-header {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border-bottom: 2px solid #f59e0b;
  }
  
  .icon-wrapper {
    background: #f59e0b;
    color: white;
  }
}
```

### Modal de succès
```scss
.success-modal {
  .modal-header {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    border-bottom: 2px solid #10b981;
  }
  
  .icon-wrapper {
    background: #10b981;
    color: white;
  }
}
```

---

## 🔘 Boutons

### Styles des boutons
```scss
.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.btn-primary {
  background: #3a5689;
  color: white;
  
  &:hover {
    background: #2d4470;
    box-shadow: 0 4px 12px rgba(58, 86, 137, 0.3);
  }
}

.btn-danger {
  background: #ef4444;
  color: white;
  
  &:hover {
    background: #dc2626;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  
  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
}
```

---

## 📱 Responsive Design

### Breakpoints
```scss
$mobile: 768px;
$tablet: 1024px;
$desktop: 1280px;
```

### Styles responsive
```scss
@media (max-width: 768px) {
  .modal-container {
    width: 95% !important;
    max-width: none !important;
    margin: 16px;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 20px;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
    
    button {
      width: 100%;
    }
  }
}
```

---

## ✨ Effets visuels

### Ombres
```scss
// Ombre légère
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

// Ombre moyenne
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

// Ombre forte (modals)
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
```

### Backdrop blur
```scss
backdrop-filter: blur(2px);  // Léger
backdrop-filter: blur(4px);  // Moyen
backdrop-filter: blur(8px);  // Fort
```

### Gradients
```scss
// Gradient subtil
background: linear-gradient(to bottom, #ffffff, #fafbfc);

// Gradient coloré
background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
```

---

## 🎪 Transitions

### Durées recommandées
```scss
$transition-fast: 0.15s;
$transition-normal: 0.2s;
$transition-slow: 0.3s;
```

### Courbes d'animation
```scss
// Standard
transition: all 0.2s ease;

// Bounce
transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

// Smooth
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 🔍 Z-index

### Hiérarchie des couches
```scss
$z-base: 1;
$z-dropdown: 100;
$z-sticky: 200;
$z-fixed: 300;
$z-modal-backdrop: 1000;
$z-modal: 1001;
$z-toast: 9999;
```

---

## 💡 Bonnes pratiques

1. **Toujours utiliser backdrop-filter** pour un effet moderne
2. **Animations fluides** avec cubic-bezier
3. **Responsive first** - tester sur mobile
4. **Accessibilité** - focus visible, ARIA labels
5. **Performance** - éviter les animations sur propriétés coûteuses
6. **Cohérence** - utiliser les variables de couleurs
7. **Feedback visuel** - hover, active, disabled states

---

## 🎓 Exemples d'utilisation

Voir les fichiers:
- `modal.component.scss` - Modal de base
- `error-modal.component.scss` - Modal d'erreur
- `confirmation-modal.component.scss` - Modal de confirmation
- `toast.component.scss` - Notifications toast
- `loading.component.scss` - Indicateur de chargement
