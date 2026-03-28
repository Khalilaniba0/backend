const candidatureModel = require('../models/candidature.model');
const offreEmploiModel = require('../models/offreEmploi.model');
const candidatModel = require('../models/candidat.model');
const crypto = require('crypto');

const ALLOWED_TRANSITIONS = {
    'soumise': ['preselectionne', 'refuse'],
    'preselectionne': ['entretien_planifie', 'refuse'],
    'entretien_planifie': ['entretien_passe', 'refuse'],
    'entretien_passe': ['accepte', 'refuse'],
    'accepte': [],
    'refuse': []
};

const normaliserCandidatureSortie = (doc) => {
    const candidature = doc.toObject ? doc.toObject({ virtuals: true }) : doc;
    return {
        ...candidature,
        lettre_motivation: candidature.lettre_motivation || candidature.lettreMotivation,
        score_ia: candidature.score_ia !== undefined ? candidature.score_ia : candidature.scoreIA
    };
};

module.exports.postuler = async (req, res) => {
    try {
        if (!req.candidatId) {
            return res.status(401).json({ message: 'Non authentifie. Connexion candidat requise.' });
        }

        const { lettre_motivation, lettreMotivation, offre } = req.body;

        if (!offre) {
            return res.status(400).json({ message: 'offre est requise.' });
        }

        const candidat = await candidatModel.findById(req.candidatId);
        if (!candidat) {
            return res.status(404).json({ message: 'Candidat introuvable.' });
        }

        const existante = await candidatureModel.findOne({ candidat: req.candidatId, offre });
        if (existante) {
            return res.status(400).json({ message: 'Vous avez deja postule a cette offre' });
        }

        const offreTrouvee = await offreEmploiModel.findById(offre);
        if (!offreTrouvee) {
            return res.status(404).json({ message: 'Offre not found' });
        }

        const statutOffre = offreTrouvee.statut || offreTrouvee.status;
        if (statutOffre !== 'open') {
            return res.status(400).json({ message: 'This offer is closed' });
        }

        if (offreTrouvee.dateLimite && new Date(offreTrouvee.dateLimite) < new Date()) {
            return res.status(400).json({ message: 'The deadline for this offer has passed' });
        }

        const cv_url = req.file ? req.file.filename : (candidat.cv_url || null);
        const tokenSuivi = crypto.randomUUID();

        const candidature = await candidatureModel.create({
            candidat: req.candidatId,
            nom: candidat.nom,
            email: candidat.email,
            telephone: candidat.telephone,
            cv_url,
            lettreMotivation: lettreMotivation !== undefined ? lettreMotivation : lettre_motivation,
            entreprise: offreTrouvee.entreprise,
            offre,
            tokenSuivi
        });

        return res.status(201).json({
            message: 'Condidature created successfully',
            tokenSuivi,
            candidatureId: candidature._id
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports.mesCandidatures = async (req, res) => {
    try {
        if (!req.candidatId) {
            return res.status(401).json({ message: 'Non authentifie. Connexion candidat requise.' });
        }

        const candidatures = await candidatureModel
            .find({ candidat: req.candidatId })
            .populate({ path: 'offre', select: 'poste post typeContrat localisation entreprise' })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Candidatures recuperees.',
            data: candidatures.map(normaliserCandidatureSortie)
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports.annulerCandidature = async (req, res) => {
    try {
        if (!req.candidatId) {
            return res.status(401).json({ message: 'Non authentifie. Connexion candidat requise.' });
        }

        const candidature = await candidatureModel.findOne({ _id: req.params.id, candidat: req.candidatId });
        if (!candidature) {
            return res.status(404).json({ message: 'Condidature not found' });
        }

        if (candidature.etape !== 'soumise') {
            return res.status(400).json({
                message: 'Impossible d\'annuler une candidature deja en cours de traitement'
            });
        }

        await candidatureModel.deleteOne({ _id: candidature._id });
        return res.status(200).json({ message: 'Candidature annulee avec succes.' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports.modifierCandidature = async (req, res) => {
    try {
        if (!req.candidatId) {
            return res.status(401).json({ message: 'Non authentifie. Connexion candidat requise.' });
        }

        const candidature = await candidatureModel.findOne({ _id: req.params.id, candidat: req.candidatId });
        if (!candidature) {
            return res.status(404).json({ message: 'Condidature not found' });
        }

        if (candidature.etape !== 'soumise') {
            return res.status(400).json({
                message: 'Impossible de modifier une candidature deja en cours de traitement'
            });
        }

        const { lettre_motivation, lettreMotivation, cv_url } = req.body;

        if (lettreMotivation !== undefined || lettre_motivation !== undefined) {
            candidature.lettreMotivation = lettreMotivation !== undefined ? lettreMotivation : lettre_motivation;
        }

        if (req.file) {
            candidature.cv_url = req.file.filename;
        } else if (cv_url !== undefined) {
            candidature.cv_url = cv_url;
        }

        await candidature.save();
        return res.status(200).json({ message: 'Candidature modifiee avec succes.', data: normaliserCandidatureSortie(candidature) });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};




module.exports.getAllCandidatures = async (req, res) => {
    try {
        if (!req.entrepriseId) {
            return res.status(403).json({ message: 'Access denied: tenant is required' });
        }

        const filter = { entreprise: req.entrepriseId };
        if (req.query.offre) filter.offre = req.query.offre;
        if (req.query.etape) filter.etape = req.query.etape;

        const candidatures = await candidatureModel
            .find(filter)
            .populate('offre')
            .sort({ scoreIA: -1 });

        return res.status(200).json({
            message: 'Candidatures retrieved successfully',
            data: candidatures.map(normaliserCandidatureSortie)
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports.getAllCondidatures = module.exports.getAllCandidatures;

module.exports.getCandidatureById = async (req, res) => {
    try {
        if (!req.entrepriseId) {
            return res.status(403).json({ message: 'Access denied: tenant is required' });
        }

        const candidature = await candidatureModel
            .findOne({ _id: req.params.id, entreprise: req.entrepriseId })
            .populate('offre');

        if (!candidature) {
            return res.status(404).json({ message: 'Candidature not found' });
        }

        return res.status(200).json({ message: 'Candidature retrieved successfully', data: normaliserCandidatureSortie(candidature) });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports.getCandidatureById = module.exports.getCandidatureById;

module.exports.getCandidaturesByOffre = async (req, res) => {
    try {
        if (!req.entrepriseId) {
            return res.status(403).json({ message: 'Access denied: tenant is required' });
        }

        const offreId = req.params.offreId;
        if (!offreId) {
            return res.status(400).json({ message: 'Offre ID is required' });
        }

        const offre = await offreEmploiModel.findOne({ _id: offreId, entreprise: req.entrepriseId });
        if (!offre) {
            return res.status(404).json({ message: 'Offre not found' });
        }

        const candidatures = await candidatureModel
            .find({ offre: offreId, entreprise: req.entrepriseId })
            .populate('offre')
            .sort({ scoreIA: -1 });

        return res.status(200).json({
            message: 'Condidatures retrieved successfully',
            data: candidatures.map(normaliserCandidatureSortie)
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports.getCandidaturesByOffre = module.exports.getCandidaturesByOffre;

module.exports.updateCandidatureEtape = async (req, res) => {
    try {
        if (!req.entrepriseId) {
            return res.status(403).json({ message: 'Access denied: tenant is required' });
        }

        const candidature = await candidatureModel.findOne({ _id: req.params.id, entreprise: req.entrepriseId });
        if (!candidature) {
            return res.status(404).json({ message: 'Candidature not found' });
        }

        const { etape, score_ia, scoreIA } = req.body;

        if (scoreIA !== undefined || score_ia !== undefined) {
            candidature.scoreIA = scoreIA !== undefined ? scoreIA : score_ia;
        }

        if (etape) {
            const allowed = ALLOWED_TRANSITIONS[candidature.etape] || [];
            if (!allowed || !allowed.includes(etape)) {
                return res.status(400).json({
                    message: `Transition invalide: ${candidature.etape} -> ${etape}`,
                    allowedTransitions: allowed
                });
            }
            candidature.etape = etape;
        }

        await candidature.save();
        return res.status(200).json({ message: 'Candidature updated successfully', data: normaliserCandidatureSortie(candidature) });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports.updateCandidatureEtape = module.exports.updateCandidatureEtape;

module.exports.deleteCandidatureById = async (req, res) => {
    try {
        if (!req.entrepriseId) {
            return res.status(403).json({ message: 'Access denied: tenant is required' });
        }

        const candidature = await candidatureModel.findOneAndDelete({ _id: req.params.id, entreprise: req.entrepriseId });
        if (!candidature) {
            return res.status(404).json({ message: 'Candidature not found' });
        }

        return res.status(200).json({ message: 'Candidature deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports.deleteCandidatureById = module.exports.deleteCandidatureById;
