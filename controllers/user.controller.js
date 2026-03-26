require('dotenv').config();
const userModel = require('../models/user.model');
const jwt = require("jsonwebtoken");

const maxage = 3 * 24 * 60 * 60; // 3 days in seconds

const createToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            role: user.role,
            entrepriseId: user.entreprise
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: maxage }
    );
};

module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({ entreprise: req.entrepriseId }).select('-password');
        res.status(200).json({ message: "Users retrieved successfully", data: users });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
};

module.exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userModel.findOne({ _id: userId, entreprise: req.entrepriseId }).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User retrieved successfully", data: user });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', detail: error.message });
    }
};

module.exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const deletedUser = await userModel.findOneAndDelete({ _id: userId, entreprise: req.entrepriseId });
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully", data: deletedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', detail: error.message });
    }
};

module.exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const isAdmin = req.user.role === 'admin';
        const isOwner = userId.toString() === req.user._id.toString();
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: "Access denied" });
        }
        const { name, tel, photo, adresse, competences, formation, linkedin, departement } = req.body;
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (tel !== undefined) updateData.tel = tel;
        if (photo !== undefined) updateData.photo = photo;
        if (adresse !== undefined) updateData.adresse = adresse;
        if (competences !== undefined) updateData.competences = competences;
        if (formation !== undefined) updateData.formation = formation;
        if (linkedin !== undefined) updateData.linkedin = linkedin;
        if (departement !== undefined) updateData.departement = departement;

        const updatedUser = await userModel.findOneAndUpdate(
            { _id: userId, entreprise: req.entrepriseId },
            updateData,
            { new: true }
        ).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User updated successfully", data: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', detail: error.message });
    }
};

module.exports.createRh = async (req, res) => {
    try {
        if (!req.entrepriseId) {
            return res.status(403).json({ message: "Access denied" });
        }
        const { name, email, password, tel, departement } = req.body;
        const newUser = new userModel({
            name,
            email,
            password,
            role: "rh",
            tel,
            departement,
            entreprise: req.entrepriseId
        });
        await newUser.save();
        res.status(201).json({ message: "RH created successfully", data: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error creating RH', detail: error.message });
    }
};

module.exports.createAdmin = async (req, res) => {
    try {
        if (!req.entrepriseId) {
            return res.status(403).json({ message: "Access denied" });
        }
        const { name, email, password } = req.body;
        const newUser = new userModel({ name, email, password, role: "admin", entreprise: req.entrepriseId });
        await newUser.save();
        res.status(201).json({ message: "Admin created successfully", data: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error creating admin', detail: error.message });
    }
};


module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.login(email, password);
        if (!user.entreprise) {
            return res.status(403).json({ message: "User has no entreprise assigned" });
        }

        const token = createToken(user);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxage * 1000, sameSite: 'strict' });
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(200).json({ message: "Login successful", data: userWithoutPassword });
    } catch (error) {
        res.status(401).json({ error: error.message });
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
