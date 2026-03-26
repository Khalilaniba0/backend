# Documentation API, Attributs et Relations (SaaS Multi-Tenant)

Ce document décrit:
- Les routes disponibles (avec chemins complets).
- Les attributs de chaque collection MongoDB.
- Les relations entre les collections.
- Les regles d'isolation multi-tenant.

## 1) Principes multi-tenant

- Chaque entreprise possede son propre espace de donnees.
- Les collections internes sont scopees par le champ entreprise.
- Les routes protegees utilisent requireAuth + requireTenant.
- Le JWT transporte le payload: { userId, role, entrepriseId }.
- Les routes publiques restent accessibles sans token.

### Candidat (important)

- Le candidat n'est pas un utilisateur de l'application.
- Il postule via la route publique /condidature/postuler.
- Il suit sa candidature via /condidature/suivi/:token.
- Aucun compte candidat, aucun JWT candidat, aucun mot de passe candidat.

## 2) Routes API

### Base URL locale
- Serveur: http://localhost:${PORT}

### Entreprise (/entreprise)
| Methode | Route | Protection | Description |
|---|---|---|---|
| POST | /entreprise/register | Public | Creer une entreprise + admin initial |
| GET | /entreprise/me | requireAuth + requireAdmin + requireTenant | Voir son entreprise |
| PUT | /entreprise/update | requireAuth + requireAdmin + requireTenant | Modifier son entreprise |
| DELETE | /entreprise/delete | requireAuth + requireAdmin + requireTenant | Supprimer son entreprise |

### User (/user)
| Methode | Route | Protection | Description |
|---|---|---|---|
| GET | /user/getAllUsers | requireAuth + requireAdmin + requireTenant + logMiddleware | Lister les users de la meme entreprise |
| GET | /user/getUserById/:id | requireAuth + requireTenant + logMiddleware | Voir un user de la meme entreprise |
| POST | /user/createRh | requireAuth + requireAdmin + requireTenant | Creer un compte RH dans la meme entreprise |
| POST | /user/createAdmin | requireAuth + requireAdmin + requireTenant | Creer un compte admin dans la meme entreprise |
| DELETE | /user/deleteUser/:id | requireAuth + requireAdmin + requireTenant | Supprimer un user de la meme entreprise |
| PUT | /user/updateUser/:id | requireAuth + requireTenant | Mettre a jour son profil (ou admin de la meme entreprise) |
| POST | /user/login | Public | Connexion interne (admin/rh) |
| POST | /user/logout | requireAuth | Deconnexion |

### Offre Emploi (/offre)
| Methode | Route | Protection | Description |
|---|---|---|---|
| GET | /offre/getAll | Public | Liste publique des offres |
| GET | /offre/getById/:id | Public | Detail public d'une offre |
| POST | /offre/create | requireAuth + requireRhOrAdmin + requireTenant | Creer une offre dans son entreprise |
| PUT | /offre/update/:id | requireAuth + requireRhOrAdmin + requireTenant | Mettre a jour une offre de son entreprise |
| PUT | /offre/updateStatus/:id | requireAuth + requireRhOrAdmin + requireTenant | Ouvrir/Fermer une offre de son entreprise |
| DELETE | /offre/deleteById/:id | requireAuth + requireRhOrAdmin + requireTenant | Supprimer une offre de son entreprise |

### Condidature (/condidature)
| Methode | Route | Protection | Description |
|---|---|---|---|
| POST | /condidature/postuler | Public (+ upload cv_url) | Soumettre une candidature |
| GET | /condidature/suivi/:token | Public | Suivre sa candidature via tokenSuivi |
| GET | /condidature/getAll | requireAuth + requireRhOrAdmin + requireTenant | Lister les candidatures de son entreprise |
| GET | /condidature/getById/:id | requireAuth + requireRhOrAdmin + requireTenant | Voir une candidature de son entreprise |
| GET | /condidature/getByOffre/:offreId | requireAuth + requireRhOrAdmin + requireTenant | Lister les candidatures d'une offre de son entreprise |
| PUT | /condidature/updateEtape/:id | requireAuth + requireRhOrAdmin + requireTenant | Mettre a jour l'etape d'une candidature de son entreprise |
| DELETE | /condidature/deleteById/:id | requireAuth + requireRhOrAdmin + requireTenant | Supprimer une candidature de son entreprise |

### Entretien (/entretien)
| Methode | Route | Protection | Description |
|---|---|---|---|
| GET | /entretien/getAll | requireAuth + requireRhOrAdmin + requireTenant | Lister les entretiens de son entreprise |
| GET | /entretien/getById/:id | requireAuth + requireRhOrAdmin + requireTenant | Voir un entretien de son entreprise |
| POST | /entretien/create | requireAuth + requireRhOrAdmin + requireTenant | Creer un entretien de son entreprise |
| PUT | /entretien/update/:id | requireAuth + requireRhOrAdmin + requireTenant | Mettre a jour un entretien de son entreprise |
| DELETE | /entretien/deleteById/:id | requireAuth + requireRhOrAdmin + requireTenant | Supprimer un entretien de son entreprise |

## 3) Attributs des collections

Remarque: toutes les collections ont aussi _id, createdAt, updatedAt (timestamps actives).

### Collection Entreprise
- nom: String, requis
- email: String, requis, unique, minuscule, format email valide
- adresse: String
- secteur: String
- logo: String
- siteWeb: String
- plan: String, enum [free, pro, enterprise], defaut free
- isActive: Boolean, defaut true

### Collection User
- name: String
- email: String, requis, unique, minuscule, format email valide
- password: String
- role: String, enum [rh, admin], defaut rh
- tel: String
- photo: String
- adresse: String
- entreprise: ObjectId -> Entreprise, requis
- block: Boolean, defaut false
- loginAttempts: Number, defaut 0

### Collection OffreEmploi
- post: String
- description: String
- status: String, enum [open, closed], defaut open
- entreprise: ObjectId -> Entreprise, requis
- responsable: ObjectId -> User
- requirements: Array<String>
- typeContrat: String, enum [CDI, CDD, Stage, Alternance, Freelance], defaut CDI
- salaireMin: Number
- salaireMax: Number
- localisation: String
- modeContrat: String, enum [presentiel, hybride, remote], defaut presentiel
- departement: String
- dateLimite: Date
- niveauExperience: String, enum [junior, mid, senior], defaut junior

### Collection Condidature
- nom: String, requis
- email: String, requis, format email valide
- telephone: String
- cv_url: String
- lettre_motivation: String
- entreprise: ObjectId -> Entreprise, requis
- offre: ObjectId -> OffreEmploi, requis
- score_ia: Number, defaut null
- etape: String, enum [soumise, preselectionne, entretien_planifie, entretien_passe, accepte, refuse], defaut soumise
- tokenSuivi: String, unique

### Collection Entretien
- entreprise: ObjectId -> Entreprise, requis
- candidature: ObjectId -> Condidature, requis
- responsable: ObjectId -> User, requis
- date_entretien: Date, requis
- type_entretien: String, enum [telephone, visio, presentiel], defaut visio
- duree: Number, defaut 30
- lien_visio: String
- commentaires: String
- score_entretien: Number, min 0, max 20
- criteres_evaluation: Array<Object>
  - critere: String
  - note: Number, min 0, max 5
- reponse: String, enum [accepte, refuse, en attente], defaut en attente

## 4) Relations entre collections

1. Entreprise 1 --- N User
- Cle: User.entreprise

2. Entreprise 1 --- N OffreEmploi
- Cle: OffreEmploi.entreprise

3. Entreprise 1 --- N Condidature
- Cle: Condidature.entreprise

4. Entreprise 1 --- N Entretien
- Cle: Entretien.entreprise

5. User 1 --- N OffreEmploi
- Cle: OffreEmploi.responsable
- Un RH/Admin peut gerer plusieurs offres dans sa propre entreprise.

6. OffreEmploi 1 --- N Condidature
- Cle: Condidature.offre
- Une offre recueille plusieurs candidatures.

7. Condidature 1 --- N Entretien
- Cle: Entretien.candidature

8. User 1 --- N Entretien
- Cle: Entretien.responsable

## 5) Isolation des donnees (regles)

- Toute route protegee filtre par req.entrepriseId.
- Aucune route protegee ne doit exposer les donnees d'une autre entreprise.
- Exceptions publiques sans tenant check:
  - GET /offre/getAll
  - GET /offre/getById/:id
  - POST /condidature/postuler
  - GET /condidature/suivi/:token

## 6) Module supprime

- Le module Employee est retire de l'application:
  - model supprime
  - controller supprime
  - routes supprimees
