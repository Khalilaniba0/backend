const offreEmploiModel = require('../models/offreEmploi.model');

module.exports.getAllOffres = async (req, res) => {
    try {
        const filter = {};
        if (req.query.typeContrat) filter.typeContrat = req.query.typeContrat;
        if (req.query.localisation) filter.localisation = { $regex: req.query.localisation, $options: 'i' };
        if (req.query.status) filter.status = req.query.status;
        if (req.query.departement) filter.departement = { $regex: req.query.departement, $options: 'i' };
        if (req.query.modeContrat) filter.modeContrat = req.query.modeContrat;
        if (req.query.niveauExperience) filter.niveauExperience = req.query.niveauExperience;

        const offres = await offreEmploiModel.find(filter).populate('responsable', 'name email');
        res.status(200).json({ message: "Offres retrieved successfully", data: offres });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving offres', error: error.message });
    }
};

module.exports.getOffreById = async (req, res) => {
    try {
        const offreId = req.params.id;
        const offre = await offreEmploiModel.findById(offreId).populate('responsable', 'name email');
        if (!offre) {
            return res.status(404).json({ message: "Offre not found" });
        }
        res.status(200).json({ message: "Offre retrieved successfully", data: offre });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving offre', error: error.message });
    }
};

module.exports.createOffre = async (req, res) => {
    try {
        if (!req.entrepriseId) {
            return res.status(403).json({ message: "Access denied: tenant is required" });
        }

        const {
            post, description, requirements, typeContrat, salaireMin, salaireMax,
            localisation, modeContrat, departement, dateLimite, niveauExperience
        } = req.body;

        const newOffre = new offreEmploiModel({
            post, description, requirements, typeContrat, salaireMin, salaireMax,
            localisation, modeContrat, departement, dateLimite, niveauExperience,
            responsable: req.user._id,
            entreprise: req.entrepriseId
        });

        await newOffre.save();
        res.status(201).json({ message: "Offre created successfully", data: newOffre });
    } catch (error) {
        res.status(500).json({ message: 'Error creating offre', error: error.message });
    }
};
module.exports.updateOffre = async (req, res) => {
    try {
        if (!req.entrepriseId) {
            return res.status(403).json({ message: "Access denied: tenant is required" });
        }

        const offreId = req.params.id;
        const {
            post, description, requirements, typeContrat, salaireMin, salaireMax,
            localisation, modeContrat, departement, dateLimite, niveauExperience
        } = req.body;

        const updateData = {};
        if (post !== undefined) updateData.post = post;
        if (description !== undefined) updateData.description = description;
        if (requirements !== undefined) updateData.requirements = requirements;
        if (typeContrat !== undefined) updateData.typeContrat = typeContrat;
        if (salaireMin !== undefined) updateData.salaireMin = salaireMin;
        if (salaireMax !== undefined) updateData.salaireMax = salaireMax;
        if (localisation !== undefined) updateData.localisation = localisation;
        if (modeContrat !== undefined) updateData.modeContrat = modeContrat;
        if (departement !== undefined) updateData.departement = departement;
        if (dateLimite !== undefined) updateData.dateLimite = dateLimite;
        if (niveauExperience !== undefined) updateData.niveauExperience = niveauExperience;

        const updatedOffre = await offreEmploiModel.findOneAndUpdate(
            { _id: offreId, entreprise: req.entrepriseId },
            updateData,
            { new: true }
        );
        if (!updatedOffre) {
            return res.status(404).json({ message: "Offre not found" });
        }
        res.status(200).json({ message: "Offre updated successfully", data: updatedOffre });
    } catch (error) {
        res.status(500).json({ message: 'Error updating offre', error: error.message });
    }
};

module.exports.deleteOffre = async (req, res) => {
    try {
        if (!req.entrepriseId) {
            return res.status(403).json({ message: "Access denied: tenant is required" });
        }

        const offreId = req.params.id;
        const deletedOffre = await offreEmploiModel.findOneAndDelete({ _id: offreId, entreprise: req.entrepriseId });
        if (!deletedOffre) {
            return res.status(404).json({ message: "Offre not found" });
        }
        res.status(200).json({ message: "Offre deleted successfully", data: deletedOffre });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting offre', error: error.message });
    }
};

module.exports.updateStatus = async (req, res) => {
    try {
        if (!req.entrepriseId) {
            return res.status(403).json({ message: "Access denied: tenant is required" });
        }

        const offreId = req.params.id;
        const offre = await offreEmploiModel.findOne({ _id: offreId, entreprise: req.entrepriseId });

        if (!offre) {
            return res.status(404).json({ message: "Offre not found" });
        }

        const newStatus = offre.status === 'closed' ? 'open' : 'closed';
        const updatedOffre = await offreEmploiModel.findOneAndUpdate(
            { _id: offreId, entreprise: req.entrepriseId },
            { status: newStatus },
            { new: true }
        );

        res.status(200).json({ message: "Offre status updated successfully", data: updatedOffre });
    } catch (error) {
        res.status(500).json({ message: 'Error updating offre status', error: error.message });
    }
};
