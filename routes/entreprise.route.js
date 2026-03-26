const express = require('express');
const router = express.Router();
const entrepriseController = require('../controllers/entreprise.controller');
const requireAuth = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/requireAdmin');
const requireTenant = require('../middlewares/requireTenant');

router.post('/register', entrepriseController.registerEntreprise);
router.get('/me', requireAuth, requireAdmin, requireTenant, entrepriseController.getMyEntreprise);
router.put('/update', requireAuth, requireAdmin, requireTenant, entrepriseController.updateEntreprise);
router.delete('/delete', requireAuth, requireAdmin, requireTenant, entrepriseController.deleteEntreprise);

module.exports = router;
