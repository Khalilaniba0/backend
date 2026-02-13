var exppress = require('express');
var router = exppress.Router();
const offreEmploiController = require('../controllers/offreEmploi.controller');

router.get('/getAllOffres', offreEmploiController.getAllOffres);
router.get('/getOffreById/:id', offreEmploiController.getOffreById);
router.post('/createOffre', offreEmploiController.createOffre);
router.put('/updateOffre/:id', offreEmploiController.updateOffre);
router.put('/updateStatus/:id', offreEmploiController.updateStatus);
router.delete('/deleteOffre/:id', offreEmploiController.deleteOffre);

module.exports = router;
