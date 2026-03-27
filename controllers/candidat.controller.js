const jwt = require('jsonwebtoken');
const Candidat = require('../models/candidat.model');

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const CANDIDAT_JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;

const createCandidatToken = (candidat) => {
  if (!CANDIDAT_JWT_SECRET) {
    throw new Error('JWT secret is not configured');
  }

  return jwt.sign(
    { candidatId: candidat._id, type: 'candidat' },
    CANDIDAT_JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports.inscrire = async (req, res) => {
  try {
    const { nom, email, motDePasse, telephone } = req.body;

    if (!nom || !email || !motDePasse) {
      return res.status(400).json({ message: 'nom, email et motDePasse sont requis.' });
    }

    const emailNormalise = email.toLowerCase();
    const existe = await Candidat.findOne({ email: emailNormalise });
    if (existe) {
      return res.status(400).json({ message: 'Cet email est deja utilise.' });
    }

    const candidat = await Candidat.create({ nom, email: emailNormalise, motDePasse, telephone });
    const token = createCandidatToken(candidat);

    res.cookie('jwt_candidat', token, {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'strict'
    });

    return res.status(201).json({
      message: 'Inscription candidat reussie.',
      data: {
        _id: candidat._id,
        nom: candidat.nom,
        email: candidat.email,
        telephone: candidat.telephone,
        cv_url: candidat.cv_url,
        portfolio_url: candidat.portfolio_url
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports.connecter = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({ message: 'email et motDePasse sont requis.' });
    }

    const candidat = await Candidat.findOne({ email: email.toLowerCase() });
    if (!candidat) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const motDePasseValide = await candidat.verifierMotDePasse(motDePasse);
    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const token = createCandidatToken(candidat);

    res.cookie('jwt_candidat', token, {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'strict'
    });

    return res.status(200).json({
      message: 'Connexion candidat reussie.',
      data: {
        _id: candidat._id,
        nom: candidat.nom,
        email: candidat.email,
        telephone: candidat.telephone,
        cv_url: candidat.cv_url,
        portfolio_url: candidat.portfolio_url
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports.deconnecter = async (req, res) => {
  try {
    res.cookie('jwt_candidat', '', { httpOnly: true, maxAge: 1 });
    return res.status(200).json({ message: 'Deconnexion candidat reussie.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports.monProfil = async (req, res) => {
  try {
    const candidat = await Candidat.findById(req.candidatId).select('-motDePasse');
    if (!candidat) {
      return res.status(404).json({ message: 'Candidat introuvable.' });
    }

    return res.status(200).json({ message: 'Profil candidat recupere.', data: candidat });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports.mettreAJourProfil = async (req, res) => {
  try {
    const { nom, telephone, cv_url, portfolio_url } = req.body;
    const updateData = {};

    if (nom !== undefined) updateData.nom = nom;
    if (telephone !== undefined) updateData.telephone = telephone;
    if (cv_url !== undefined) updateData.cv_url = cv_url;
    if (portfolio_url !== undefined) updateData.portfolio_url = portfolio_url;

    const candidat = await Candidat.findByIdAndUpdate(req.candidatId, updateData, { new: true })
      .select('-motDePasse');

    if (!candidat) {
      return res.status(404).json({ message: 'Candidat introuvable.' });
    }

    return res.status(200).json({ message: 'Profil candidat mis a jour.', data: candidat });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};