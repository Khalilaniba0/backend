const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const requireAuth = require('../middlewares/authMiddleware');
const requireRhOrAdmin = require('../middlewares/requireRhOrAdmin');

router.get('/getAll', requireAuth, requireRhOrAdmin, employeeController.getAllEmployees);
router.get('/myProfile', requireAuth, employeeController.getMyProfile);
router.get('/stats', requireAuth, requireRhOrAdmin, employeeController.getStats);
router.get('/byDepartement/:dep', requireAuth, requireRhOrAdmin, employeeController.getByDepartement);
router.get('/getById/:id', requireAuth, employeeController.getEmployeeById);
router.post('/create', requireAuth, requireRhOrAdmin, employeeController.createEmployee);
router.put('/update/:id', requireAuth, requireRhOrAdmin, employeeController.updateEmployee);
router.put('/updateStatut/:id', requireAuth, requireRhOrAdmin, employeeController.updateStatut);

module.exports = router;
