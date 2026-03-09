const mongose = require('mongoose');
const offreEmploiSchema = new mongose.Schema(
    {
        post: String,
        description : String,
        status : { type : String , enum : ['open' ,'closed'] , default : 'open' },
        responsable: { type: mongose.Schema.Types.ObjectId, ref: 'User' },
        requirements: [String],
        typeContrat: { type: String, enum: ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance'], default: 'CDI' },
        salaireMin: Number,
        salaireMax: Number,
        localisation: String,
        modeContrat: { type: String, enum: ['presentiel', 'hybride', 'remote'], default: 'presentiel' },
        departement: String,
        dateLimite: Date,
        niveauExperience: { type: String, enum: ['junior', 'mid', 'senior'], default: 'junior' }
    },{timestamps:true});
const OffreEmploi = mongose.model('OffreEmploi',offreEmploiSchema);
module.exports = OffreEmploi;
