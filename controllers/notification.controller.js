const notificationModel = require('../models/notification.model');
const candidatureModel = require('../models/candidature.model');
const { buildNotificationMessage } = require('../utils/notificationMessage');

const getPosteFromCandidature = (candidature) => {
    if (!candidature || !candidature.offre) return null;
    return candidature.offre.poste || candidature.offre.post || null;
};

module.exports.getNotificationsByCandidat = async (req, res) => {
    try {
        const candidatId = req.candidatId || req.params.candidatId;

        if (!candidatId) {
            return res.status(400).json({ message: 'candidatId is required' });
        }

        if (req.candidatId && String(req.params.candidatId) !== String(req.candidatId)) {
            return res.status(403).json({ message: 'Access denied: cannot access notifications of another candidate' });
        }

        const filter = { candidat: candidatId };
        if (req.entrepriseId) {
            filter.entreprise = req.entrepriseId;
        }

        const notifications = await notificationModel
            .find(filter)
            .populate('candidature', 'etape offre')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Notifications recuperees avec succes',
            data: notifications
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports.getPendingNotifications = async (req, res) => {
    try {
        if (!req.entrepriseId) {
            return res.status(403).json({ message: 'Access denied: tenant is required' });
        }

        const notifications = await notificationModel
            .find({
                entreprise: req.entrepriseId,
                statut: 'en_attente',
                datePrevueEnvoi: { $lte: new Date() }
            })
            .sort({ datePrevueEnvoi: 1 });

        return res.status(200).json({
            message: 'Notifications en attente recuperees avec succes',
            data: notifications
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports.createNotification = async (req, res) => {
    try {
        if (!req.entrepriseId) {
            return res.status(403).json({ message: 'Access denied: tenant is required' });
        }

        const {
            candidat,
            candidature,
            type,
            message,
            etapeSource,
            etapeCible,
            dateEntretien,
            typeEntretien,
            datePrevueEnvoi
        } = req.body;

        if (!candidat || !candidature || !type) {
            return res.status(400).json({ message: 'candidat, candidature et type sont requis.' });
        }

        const candidatureDoc = await candidatureModel
            .findOne({ _id: candidature, entreprise: req.entrepriseId })
            .populate('offre', 'poste post');

        if (!candidatureDoc) {
            return res.status(404).json({ message: 'Candidature not found' });
        }

        const poste = getPosteFromCandidature(candidatureDoc);
        const messageFinal = message || buildNotificationMessage({
            type,
            poste,
            etapeCible,
            dateEntretien,
            typeEntretien
        });

        const notification = await notificationModel.create({
            candidat,
            candidature,
            type,
            message: messageFinal,
            etapeSource,
            etapeCible,
            dateEntretien,
            typeEntretien,
            datePrevueEnvoi: datePrevueEnvoi ? new Date(datePrevueEnvoi) : undefined,
            entreprise: req.entrepriseId
        });

        return res.status(201).json({
            message: 'Notification creee avec succes',
            data: notification
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports.markAsSent = async (req, res) => {
    try {
        if (!req.entrepriseId) {
            return res.status(403).json({ message: 'Access denied: tenant is required' });
        }

        const notification = await notificationModel.findOneAndUpdate(
            { _id: req.params.id, entreprise: req.entrepriseId },
            { statut: 'envoyee', dateEnvoi: new Date() },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        return res.status(200).json({
            message: 'Notification marquee comme envoyee',
            data: notification
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports.markAsRead = async (req, res) => {
    try {
        const filter = { _id: req.params.id };
        if (req.candidatId) {
            filter.candidat = req.candidatId;
        } else if (req.entrepriseId) {
            filter.entreprise = req.entrepriseId;
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }

        const notification = await notificationModel.findOneAndUpdate(
            filter,
            { statut: 'lue' },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        return res.status(200).json({
            message: 'Notification marquee comme lue',
            data: notification
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports.deleteNotification = async (req, res) => {
    try {
        const filter = { _id: req.params.id };
        if (req.candidatId) {
            filter.candidat = req.candidatId;
        } else if (req.entrepriseId) {
            filter.entreprise = req.entrepriseId;
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }

        const notification = await notificationModel.findOneAndDelete(filter);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        return res.status(200).json({ message: 'Notification supprimee avec succes' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
