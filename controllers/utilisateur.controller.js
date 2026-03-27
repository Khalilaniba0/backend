require('dotenv').config();
const utilisateurModel = require('../models/utilisateur.model');
const jwt = require('jsonwebtoken');

const maxage = 3 * 24 * 60 * 60; // 3 days in seconds

const normaliserUtilisateurSortie = (doc) => {
    const utilisateur = doc.toObject ? doc.toObject({ virtuals: true }) : doc;
    return {
        ...utilisateur,
        name: utilisateur.name || utilisateur.nom,
        block: typeof utilisateur.block === 'boolean' ? utilisateur.block : utilisateur.bloque,
        loginAttempts: typeof utilisateur.loginAttempts === 'number' ? utilisateur.loginAttempts : utilisateur.tentativesConnexion
    };
};

const createToken = (utilisateur) => {
    return jwt.sign(
        {
            utilisateurId: utilisateur._id,
            userId: utilisateur._id, // compatibilite descendante
            role: utilisateur.role,
            entrepriseId: utilisateur.entreprise
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: maxage }
    );
};

module.exports.getAllUsers = async (req, res) => {
    try {
        const utilisateurs = await utilisateurModel.find({ entreprise: req.entrepriseId }).select('-motDePasse');
        const data = utilisateurs.map(normaliserUtilisateurSortie);
        res.status(200).json({ message: 'Users retrieved successfully', data });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
};

module.exports.getUserById = async (req, res) => {
    try {
        const utilisateurId = req.params.id;
        const utilisateur = await utilisateurModel
            .findOne({ _id: utilisateurId, entreprise: req.entrepriseId })
            .select('-motDePasse');
        if (!utilisateur) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: 'User retrieved successfully', data: normaliserUtilisateurSortie(utilisateur) });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', detail: error.message });
    }
};

module.exports.deleteUser = async (req, res) => {
    try {
        const utilisateurId = req.params.id;
        const utilisateurSupprime = await utilisateurModel.findOneAndDelete({ _id: utilisateurId, entreprise: req.entrepriseId });
        if (!utilisateurSupprime) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: 'User deleted successfully', data: normaliserUtilisateurSortie(utilisateurSupprime) });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', detail: error.message });
    }
};

module.exports.updateUser = async (req, res) => {
    try {
        const utilisateurId = req.params.id;
        const isAdmin = (req.utilisateur || req.user).role === 'admin';
        const isOwner = utilisateurId.toString() === (req.utilisateurId || req.userId || (req.user && req.user._id.toString()));
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: "Access denied" });
        }
        const { name, nom, tel, photo, adresse, competences, formation, linkedin, departement } = req.body;
        const donneesMiseAJour = {};
        if (nom !== undefined || name !== undefined) donneesMiseAJour.nom = nom !== undefined ? nom : name;
        if (tel !== undefined) donneesMiseAJour.tel = tel;
        if (photo !== undefined) donneesMiseAJour.photo = photo;
        if (adresse !== undefined) donneesMiseAJour.adresse = adresse;
        if (competences !== undefined) donneesMiseAJour.competences = competences;
        if (formation !== undefined) donneesMiseAJour.formation = formation;
        if (linkedin !== undefined) donneesMiseAJour.linkedin = linkedin;
        if (departement !== undefined) donneesMiseAJour.departement = departement;

        const utilisateurMisAJour = await utilisateurModel.findOneAndUpdate(
            { _id: utilisateurId, entreprise: req.entrepriseId },
            donneesMiseAJour,
            { new: true }
        ).select('-motDePasse');
        if (!utilisateurMisAJour) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: 'User updated successfully', data: normaliserUtilisateurSortie(utilisateurMisAJour) });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', detail: error.message });
    }
};

module.exports.createRh = async (req, res) => {
    try {
        if (!req.entrepriseId) {
            return res.status(403).json({ message: "Access denied" });
        }
        const { name, nom, email, password, motDePasse, tel, departement } = req.body;
        const nouvelUtilisateur = new utilisateurModel({
            nom: nom !== undefined ? nom : name,
            email,
            motDePasse: motDePasse !== undefined ? motDePasse : password,
            role: 'rh',
            tel,
            departement,
            entreprise: req.entrepriseId
        });
        await nouvelUtilisateur.save();
        res.status(201).json({ message: 'RH created successfully', data: normaliserUtilisateurSortie(nouvelUtilisateur) });
    } catch (error) {
        res.status(500).json({ message: 'Error creating RH', detail: error.message });
    }
};

module.exports.createAdmin = async (req, res) => {
    try {
        if (!req.entrepriseId) {
            return res.status(403).json({ message: "Access denied" });
        }
        const { name, nom, email, password, motDePasse } = req.body;
        const nouvelUtilisateur = new utilisateurModel({
            nom: nom !== undefined ? nom : name,
            email,
            motDePasse: motDePasse !== undefined ? motDePasse : password,
            role: 'admin',
            entreprise: req.entrepriseId
        });
        await nouvelUtilisateur.save();
        res.status(201).json({ message: 'Admin created successfully', data: normaliserUtilisateurSortie(nouvelUtilisateur) });
    } catch (error) {
        res.status(500).json({ message: 'Error creating admin', detail: error.message });
    }
};


module.exports.login = async (req, res) => {
    try {
        const { email, password, motDePasse } = req.body;
        const utilisateur = await utilisateurModel.connexion(email, motDePasse !== undefined ? motDePasse : password);
        if (!utilisateur.entreprise) {
            return res.status(403).json({ message: "User has no entreprise assigned" });
        }

        const token = createToken(utilisateur);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxage * 1000, sameSite: 'strict' });
        const donneesUtilisateur = normaliserUtilisateurSortie(utilisateur);
        delete donneesUtilisateur.motDePasse;
        delete donneesUtilisateur.password;
        res.status(200).json({ message: 'Login successful', data: donneesUtilisateur });
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
