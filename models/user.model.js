const mongose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongose.Schema(
    {
        name: String,
        email: { type: String, required: [true, 'Email is required'], lowercase: true , unique: true , match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/},
        password : String,
        role : { type : String , enum : ['user' ,'rh', 'admin'] , default : 'user' }
    },{timestamps:true});
userSchema.pre('save', async function(next) {
    try {
        
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }});
    
const User = mongose.model('User',userSchema);
module.exports = User;        