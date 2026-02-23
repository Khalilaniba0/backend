const mongose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongose.Schema(
    {
        name: String,
        email: { type: String, required: [true, 'Email is required'], lowercase: true , unique: true , match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/},
        password : String,
        role : { type : String , enum : ['user' ,'rh', 'admin'] , default : 'user' },
        tel: String,
        block: { type: Boolean, default: false }, 
        cv : [{ type: mongose.Schema.Types.ObjectId, ref: 'Cv' }]
    },{timestamps:true});
userSchema.pre('save', async function() {
    try {
        
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
    } catch (error) {
        throw error;
    }});
userSchema.statics.login = async function (email, password) {
  try {
    const user = await this.findOne({ email });
    if (!user) {
      throw new Error("Incorrect email");
    }
    // if (user.block === true) {
    //   throw new Error("User is blocked");
    // }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const updatedUser = await this.findByIdAndUpdate(
        user._id,
        { $inc: { loginAttempts: 1 } },
        { new: true },
      );
      if (updatedUser.loginAttempts >= 5) {
        await this.findByIdAndUpdate(user._id, { block: true });
        throw new Error(
          "User is blocked due to too many failed login attempts",
        );
      }
      throw new Error("Incorrect password");
    }

    const updatedUser = await this.findByIdAndUpdate(
      user._id,
      { loginAttempts: 0  },
      { new: true },
    );


    return updatedUser;
  } catch (err) {
    throw err;
  }
};
  
    
const User = mongose.model('User',userSchema);
module.exports = User;        