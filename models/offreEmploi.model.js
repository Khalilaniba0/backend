const mongoose = require('mongoose');

const offreEmploiSchema = new mongoose.Schema(
    {
        poste: { type: String, alias: 'post' },
        description: String,
        statut: { type: String, enum: ['open', 'closed'], default: 'open', alias: 'status' },
        entreprise: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise', required: true },
        responsable: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
        exigences: { type: [String], alias: 'requirements' },
        langues: { type: [String], default: [] },
        typeContrat: { type: String, enum: ['CDI', 'CDD', 'Stage', 'Freelance'], default: 'CDI' },
        modeContrat: { type: String, enum: ['presentiel', 'hybride', 'remote'], default: 'presentiel' },
        niveauEducation: { type: String },
        // Accept legacy levels (junior/senior) and numeric values sent by frontend form.
        niveauExperience: {
            type: String,
            default: null,
            set: (value) => {
                if (value === undefined || value === null) return null;
                const normalized = String(value).trim();
                return normalized === '' ? null : normalized;
            }
        },
        processedJobIA: { type: Object, default: null },
        iaOutOfScope: { type: Boolean, default: false }
    },
    { timestamps: true }
);

offreEmploiSchema.set('toJSON', { virtuals: true });
offreEmploiSchema.set('toObject', { virtuals: true });

const OffreEmploi = mongoose.model('OffreEmploi', offreEmploiSchema, 'offreemplois');
module.exports = OffreEmploi;
