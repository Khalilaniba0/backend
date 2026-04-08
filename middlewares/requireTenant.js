const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;

const requireTenant = (req, res, next) => {
  if (!req.entrepriseId) {
    const token = req.cookies && req.cookies.jwt;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.entrepriseId = decoded.entrepriseId || null;
      } catch (error) {
        req.entrepriseId = null;
      }
    }
  }

  const utilisateurCourant = req.utilisateur || req.user;
  if (!req.entrepriseId && utilisateurCourant && utilisateurCourant.entreprise) {
    req.entrepriseId = utilisateurCourant.entreprise.toString();
  }

  if (!req.entrepriseId) {
    return res.status(403).json({ message: 'Access denied: tenant is required' });
  }

  next();
};

module.exports = requireTenant;
