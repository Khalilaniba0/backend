var express = require('express');
var router = express.Router();
const condidatureController = require('../controllers/condidature.controller');
const requireAuth = require('../middlewares/authMiddleware');
const requireRhOrAdmin = require('../middlewares/requireRhOrAdmin');
const uploadfile = require('../middlewares/uploadfile');

// Public routes 
router.post('/postuler', uploadfile.single('cv_url'), condidatureController.createCondidature);
router.get('/suivi/:token', condidatureController.getCondidatureBySuivi);

// Protected routes
router.get('/getAll', requireAuth, requireRhOrAdmin, condidatureController.getAllCondidatures);
router.get('/getById/:id', requireAuth, requireRhOrAdmin, condidatureController.getCondidatureById);
router.get('/getByOffre/:offreId', requireAuth, requireRhOrAdmin, condidatureController.getCondidaturesByOffre);
router.put('/updateEtape/:id', requireAuth, requireRhOrAdmin, condidatureController.updateEtape);
router.delete('/deleteById/:id', requireAuth, requireRhOrAdmin, condidatureController.deleteCondidature);

module.exports = router;
