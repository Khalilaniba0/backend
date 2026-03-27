const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/authMiddleware');
const requireTenant = require('../middlewares/requireTenant');
const requireCandidat = require('../middlewares/requireCandidat');
const upload = require('../middlewares/uploadfile');
const {
	postuler,
	getCandidatureBySuivi,
	mesCandidatures,
	annulerCandidature,
	modifierCandidature,
	getAllCandidatures,
	getCandidatureById,
	getCandidaturesByOffre,
	updateCandidatureEtape,
	deleteCandidatureById
} = require('../controllers/candidature.controller');

// Public
router.get('/getCondidatureBySuivi/:token', getCandidatureBySuivi);

// Protege candidat
router.post('/postuler', requireCandidat, upload.single('cv_url'), postuler);
router.get('/mesCandidatures', requireCandidat, mesCandidatures);
router.delete('/annuler/:id', requireCandidat, annulerCandidature);
router.put('/modifier/:id', requireCandidat, modifierCandidature);

// Protege RH/Admin
router.get('/getAllCondidatures', requireAuth, requireTenant, getAllCandidatures);
router.get('/getCondidatureById/:id', requireAuth, requireTenant, getCandidatureById);
router.get('/getCondidaturesByOffre/:offreId', requireAuth, requireTenant, getCandidaturesByOffre);
router.put('/updateCondidatureEtape/:id', requireAuth, requireTenant, updateCandidatureEtape);
router.delete('/deleteCondidatureById/:id', requireAuth, requireTenant, deleteCandidatureById);

module.exports = router;
