const employeeModel = require('../models/employee.model');
const userModel = require('../models/user.model');
const condidatureModel = require('../models/condidature.model');
const crypto = require('crypto');

module.exports.getAllEmployees = async (req, res) => {
    try {
        const filter = {};
        if (req.query.departement) filter.departement = { $regex: req.query.departement, $options: 'i' };
        if (req.query.statut) filter.statut = req.query.statut;
        if (req.query.typeContrat) filter.typeContrat = req.query.typeContrat;

        const employees = await employeeModel.find(filter)
            .populate('user', 'name email tel photo departement')
            .populate('manager', 'poste');
        res.status(200).json({ message: "Employees retrieved successfully", data: employees });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await employeeModel.findById(req.params.id)
            .populate('user', 'name email tel photo adresse competences formation linkedin departement')
            .populate('manager')
            .populate('offre')
            .populate('candidature');
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const isOwner = employee.user._id.toString() === req.user._id.toString();
        const isRhOrAdmin = req.user.role === 'admin' || req.user.role === 'rh';
        if (!isOwner && !isRhOrAdmin) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json({ message: "Employee retrieved successfully", data: employee });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.getMyProfile = async (req, res) => {
    try {
        const employee = await employeeModel.findOne({ user: req.user._id })
            .populate('user', 'name email tel photo adresse competences formation linkedin departement')
            .populate('manager');
        if (!employee) {
            return res.status(404).json({ message: "Employee profile not found" });
        }
        res.status(200).json({ message: "Profile retrieved successfully", data: employee });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.getByDepartement = async (req, res) => {
    try {
        const employees = await employeeModel.find({
            departement: { $regex: req.params.dep, $options: 'i' }
        }).populate('user', 'name email tel photo');
        res.status(200).json({ message: "Employees retrieved successfully", data: employees });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.createEmployee = async (req, res) => {
    try {
        const { name, email, password, tel, poste, departement, typeContrat, salaire, manager } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "name, email and password are required" });
        }

        const newUser = new userModel({ name, email, password, role: 'employee', tel, departement });
        await newUser.save();

        const newEmployee = new employeeModel({
            user: newUser._id,
            poste,
            departement,
            typeContrat,
            salaire,
            manager: manager || null
        });
        await newEmployee.save();

        res.status(201).json({ message: "Employee created successfully", data: { user: newUser, employee: newEmployee } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createFromCandidature = async (candidature) => {
    const tempPassword = crypto.randomBytes(8).toString('hex');

    const newUser = new userModel({
        name: candidature.nom,
        email: candidature.email,
        password: tempPassword,
        role: 'employee',
        tel: candidature.telephone || ''
    });
    await newUser.save();

    const newEmployee = new employeeModel({
        user: newUser._id,
        cv_url: candidature.cv_url,
        offre: candidature.offre,
        candidature: candidature._id
    });
    await newEmployee.save();

    return { user: newUser, employee: newEmployee, tempPassword };
};

module.exports.createFromCandidature = createFromCandidature;

module.exports.updateEmployee = async (req, res) => {
    try {
        const { poste, departement, typeContrat, salaire, manager, dateFinContrat, cv_url } = req.body;
        const updateData = {};
        if (poste !== undefined) updateData.poste = poste;
        if (departement !== undefined) updateData.departement = departement;
        if (typeContrat !== undefined) updateData.typeContrat = typeContrat;
        if (salaire !== undefined) updateData.salaire = salaire;
        if (manager !== undefined) updateData.manager = manager;
        if (dateFinContrat !== undefined) updateData.dateFinContrat = dateFinContrat;
        if (cv_url !== undefined) updateData.cv_url = cv_url;

        const updatedEmployee = await employeeModel.findByIdAndUpdate(req.params.id, updateData, { new: true })
            .populate('user', 'name email');
        if (!updatedEmployee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.status(200).json({ message: "Employee updated successfully", data: updatedEmployee });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.updateStatut = async (req, res) => {
    try {
        const { statut } = req.body;
        if (!statut) {
            return res.status(400).json({ message: "statut is required" });
        }
        const validStatuts = ['actif', 'en_periode_essai', 'suspendu', 'demissionnaire', 'licencie', 'fin_contrat'];
        if (!validStatuts.includes(statut)) {
            return res.status(400).json({ message: "Invalid statut value", validStatuts });
        }

        const updatedEmployee = await employeeModel.findByIdAndUpdate(
            req.params.id,
            { statut },
            { new: true }
        ).populate('user', 'name email');
        if (!updatedEmployee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.status(200).json({ message: "Employee statut updated successfully", data: updatedEmployee });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.getStats = async (req, res) => {
    try {
        const total = await employeeModel.countDocuments();

        const byDepartement = await employeeModel.aggregate([
            { $group: { _id: '$departement', count: { $sum: 1 } } }
        ]);

        const byStatut = await employeeModel.aggregate([
            { $group: { _id: '$statut', count: { $sum: 1 } } }
        ]);

        const byTypeContrat = await employeeModel.aggregate([
            { $group: { _id: '$typeContrat', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            message: "Stats retrieved successfully",
            data: { total, byDepartement, byStatut, byTypeContrat }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
