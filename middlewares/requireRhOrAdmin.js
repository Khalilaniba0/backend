const requireRhOrAdmin = (req, res, next) => {
    if (!(req.user.role === "admin" || req.user.role === "rh")) {
        return res.status(403).json({ message: "Access denied: Admin or RH only" });
    }
    next();
} 

module.exports = requireRhOrAdmin;
