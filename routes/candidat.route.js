const express = require('express');
const router = express.Router();
const requireCandidat = require('../middlewares/requireCandidat');
const uploadfile = require('../middlewares/uploadfile');
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
router.put('/mettreAJourProfil', requireCandidat, uploadfile.single('cv_url'), mettreAJourProfil);

module.exports = router;