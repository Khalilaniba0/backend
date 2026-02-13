const mongose = require('mongoose');
const condidatureSchema = new mongose.Schema(
    {
        score_ia: Number
    },{timestamps:true});
const Condidature = mongose.model('Condidature',condidatureSchema);
module.exports = Condidature;