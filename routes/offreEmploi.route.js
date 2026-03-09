var express = require('express');
var router = express.Router();
const offreEmploiController = require('../controllers/offreEmploi.controller');
const requireAuth = require('../middlewares/authMiddleware');
const requireRhOrAdmin = require('../middlewares/requireRhOrAdmin');

router.get('/getAll', offreEmploiController.getAllOffres);
router.get('/getById/:id', offreEmploiController.getOffreById);
router.post('/create', requireAuth, requireRhOrAdmin, offreEmploiController.createOffre);
router.put('/update/:id',requireAuth, requireRhOrAdmin, offreEmploiController.updateOffre);
router.put('/updateStatus/:id',requireAuth, requireRhOrAdmin, offreEmploiController.updateStatus);
router.delete('/deleteById/:id', requireAuth, requireRhOrAdmin, offreEmploiController.deleteOffre);

module.exports = router;
