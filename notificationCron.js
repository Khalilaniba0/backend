const cron = require('node-cron');
const notificationModel = require('./models/notification.model');

let notificationCronTask = null;

const runNotificationDispatch = async () => {
    const now = new Date();
    const notifications = await notificationModel.find({
        statut: 'en_attente',
        datePrevueEnvoi: { $lte: now }
    });

    for (const notification of notifications) {
        try {
            // Simulation d'envoi (peut etre remplace par nodemailer)
            console.log(`[NotificationCron] Envoi notification ${notification._id} -> candidat ${notification.candidat}`);

            notification.statut = 'envoyee';
            notification.dateEnvoi = new Date();
            await notification.save();
        } catch (error) {
            console.error(`[NotificationCron] Erreur lors de l'envoi ${notification._id}:`, error.message);
        }
    }
};

const startNotificationCron = () => {
    if (notificationCronTask) {
        return notificationCronTask;
    }

    notificationCronTask = cron.schedule('* * * * *', async () => {
        try {
            await runNotificationDispatch();
        } catch (error) {
            console.error('[NotificationCron] Erreur globale:', error.message);
        }
    });

    return notificationCronTask;
};

module.exports = {
    startNotificationCron,
    runNotificationDispatch
};
