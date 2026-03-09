const condidatureModel = require('../models/condidature.model');
const offreEmploiModel = require('../models/offreEmploi.model');
const crypto = require('crypto');

const ALLOWED_TRANSITIONS = {
    'soumise': ['preselectionne', 'refuse'],
    'preselectionne': ['entretien_planifie', 'refuse'],
    'entretien_planifie': ['entretien_passe', 'refuse'],
    'entretien_passe': ['accepte', 'refuse'],
    'accepte': [],
    'refuse': []
};

module.exports.getAllCondidatures = async (req, res) => {
    try {
        // req.query exemple: /condidatures?offre=123&etape=preselectionne
        // req.query.offre => filter by offre ID
        // req.query.etape => filter by etape
        //populate permet de recupere l'objet offre complet au lieu de juste son ID
        const filter = {};
        if (req.query.offre) filter.offre = req.query.offre;
        if (req.query.etape) filter.etape = req.query.etape;
        const condidatures = await condidatureModel.find(filter).populate('offre');
        res.status(200).json({ message: "Condidatures retrieved successfully", data: condidatures });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.getCondidatureById = async (req, res) => {
    try {
        const condidature = await condidatureModel.findById(req.params.id).populate('offre');
        if (!condidature) {
            return res.status(404).json({ message: "Condidature not found" });
        }
        res.status(200).json({ message: "Condidature retrieved successfully", data: condidature });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// .sort permet de trier les condidatures par score IA decroissant pour une offre donnée
module.exports.getCondidaturesByOffre = async (req, res) => {
    try {
        const offreId = req.params.offreId;
        if (!offreId) {
            return res.status(400).json({ message: "Offre ID is required" });
        }
        const condidatures = await condidatureModel.find({ offre: offreId })
            .populate('offre')
            .sort({ score_ia: -1 });
        res.status(200).json({ message: "Condidatures retrieved successfully", data: condidatures });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.getCondidatureBySuivi = async (req, res) => {
    try {
        const { token } = req.params;
        const condidature = await condidatureModel.findOne({ tokenSuivi: token }).populate('offre', 'post');
        if (!condidature) {
            return res.status(404).json({ message: "Condidature not found" });
        }
        res.status(200).json({
            data: {
                etape: condidature.etape,
                offre: condidature.offre ? condidature.offre.post : null,
                date: condidature.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.createCondidature = async (req, res) => {
    try {
        const { nom, email, telephone, lettre_motivation, offre } = req.body;

        if (!nom || !email || !offre) {
            return res.status(400).json({ message: "nom, email and offre are required" });
        }

        const offreDoc = await offreEmploiModel.findById(offre);
        if (!offreDoc) {
            return res.status(404).json({ message: "Offre not found" });
        }
        if (offreDoc.status !== 'open') {
            return res.status(400).json({ message: "This offer is closed" });
        }
        if (offreDoc.dateLimite && new Date(offreDoc.dateLimite) < new Date()) {
            return res.status(400).json({ message: "The deadline for this offer has passed" });
        }

        const existing = await condidatureModel.findOne({ email, offre });
        if (existing) {
            return res.status(400).json({ message: "A condidature with this email already exists for this offer" });
        }

        const cv_url = req.file ? req.file.filename : null;
        const tokenSuivi = crypto.randomUUID();

        const newCondidature = new condidatureModel({
            nom,
            email,
            telephone,
            cv_url,
            lettre_motivation,
            offre,
            etape: 'soumise',
            tokenSuivi
        });

        await newCondidature.save();

        res.status(201).json({ message: "Condidature created successfully", data: newCondidature, tokenSuivi });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// il faut comprendre cette fonction
module.exports.updateEtape = async (req, res) => {
    try {
        const condidature = await condidatureModel.findById(req.params.id);
        if (!condidature) {
            return res.status(404).json({ message: "Condidature not found" });
        }

        const { etape, score_ia } = req.body;

        if (score_ia !== undefined) {
            condidature.score_ia = score_ia;
        }

        if (etape) {
            const allowed = ALLOWED_TRANSITIONS[condidature.etape];
            if (!allowed || !allowed.includes(etape)) {
                return res.status(400).json({
                    message: `Transition from '${condidature.etape}' to '${etape}' is not allowed`,
                    allowedTransitions: allowed
                });
            }
            condidature.etape = etape;
        }

        await condidature.save();
        res.status(200).json({ message: "Condidature updated successfully", data: condidature });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.deleteCondidature = async (req, res) => {
    try {
        const condidature = await condidatureModel.findByIdAndDelete(req.params.id);
        if (!condidature) {
            return res.status(404).json({ message: "Condidature not found" });
        }
        res.status(200).json({ message: "Condidature deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
