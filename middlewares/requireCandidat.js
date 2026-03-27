const jwt = require('jsonwebtoken');
const CANDIDAT_JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;

const requireCandidat = (req, res, next) => {
  try {
    if (!CANDIDAT_JWT_SECRET) {
      return res.status(500).json({ message: 'JWT secret non configure.' });
    }

    const token = req.cookies.jwt_candidat;
    if (!token) {
      return res.status(401).json({ message: 'Non authentifie. Connexion candidat requise.' });
    }
    const decoded = jwt.verify(token, CANDIDAT_JWT_SECRET);
    if (decoded.type !== 'candidat') {
      return res.status(403).json({ message: 'Acces reserve aux candidats.' });
    }
    req.candidatId = decoded.candidatId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expire.' });
  }
};

module.exports = requireCandidat;