const requireOwner = (Model, userField = 'user') => {
    return async (req, res, next) => {
        try {
            const resource = await Model.findById(req.params.id);
            if (!resource) {
                return res.status(404).json({ message: "Resource not found" });
            }
            if (req.user._id.toString() !== resource[userField].toString()) {
                return res.status(403).json({ message: "Access denied: Owner only" });
            }
            req.resource = resource;
            next();
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
};

module.exports = requireOwner;