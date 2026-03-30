const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    candidat: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidat', required: true },
    candidature: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidature', required: true },
    type: {
        type: String,
        enum: ['etape_avancement', 'entretien_planifie', 'refus', 'suppression', 'offre_acceptee'],
        required: true
    },
    message: { type: String, required: true },
    etapeSource: { type: String },
    etapeCible: { type: String },
    dateEntretien: { type: Date },
    typeEntretien: { type: String, enum: ['telephone', 'visio', 'presentiel'] },
    statut: { type: String, enum: ['en_attente', 'envoyee', 'lue'], default: 'en_attente' },
    datePrevueEnvoi: { type: Date, default: () => new Date(Date.now() + 10 * 60 * 1000) },
    dateEnvoi: { type: Date },
    entreprise: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise', required: true }
}, { timestamps: true });

notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

const Notification = mongoose.model('Notification', notificationSchema, 'notifications');
module.exports = Notification;
