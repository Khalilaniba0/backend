# Guide de Consommation API

Ce guide est centre sur la consommation pratique de l'API (frontend, Postman, tests manuels).
Il est synchronise avec le code actuel (routes, middlewares, controllers, modeles).

## 1. Base URL et prerequis

- Base URL locale: `http://localhost:${PORT}` (souvent `http://localhost:5000` en local)
- Format JSON: `Content-Type: application/json`
- Backend CORS:
  - `origin: http://localhost:3000`
  - `credentials: true`

Cookies d'authentification:
- RH/Admin: cookie HTTP-only `jwt`
- Candidat: cookie HTTP-only `jwt_candidat`

Secrets JWT:
- RH/Admin: `JWT_SECRET_KEY`
- Candidat: `JWT_SECRET` (fallback possible sur `JWT_SECRET_KEY`)

Important pour frontend:
- Toujours envoyer les requetes protegees avec `credentials: 'include'` (fetch) ou `withCredentials: true` (axios), sinon les cookies ne seront pas envoyes.

## 2. Convention de nommage des champs

L'API accepte parfois plusieurs variantes (`snake_case` et `camelCase`) selon les endpoints.
Pour eviter les erreurs, utiliser en priorite les champs suivants:

- User RH/Admin: `name`, `password`
- Candidat: `motDePasse`, `cv_url`, `portfolio_url`
- Candidature: `lettre_motivation`, `score_ia`
- Entretien: `date_entretien`, `type_entretien`, `lien_visio`, `score_entretien`, `criteres_evaluation`

## 3. Flux recommande

Flux RH/Admin:
1. `POST /entreprise/registerEntreprise`
2. `POST /user/login`
3. Routes protegees RH/Admin
4. `POST /user/logout`

Flux Candidat:
1. `POST /candidat/inscrire`
2. `POST /candidat/connecter`
3. `POST /condidature/postuler`
4. `GET /condidature/mesCandidatures`
5. `POST /candidat/deconnecter`

Flux Visiteur:
1. `GET /offre/getAllOffres`
2. `GET /offre/getOffreById/:id`

Note:
- Le prefixe candidature est actuellement `/condidature` (orthographe conservee par le code).

## 4. Auth et autorisations

Middlewares:
- `requireAuth`: verifie `req.cookies.jwt`
- `requireTenant`: verifie/injecte `req.entrepriseId`
- `requireAdmin`: reserve aux users role `admin`
- `requireCandidat`: verifie `req.cookies.jwt_candidat`

Regles globales:
- Routes publiques: pas de cookie requis
- Routes protegees RH/Admin: cookie `jwt` requis
- Routes protegees Candidat: cookie `jwt_candidat` requis
- Routes admin: cookie `jwt` + role admin

## 5. Endpoints par module

## 5.0 Candidat (`/candidat`)

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

### POST /candidat/deconnecter
- Protection: `requireCandidat`
- Reponse: `200`

### GET /candidat/monProfil
- Protection: `requireCandidat`
- Reponse: `200`

### PUT /candidat/mettreAJourProfil
- Protection: `requireCandidat`
- Body partiel accepte: `nom`, `telephone`, `cv_url`, `portfolio_url`
- Reponse: `200`

## 5.1 Entreprise (`/entreprise`)

### POST /entreprise/registerEntreprise
- Protection: Public
- But: creer l'entreprise + admin initial
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

- Reponse: `201`

### GET /entreprise/getMyEntreprise
- Protection: `requireAuth` + `requireAdmin` + `requireTenant`
- Reponse: `200`

### PUT /entreprise/updateEntreprise
- Protection: `requireAuth` + `requireAdmin` + `requireTenant`
- Body partiel: `nom`, `email`, `adresse`, `secteur`, `logo`, `siteWeb`, `plan`, `isActive`
- Reponse: `200`

### DELETE /entreprise/deleteEntreprise
- Protection: `requireAuth` + `requireAdmin` + `requireTenant`
- Reponse: `200`

## 5.2 User (`/user`)

### POST /user/login
- Protection: Public
- Body:

```json
{
  "email": "admin.qa@example.com",
  "password": "Admin123!"
}
```

- Reponse: `200` + cookie `jwt`

### POST /user/logout
- Protection: `requireAuth`
- Reponse: `200`

### GET /user/getAllUsers
- Protection: `requireAuth` + `requireAdmin` + `requireTenant` + `logMiddleware`
- Reponse: `200`

### GET /user/getUserById/:id
- Protection: `requireAuth` + `requireTenant` + `logMiddleware`
- Reponse: `200`

### POST /user/createRh
- Protection: `requireAuth` + `requireAdmin` + `requireTenant`
- Body minimal:

```json
{
  "name": "RH QA",
  "email": "rh.qa@example.com",
  "password": "Rh123456!"
}
```

- Reponse: `201`

### POST /user/createAdmin
- Protection: `requireAuth` + `requireAdmin` + `requireTenant`
- Body minimal:

```json
{
  "name": "Second Admin",
  "email": "admin2.qa@example.com",
  "password": "Admin123!"
}
```

- Reponse: `201`

### PUT /user/updateUser/:id
- Protection: `requireAuth` + `requireTenant`
- Regle: admin peut modifier tout user du tenant; sinon user modifie son propre profil
- Body partiel: `name`/`nom`, `tel`, `photo`, `adresse`, `competences`, `formation`, `linkedin`, `departement`
- Reponse: `200`

### DELETE /user/deleteUser/:id
- Protection: `requireAuth` + `requireAdmin` + `requireTenant`
- Reponse: `200`

## 5.3 Offre Emploi (`/offre`)

### GET /offre/getAllOffres
- Protection: Public
- Query params optionnels:
  - `typeContrat`
  - `localisation`
  - `status` (ou `statut`)
  - `departement`
  - `modeContrat`
  - `niveauExperience`
- Reponse: `200`

### GET /offre/getOffreById/:id
- Protection: Public
- Reponse: `200`

### POST /offre/createOffre
- Protection: `requireAuth` + `requireTenant`
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

- Reponse: `201`

### PUT /offre/updateOffre/:id
- Protection: `requireAuth` + `requireTenant`
- Body partiel accepte
- Reponse: `200`

### PUT /offre/updateOffreStatus/:id
- Protection: `requireAuth` + `requireTenant`
- Effet: toggle `open <-> closed`
- Reponse: `200`

### DELETE /offre/deleteOffreById/:id
- Protection: `requireAuth` + `requireTenant`
- Reponse: `200`

## 5.4 Condidature (`/condidature`)

### POST /condidature/postuler
- Protection: `requireCandidat`
- Type: `multipart/form-data` supporte
- Fichier CV: champ `cv_url`
- Champ requis: `offre`
- Regles metier:
  - une seule candidature par candidat et par offre
  - offre doit etre `open`
  - `dateLimite` non depassee
- Reponse: `201`

### GET /condidature/mesCandidatures
- Protection: `requireCandidat`
- Reponse: `200`

### DELETE /condidature/annuler/:id
- Protection: `requireCandidat`
- Condition: uniquement si `etape === soumise`
- Reponse: `200`

### PUT /condidature/modifier/:id
- Protection: `requireCandidat`
- Condition: uniquement si `etape === soumise`
- Champs modifiables: `lettre_motivation` (ou `lettreMotivation`), `cv_url` (string)
- Reponse: `200`

### GET /condidature/getAllCandidatures
- Protection: `requireAuth` + `requireTenant`
- Query params optionnels: `offre`, `etape`
- Reponse: `200`

### GET /condidature/getCandidatureById/:id
- Protection: `requireAuth` + `requireTenant`
- Reponse: `200`

### GET /condidature/getCandidaturesByOffre/:offreId
- Protection: `requireAuth` + `requireTenant`
- Reponse: `200`

### PUT /condidature/updateCandidatureEtape/:id
- Protection: `requireAuth` + `requireTenant`
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
- Reponse: `200`

### DELETE /condidature/deleteCandidatureById/:id
- Protection: `requireAuth` + `requireTenant`
- Reponse: `200`

Note importante:
- A ce stade, il n'existe pas de route publique de suivi par token (ex: `/getCondidatureBySuivi/:token`) dans le code actuel.

## 5.5 Entretien (`/entretien`)

### GET /entretien/getAllEntretiens
- Protection: `requireAuth` + `requireTenant`
- Reponse: `200`

### GET /entretien/getEntretienById/:id
- Protection: `requireAuth` + `requireTenant`
- Reponse: `200`

### POST /entretien/createEntretien
- Protection: `requireAuth` + `requireTenant`
- Body minimal:

```json
{
  "candidature": "CANDIDATURE_ID",
  "date_entretien": "2026-04-01T09:00:00.000Z"
}
```

- Champs optionnels: `type_entretien`, `duree`, `lien_visio`
- Validation: gestion des conflits d'horaire (responsable et candidature)
- Effet: candidature associee passe a `entretien_planifie`
- Reponse: `201`

### PUT /entretien/updateEntretien/:id
- Protection: `requireAuth` + `requireTenant`
- Champs modifiables:
  - `commentaires`
  - `score_entretien` (ou `scoreEntretien`)
  - `criteres_evaluation` (ou `criteresEvaluation`)
  - `reponse`
  - `date_entretien` (ou `dateEntretien`)
  - `type_entretien` (ou `typeEntretien`)
  - `duree`
  - `lien_visio` (ou `lienVisio`)
- Si `reponse` vaut `accepte` ou `refuse`, etape candidature synchronisee
- Reponse: `200`

### DELETE /entretien/deleteEntretienById/:id
- Protection: `requireAuth` + `requireTenant`
- Reponse: `200`

## 6. Exemples frontend

### Fetch avec cookies

```js
const res = await fetch('http://localhost:5000/entreprise/getMyEntreprise', {
  method: 'GET',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
});
const data = await res.json();
```

### Axios avec cookies

```js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
});

const { data } = await api.get('/offre/getAllOffres');
```

## 7. Codes de retour frequents

- `200`: succes lecture/mise a jour/suppression
- `201`: creation ok
- `400`: donnees invalides
- `401`: non authentifie
- `403`: acces interdit
- `404`: ressource introuvable
- `500`: erreur serveur
