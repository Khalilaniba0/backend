var express = require('express');
var router = express.Router();
const offreEmploiController = require('../controllers/offreEmploi.controller');
const requireAuth = require('../middlewares/authMiddleware');
const requireRhOrAdmin = require('../middlewares/requireRhOrAdmin');

router.get('/getAllOffres', offreEmploiController.getAllOffres);
router.get('/getOffreById/:id', offreEmploiController.getOffreById);
router.post('/createOffre', requireAuth, requireRhOrAdmin, offreEmploiController.createOffre);
router.put('/updateOffre/:id',requireAuth, requireRhOrAdmin, offreEmploiController.updateOffre);
router.put('/updateStatus/:id',requireAuth, requireRhOrAdmin, offreEmploiController.updateStatus);
router.delete('/deleteOffre/:id', requireAuth, requireRhOrAdmin, offreEmploiController.deleteOffre);

module.exports = router;
