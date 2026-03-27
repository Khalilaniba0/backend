var express = require('express');
var router = express.Router();
const utilisateurController = require('../controllers/utilisateur.controller');
const logMiddleware = require('../middlewares/logMiddlewares');
const requireAuth = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/requireAdmin');
const requireTenant = require('../middlewares/requireTenant');

router.get('/getAllUsers', requireAuth, requireAdmin, requireTenant, logMiddleware, utilisateurController.getAllUsers);
router.get('/getUserById/:id', requireAuth, requireTenant, logMiddleware, utilisateurController.getUserById);

router.post('/createRh', requireAuth, requireAdmin, requireTenant, utilisateurController.createRh);
router.post('/createAdmin', requireAuth, requireAdmin, requireTenant, utilisateurController.createAdmin);


router.delete('/deleteUser/:id', requireAuth, requireAdmin, requireTenant, utilisateurController.deleteUser);

router.put('/updateUser/:id', requireAuth, requireTenant, utilisateurController.updateUser);
router.post('/login', utilisateurController.login);
router.post('/logout', requireAuth, utilisateurController.logout);

module.exports = router;
