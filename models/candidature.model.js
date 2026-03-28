const mongoose = require('mongoose');

const candidatureSchema = new mongoose.Schema({
    candidat: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidat', required: true },
    nom: { type: String, required: true },
    email: { type: String, required: true },
    telephone: { type: String },
    cv_url: { type: String },
    lettreMotivation: { type: String, alias: 'lettre_motivation' },
    entreprise: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise', required: true },
    offre: { type: mongoose.Schema.Types.ObjectId, ref: 'OffreEmploi', required: true },
    scoreIA: { type: Number, default: null, alias: 'score_ia' },
    etape: {
        type: String,
        enum: ['soumise', 'preselectionne', 'entretien_planifie', 'entretien_passe', 'accepte', 'refuse'],
        default: 'soumise'
    },
}, { timestamps: true });

candidatureSchema.set('toJSON', { virtuals: true });
candidatureSchema.set('toObject', { virtuals: true });

const Candidature = mongoose.model('Candidature', candidatureSchema, 'candidatures');
module.exports = Candidature;
