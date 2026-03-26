var express = require('express');
var router = express.Router();
const offreEmploiController = require('../controllers/offreEmploi.controller');
const requireAuth = require('../middlewares/authMiddleware');
const requireRhOrAdmin = require('../middlewares/requireRhOrAdmin');
const requireTenant = require('../middlewares/requireTenant');

router.get('/getAll', offreEmploiController.getAllOffres);
router.get('/getById/:id', offreEmploiController.getOffreById);
router.post('/create', requireAuth, requireRhOrAdmin, requireTenant, offreEmploiController.createOffre);
router.put('/update/:id', requireAuth, requireRhOrAdmin, requireTenant, offreEmploiController.updateOffre);
router.put('/updateStatus/:id', requireAuth, requireRhOrAdmin, requireTenant, offreEmploiController.updateStatus);
router.delete('/deleteById/:id', requireAuth, requireRhOrAdmin, requireTenant, offreEmploiController.deleteOffre);

module.exports = router;
