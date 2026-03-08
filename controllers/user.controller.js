
require('dotenv').config();
const userModel = require('../models/user.model');
module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find();
        if (!users) {
            throw new Error("No users found !!!")
        }
        res.status(200).json({ message: "Users retrieved successfully", data: users });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
}
module.exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userModel.findById(userId);
        if (!user) {
            throw new Error("user not found !")
        }
        res.status(200).json({ message: "User retrieved successfully", data: user })
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving user', detail: error.message });
    }
}
module.exports.createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = new userModel({ name, email, password });
        await newUser.save();
        res.status(201).json({ message: "user created successfully", data: newUser })
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating user', detail: error.message });
    }
}
module.exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const deletedUser = await userModel.findByIdAndDelete(userId);
        if (!deletedUser) {
            throw new Error("user not found !")
        }
        res.status(200).json({ message: "user deleted successfully", data: deletedUser })
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting user', detail: error.message });
    }
}
module.exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        if (userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }
        const { name } = req.body;
        const updatedUser = await userModel.findByIdAndUpdate(userId, { name }, { new: true });
        if (!updatedUser) {
            throw new Error("user not found !")
        }
        res.status(200).json({ message: "user updated successfully", data: updatedUser });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating user', detail: error.message });
    }
}
module.exports.createRh = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = new userModel({ name, email, password, role: "rh" });
        await newUser.save();
        res.status(201).json({ message: "RH created successfully", data: newUser })
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating RH', detail: error.message });
    }
}
module.exports.createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = new userModel({ name, email, password, role: "admin" });
        await newUser.save();
        res.status(201).json({ message: "Admin created successfully", data: newUser })
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating admin', detail: error.message });
    }
}
const jwt = require("jsonwebtoken");

const maxage = 3 * 24 * 60 * 60; // 3 days in seconds



const createToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, { expiresIn: maxage });
};

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.login(email, password);
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxage * 1000, sameSite: 'strict' });
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(200).json({ message: "Login successful", data: userWithoutPassword });
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
