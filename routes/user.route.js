var express = require('express');
var router = express.Router();
const userController = require('../controllers/user.controller');
const logMiddleware = require('../middlewares/logMiddlewares');
const requireAuth = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/requireAdmin');


router.get('/getAllUsers',requireAuth,requireAdmin,logMiddleware,userController.getAllUsers);
router.get('/getUserById/:id',requireAuth,logMiddleware,userController.getUserById);

router.post('/createUser',userController.createUser);
router.post('/createRh',requireAuth,requireAdmin,userController.createRh);
router.post('/createAdmin',userController.createAdmin);

router.delete('/deleteUser/:id',requireAuth,requireAdmin,userController.deleteUser);

router.put('/updateUser/:id',requireAuth,userController.updateUser);
router.post('/login',userController.login);
router.post('/logout',requireAuth,userController.logout);

module.exports = router;
