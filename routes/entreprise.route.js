const express = require('express');
const router = express.Router();
const entrepriseController = require('../controllers/entreprise.controller');
const requireAuth = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/requireAdmin');
const requireTenant = require('../middlewares/requireTenant');

router.post('/registerEntreprise', entrepriseController.registerEntreprise);
router.get('/getMyEntreprise', requireAuth, requireAdmin, requireTenant, entrepriseController.getMyEntreprise);
router.put('/updateEntreprise', requireAuth, requireAdmin, requireTenant, entrepriseController.updateEntreprise);
router.delete('/deleteEntreprise', requireAuth, requireAdmin, requireTenant, entrepriseController.deleteEntreprise);

module.exports = router;
