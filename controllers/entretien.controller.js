const entretienModel = require('../models/entretien.model');
const condidatureModel = require('../models/condidature.model');
const { createFromCandidature } = require('./employee.controller');

module.exports.getAllEntretiens = async (req, res) => {
    try {
        const entretiens = await entretienModel.find()
            .populate('candidature')
            .populate('responsable', 'name email');
        res.status(200).json({ message: "Entretiens retrieved successfully", data: entretiens });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.getEntretienById = async (req, res) => {
    try {
        const entretien = await entretienModel.findById(req.params.id)
            .populate('candidature')
            .populate('responsable', 'name email');
        if (!entretien) {
            return res.status(404).json({ message: "Entretien not found" });
        }
        res.status(200).json({ message: "Entretien retrieved successfully", data: entretien });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.createEntretien = async (req, res) => {
    try {
        const { candidature, date_entretien, type_entretien, duree, lien_visio } = req.body;
        const responsableId = req.user._id;

        if (!candidature || !date_entretien) {
            return res.status(400).json({ message: "candidature and date_entretien are required" });
        }

        const parsedDate = new Date(date_entretien);
        if (isNaN(parsedDate)) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        const candidatureDoc = await condidatureModel.findById(candidature);
        if (!candidatureDoc) {
            return res.status(404).json({ message: "Candidature not found" });
        }

        const dureeMinutes = duree || 30;
        const endDate = new Date(parsedDate.getTime() + dureeMinutes * 60000);

        const conflictResponsable = await entretienModel.findOne({
            responsable: responsableId,
            date_entretien: {
                $gte: new Date(parsedDate.getTime() - dureeMinutes * 60000),
                $lt: endDate
            }
        });
        if (conflictResponsable) {
            return res.status(400).json({ message: "Schedule conflict: the responsable already has an interview at this time" });
        }

        const conflictCandidature = await entretienModel.findOne({
            candidature,
            date_entretien: {
                $gte: new Date(parsedDate.getTime() - dureeMinutes * 60000),
                $lt: endDate
            }
        });
        if (conflictCandidature) {
            return res.status(400).json({ message: "Schedule conflict: this candidature already has an interview at this time" });
        }

        const newEntretien = new entretienModel({
            candidature,
            responsable: responsableId,
            date_entretien: parsedDate,
            type_entretien: type_entretien || 'visio',
            duree: dureeMinutes,
            lien_visio
        });

        await newEntretien.save();

        candidatureDoc.etape = 'entretien_planifie';
        await candidatureDoc.save();

        res.status(201).json({ message: "Entretien created successfully", data: newEntretien });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.updateEntretien = async (req, res) => {
    try {
        const entretien = await entretienModel.findById(req.params.id);
        if (!entretien) {
            return res.status(404).json({ message: "Entretien not found" });
        }

        const { commentaires, score_entretien, criteres_evaluation, reponse, date_entretien, type_entretien, duree, lien_visio } = req.body;

        if (commentaires !== undefined) entretien.commentaires = commentaires;
        if (score_entretien !== undefined) entretien.score_entretien = score_entretien;
        if (criteres_evaluation !== undefined) entretien.criteres_evaluation = criteres_evaluation;
        if (date_entretien !== undefined) entretien.date_entretien = new Date(date_entretien);
        if (type_entretien !== undefined) entretien.type_entretien = type_entretien;
        if (duree !== undefined) entretien.duree = duree;
        if (lien_visio !== undefined) entretien.lien_visio = lien_visio;

        if (reponse !== undefined) {
            entretien.reponse = reponse;

            const candidature = await condidatureModel.findById(entretien.candidature);
            if (candidature) {
                if (reponse === 'accepte') {
                    candidature.etape = 'accepte';
                    await candidature.save();
                    try {
                        await createFromCandidature(candidature);
                    } catch (err) {
                        console.error('Error creating employee from candidature:', err.message);
                    }
                } else if (reponse === 'refuse') {
                    candidature.etape = 'refuse';
                    await candidature.save();
                }
            }
        }

        await entretien.save();
        res.status(200).json({ message: "Entretien updated successfully", data: entretien });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.deleteEntretien = async (req, res) => {
    try {
        const deletedEntretien = await entretienModel.findByIdAndDelete(req.params.id);
        if (!deletedEntretien) {
            return res.status(404).json({ message: "Entretien not found" });
        }
        res.status(200).json({ message: "Entretien deleted successfully", data: deletedEntretien });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
