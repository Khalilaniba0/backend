const express = require('express');
const router = express.Router();
const entretienController = require('../controllers/entretien.controller');
const requireAuth = require('../middlewares/authMiddleware');
const requireRhOrAdmin = require('../middlewares/requireRhOrAdmin');
const requireTenant = require('../middlewares/requireTenant');

router.get('/getAll', requireAuth, requireRhOrAdmin, requireTenant, entretienController.getAllEntretiens);
router.get('/getById/:id', requireAuth, requireRhOrAdmin, requireTenant, entretienController.getEntretienById);
router.post('/create', requireAuth, requireRhOrAdmin, requireTenant, entretienController.createEntretien);
router.put('/update/:id', requireAuth, requireRhOrAdmin, requireTenant, entretienController.updateEntretien);
router.delete('/deleteById/:id', requireAuth, requireRhOrAdmin, requireTenant, entretienController.deleteEntretien);

module.exports = router;
