
//pas encore utilisé 
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const requireAuth = require('../middlewares/authMiddleware');

router.get('/mine', requireAuth, notificationController.getMyNotifications);
router.get('/unreadCount', requireAuth, notificationController.getUnreadCount);
router.put('/read/:id', requireAuth, notificationController.markAsRead);
router.put('/readAll', requireAuth, notificationController.markAllAsRead);

module.exports = router;
