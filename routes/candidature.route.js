const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/authMiddleware');
const requireTenant = require('../middlewares/requireTenant');
const requireCandidat = require('../middlewares/requireCandidat');
const upload = require('../middlewares/uploadfile');
const {
	postuler,
	mesCandidatures,
	annulerCandidature,
	modifierCandidature,
	getAllCandidatures,
	getCandidatureById,
	getCandidaturesByOffre,
	updateCandidatureEtape,
	deleteCandidatureById
} = require('../controllers/candidature.controller');


// Protege candidat
router.post('/postuler', requireCandidat, upload.single('cv_url'), postuler);
router.get('/mesCandidatures', requireCandidat, mesCandidatures);
router.delete('/annuler/:id', requireCandidat, annulerCandidature);
router.put('/modifier/:id', requireCandidat, modifierCandidature);

// Protege RH/Admin
router.get('/getAllCandidatures', requireAuth, requireTenant, getAllCandidatures);
router.get('/getCandidatureById/:id', requireAuth, requireTenant, getCandidatureById);
router.get('/getCandidaturesByOffre/:offreId', requireAuth, requireTenant, getCandidaturesByOffre);
router.put('/updateCandidatureEtape/:id', requireAuth, requireTenant, updateCandidatureEtape);
router.delete('/deleteCandidatureById/:id', requireAuth, requireTenant, deleteCandidatureById);

module.exports = router;
