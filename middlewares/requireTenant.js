const jwt = require('jsonwebtoken');

const requireTenant = (req, res, next) => {
  if (!req.entrepriseId) {
    const token = req.cookies && req.cookies.jwt;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.entrepriseId = decoded.entrepriseId || null;
      } catch (error) {
        req.entrepriseId = null;
      }
    }
  }

  if (!req.entrepriseId && req.user && req.user.entreprise) {
    req.entrepriseId = req.user.entreprise.toString();
  }

  if (!req.entrepriseId) {
    return res.status(403).json({ message: 'Access denied: tenant is required' });
  }

  next();
};

module.exports = requireTenant;
