# Guide de débogage - Filtre École

## Étapes de vérification

### 1. Vérifier que vous êtes connecté
- Ouvrez http://localhost:4200
- Connectez-vous avec:
  - Email: `super.admin@saintjeaningenieur.org`
  - Mot de passe: `admin123`

### 2. Ouvrir la console du navigateur
- Appuyez sur **F12**
- Cliquez sur l'onglet **Console**

### 3. Aller dans la section Étudiants
- Cliquez sur "Étudiants" dans le menu

### 4. Vérifier les logs dans la console

Vous devriez voir:
```
📚 Classes chargées: Array(4)
🏫 Écoles chargées: Array(1)
```

Si vous voyez des erreurs rouges, notez-les.

### 5. Vérifier le dropdown École
- Regardez le dropdown "Toutes les écoles"
- Est-ce qu'il contient "Saint Jean Ingenieur"?

### 6. Tester le filtre
- Sélectionnez "Saint Jean Ingenieur"
- Console devrait afficher: `🔍 Filtre école changé: 12fc03d5-...`
- Le dropdown "Toutes les classes" devrait afficher les 4 classes

### 7. Tester la recherche
- Tapez un nom dans la barre de recherche
- Les résultats devraient se filtrer en temps réel

## Problèmes courants

### Problème: Le dropdown école est vide
**Cause**: Les écoles ne se chargent pas
**Solution**:
1. Vérifiez dans la console s'il y a une erreur 401
2. Si oui, reconnectez-vous
3. Si erreur 500, vérifiez que le backend tourne

### Problème: Erreur 401 dans la console
**Cause**: Token expiré ou invalide
**Solution**:
1. Déconnectez-vous
2. Reconnectez-vous
3. Rafraîchissez la page

### Problème: Les filtres ne réagissent pas
**Cause**: Erreur JavaScript
**Solution**:
1. Regardez les erreurs dans la console
2. Rafraîchissez la page (F5)
3. Videz le cache (Ctrl+Shift+Delete)

### Problème: La recherche ne fonctionne plus
**Cause**: Conflit avec le filtre école
**Solution**:
1. Cliquez sur "Réinitialiser les filtres"
2. Essayez à nouveau

## Commandes de vérification backend

### Vérifier que le backend tourne
```bash
netstat -ano | findstr :3000
```
Devrait afficher des lignes avec "LISTENING"

### Vérifier les données dans la base
```bash
cd backend
node check-ecoles.js
```
Devrait afficher 1 école et 4 classes

### Tester l'API des classes
```bash
cd backend
node test-api-classes.js
```
Devrait afficher le format JSON avec `ecole_id`

## Informations à fournir pour le débogage

Si ça ne marche toujours pas, fournissez:

1. **Capture d'écran** de la console (F12)
2. **Capture d'écran** de la section Étudiants
3. **Copie des erreurs** dans la console (texte)
4. **Comportement exact**:
   - Qu'est-ce qui ne marche pas?
   - Qu'est-ce que vous voyez?
   - Qu'est-ce que vous attendez?
