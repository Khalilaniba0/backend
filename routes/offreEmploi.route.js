var express = require('express');
var router = express.Router();
const offreEmploiController = require('../controllers/offreEmploi.controller');
const requireAuth = require('../middlewares/authMiddleware');
const requireTenant = require('../middlewares/requireTenant');

router.get('/getAllOffres', offreEmploiController.getAllOffres);
router.get('/getOffresDisponibles', offreEmploiController.getOffresDisponibles);
router.get('/getOffresByEntreprise', requireAuth, requireTenant, offreEmploiController.getOffresByEntreprise);
router.get('/getOffresByEntreprise/:entrepriseId', requireAuth, requireTenant, offreEmploiController.getOffresByEntrepriseId);
router.get('/getOffreById/:id', offreEmploiController.getOffreById);
router.post('/createOffre', requireAuth, requireTenant, offreEmploiController.createOffre);
router.put('/updateOffre/:id', requireAuth, requireTenant, offreEmploiController.updateOffre);
router.put('/updateOffreStatus/:id', requireAuth, requireTenant, offreEmploiController.updateStatus);
router.delete('/deleteOffreById/:id', requireAuth, requireTenant, offreEmploiController.deleteOffre);

module.exports = router;
