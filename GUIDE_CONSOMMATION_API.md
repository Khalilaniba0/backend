# Guide de Consommation API

Ce guide est centre sur la consommation pratique de l'API (frontend, Postman, tests manuels).
Il est base sur les routes et middlewares actifs dans le code.

## 1. Base URL et prerequis

- Base URL locale: `http://localhost:5000`
- Format JSON: `Content-Type: application/json`
- Authentification RH/Admin: cookie HTTP-only nomme `jwt`
- Authentification Candidat: cookie HTTP-only nomme `jwt_candidat`
- Secret JWT: `JWT_SECRET_KEY` (et `JWT_SECRET` optionnel)
- CORS backend:
  - `origin: http://localhost:3000`
  - `credentials: true`

Important pour le frontend:
- Toujours envoyer les requetes protegees avec `credentials: 'include'` (fetch) ou `withCredentials: true` (axios), sinon les cookies `jwt`/`jwt_candidat` ne seront pas envoyes.

## 2. Flux recommande (ordre de consommation)

Flux RH/Admin (inchange):

1. `POST /entreprise/registerEntreprise`
2. `POST /user/login`
3. Appels proteges RH/Admin
4. `POST /user/logout`

Flux Candidat:

1. `POST /candidat/inscrire`
2. `POST /candidat/connecter`
3. `POST /condidature/postuler` (avec cookie `jwt_candidat`)
4. `GET /condidature/mesCandidatures`
5. `POST /candidat/deconnecter`

Flux Visiteur:

1. `GET /offre/getAllOffres` (sans cookie)
2. `GET /offre/getOffreById/:id` (sans cookie)

Pour postuler: s'inscrire d'abord en tant que candidat.

## 3. Auth et autorisations

Middlewares utilises:
- `requireAuth`: verifie `req.cookies.jwt`
- `requireTenant`: verifie la presence de `entrepriseId`
- `requireAdmin`: reserve aux users role `admin`

Regles globales:
- Routes publiques: pas de cookie requis
- Routes protegees RH/Admin: cookie `jwt` requis
- Routes protegees Candidat: cookie `jwt_candidat` requis
- Routes admin: cookie `jwt` + role admin

Cookie candidat: `jwt_candidat` (HTTP-only, distinct du cookie `jwt` RH/Admin)
`requireCandidat`: verifie `req.cookies.jwt_candidat` et injecte `req.candidatId`

## 4. Endpoints par module

## 4.0 Candidat

### POST /candidat/inscrire
- Protection: Public
- Body:

```json
{
  "nom": "Ahmed Ben Ali",
  "email": "ahmed@example.com",
  "motDePasse": "Ahmed123!",
  "telephone": "0612345678"
}
```

- Reponse: `201` + cookie `jwt_candidat`

### POST /candidat/connecter
- Protection: Public
- Body:

```json
{
  "email": "ahmed@example.com",
  "motDePasse": "Ahmed123!"
}
```

- Reponse: `200` + cookie `jwt_candidat`

### GET /candidat/monProfil
- Protection: requireCandidat (cookie `jwt_candidat`)
- Reponse: `200` + profil sans `motDePasse`

### PUT /candidat/mettreAJourProfil
- Protection: requireCandidat
- Body partiel: `nom`, `telephone`, `cv_url`, `portfolio_url`
- Reponse: `200`

## 4.1 Entreprise

### POST /entreprise/registerEntreprise
- Protection: Public
- But: creer l'entreprise et l'admin initial
- Body minimal:

```json
{
  "nom": "Talentia QA",
  "email": "entreprise.qa@example.com",
  "adminName": "Admin QA",
  "adminEmail": "admin.qa@example.com",
  "adminPassword": "Admin123!"
}
```

- Reponse succes: `201`

### GET /entreprise/getMyEntreprise
- Protection: Auth + Admin + Tenant
- Reponse succes: `200`

### PUT /entreprise/updateEntreprise
- Protection: Auth + Admin + Tenant
- Body partiel accepte (ex: `nom`, `email`, `adresse`, `secteur`, `logo`, `siteWeb`, `plan`, `isActive`)
- Reponse succes: `200`

### DELETE /entreprise/deleteEntreprise
- Protection: Auth + Admin + Tenant
- Effet: supprime aussi users, offres, candidatures, entretiens du tenant
- Reponse succes: `200`

## 4.2 User

### POST /user/login
- Protection: Public
- Body:

```json
{
  "email": "admin.qa@example.com",
  "password": "Admin123!"
}
```

- Reponse succes: `200` + cookie `jwt`

### POST /user/logout
- Protection: Auth
- Reponse succes: `200`

### GET /user/getAllUsers
- Protection: Auth + Admin + Tenant + logMiddleware
- Reponse succes: `200`

### GET /user/getUserById/:id
- Protection: Auth + Tenant
- Reponse succes: `200`

### POST /user/createRh
- Protection: Auth + Admin + Tenant
- Body minimal:

```json
{
  "name": "RH QA",
  "email": "rh.qa@example.com",
  "password": "Rh123456!"
}
```

- Reponse succes: `201`

### POST /user/createAdmin
- Protection: Auth + Admin + Tenant
- Body minimal:

```json
{
  "name": "Second Admin",
  "email": "admin2.qa@example.com",
  "password": "Admin123!"
}
```

- Reponse succes: `201`

### PUT /user/updateUser/:id
- Protection: Auth + Tenant
- Regle: admin peut modifier n'importe quel user du tenant, sinon seulement son propre profil
- Body partiel accepte (ex: `name`, `tel`, `photo`, `adresse`, `competences`, `formation`, `linkedin`, `departement`)
- Reponse succes: `200`

### DELETE /user/deleteUser/:id
- Protection: Auth + Admin + Tenant
- Reponse succes: `200`

## 4.3 Offre Emploi

### GET /offre/getAllOffres
- Protection: Public
- Query params supportes:
  - `typeContrat`
  - `localisation`
  - `status`
  - `departement`
  - `modeContrat`
  - `niveauExperience`
- Reponse succes: `200`

### GET /offre/getOffreById/:id
- Protection: Public
- Reponse succes: `200`

### POST /offre/createOffre
- Protection: Auth + Tenant
- Body exemple:

```json
{
  "post": "Developpeur Node",
  "description": "Backend ATS",
  "requirements": ["Node.js", "MongoDB"],
  "typeContrat": "CDI",
  "localisation": "Tunis",
  "modeContrat": "hybride",
  "departement": "IT",
  "niveauExperience": "mid"
}
```

- Reponse succes: `201`

### PUT /offre/updateOffre/:id
- Protection: Auth + Tenant
- Body partiel accepte
- Reponse succes: `200`

### PUT /offre/updateOffreStatus/:id
- Protection: Auth + Tenant
- Effet: toggle automatique `open <-> closed`
- Reponse succes: `200`

### DELETE /offre/deleteOffreById/:id
- Protection: Auth + Tenant
- Reponse succes: `200`

## 4.4 Condidature

### POST /condidature/postuler
- Protection: requireCandidat (cookie `jwt_candidat`)
- Type: `multipart/form-data` si envoi de CV (champ fichier: `cv_url`)
- Champs requis: `offre`
- Regles metier: l'offre doit etre `open` et non expiree (`dateLimite` non depassee)
- Reponse succes: `201` + `tokenSuivi` + `candidatureId`

### GET /condidature/getCondidatureBySuivi/:token
- Protection: Public
- Reponse: etape + post offre + date

Exemple sans authentification:

```http
GET /condidature/getCondidatureBySuivi/REPLACE_TOKEN_SUIVI
```

### GET /condidature/getAllCondidatures
- Protection: Auth + Tenant
- Query params optionnels:
  - `offre`
  - `etape`
- Reponse succes: `200`

### GET /condidature/mesCandidatures
- Protection: requireCandidat
- Retourne uniquement les candidatures du candidat connecte

### DELETE /condidature/annuler/:id
- Protection: requireCandidat
- Fonctionne uniquement si `etape === 'soumise'`

### PUT /condidature/modifier/:id
- Protection: requireCandidat
- Fonctionne uniquement si `etape === 'soumise'`
- Champs modifiables: `lettre_motivation`, `cv_url`

### GET /condidature/getCondidatureById/:id
- Protection: Auth + Tenant
- Reponse succes: `200`

### GET /condidature/getCondidaturesByOffre/:offreId
- Protection: Auth + Tenant
- Reponse succes: `200` (tries par `score_ia` decroissant)

### PUT /condidature/updateCondidatureEtape/:id
- Protection: Auth + Tenant
- Body possible:

```json
{
  "etape": "preselectionne",
  "score_ia": 14
}
```

- Transitions autorisees:
  - `soumise -> preselectionne | refuse`
  - `preselectionne -> entretien_planifie | refuse`
  - `entretien_planifie -> entretien_passe | refuse`
  - `entretien_passe -> accepte | refuse`

### DELETE /condidature/deleteCondidatureById/:id
- Protection: Auth + Tenant
- Reponse succes: `200`

## 4.5 Entretien

### GET /entretien/getAllEntretiens
- Protection: Auth + Tenant

### GET /entretien/getEntretienById/:id
- Protection: Auth + Tenant

### POST /entretien/createEntretien
- Protection: Auth + Tenant
- Body minimal:

```json
{
  "candidature": "CANDIDATURE_ID",
  "date_entretien": "2026-04-01T09:00:00.000Z"
}
```

- Champs optionnels: `type_entretien`, `duree`, `lien_visio`
- Validation: evite les conflits d'horaire (responsable et candidature)
- Effet: met automatiquement la candidature a `entretien_planifie`

### PUT /entretien/updateEntretien/:id
- Protection: Auth + Tenant
- Champs modifiables: `commentaires`, `score_entretien`, `criteres_evaluation`, `reponse`, `date_entretien`, `type_entretien`, `duree`, `lien_visio`
- Si `reponse` vaut `accepte` ou `refuse`, la candidature associee est synchronisee

### DELETE /entretien/deleteEntretienById/:id
- Protection: Auth + Tenant

## 5. Exemples de consommation frontend

### Fetch (avec cookie)

```js
const res = await fetch('http://localhost:5000/entreprise/getMyEntreprise', {
  method: 'GET',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
});
const data = await res.json();
```

```js
// Inscription candidat
await fetch('http://localhost:5000/candidat/inscrire', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nom: 'Ahmed', email: 'ahmed@ex.com', motDePasse: 'Ahmed123!' })
});

// Postuler (apres connexion, avec FormData pour cv_url)
const form = new FormData();
form.append('offre', 'OFFRE_ID');
form.append('lettre_motivation', 'Je suis motive...');
form.append('cv_url', fichierCV);
await fetch('http://localhost:5000/condidature/postuler', {
  method: 'POST',
  credentials: 'include',
  body: form
});
```

### Axios (avec cookie)

```js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
});

const { data } = await api.get('/offre/getAllOffres');
```

## 6. Codes de retour frequents

- `200`: succes lecture/mise a jour/suppression
- `201`: creation ok
- `400`: donnees invalides (ex: champs requis, transition etape invalide)
- `401`: non authentifie (token absent/invalide)
- `403`: acces interdit (role/tenant)
- `404`: ressource introuvable
- `500`: erreur serveur

## 7. Checklist rapide de debug consommation

1. Verifier que login est fait et que le cookie `jwt` est bien present.
2. Verifier `credentials: 'include'` ou `withCredentials: true`.
3. Verifier la route exacte (ex: `/offre/getAllOffres`, pas `/offre/getAll`).
4. Verifier que l'ID passe en parametre existe.
5. Verifier que le role est admin pour les routes admin.
6. Verifier que la ressource appartient au meme tenant.
7. Verifier les transitions de condidature (`soumise` pour annuler/modifier cote candidat).
8. Pour les routes candidat: verifier que le cookie `jwt_candidat` est present (distinct du cookie `jwt` RH/Admin).
9. Un visiteur ne peut PAS postuler sans s'inscrire d'abord.

## 8. Fichiers de reference projet

- Routes: `routes/*.route.js`
- Controllers: `controllers/*.controller.js`
- Exemple test HTTP: `tests/smoke-multitenant.http`
- Documentation metier existante: `DOCUMENTATION_API_ET_MODELES.md`
