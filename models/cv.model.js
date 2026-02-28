const mongose = require('mongoose');
const cvSchema = new mongose.Schema(
    {
        cv_url : String,
        user : { type: mongose.Schema.Types.ObjectId, ref: 'User' }    
    },{timestamps:true});
const Cv = mongose.model('Cv',cvSchema);
module.exports = Cv;