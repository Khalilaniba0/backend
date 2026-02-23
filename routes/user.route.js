var express = require('express');
var router = express.Router();
const userController = require('../controllers/user.controller');
const logMiddleware = require('../middlewares/logMiddlewares');
const requireAuth = require('../middlewares/authMiddleware');
router.get('/getAllUsers',requireAuth,logMiddleware,userController.getAllUsers);
router.get('/getUserById/:id',requireAuth,logMiddleware,userController.getUserById);

router.post('/createcondidat',userController.createCondidat);
router.post('/createRh',userController.createRh);
router.post('/createAdmin',userController.createAdmin);

router.delete('/deleteUser/:id',userController.deleteUser);

router.put('/updateUser/:id',userController.updateUser);
router.post('/login',userController.login);
router.post('/logout',requireAuth,userController.logout);

module.exports = router;
