var express = require('express');
var router = express.Router();
const userController = require('../controllers/user.controller');
const logMiddleware = require('../middlewares/logMiddlewares');
const requireAuth = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/requireAdmin');
const requireTenant = require('../middlewares/requireTenant');

router.get('/getAllUsers', requireAuth, requireAdmin, requireTenant, logMiddleware, userController.getAllUsers);
router.get('/getUserById/:id', requireAuth, requireTenant, logMiddleware, userController.getUserById);

router.post('/createRh', requireAuth, requireAdmin, requireTenant, userController.createRh);
router.post('/createAdmin', requireAuth, requireAdmin, requireTenant, userController.createAdmin);


router.delete('/deleteUser/:id', requireAuth, requireAdmin, requireTenant, userController.deleteUser);

router.put('/updateUser/:id', requireAuth, requireTenant, userController.updateUser);
router.post('/login', userController.login);
router.post('/logout', requireAuth, userController.logout);

module.exports = router;
