const mongose = require('mongoose');
const offreEmploiSchema = new mongose.Schema(
    {
        post: String,
        description : String,
        status : { type : String , enum : ['open' ,'closed'] , default : 'open' }
    },{timestamps:true});
const OffreEmploi = mongose.model('OffreEmploi',offreEmploiSchema);
module.exports = OffreEmploi;
