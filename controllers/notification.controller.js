const notificationModel = require('../models/notification.model');

const createNotification = async (destinataire, type, titre, message, lien) => {
    try {
        const notification = new notificationModel({
            destinataire,
            type,
            titre,
            message,
            lien
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error.message);
    }
};

module.exports.createNotification = createNotification;

module.exports.getMyNotifications = async (req, res) => {
    try {
        const notifications = await notificationModel.find({ destinataire: req.user._id })
            .sort({ createdAt: -1 });
        res.status(200).json({ message: "Notifications retrieved successfully", data: notifications });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.getUnreadCount = async (req, res) => {
    try {
        const count = await notificationModel.countDocuments({ destinataire: req.user._id, lu: false });
        res.status(200).json({ data: { count } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.markAsRead = async (req, res) => {
    try {
        const notification = await notificationModel.findOneAndUpdate(
            { _id: req.params.id, destinataire: req.user._id },
            { lu: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        res.status(200).json({ message: "Notification marked as read", data: notification });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.markAllAsRead = async (req, res) => {
    try {
        await notificationModel.updateMany(
            { destinataire: req.user._id, lu: false },
            { lu: true }
        );
        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
