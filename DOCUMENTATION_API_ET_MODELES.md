# Documentation API, Attributs et Relations (SaaS Multi-Tenant)

Ce document decrit:
- Les routes disponibles (et leur protection)
- Les attributs reels des collections MongoDB
- Les relations entre collections
- Les regles d'isolation multi-tenant

Il est synchronise avec le code actuel.

## 1) Principes multi-tenant

- Chaque entreprise possede son propre espace de donnees.
- Les routes RH/Admin protegees utilisent `requireAuth` + `requireTenant` (et `requireAdmin` selon le cas).
- Les routes candidat protegees utilisent `requireCandidat`.
- Le JWT RH/Admin transporte: `{ utilisateurId, userId, role, entrepriseId }`.
- Le JWT candidat transporte: `{ candidatId, type: 'candidat' }`.
- Le candidat n'est pas rattache a un tenant (pas de champ `entreprise` dans le modele Candidat).

## 2) Routes API

### Base URL locale
- `http://localhost:${PORT}`

### Entreprise (`/entreprise`)
| Methode | Route | Protection | Description |
|---|---|---|---|
| POST | /entreprise/registerEntreprise | Public | Creer une entreprise + admin initial |
| GET | /entreprise/getMyEntreprise | requireAuth + requireAdmin + requireTenant | Voir son entreprise |
| PUT | /entreprise/updateEntreprise | requireAuth + requireAdmin + requireTenant | Modifier son entreprise |
| DELETE | /entreprise/deleteEntreprise | requireAuth + requireAdmin + requireTenant | Supprimer son entreprise |

### User (`/user`)
| Methode | Route | Protection | Description |
|---|---|---|---|
| GET | /user/getAllUsers | requireAuth + requireAdmin + requireTenant + logMiddleware | Lister les users du tenant |
| GET | /user/getUserById/:id | requireAuth + requireTenant + logMiddleware | Voir un user du tenant |
| POST | /user/createRh | requireAuth + requireAdmin + requireTenant | Creer un compte RH |
| POST | /user/createAdmin | requireAuth + requireAdmin + requireTenant | Creer un compte admin |
| DELETE | /user/deleteUser/:id | requireAuth + requireAdmin + requireTenant | Supprimer un user |
| PUT | /user/updateUser/:id | requireAuth + requireTenant | Mise a jour profil user |
| POST | /user/login | Public | Connexion interne (admin/rh) |
| POST | /user/logout | requireAuth | Deconnexion |

### Candidat (`/candidat`)
| Methode | Route | Protection | Description |
|---|---|---|---|
| POST | /candidat/inscrire | Public | Creer un compte candidat |
| POST | /candidat/connecter | Public | Connexion candidat |
| POST | /candidat/deconnecter | requireCandidat | Deconnexion candidat |
| GET | /candidat/monProfil | requireCandidat | Voir son profil |
| PUT | /candidat/mettreAJourProfil | requireCandidat | Modifier son profil |

### Offre Emploi (`/offre`)
| Methode | Route | Protection | Description |
|---|---|---|---|
| GET | /offre/getAllOffres | Public | Liste publique des offres |
| GET | /offre/getOffreById/:id | Public | Detail public d'une offre |
| POST | /offre/createOffre | requireAuth + requireTenant | Creer une offre dans son entreprise |
| PUT | /offre/updateOffre/:id | requireAuth + requireTenant | Mettre a jour une offre |
| PUT | /offre/updateOffreStatus/:id | requireAuth + requireTenant | Ouvrir/Fermer une offre |
| DELETE | /offre/deleteOffreById/:id | requireAuth + requireTenant | Supprimer une offre |

### Condidature (`/condidature`)
| Methode | Route | Protection | Description |
|---|---|---|---|
| POST | /condidature/postuler | requireCandidat | Soumettre une candidature |
| GET | /condidature/mesCandidatures | requireCandidat | Voir ses candidatures |
| DELETE | /condidature/annuler/:id | requireCandidat | Annuler candidature si etape=soumise |
| PUT | /condidature/modifier/:id | requireCandidat | Modifier candidature si etape=soumise |
| GET | /condidature/getAllCandidatures | requireAuth + requireTenant | Lister candidatures du tenant |
| GET | /condidature/getCandidatureById/:id | requireAuth + requireTenant | Voir une candidature du tenant |
| GET | /condidature/getCandidaturesByOffre/:offreId | requireAuth + requireTenant | Lister candidatures d'une offre |
| PUT | /condidature/updateCandidatureEtape/:id | requireAuth + requireTenant | Mettre a jour etape candidature |
| DELETE | /condidature/deleteCandidatureById/:id | requireAuth + requireTenant | Supprimer candidature |

Note:
- Le prefixe est `/condidature` (orthographe actuelle du code).
- Il n'existe pas, a ce stade, de route publique `GET /condidature/getCondidatureBySuivi/:token` dans les routes actives.

### Entretien (`/entretien`)
| Methode | Route | Protection | Description |
|---|---|---|---|
| GET | /entretien/getAllEntretiens | requireAuth + requireTenant | Lister les entretiens du tenant |
| GET | /entretien/getEntretienById/:id | requireAuth + requireTenant | Voir un entretien |
| POST | /entretien/createEntretien | requireAuth + requireTenant | Creer un entretien |
| PUT | /entretien/updateEntretien/:id | requireAuth + requireTenant | Mettre a jour un entretien |
| DELETE | /entretien/deleteEntretienById/:id | requireAuth + requireTenant | Supprimer un entretien |

## 3) Attributs des collections

Remarque: toutes les collections ont `_id`, `createdAt`, `updatedAt`.

### Collection Entreprise
- `nom`: String, requis
- `email`: String, requis, unique, lowercase, email valide
- `adresse`: String
- `secteur`: String
- `logo`: String
- `siteWeb`: String
- `plan`: String, enum `[free, pro, enterprise]`, defaut `free`
- `isActive`: Boolean, defaut `true`

### Collection Utilisateur (`users`)
- `nom`: String (alias `name`)
- `email`: String, requis, unique, lowercase, email valide
- `motDePasse`: String (alias `password`)
- `role`: String, enum `[rh, admin]`, defaut `rh`
- `tel`: String
- `photo`: String
- `adresse`: String
- `entreprise`: ObjectId -> Entreprise, requis
- `bloque`: Boolean, defaut `false` (alias `block`)
- `tentativesConnexion`: Number, defaut `0` (alias `loginAttempts`)

### Collection Candidat
- `nom`: String, requis
- `email`: String, requis, unique, lowercase
- `motDePasse`: String, requis, hashe (bcrypt)
- `telephone`: String
- `cv_url`: String
- `portfolio_url`: String

### Collection OffreEmploi (`offreemplois`)
- `poste`: String (alias `post`)
- `description`: String
- `statut`: String, enum `[open, closed]`, defaut `open` (alias `status`)
- `entreprise`: ObjectId -> Entreprise, requis
- `responsable`: ObjectId -> Utilisateur
- `exigences`: Array<String> (alias `requirements`)
- `typeContrat`: String, enum `[CDI, CDD, Stage, Alternance, Freelance]`, defaut `CDI`
- `salaireMin`: Number
- `salaireMax`: Number
- `localisation`: String
- `modeContrat`: String, enum `[presentiel, hybride, remote]`, defaut `presentiel`
- `departement`: String
- `dateLimite`: Date
- `niveauExperience`: String, enum `[junior, mid, senior]`, defaut `junior`

### Collection Candidature (`candidatures`)
- `candidat`: ObjectId -> Candidat, requis
- `nom`: String, requis
- `email`: String, requis
- `telephone`: String
- `cv_url`: String
- `lettreMotivation`: String (alias `lettre_motivation`)
- `entreprise`: ObjectId -> Entreprise, requis
- `offre`: ObjectId -> OffreEmploi, requis
- `scoreIA`: Number, defaut `null` (alias `score_ia`)
- `etape`: String, enum `[soumise, preselectionne, entretien_planifie, entretien_passe, accepte, refuse]`, defaut `soumise`

### Collection Entretien (`entretiens`)
- `entreprise`: ObjectId -> Entreprise, requis
- `candidature`: ObjectId -> Candidature, requis
- `responsable`: ObjectId -> Utilisateur, requis
- `dateEntretien`: Date, requis (alias `date_entretien`)
- `typeEntretien`: String, enum `[telephone, visio, presentiel]`, defaut `visio` (alias `type_entretien`)
- `duree`: Number, defaut `30`
- `lienVisio`: String (alias `lien_visio`)
- `commentaires`: String
- `scoreEntretien`: Number, min `0`, max `20` (alias `score_entretien`)
- `criteresEvaluation`: Array<Object> (alias `criteres_evaluation`)
  - `critere`: String
  - `note`: Number, min `0`, max `5`
- `reponse`: String, enum `[accepte, refuse, en_attente]`, defaut `en_attente`

## 4) Relations entre collections

1. Entreprise 1 --- N Utilisateur
- Cle: `Utilisateur.entreprise`

2. Entreprise 1 --- N OffreEmploi
- Cle: `OffreEmploi.entreprise`

3. Entreprise 1 --- N Candidature
- Cle: `Candidature.entreprise`

4. Entreprise 1 --- N Entretien
- Cle: `Entretien.entreprise`

5. Utilisateur 1 --- N OffreEmploi
- Cle: `OffreEmploi.responsable`

6. OffreEmploi 1 --- N Candidature
- Cle: `Candidature.offre`

7. Candidat 1 --- N Candidature
- Cle: `Candidature.candidat`

8. Candidature 1 --- N Entretien
- Cle: `Entretien.candidature`

9. Utilisateur 1 --- N Entretien
- Cle: `Entretien.responsable`

## 5) Isolation des donnees

- Les routes protegees RH/Admin filtrent par `req.entrepriseId`.
- Aucune route protegee ne doit exposer les donnees d'une autre entreprise.
- Routes publiques sans tenant check:
  - `GET /offre/getAllOffres`
  - `GET /offre/getOffreById/:id`
  - `POST /entreprise/registerEntreprise`
  - `POST /user/login`
  - `POST /candidat/inscrire`
  - `POST /candidat/connecter`
