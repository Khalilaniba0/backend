var express = require('express');
var router = express.Router();
const cvController = require('../controllers/cv.controller');
router.get('/getAllCVs', cvController.getAllCVs);
router.get('/getCVById/:id',cvController.getCVById);
router.post('/createCV',cvController.createCV);
router.delete('/deleteCV/:id',cvController.deleteCV);
router.put('/updateCV/:id',cvController.updateCV);
module.exports = router;