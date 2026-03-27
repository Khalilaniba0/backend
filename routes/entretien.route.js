const express = require('express');
const router = express.Router();
const entretienController = require('../controllers/entretien.controller');
const requireAuth = require('../middlewares/authMiddleware');
const requireTenant = require('../middlewares/requireTenant');

router.get('/getAllEntretiens', requireAuth, requireTenant, entretienController.getAllEntretiens);
router.get('/getEntretienById/:id', requireAuth, requireTenant, entretienController.getEntretienById);
router.post('/createEntretien', requireAuth, requireTenant, entretienController.createEntretien);
router.put('/updateEntretien/:id', requireAuth, requireTenant, entretienController.updateEntretien);
router.delete('/deleteEntretienById/:id', requireAuth, requireTenant, entretienController.deleteEntretien);

module.exports = router;
