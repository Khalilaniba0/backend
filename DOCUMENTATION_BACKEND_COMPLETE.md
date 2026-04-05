# Talentia ATS Backend - Documentation Complete

## 1. Objectif du document
Ce document explique le backend Talentia ATS avec:
- architecture globale
- role des dossiers
- modeles de donnees
- routes API actives
- securite (auth, role, tenant)
- flux metier importants (candidature, entretien, notification)

Le but est qu un nouveau developpeur comprenne rapidement le projet et puisse intervenir sans casser les conventions.

## 2. Stack technique
- Runtime: Node.js
- Framework HTTP: Express
- Base de donnees: MongoDB
- ODM: Mongoose
- Auth: JWT via cookies HTTP only
- Upload: multer
- Tache planifiee: node-cron

Dependances et scripts:
- voir `package.json`
- scripts: `npm start`, `npm run dev`

## 3. Variables d environnement
Variables utilisees dans le code:
- `PORT`: port HTTP du serveur Express
- `url_db`: URI de connexion MongoDB
- `JWT_SECRET_KEY`: cle JWT RH/Admin
- `JWT_SECRET`: cle JWT candidat (fallback possible sur `JWT_SECRET_KEY`)

## 4. Demarrage de l application
Fichier principal: `app.js`

Sequence:
1. charge dotenv
2. cree l app Express
3. active CORS (`http://localhost:3000`, credentials true)
4. middlewares globaux (logger, body parser, cookies, static)
5. monte tous les routeurs
6. cree le serveur HTTP et ecoute `PORT`
7. connecte MongoDB
8. demarre le cron des notifications (hors environnement test)

## 5. Architecture des dossiers
- `config`: configuration technique (MongoDB)
- `controllers`: logique metier par domaine
- `middlewares`: auth, role, tenant, logging, upload
- `models`: schemas Mongoose
- `routes`: mapping HTTP vers controllers
- `utils`: utilitaires metier
- `tests`: scenarios de test manuel
- `public`: fichiers statiques (CV)
- `logs`: logs middleware

## 6. Fichiers backend actifs

### Racine
- `app.js`: point d entree serveur
- `notificationCron.js`: tache cron des notifications
- `package.json`, `package-lock.json`
- `DOCUMENTATION_API_ET_MODELES.md`
- `GUIDE_CONSOMMATION_API.md`
- `DOCUMENTATION_BACKEND_COMPLETE.md`

### config
- `config/db.js`: connexion MongoDB via `mongoose.connect(process.env.url_db)`

### controllers
- `controllers/candidat.controller.js`: inscription, connexion, deconnexion, profil candidat
- `controllers/candidature.controller.js`: postuler, pipeline des etapes, suppression candidature
- `controllers/entreprise.controller.js`: creation/gestion entreprise
- `controllers/entretien.controller.js`: CRUD entretiens
- `controllers/notification.controller.js`: CRUD notifications et statut
- `controllers/offreEmploi.controller.js`: CRUD offres et statuts
- `controllers/utilisateur.controller.js`: CRUD utilisateurs RH/Admin + login/logout

### middlewares
- `middlewares/authMiddleware.js`: auth RH/Admin via cookie jwt
- `middlewares/logMiddlewares.js`: log des requetes HTTP dans `logs/doc.log`
- `middlewares/requireAdmin.js`: guard role admin
- `middlewares/requireCandidat.js`: auth candidat via cookie `jwt_candidat`
- `middlewares/requireTenant.js`: exige `entrepriseId` pour routes RH/Admin
- `middlewares/uploadfile.js`: upload CV dans `public/cv`

### models
- `models/candidat.model.js`
- `models/candidature.model.js`
- `models/entreprise.model.js`
- `models/entretien.model.js`
- `models/notification.model.js`
- `models/offreEmploi.model.js`
- `models/utilisateur.model.js`

### routes
- `routes/candidat.route.js`
- `routes/candidature.route.js`
- `routes/entreprise.route.js`
- `routes/entretien.route.js`
- `routes/notification.route.js`
- `routes/offreEmploi.route.js`
- `routes/utilisateur.route.js`

### tests
- `tests/smoke-multitenant.http`

### utils
- `utils/notificationMessage.js`: generation de messages de notifications

## 7. Authentification, roles, tenant

### RH/Admin
Cookie: `jwt`
Middleware: `authMiddleware`
Injecte dans `req`:
- `req.utilisateur`
- `req.utilisateurId`
- `req.role`
- `req.entrepriseId`
- compatibilite: `req.user`, `req.userId`

### Candidat
Cookie: `jwt_candidat`
Middleware: `requireCandidat`
Injecte dans `req`:
- `req.candidatId`

### Role Admin
Middleware: `requireAdmin`
Condition:
- `req.role` doit etre `admin`

### Tenant
Middleware: `requireTenant`
Condition:
- `req.entrepriseId` doit etre present

## 8. Modeles de donnees

### Utilisateur (RH/Admin)
Fichier: `models/utilisateur.model.js`
- role: `rh | admin`
- entreprise: ObjectId `Entreprise` requis
- alias: `name <-> nom`, `password <-> motDePasse`, `telephone <-> tel`, `address <-> adresse`
- collection Mongo: `users`

### Candidat
Fichier: `models/candidat.model.js`
- infos de profil candidat
- mot de passe hashe via bcrypt

### Entreprise
Fichier: `models/entreprise.model.js`
- entite tenant
- plan: `free | pro | enterprise`

### OffreEmploi
Fichier: `models/offreEmploi.model.js`
- entreprise obligatoire
- responsable RH optionnel
- statut: `open | closed`

### Candidature
Fichier: `models/candidature.model.js`
- relie candidat + offre + entreprise
- etape pipeline:
  - `soumise`
  - `preselectionne`
  - `test_technique`
  - `entretien_planifie`
  - `entretien_passe`
  - `offre`
  - `accepte`
  - `refuse`
- champs entretien lies: `dateEntretien`, `typeEntretien`

### Entretien
Fichier: `models/entretien.model.js`
- relie entreprise + responsable
- peut etre rattache a une candidature ou cree en mode standalone
- type entretien: `telephone | visio | presentiel`

### Notification
Fichier: `models/notification.model.js`
- relie candidat + candidature + entreprise
- type: `etape_avancement | entretien_planifie | refus | suppression | offre_acceptee`
- statut: `en_attente | envoyee | lue`
- envoi differe via `datePrevueEnvoi`

## 9. Routes API montees dans app.js

- `/user`
- `/offre`
- `/candidature`
- `/entretien`
- `/entreprise`
- `/candidat`
- `/notification`

## 10. Detail des routes

### 10.1 Utilisateurs RH/Admin (`/user`)
Source: `routes/utilisateur.route.js`

- `GET /user/getAllUsers` (auth + admin + tenant)
- `GET /user/getUserById/:id` (auth + tenant)
- `POST /user/createRh` (auth + admin + tenant)
- `POST /user/createAdmin` (auth + admin + tenant)
- `DELETE /user/deleteUser/:id` (auth + admin + tenant)
- `PUT /user/updateUser/:id` (auth + tenant)
- `PUT /user/updateMyProfile` (auth + tenant)
- `PUT /user/changePassword` (auth + tenant)
- `POST /user/login` (public)
- `POST /user/logout` (auth)

### 10.2 Offres (`/offre`)
Source: `routes/offreEmploi.route.js`

- `GET /offre/getAllOffres` (public)
- `GET /offre/getOffresDisponibles` (public)
- `GET /offre/getOffresByEntreprise` (auth + tenant)
- `GET /offre/getOffresByEntreprise/:entrepriseId` (public)
- `GET /offre/getOffreById/:id` (public)
- `POST /offre/createOffre` (auth + tenant)
- `PUT /offre/updateOffre/:id` (auth + tenant)
- `PUT /offre/updateOffreStatus/:id` (auth + tenant)
- `DELETE /offre/deleteOffreById/:id` (auth + tenant)

### 10.3 Candidatures (`/candidature`)
Source: `routes/candidature.route.js`

Routes candidat:
- `POST /candidature/postuler` (requireCandidat + upload)
- `GET /candidature/mesCandidatures` (requireCandidat)
- `DELETE /candidature/annuler/:id` (requireCandidat)
- `PUT /candidature/modifier/:id` (requireCandidat)

Routes RH/Admin:
- `GET /candidature/getAllCandidatures` (auth + tenant)
- `GET /candidature/getCandidatureById/:id` (auth + tenant)
- `GET /candidature/getCandidaturesByOffre/:offreId` (auth + tenant)
- `PUT /candidature/updateCandidatureEtape/:id` (auth + tenant)
- `PUT /candidature/refuserCandidature/:id` (auth + tenant)
- `DELETE /candidature/deleteCandidatureById/:id` (auth + tenant)

### 10.4 Entretiens (`/entretien`)
Source: `routes/entretien.route.js`

- `GET /entretien/getAllEntretiens` (auth + tenant)
- `GET /entretien/getEntretienById/:id` (auth + tenant)
- `POST /entretien/createEntretien` (auth + tenant)
- `PUT /entretien/updateEntretien/:id` (auth + tenant)
- `DELETE /entretien/deleteEntretienById/:id` (auth + tenant)

### 10.5 Entreprise (`/entreprise`)
Source: `routes/entreprise.route.js`

- `POST /entreprise/registerEntreprise` (public)
- `GET /entreprise/getMyEntreprise` (auth + admin + tenant)
- `PUT /entreprise/updateEntreprise` (auth + admin + tenant)
- `DELETE /entreprise/deleteEntreprise` (auth + admin + tenant)

### 10.6 Candidat (`/candidat`)
Source: `routes/candidat.route.js`

Public:
- `POST /candidat/inscrire`
- `POST /candidat/connecter`

Protege candidat:
- `POST /candidat/deconnecter`
- `GET /candidat/monProfil`
- `PUT /candidat/mettreAJourProfil` (upload CV possible)

### 10.7 Notifications (`/notification`)
Source: `routes/notification.route.js`

- `GET /notification/getNotificationsByCandidat/:candidatId` (auth + tenant)
- `GET /notification/getPendingNotifications` (auth + tenant)
- `POST /notification/createNotification` (auth + tenant)
- `PUT /notification/markAsSent/:id` (auth + tenant)
- `PUT /notification/markAsRead/:id` (auth + tenant)
- `DELETE /notification/deleteNotification/:id` (auth + tenant)

## 11. Flux metier candidature
Source: `controllers/candidature.controller.js`

### 11.1 Postuler
1. candidat authentifie envoie sa candidature
2. verification offre ouverte + date limite
3. creation candidature en etape `soumise`

### 11.2 Avancement d etape
1. RH met a jour etape via `updateCandidatureEtape`
2. transitions controlees par `ALLOWED_TRANSITIONS`
3. si `entretien_planifie`:
   - validation date/type
   - creation entretien
4. creation notification differee

### 11.3 Refus et suppression
- `refuserCandidature`: passe la candidature a `refuse` + notification differee
- `deleteCandidatureById`: cree notification de suppression puis supprime la candidature

## 12. Flux metier entretiens
Source: `controllers/entretien.controller.js`

- creation d entretien possible:
  - avec candidature
  - sans candidature (mode standalone avec identite candidat)
- controle de conflits planning cote responsable
- controle de conflits planning cote candidature
- update entretien peut synchroniser etape candidature via champ `reponse`

## 13. Flux metier notifications
Sources: `controllers/notification.controller.js`, `notificationCron.js`, `utils/notificationMessage.js`

- les notifications peuvent etre creees manuellement via API
- certaines notifications sont creees automatiquement depuis la candidature
- statut initial: `en_attente`
- cron toutes les minutes:
  - recupere les notifications en attente planifiees
  - les marque `envoyee` avec `dateEnvoi`

## 14. Conventions importantes
- Le modele user est `Utilisateur` (pas `User`)
- Les roles internes sont en minuscules: `rh`, `admin`
- Le backend supporte des alias legacy dans plusieurs payloads
- Pour le frontend, envoyer les cookies (`credentials: true`)
- La plupart des operations RH/Admin sont scopees par entreprise

## 15. Commandes utiles
- Installer: `npm install`
- Lancer en dev: `npm run dev`
- Lancer en local: `npm start`

---
Derniere mise a jour: 2026-04-02
