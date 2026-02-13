const condidaatureModel = require('../models/condidature.model');
module.exports.getAllCondidatures = async (req, res) => {
    try {
        const condidatures = await condidaatureModel.find();
        res.status(200).json(condidatures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports.getCondidatureById = async (req, res) =>{
    try{
        const condidatureId=req.params.id;
        const condidature = await condidaatureModel.findById(condidatureId);
        if (!condidature){
            throw new Error("Condidature not found !");
        }
        res.status(200).json(condidature);
    }catch(error){ 
        res.status(500).json({ message: error.message });
    }
};

/* le creation de condidature ce fait apres le postuler a une offre d'emploi 
il une selection des condidature par offre 
*/