const mongoose = require('mongoose');

const entretienSchema = new mongoose.Schema(
    {
        entreprise: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise', required: true },
        candidature: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidature', required: true },
        responsable: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
        dateEntretien: { type: Date, required: true, alias: 'date_entretien' },
        typeEntretien: { type: String, enum: ['telephone', 'visio', 'presentiel'], default: 'visio', alias: 'type_entretien' },
        duree: { type: Number, default: 30 },
        lienVisio: { type: String, alias: 'lien_visio' },
        commentaires: String,
        scoreEntretien: { type: Number, min: 0, max: 20, alias: 'score_entretien' },
        criteresEvaluation: [{
            critere: String,
            note: { type: Number, min: 0, max: 5 }
        }],
        reponse: { type: String, enum: ['accepte', 'refuse', 'en_attente'], default: 'en_attente' }
    },
    { timestamps: true }
);

entretienSchema.path('criteresEvaluation').options.alias = 'criteres_evaluation';
entretienSchema.set('toJSON', { virtuals: true });
entretienSchema.set('toObject', { virtuals: true });

const Entretien = mongoose.model('Entretien', entretienSchema, 'entretiens');
module.exports = Entretien;
