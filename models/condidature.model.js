const mongose = require('mongoose');
const condidatureSchema = new mongose.Schema(
    {
        nom: { type: String, required: true },
        email: { type: String, required: true, match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ },
        telephone: String,
        cv_url: String,
        lettre_motivation: String,
        entreprise: { type: mongose.Schema.Types.ObjectId, ref: 'Entreprise', required: true },
        offre: { type: mongose.Schema.Types.ObjectId, ref: 'OffreEmploi', required: true },
        score_ia: { type: Number, default: null },
        etape: {
            type: String,
            enum: ['soumise', 'preselectionne', 'entretien_planifie', 'entretien_passe', 'accepte', 'refuse'],
            default: 'soumise'
        },
        tokenSuivi: { type: String, unique: true }
    }, { timestamps: true });
const Condidature = mongose.model('Condidature', condidatureSchema);
module.exports = Condidature;
