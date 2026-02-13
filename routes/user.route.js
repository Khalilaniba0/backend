var express = require('express');
var router = express.Router();
const userController = require('../controllers/user.controller');


router.get('/getAllUsers', userController.getAllUsers);
router.get('/getUserById/:id',userController.getUserById);

router.post('/createUser',userController.createUser);

router.delete('/deleteUser/:id',userController.deleteUser);

router.put('/updateUser/:id',userController.updateUser);



module.exports = router;
