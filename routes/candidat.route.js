const express = require('express');
const router = express.Router();
const requireCandidat = require('../middlewares/requireCandidat');
const {
  inscrire,
  connecter,
  deconnecter,
  monProfil,
  mettreAJourProfil
} = require('../controllers/candidat.controller');

// Public
router.post('/inscrire', inscrire);
router.post('/connecter', connecter);

// Protege candidat
router.post('/deconnecter', requireCandidat, deconnecter);
router.get('/monProfil', requireCandidat, monProfil);
router.put('/mettreAJourProfil', requireCandidat, mettreAJourProfil);

module.exports = router;