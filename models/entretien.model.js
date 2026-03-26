const mongose = require('mongoose');
const entretienSchema = new mongose.Schema(
    {
        entreprise: { type: mongose.Schema.Types.ObjectId, ref: 'Entreprise', required: true },
        candidature: { type: mongose.Schema.Types.ObjectId, ref: 'Condidature', required: true },
        responsable: { type: mongose.Schema.Types.ObjectId, ref: 'User', required: true },
        date_entretien: { type: Date, required: true },
        type_entretien: { type: String, enum: ['telephone', 'visio', 'presentiel'], default: 'visio' },
        duree: { type: Number, default: 30 },
        lien_visio: String,
        commentaires: String,
        score_entretien: { type: Number, min: 0, max: 20 },
        criteres_evaluation: [{
            critere: String,
            note: { type: Number, min: 0, max: 5 }
        }],
        reponse: { type: String, enum: ['accepte', 'refuse', 'en attente'], default: 'en attente' }
    }, { timestamps: true });
const Entretien = mongose.model('Entretien', entretienSchema);
module.exports = Entretien;
