const mongose = require('mongoose');
const entretienSchema = new mongose.Schema(
    {
        date_entretien : Date
    },{timestamps:true});
const Entretien = mongose.model('Entretien',entretienSchema);
module.exports = Entretien;