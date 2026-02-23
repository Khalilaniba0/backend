const mongose = require('mongoose');
const offreEmploiSchema = new mongose.Schema(
    {
        post: String,
        description : String,
        status : { type : String , enum : ['open' ,'closed'] , default : 'open' },
        //kifech nthbet ili user rh wla le 
        responsable: { type: mongose.Schema.Types.ObjectId, ref: 'User' }
    },{timestamps:true});
const OffreEmploi = mongose.model('OffreEmploi',offreEmploiSchema);
module.exports = OffreEmploi;
