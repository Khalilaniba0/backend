# Documentation API, Attributs et Relations (SaaS Multi-Tenant)

Ce document décrit:
- Les routes disponibles (avec chemins complets).
- Les attributs de chaque collection MongoDB.
- Les relations entre les collections.
- Les regles d'isolation multi-tenant.

## 1) Principes multi-tenant

- Chaque entreprise possede son propre espace de donnees.
- Les collections internes sont scopees par le champ entreprise.
- Les routes protegees RH/Admin utilisent requireAuth + requireTenant.
- Les routes protegees Candidat utilisent requireCandidat.
- Le JWT RH/Admin transporte le payload: { utilisateurId, userId, role, entrepriseId }.
- Les routes publiques restent accessibles sans token.

### Candidat (important)

- Le candidat EST un acteur authentifie avec son propre compte.
- Il s'inscrit via POST /candidat/inscrire et se connecte via POST /candidat/connecter.
- Son JWT est stocke dans le cookie HTTP-only 'jwt_candidat' distinct du cookie 'jwt' RH/Admin.
- Le JWT candidat contient: { candidatId, type: 'candidat' }.
- Le candidat N'appartient PAS a un tenant (pas de champ entreprise dans Candidat).
- Un visiteur non connecte peut consulter les offres mais ne peut PAS postuler.

## 2) Routes API

### Base URL locale
- Serveur: http://localhost:${PORT}

### Entreprise (/entreprise)
| Methode | Route | Protection | Description |
|---|---|---|---|
| POST | /entreprise/registerEntreprise | Public | Creer une entreprise + admin initial |
| GET | /entreprise/getMyEntreprise | requireAuth + requireAdmin + requireTenant | Voir son entreprise |
| PUT | /entreprise/updateEntreprise | requireAuth + requireAdmin + requireTenant | Modifier son entreprise |
| DELETE | /entreprise/deleteEntreprise | requireAuth + requireAdmin + requireTenant | Supprimer son entreprise |

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

### Candidat (/candidat)
| Methode | Route | Protection | Description |
|---|---|---|---|
| POST | /candidat/inscrire | Public | Creer un compte candidat |
| POST | /candidat/connecter | Public | Connexion candidat |
| POST | /candidat/deconnecter | requireCandidat | Deconnexion candidat |
| GET | /candidat/monProfil | requireCandidat | Voir son profil |
| PUT | /candidat/mettreAJourProfil | requireCandidat | Modifier son profil |

### Offre Emploi (/offre)
| Methode | Route | Protection | Description |
|---|---|---|---|
| GET | /offre/getAllOffres | Public | Liste publique des offres |
| GET | /offre/getOffreById/:id | Public | Detail public d'une offre |
| POST | /offre/createOffre | requireAuth + requireTenant | Creer une offre dans son entreprise |
| PUT | /offre/updateOffre/:id | requireAuth + requireTenant | Mettre a jour une offre de son entreprise |
| PUT | /offre/updateOffreStatus/:id | requireAuth + requireTenant | Ouvrir/Fermer une offre de son entreprise |
| DELETE | /offre/deleteOffreById/:id | requireAuth + requireTenant | Supprimer une offre de son entreprise |

### Condidature (/condidature)
| Methode | Route | Protection | Description |
|---|---|---|---|
| POST | /condidature/postuler | requireCandidat | Soumettre une candidature |
| GET | /condidature/getCondidatureBySuivi/:token | Public | Suivre sa candidature via tokenSuivi |
| GET | /condidature/mesCandidatures | requireCandidat | Voir ses propres candidatures |
| DELETE | /condidature/annuler/:id | requireCandidat | Annuler (si etape=soumise) |
| PUT | /condidature/modifier/:id | requireCandidat | Modifier (si etape=soumise) |
| GET | /condidature/getAllCondidatures | requireAuth + requireTenant | Lister les candidatures de son entreprise |
| GET | /condidature/getCondidatureById/:id | requireAuth + requireTenant | Voir une candidature de son entreprise |
| GET | /condidature/getCondidaturesByOffre/:offreId | requireAuth + requireTenant | Lister les candidatures d'une offre de son entreprise |
| PUT | /condidature/updateCondidatureEtape/:id | requireAuth + requireTenant | Mettre a jour l'etape d'une candidature de son entreprise |
| DELETE | /condidature/deleteCondidatureById/:id | requireAuth + requireTenant | Supprimer une candidature de son entreprise |

### Entretien (/entretien)
| Methode | Route | Protection | Description |
|---|---|---|---|
| GET | /entretien/getAllEntretiens | requireAuth + requireTenant | Lister les entretiens de son entreprise |
| GET | /entretien/getEntretienById/:id | requireAuth + requireTenant | Voir un entretien de son entreprise |
| POST | /entretien/createEntretien | requireAuth + requireTenant | Creer un entretien de son entreprise |
| PUT | /entretien/updateEntretien/:id | requireAuth + requireTenant | Mettre a jour un entretien de son entreprise |
| DELETE | /entretien/deleteEntretienById/:id | requireAuth + requireTenant | Supprimer un entretien de son entreprise |

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

### Collection Utilisateur
- nom: String
- email: String, requis, unique, minuscule, format email valide
- motDePasse: String
- role: String, enum [rh, admin], defaut rh
- tel: String
- photo: String
- adresse: String
- entreprise: ObjectId -> Entreprise, requis
- bloque: Boolean, defaut false
- tentativesConnexion: Number, defaut 0

### Collection Candidat
- nom: String, requis
- email: String, requis, unique, minuscule
- motDePasse: String, requis, hashe bcrypt
- telephone: String
- cv_url: String
- portfolio_url: String

### Collection OffreEmploi
- poste: String
- description: String
- statut: String, enum [open, closed], defaut open
- entreprise: ObjectId -> Entreprise, requis
- responsable: ObjectId -> Utilisateur
- exigences: Array<String>
- typeContrat: String, enum [CDI, CDD, Stage, Alternance, Freelance], defaut CDI
- salaireMin: Number
- salaireMax: Number
- localisation: String
- modeContrat: String, enum [presentiel, hybride, remote], defaut presentiel
- departement: String
- dateLimite: Date
- niveauExperience: String, enum [junior, mid, senior], defaut junior

### Collection Candidature
- candidat: ObjectId -> Candidat, requis
- nom: String, requis
- email: String, requis
- telephone: String
- cv_url: String
- lettreMotivation: String
- entreprise: ObjectId -> Entreprise, requis
- offre: ObjectId -> OffreEmploi, requis
- scoreIA: Number, defaut null
- etape: String, enum [soumise, preselectionne, entretien_planifie, entretien_passe, accepte, refuse], defaut soumise
- tokenSuivi: String, unique

### Collection Entretien
- entreprise: ObjectId -> Entreprise, requis
- candidature: ObjectId -> Candidature, requis
- responsable: ObjectId -> Utilisateur, requis
- dateEntretien: Date, requis
- typeEntretien: String, enum [telephone, visio, presentiel], defaut visio
- duree: Number, defaut 30
- lienVisio: String
- commentaires: String
- scoreEntretien: Number, min 0, max 20
- criteresEvaluation: Array<Object>
  - critere: String
  - note: Number, min 0, max 5
- reponse: String, enum [accepte, refuse, en_attente], defaut en_attente

## 4) Relations entre collections

1. Entreprise 1 --- N Utilisateur
- Cle: Utilisateur.entreprise

2. Entreprise 1 --- N OffreEmploi
- Cle: OffreEmploi.entreprise

3. Entreprise 1 --- N Candidature
- Cle: Candidature.entreprise

4. Entreprise 1 --- N Entretien
- Cle: Entretien.entreprise

5. Utilisateur 1 --- N OffreEmploi
- Cle: OffreEmploi.responsable
- Un RH/Admin peut gerer plusieurs offres dans sa propre entreprise.

6. OffreEmploi 1 --- N Candidature
- Cle: Candidature.offre
- Une offre recueille plusieurs candidatures.

7. Candidat 1 --- N Candidature
- Cle: Candidature.candidat

8. Candidature 1 --- N Entretien
- Cle: Entretien.candidature

9. Utilisateur 1 --- N Entretien
- Cle: Entretien.responsable

## 5) Isolation des donnees (regles)

- Toute route protegee filtre par req.entrepriseId.
- Aucune route protegee ne doit exposer les donnees d'une autre entreprise.
- Exceptions publiques sans tenant check:
  - GET /offre/getAllOffres
  - GET /offre/getOffreById/:id
  - GET /condidature/getCondidatureBySuivi/:token

## 6) Module supprime

- Le module Employee est retire de l'application:
  - model supprime
  - controller supprime
  - routes supprimees
