const userModel = require('../models/user.model');
module.exports.getAllUsers = async (req, res) => {
    try { 
        const users = await userModel.find();
        if (!users){
            throw new error("No users found !!!")
        }
        res.status(200).json({ message : "Users retrieved successfully" , data : users });
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving users', error: error.message });
    }
}
module.exports.getUserById = async (req, res) =>{
    try{
        const userId=req.params.id;
        const user = await userModel.findById(userId);
        if (!user){
            throw new Error("user not found !")
        }
        res.status(200).json({ message : "User retrieved successfully", data : user})
    }
    catch(error){
        res.status(500).json({ error: 'Error retrieving users', error: error.message });
    }
}
module.exports.createUser = async (req , res) =>{
    try {
        const { name , email , password } = req.body;
        const newUser = new userModel({ name , email, password });
        await newUser.save();
        res.status(201).json({message : "user created successfully", data : newUser }) 
    }
    catch(error){
        res.status(500).json({ error: 'error create user ' ,error : error.message });
    }
}
module.exports.deleteUser = async (req , res) =>{
    try {
        const userId = req.params.id;
        const deletedUser = await userModel.findByIdAndDelete(userId);
        if (!deletedUser){
            throw new Error("user not found !")
        }
        res.status(200).json({ message : "user deleted successfully", data : deletedUser })
    }
    catch(error){
        res.status(500).json({ error: 'error delete user ' ,error : error.message });
    }
}
module.exports.updateUser = async (req , res) =>{
    try {
        const userId = req.params.id;
        const { name } = req.body;
        const updatedUser = await userModel.findByIdAndUpdate(userId , { name } , { new : true });
        if (!updatedUser){
            throw new Error("user not found !")
        }
        res.status(200).json({ message : "user updated successfully", data : updatedUser });
    }
    catch(error){
        res.status(500).json({ error: 'error update user ' ,error : error.message });
    }
}