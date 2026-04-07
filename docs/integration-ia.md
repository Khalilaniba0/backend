# Documentation d'integration Backend <-> IA (cv_matching_job)

Mise a jour: 2026-04-05

## 1) Objectif

Ce document definit le contrat d'integration entre:
- le backend Node/Express (dossier backend)
- le service IA FastAPI (dossier cv_matching_job)

Le but est de preciser exactement:
- ce que l'IA attend (inputs)
- ce que l'IA renvoie (outputs)

## 2) Base URL et configuration

Variables d'environnement backend:
- IA_BASE_URL: URL du service IA (ex: http://127.0.0.1:8000)
- IA_TIMEOUT_MS: timeout HTTP en ms (ex: 15000)

Le client backend existant est dans:
- backend/utils/iaScoringClient.js

## 3) Endpoint IA 1 - Pre-traitement d'offre

### Route
POST /api/process-job

### Content-Type
application/json

### Body attendu

- description: string (obligatoire)
- langues: string (optionnel)
- exigences: string (optionnel)
- niveauExperience: string (optionnel)
- niveauEducation: string (optionnel)

Exemple:

```json
{
  "description": "Nous recrutons un developpeur backend Python...",
  "langues": "Francais courant, Anglais B2",
  "exigences": "Python, FastAPI, PostgreSQL, Docker",
  "niveauExperience": "3 ans minimum",
  "niveauEducation": "Bac+5 / Master"
}
```

### Reponse succes (HTTP 200)

```json
{
  "success": true,
  "data": {
    "normalized_text": "...",
    "skills": ["python", "fastapi", "postgresql", "docker"],
    "required_experience": 3,
    "required_education": 5,
    "has_language_requirement": true,
    "languages": {"francais": 0.85, "anglais": 0.65},
    "domain": {"primary": "it", "sub_domains": ["backend"]},
    "is_it_domain": true,
    "out_of_scope_reason": ""
  }
}
```

### Reponses erreur

- HTTP 400:

```json
{
  "success": false,
  "error": "Champ 'description' requis"
}
```

- HTTP 500:

```json
{
  "success": false,
  "error": "..."
}
```

## 4) Endpoint IA 2 - Matching CV

### Route
POST /api/match-cv

### Content-Type
multipart/form-data

### Champs form-data attendus

- cv: fichier PDF (obligatoire)
- processed_job: string JSON (obligatoire)

Important:
- processed_job doit etre exactement l'objet data renvoye par /api/process-job, serialise en JSON string.
- Le service IA ne lit pas un champ job_description sur cette route.

Exemple de valeur processed_job (en string JSON):

```json
{
  "normalized_text": "...",
  "skills": ["python", "fastapi"],
  "required_experience": 3,
  "required_education": 5,
  "has_language_requirement": true,
  "languages": {"anglais": 0.65},
  "domain": {"primary": "it", "sub_domains": ["backend"]},
  "is_it_domain": true,
  "out_of_scope_reason": ""
}
```

### Reponse succes (HTTP 200)

```json
{
  "cv_name": "cv.pdf",
  "contact": {
    "name": "...",
    "email": "...",
    "phone": "..."
  },
  "final_score": 81.4,
  "score_details": {
    "skills": 84.0,
    "experience": 72.0,
    "education": 90.0,
    "language": 100.0,
    "semantic": 78.9
  },
  "missing_skills": ["docker"],
  "skills": ["python", "fastapi", "sql"],
  "experience_years": 4.5,
  "education_level": 5
}
```

### Reponse out_of_scope (HTTP 400)

```json
{
  "success": false,
  "status": "out_of_scope",
  "reason": "CV hors domaine IT",
  "score": 0
}
```

### Reponses erreur (HTTP 400 / 500)

Exemples frequents:

```json
{
  "success": false,
  "error": "processed_job requis (JSON issu de /api/process-job)"
}
```

```json
{
  "success": false,
  "error": "Type de fichier non autorise (.docx). Seul le PDF est accepte."
}
```

```json
{
  "success": false,
  "error": "PDF illisible"
}
```

## 5) Mapping backend -> payload IA

Depuis backend/models/offreEmploi.model.js:
- offre.description -> description
- offre.langues (Array) -> langues (string, joindre par virgules)
- offre.exigences (Array) -> exigences (string, joindre par virgules)
- offre.niveauExperience -> niveauExperience
- offre.niveauEducation -> niveauEducation

Pour le matching:
- candidature.cv_url / req.file -> cv (fichier PDF)
- objet processed_job stocke pour l'offre -> processed_job (JSON stringify)

## 6) Sequence recommandee cote backend

1. Creation offre:
- appeler POST /api/process-job
- stocker la reponse data (objet complet) dans l'offre (ex: champ processedJobIA)

2. Creation candidature:
- recuperer processedJobIA depuis l'offre
- envoyer cv + JSON.stringify(processedJobIA) vers POST /api/match-cv
- stocker le rapport recu dans candidature.rapportIA et le score numerique dans candidature.scoreIA

Avantages:
- evite de reprocesser l'offre a chaque candidature
- assure un matching coherent sur une meme offre

## 7) Exemple Node.js (axios + form-data)

```js
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function processOffer(baseUrl, offre) {
  const payload = {
    description: offre.description || '',
    langues: Array.isArray(offre.langues) ? offre.langues.join(', ') : String(offre.langues || ''),
    exigences: Array.isArray(offre.exigences) ? offre.exigences.join(', ') : String(offre.exigences || ''),
    niveauExperience: String(offre.niveauExperience || ''),
    niveauEducation: String(offre.niveauEducation || '')
  };

  const { data } = await axios.post(`${baseUrl}/api/process-job`, payload, {
    headers: { 'Content-Type': 'application/json' }
  });

  return data.data; // objet processed_job a stocker
}

async function matchCv(baseUrl, cvPath, processedJob) {
  const form = new FormData();
  form.append('cv', fs.createReadStream(cvPath));
  form.append('processed_job', JSON.stringify(processedJob));

  const { data } = await axios.post(`${baseUrl}/api/match-cv`, form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  });

  return data;
}
```

## 8) Note de compatibilite importante

Le contrat actuel du service IA exige:
- /api/match-cv: champ processed_job

Si le backend envoie job_description au lieu de processed_job:
- la route retourne une erreur 400
- message: processed_job requis (JSON issu de /api/process-job)

## 9) Checklist integration

- Verifier IA_BASE_URL
- Verifier timeout IA_TIMEOUT_MS
- Appeler /api/process-job a la creation de l'offre
- Stocker data complet (pas uniquement normalized_text)
- Envoyer processed_job (JSON string) dans /api/match-cv
- Accepter les 2 formes de retour /api/match-cv:
  - succes 200 (rapport complet)
  - out_of_scope 400 (score = 0)
