var express = require('express');
var router = express.Router();
const upload = require('../middlewares/uploadfile');
const cvController = require('../controllers/cv.controller');
const requireAuth = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/requireAdmin');
const requireOwner = require('../middlewares/requireOwner');
const cvModel = require('../models/cv.model');

router.get('/getAllCVs', requireAuth, requireAdmin, cvController.getAllCVs);
router.get('/getCVById/:id', requireAuth, cvController.getCVById);
router.post('/uploadCV/:id', requireAuth, requireOwner(cvModel), upload.single('cv_url'), cvController.uploadCV);
router.delete('/deleteCV/:id', requireAuth, cvController.deleteCV);
module.exports = router;