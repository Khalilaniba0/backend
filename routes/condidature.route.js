var express = require('express');
var router  = express.Router();
const condidatureController = require('../controllers/condidature.controller');
router.get('/getAllCondidatures', condidatureController.getAllCondidatures);
router.get('/getCondidatureById/:id',condidatureController.getCondidatureById);
module.exports = router;