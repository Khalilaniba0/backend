const express = require('express');
const router = express.Router();
const entretienController = require('../controllers/entretien.controller');
const requireAuth = require('../middlewares/authMiddleware');
const requireRhOrAdmin = require('../middlewares/requireRhOrAdmin');

router.get('/getAll', requireAuth, requireRhOrAdmin, entretienController.getAllEntretiens);
router.get('/getById/:id', requireAuth, requireRhOrAdmin, entretienController.getEntretienById);
router.post('/create', requireAuth, requireRhOrAdmin, entretienController.createEntretien);
router.put('/update/:id', requireAuth, requireRhOrAdmin, entretienController.updateEntretien);
router.delete('/deleteById/:id', requireAuth, requireRhOrAdmin, entretienController.deleteEntretien);

module.exports = router;
