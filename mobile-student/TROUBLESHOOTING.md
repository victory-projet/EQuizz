# 🔧 Guide de Dépannage - Application EQuizz

## ✅ Problèmes Résolus

### 1. Navigation après connexion ✅
**Problème** : L'utilisateur n'était pas redirigé vers l'accueil après connexion.

**Solution** : 
- Correction du `useEffect` dans `src/app/_layout.tsx`
- Changement de `segments[0]?.includes('auth')` à `segments[0] === '(auth)'`
- Ajout de logs pour le débogage
- Correction des chemins de navigation : `'/(auth)/login'` et `'/(tabs)/accueil'`

**Résultat** : ✅ La navigation fonctionne correctement maintenant.

---

## ⚠️ Problèmes Actuels

### 1. Aucun quiz disponible
**Symptôme** : L'API retourne un tableau vide pour `/student/quizzes`

**Logs** :
```
✅ Quizzes fetched: 0 quiz(zes)
```

**Causes possibles** :
1. L'étudiant connecté n'est pas associé à une classe qui a des évaluations
2. Les évaluations ne sont pas publiées ou sont expirées
3. L'étudiant n'a pas les bonnes permissions

**Vérifications à faire** :

#### A. Vérifier l'utilisateur connecté
Allez dans l'onglet "Profil" et vérifiez :
- Le matricule de l'étudiant
- Sa classe
- Son niveau

#### B. Vérifier les données du backend
Selon le fichier `init.routes.js`, les données de seed créent :
- **Étudiants** :
  - `gills.sims@saintjeaningenieur.org` / `Etudiant123!` - Matricule: ING4-2024-001 - Classe: ING4 ISI FR
  - `lucas.petit@saintjeaningenieur.org` / `Etudiant123!` - Matricule: ING4-2024-002 - Classe: ING4 ISI FR
  - `emma.takam@saintjeaningenieur.org` / `Etudiant123!` - Matricule: ING4-2024-003 - Classe: ING4 ISI EN

- **Évaluation** :
  - Titre: "Évaluation Mi-Parcours - Bases de Données"
  - Cours: Bases de Données Avancées (INF401)
  - Classes: ING4 ISI FR, ING4 ISI EN
  - Date début: 2024-11-01
  - Date fin: 2024-11-15
  - Statut: PUBLIEE

#### C. Vérifier la route backend
La route `/student/quizzes` doit :
1. Récupérer l'étudiant connecté depuis le token JWT
2. Trouver sa classe
3. Retourner les évaluations associées à cette classe
4. Filtrer par statut PUBLIEE et dates valides

**Solution recommandée** :
1. Se connecter avec un des comptes étudiants de seed :
   - Email: `gills.sims@saintjeaningenieur.org`
   - Mot de passe: `Etudiant123!`
   - OU
   - Matricule: `ING4-2024-001`
   - Mot de passe: `Etudiant123!`

2. Si le problème persiste, vérifier le backend :
   - La route `/student/quizzes` retourne-t-elle les bonnes données ?
   - Les associations entre Evaluation, Classe et Etudiant sont-elles correctes ?
   - Le token JWT contient-il les bonnes informations ?

---

### 2. Erreur de période d'évaluation
**Symptôme** : Erreur lors de la récupération de la période d'évaluation

**Logs** :
```
ERROR Error loading evaluation period: [Error: Erreur lors de la récupération de la période d'évaluation]
```

**Cause** : L'endpoint `/student/evaluation-period` n'existe pas dans le backend

**Solution appliquée** : ✅
- L'erreur n'est plus bloquante
- La bannière de période ne s'affiche que si les données sont disponibles
- L'application fonctionne sans cette information

**Solution backend (optionnelle)** :
Créer l'endpoint `/student/evaluation-period` qui retourne :
```json
{
  "startDate": "2024-11-01",
  "endDate": "2024-11-15"
}
```

---

## 🧪 Tests à Effectuer

### Test 1 : Connexion avec compte de seed
```
1. Déconnectez-vous si connecté
2. Connectez-vous avec :
   - Matricule: ING4-2024-001
   - Mot de passe: Etudiant123!
3. Vérifiez le profil
4. Vérifiez l'accueil
```

### Test 2 : Vérifier les logs
```
1. Ouvrez la console
2. Allez sur l'onglet Profil
3. Notez les informations de l'utilisateur
4. Allez sur l'onglet Accueil
5. Vérifiez les logs de quiz
```

### Test 3 : Tester l'API directement
```bash
# 1. Se connecter
curl -X POST https://equizz-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"matricule":"ING4-2024-001","motDePasse":"Etudiant123!"}'

# 2. Récupérer le token de la réponse

# 3. Tester l'endpoint des quiz
curl https://equizz-production.up.railway.app/api/student/quizzes \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

---

## 📝 Checklist de Débogage

- [ ] L'utilisateur est bien connecté (vérifier le profil)
- [ ] L'utilisateur a une classe assignée
- [ ] La classe a des évaluations associées
- [ ] Les évaluations sont publiées (statut PUBLIEE)
- [ ] Les dates d'évaluation sont valides (entre dateDebut et dateFin)
- [ ] Le token JWT est valide et contient les bonnes informations
- [ ] L'API retourne bien les données (tester avec curl/Postman)

---

## 🔍 Logs Utiles

### Logs de Navigation
```
Navigation check: {"inAuthGroup": false, "isAuthenticated": true, "segments": "(tabs)"}
```
✅ Signifie que l'utilisateur est authentifié et sur l'écran des tabs

### Logs d'API
```
📡 Fetching available quizzes from /student/quizzes...
✅ Quizzes fetched: 0 quiz(zes)
```
✅ L'API répond, mais retourne 0 quiz

### Logs d'Utilisateur
```
👤 Utilisateur connecté: { id, nom, prenom, matricule, classe, ... }
```
Vérifier que l'utilisateur a bien une classe assignée

---

## 💡 Solutions Rapides

### Si aucun quiz n'apparaît :
1. Vérifier que vous êtes connecté avec un compte étudiant de seed
2. Vérifier que la date actuelle est entre le 1er et le 15 novembre 2024
3. Si la date est passée, modifier les dates dans le backend ou créer une nouvelle évaluation

### Si l'erreur de période persiste :
- C'est normal, l'endpoint n'existe pas
- L'application fonctionne sans cette information
- Vous pouvez ignorer cette erreur

### Si la navigation ne fonctionne pas :
- Vérifier que vous avez bien les dernières modifications
- Redémarrer l'application : `npm start`
- Vider le cache : `expo start -c`

---

## 📞 Support

Si le problème persiste après ces vérifications :
1. Vérifier les logs complets dans la console
2. Tester l'API directement avec curl/Postman
3. Vérifier les données dans la base de données
4. Contacter l'équipe backend pour vérifier la route `/student/quizzes`

---

**Dernière mise à jour** : Novembre 2025
