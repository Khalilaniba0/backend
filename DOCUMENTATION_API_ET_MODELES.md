# Documentation API, Attributs et Relations (SaaS Multi-Tenant)

Ce document decrit:
- Les routes disponibles et leur protection
- Les attributs reels des collections MongoDB
- Les relations entre collections
- Les regles d isolation multi-tenant

Il est synchronise avec le code actuel.

## 1) Principes multi-tenant

- Chaque entreprise possede son propre espace de donnees.
- Les routes RH/Admin protegees utilisent `requireAuth` + `requireTenant` (et `requireAdmin` selon le cas).
- Les routes candidat protegees utilisent `requireCandidat`.
- Le JWT RH/Admin transporte: `{ utilisateurId, userId, role, entrepriseId }`.
- Le JWT candidat transporte: `{ candidatId, type: "candidat" }`.
- Le candidat n est pas rattache a un tenant (pas de champ `entreprise` dans le modele Candidat).

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
| PUT | /user/updateUser/:id | requireAuth + requireTenant | Mise a jour d un user |
| PUT | /user/updateMyProfile | requireAuth + requireTenant | Mise a jour du profil courant |
| PUT | /user/changePassword | requireAuth + requireTenant | Changer le mot de passe du compte courant |
| POST | /user/login | Public | Connexion interne (admin/rh) |
| POST | /user/logout | requireAuth | Deconnexion |

### Candidat (`/candidat`)
| Methode | Route | Protection | Description |
|---|---|---|---|
| POST | /candidat/inscrire | Public | Creer un compte candidat |
| POST | /candidat/connecter | Public | Connexion candidat |
| POST | /candidat/deconnecter | requireCandidat | Deconnexion candidat |
| GET | /candidat/monProfil | requireCandidat | Voir son profil |
| PUT | /candidat/mettreAJourProfil | requireCandidat + uploadfile.single('cv_url') | Modifier son profil (multipart possible) |

### Offre Emploi (`/offre`)
| Methode | Route | Protection | Description |
|---|---|---|---|
| GET | /offre/getAllOffres | Public | Liste publique des offres |
| GET | /offre/getOffresDisponibles | Public | Liste des offres ouvertes |
| GET | /offre/getOffresByEntreprise | requireAuth + requireTenant | Lister les offres de son tenant |
| GET | /offre/getOffresByEntreprise/:entrepriseId | Public | Lister les offres d une entreprise |
| GET | /offre/getOffreById/:id | Public | Detail public d une offre |
| POST | /offre/createOffre | requireAuth + requireTenant | Creer une offre dans son entreprise |
| PUT | /offre/updateOffre/:id | requireAuth + requireTenant | Mettre a jour une offre |
| PUT | /offre/updateOffreStatus/:id | requireAuth + requireTenant | Changer le statut open/closed |
| DELETE | /offre/deleteOffreById/:id | requireAuth + requireTenant | Supprimer une offre (avec suppression cascade des candidatures liees) |

### Candidature (`/candidature`)
| Methode | Route | Protection | Description |
|---|---|---|---|
| POST | /candidature/postuler | requireCandidat + upload.single('cv_url') | Soumettre une candidature |
| GET | /candidature/mesCandidatures | requireCandidat | Voir ses candidatures |
| DELETE | /candidature/annuler/:id | requireCandidat | Annuler candidature si etape=soumise |
| PUT | /candidature/modifier/:id | requireCandidat | Modifier candidature si etape=soumise |
| GET | /candidature/getAllCandidatures | requireAuth + requireTenant | Lister candidatures du tenant |
| GET | /candidature/getCandidatureById/:id | requireAuth + requireTenant | Voir une candidature du tenant |
| GET | /candidature/getCandidaturesByOffre/:offreId | requireAuth + requireTenant | Lister candidatures d une offre |
| PUT | /candidature/updateCandidatureEtape/:id | requireAuth + requireTenant | Mettre a jour etape candidature |
| PUT | /candidature/refuserCandidature/:id | requireAuth + requireTenant | Forcer le refus d une candidature |
| DELETE | /candidature/deleteCandidatureById/:id | requireAuth + requireTenant | Supprimer candidature |

### Entretien (`/entretien`)
| Methode | Route | Protection | Description |
|---|---|---|---|
| GET | /entretien/getAllEntretiens | requireAuth + requireTenant | Lister les entretiens du tenant |
| GET | /entretien/getEntretienById/:id | requireAuth + requireTenant | Voir un entretien |
| POST | /entretien/createEntretien | requireAuth + requireTenant | Creer un entretien |
| PUT | /entretien/updateEntretien/:id | requireAuth + requireTenant | Mettre a jour un entretien |
| DELETE | /entretien/deleteEntretienById/:id | requireAuth + requireTenant | Supprimer un entretien |

### Notification (`/notification`)
| Methode | Route | Protection | Description |
|---|---|---|---|
| GET | /notification/getNotificationsByCandidat/:candidatId | requireAuth + requireTenant | Lister notifications d un candidat |
| GET | /notification/getPendingNotifications | requireAuth + requireTenant | Lister notifications en attente d envoi |
| POST | /notification/createNotification | requireAuth + requireTenant | Creer une notification |
| PUT | /notification/markAsSent/:id | requireAuth + requireTenant | Marquer une notification comme envoyee |
| PUT | /notification/markAsRead/:id | requireAuth + requireTenant | Marquer une notification comme lue |
| DELETE | /notification/deleteNotification/:id | requireAuth + requireTenant | Supprimer une notification |

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
- `tel`: String (alias `telephone`)
- `photo`: String
- `adresse`: String (alias `address`)
- `departement`: String
- `competences`: Array<String>
- `formation`: Array<String>
- `linkedin`: String
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
- `dateEntretien`: Date, defaut `null` (alias `date_entretien`)
- `typeEntretien`: String, defaut `null` (alias `type_entretien`)
- `etape`: String, enum `[soumise, preselectionne, test_technique, entretien_planifie, entretien_passe, offre, accepte, refuse]`, defaut `soumise`

### Collection Entretien (`entretiens`)
- `entreprise`: ObjectId -> Entreprise, requis
- `candidature`: ObjectId -> Candidature, optionnel (defaut `null`)
- `candidatEmail`: String (alias `candidat_email`)
- `candidatNom`: String (alias `candidat_nom`)
- `poste`: String
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

### Collection Notification (`notifications`)
- `candidat`: ObjectId -> Candidat, requis
- `candidature`: ObjectId -> Candidature, requis
- `type`: String, enum `[etape_avancement, entretien_planifie, refus, suppression, offre_acceptee]`, requis
- `message`: String, requis
- `etapeSource`: String
- `etapeCible`: String
- `dateEntretien`: Date
- `typeEntretien`: String, enum `[telephone, visio, presentiel]`
- `statut`: String, enum `[en_attente, envoyee, lue]`, defaut `en_attente`
- `datePrevueEnvoi`: Date, defaut `now + 10 minutes`
- `dateEnvoi`: Date
- `entreprise`: ObjectId -> Entreprise, requis

## 4) Relations entre collections

1. Entreprise 1 --- N Utilisateur
- Cle: `Utilisateur.entreprise`

2. Entreprise 1 --- N OffreEmploi
- Cle: `OffreEmploi.entreprise`

3. Entreprise 1 --- N Candidature
- Cle: `Candidature.entreprise`

4. Entreprise 1 --- N Entretien
- Cle: `Entretien.entreprise`

5. Entreprise 1 --- N Notification
- Cle: `Notification.entreprise`

6. Utilisateur 1 --- N OffreEmploi
- Cle: `OffreEmploi.responsable`

7. OffreEmploi 1 --- N Candidature
- Cle: `Candidature.offre`

8. Candidat 1 --- N Candidature
- Cle: `Candidature.candidat`

9. Candidature 1 --- N Entretien
- Cle: `Entretien.candidature`

10. Candidature 1 --- N Notification
- Cle: `Notification.candidature`

11. Candidat 1 --- N Notification
- Cle: `Notification.candidat`

## 5) Isolation des donnees

- Les routes protegees RH/Admin filtrent par `req.entrepriseId`.
- Aucune route protegee ne doit exposer les donnees d une autre entreprise.
- Routes publiques sans tenant check:
  - `POST /entreprise/registerEntreprise`
  - `POST /user/login`
  - `POST /candidat/inscrire`
  - `POST /candidat/connecter`
  - `GET /offre/getAllOffres`
  - `GET /offre/getOffresDisponibles`
  - `GET /offre/getOffresByEntreprise/:entrepriseId`
  - `GET /offre/getOffreById/:id`
