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
        localisation: String,
        modeContrat: { type: String, enum: ['presentiel', 'hybride', 'remote'], default: 'presentiel' },
        niveauExperience: { type: String, enum: ['junior', 'senior'], default: 'junior' }
    },
    { timestamps: true }
);

offreEmploiSchema.set('toJSON', { virtuals: true });
offreEmploiSchema.set('toObject', { virtuals: true });

const OffreEmploi = mongoose.model('OffreEmploi', offreEmploiSchema, 'offreemplois');
module.exports = OffreEmploi;
