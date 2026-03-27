const requireAdmin = (req, res, next) => {
    const role = req.role || (req.utilisateur && req.utilisateur.role) || (req.user && req.user.role);
    if (role !== 'admin') {
        return res.status(403).json({ message: "Access denied: Admin only" });
    }
    next();
};

module.exports = requireAdmin;