
require('dotenv').config();
const userModel = require('../models/user.model');
module.exports.getAllUsers = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);
        if (user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
        }
        const users = await userModel.find();
        if (!users){
            throw new Error("No users found !!!")
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
module.exports.createCondidat = async (req , res) =>{
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
module.exports.createRh = async (req , res) =>{
    try {
        const { name , email , password } = req.body;
        const newUser = new userModel({ name , email, password , role : "rh" });
        await newUser.save();
        res.status(201).json({message : "user created successfully", data : newUser }) 
    }
    catch(error){
        res.status(500).json({ error: 'error create user ' ,error : error.message });
    }
}
module.exports.createAdmin = async (req , res) =>{
    try {
        const { name , email , password } = req.body;
        const newUser = new userModel({ name , email, password , role : "admin" });
        await newUser.save();
        res.status(201).json({message : "user created successfully", data : newUser }) 
    }
    catch(error){
        res.status(500).json({ error: 'error create user ' ,error : error.message });
    }
}/*
module.exports.assignCvToUser = async (req , res) =>{
    try {
        const userId = req.params.userId;
        const cvId = req.params.cvId;
        const userData = await userModel.findById(userId);
        if (!userData){
            throw new Error("user not found !");
        }
        const cvData = await cvModel.findById(cvId);
        if (!cvData){
            throw new Error("CV not found !");
        }
        cvData.user = userId;
        await cvData.save();
        userData.cv = cvId;
        await userData.save();
        res.status(200).json({ message : "CV assigned to user successfully", data : userData });
    }
    catch(error){
        res.status(500).json({ error: 'error assign cv to user ' ,error : error.message });
    }
}
*/
const jwt = require("jsonwebtoken");

const maxage = 3 * 24 * 60 * 60; // 3 days in seconds
const secretKey = process.env.JWT_SECRET_KEY; // Use environment variable or default value



const createToken = (userId) => {
  return jwt.sign({ id: userId }, secretKey, { expiresIn: maxage });
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, {httpOnly: true,maxAge: maxage * 1000});
    res.status(200).json({ message: "Login successful", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { httpOnly: true, maxAge: 1 });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
  