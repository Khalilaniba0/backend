const condidatureModel = require('../models/condidature.model');
module.exports.getAllCondidatures = async (req, res) => {
    try {
        const condidatures = await condidatureModel.find();
        res.status(200).json(condidatures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports.getCondidatureById = async (req, res) =>{
    try{
        const condidatureId=req.params.id;
        const condidature = await condidatureModel.findById(condidatureId);
        if (!condidature){
            throw new Error("Condidature not found !");
        }
        res.status(200).json(condidature);
    }catch(error){ 
        res.status(500).json({ message: error.message });
    }
};
module.exports.createCondidature = async (req, res) => {
    try {
        //  dans le condidature il faut l'ide de l'offre et l'id de l'utilisateur
        const { offre, user } = req.body;
        if (!offre || !user) {
            return res.status(400).json({ message: "Offre and condidat are required" });
        }
        if (req.user._id.toString() !== user.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }
        const newCondidature = new condidatureModel({
            score_ia: req.body.score_ia || 0,
            offre,
            user
        });
        await newCondidature.save();
        res.status(201).json(newCondidature);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports.getCondidaturesByOffre = async (req, res) => {
    try {
        const offreId = req.params.offreId;
        if (!offreId) {
            return res.status(400).json({ message: "Offre ID in params is required " });
        }
        const condidatures = await condidatureModel.find({ offre: offreId });
        res.status(200).json(condidatures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports.deleteCondidature = async (req , res) =>{
    try {
        const condidature = await condidatureModel.findById(req.params.id);
        
        if (!condidature) {
            return res.status(404).json({ message: "Condidature not found" });
        }
        if (req.user._id.toString() !== condidature.user.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }
        await condidatureModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Condidature deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};