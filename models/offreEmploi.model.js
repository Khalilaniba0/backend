const mongoose = require('mongoose');

const offreEmploiSchema = new mongoose.Schema(
    {
        poste: { type: String, alias: 'post' },
        description: String,
        statut: { type: String, enum: ['open', 'closed'], default: 'open', alias: 'status' },
        entreprise: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise', required: true },
        responsable: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
        exigences: { type: [String], alias: 'requirements' },
        typeContrat: { type: String, enum: ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance'], default: 'CDI' },
        salaireMin: Number,
        salaireMax: Number,
        localisation: String,
        modeContrat: { type: String, enum: ['presentiel', 'hybride', 'remote'], default: 'presentiel' },
        departement: String,
        dateLimite: Date,
        niveauExperience: { type: String, enum: ['junior', 'mid', 'senior'], default: 'junior' }
    },
    { timestamps: true }
);

offreEmploiSchema.set('toJSON', { virtuals: true });
offreEmploiSchema.set('toObject', { virtuals: true });

const OffreEmploi = mongoose.model('OffreEmploi', offreEmploiSchema, 'offreemplois');
module.exports = OffreEmploi;
