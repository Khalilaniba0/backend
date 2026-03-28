const offreEmploiModel = require('../models/offreEmploi.model');

const construireFiltreOffres = (query = {}, entrepriseId = null) => {
    const filter = {};

    if (entrepriseId) {
        filter.entreprise = entrepriseId;
    }

    if (query.typeContrat) filter.typeContrat = query.typeContrat;
    if (query.localisation) filter.localisation = { $regex: query.localisation, $options: 'i' };
    if (query.status || query.statut) filter.statut = query.statut || query.status;
    if (query.departement) filter.departement = { $regex: query.departement, $options: 'i' };
    if (query.modeContrat) filter.modeContrat = query.modeContrat;
    if (query.niveauExperience) filter.niveauExperience = query.niveauExperience;

    return filter;
};

const normaliserOffreSortie = (doc) => {
    const offre = doc.toObject ? doc.toObject({ virtuals: true }) : doc;
    return {
        ...offre,
        post: offre.post || offre.poste,
        status: offre.status || offre.statut,
        requirements: offre.requirements || offre.exigences
    };
};

module.exports.getAllOffres = async (req, res) => {
    try {
        const filter = construireFiltreOffres(req.query);

        const offres = await offreEmploiModel.find(filter).populate('responsable', 'nom name email');
        res.status(200).json({ message: 'Offres retrieved successfully', data: offres.map(normaliserOffreSortie) });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving offres', error: error.message });
    }
};

module.exports.getOffresByEntreprise = async (req, res) => {
    try {
        if (!req.entrepriseId) {
            return res.status(403).json({ message: "Access denied: tenant is required" });
        }

        const filter = construireFiltreOffres(req.query, req.entrepriseId);
        const offres = await offreEmploiModel.find(filter).populate('responsable', 'nom name email');

        return res.status(200).json({
            message: 'Entreprise offres retrieved successfully',
            data: offres.map(normaliserOffreSortie)
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving entreprise offres', error: error.message });
    }
};

module.exports.getOffreById = async (req, res) => {
    try {
        const offreId = req.params.id;
        const offre = await offreEmploiModel.findById(offreId).populate('responsable', 'nom name email');
        if (!offre) {
            return res.status(404).json({ message: "Offre not found" });
        }
        res.status(200).json({ message: 'Offre retrieved successfully', data: normaliserOffreSortie(offre) });
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
            post, poste, description, requirements, exigences, typeContrat, salaireMin, salaireMax,
            localisation, modeContrat, departement, dateLimite, niveauExperience
        } = req.body;

        const newOffre = new offreEmploiModel({
            poste: poste !== undefined ? poste : post,
            description,
            exigences: exigences !== undefined ? exigences : requirements,
            typeContrat,
            salaireMin,
            salaireMax,
            localisation, modeContrat, departement, dateLimite, niveauExperience,
            responsable: (req.utilisateur || req.user)._id,
            entreprise: req.entrepriseId
        });

        await newOffre.save();
        res.status(201).json({ message: 'Offre created successfully', data: normaliserOffreSortie(newOffre) });
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
            post, poste, description, requirements, exigences, typeContrat, salaireMin, salaireMax,
            localisation, modeContrat, departement, dateLimite, niveauExperience
        } = req.body;

        const updateData = {};
        if (poste !== undefined || post !== undefined) updateData.poste = poste !== undefined ? poste : post;
        if (description !== undefined) updateData.description = description;
        if (exigences !== undefined || requirements !== undefined) {
            updateData.exigences = exigences !== undefined ? exigences : requirements;
        }
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
        res.status(200).json({ message: 'Offre updated successfully', data: normaliserOffreSortie(updatedOffre) });
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
        res.status(200).json({ message: 'Offre deleted successfully', data: normaliserOffreSortie(deletedOffre) });
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

        const nouveauStatut = offre.statut === 'closed' ? 'open' : 'closed';
        const updatedOffre = await offreEmploiModel.findOneAndUpdate(
            { _id: offreId, entreprise: req.entrepriseId },
            { statut: nouveauStatut },
            { new: true }
        );

        res.status(200).json({ message: 'Offre status updated successfully', data: normaliserOffreSortie(updatedOffre) });
    } catch (error) {
        res.status(500).json({ message: 'Error updating offre status', error: error.message });
    }
};
