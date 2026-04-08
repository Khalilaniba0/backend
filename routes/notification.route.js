const express = require('express');
const router = express.Router();

const requireAuth = require('../middlewares/authMiddleware');
const requireCandidat = require('../middlewares/requireCandidat');
const requireTenant = require('../middlewares/requireTenant');
const notificationController = require('../controllers/notification.controller');

router.get('/getNotificationsByCandidat/:candidatId', requireCandidat, notificationController.getNotificationsByCandidat);
//router.get('/getPendingNotifications', requireAuth, requireTenant, notificationController.getPendingNotifications);
router.post('/createNotification', requireAuth, requireTenant, notificationController.createNotification);
router.put('/markAsSent/:id', requireAuth, requireTenant, notificationController.markAsSent);
router.put('/markAsRead/:id', requireCandidat, notificationController.markAsRead);
router.delete('/deleteNotification/:id', requireCandidat, notificationController.deleteNotification);

module.exports = router;
