const mongose = require('mongoose');
const notificationSchema = new mongose.Schema(
    {
        destinataire: { type: mongose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: ['nouvelle_candidature', 'entretien_planifie', 'resultat_entretien', 'candidat_accepte', 'candidat_refuse', 'alerte_contrat']
        },
        titre: String,
        message: String,
        lien: String,
        lu: { type: Boolean, default: false }
    }, { timestamps: true });
const Notification = mongose.model('Notification', notificationSchema);
module.exports = Notification;
