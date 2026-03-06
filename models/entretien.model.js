const mongose = require('mongoose');
const entretienSchema = new mongose.Schema(
    {
        date_entretien : Date,
        reponse: { 
        type: String, 
        enum: ['accepte', 'refuse', 'en attente'], 
        default: 'en attente' 
    },
        user : { type: mongose.Schema.Types.ObjectId, ref: 'Condidature' },
        responsable : { type: mongose.Schema.Types.ObjectId, ref: 'User' }
    },{timestamps:true});
const Entretien = mongose.model('Entretien',entretienSchema);
module.exports = Entretien;