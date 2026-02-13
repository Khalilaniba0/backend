const mongose = require('mongoose');
const cvSchema = new mongose.Schema(
    {
        profil : String
    },{timestamps:true});
const Cv = mongose.model('Cv',cvSchema);
module.exports = Cv;