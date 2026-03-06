const mongose = require('mongoose');
const condidatureSchema = new mongose.Schema(
    {
        score_ia: Number,
        reponse: { type : String , enum : ['accepte','refuse', 'en attente'] , default : 'en attente' },
        user : { type: mongose.Schema.Types.ObjectId, ref: 'User', required: true },
        offre : { type: mongose.Schema.Types.ObjectId, ref: 'Offre', required: true }
    },{timestamps:true});
const Condidature = mongose.model('Condidature',condidatureSchema);
module.exports = Condidature;