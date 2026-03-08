const express = require('express');
const router = express.Router();
const entretienController = require('../controllers/entretien.controller');
const requireAuth = require('../middlewares/authMiddleware');
const requireRhOrAdmin = require('../middlewares/requireRhOrAdmin');

router.get('/getAllEntretiens', requireAuth,entretienController.getAllEntretiens);
router.get('/getEntretienById/:id', requireAuth,entretienController.getEntretienById);
router.post('/createEntretien', requireAuth,entretienController.createEntretien);
router.put('/updateEntretien/:id', requireAuth,requireRhOrAdmin,entretienController.updateEntretien);
router.delete('/deleteEntretien/:id', requireAuth,requireRhOrAdmin,entretienController.deleteEntretien);
module.exports = router;