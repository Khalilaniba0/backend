const offreEmploiModel = require('../models/offreEmploi.model');
module.exports.getAllOffres = async (req, res) => {
    try { 
        const offres = await offreEmploiModel.find();
        if (!offres){
            throw new Error("No offres found !!!")
        }
        res.status(200).json({ message : "Offres retrieved successfully" , data : offres });
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving offres', error: error.message });
    }
}
module.exports.getOffreById = async (req, res) =>{
    try{
        const offreId=req.params.id;
        const offre = await offreEmploiModel.findById(offreId);
        if (!offre){
            throw new Error("Offre not found !")
        }
        res.status(200).json({ message : "Offre retrieved successfully", data : offre})
    }
    catch(error){
        res.status(500).json({ error: 'Error retrieving offre', error: error.message });
    }
}
module.exports.createOffre = async (req , res) =>{
    try {
        const { post , description } = req.body;
        const newOffre = new offreEmploiModel({ post , description });
        await newOffre.save();
        res.status(201).json({message : "Offre created successfully", data : newOffre }) 
    }
    catch(error){
        res.status(500).json({ error: 'error create offre ' ,error : error.message });
    }
}
module.exports.updateOffre = async (req , res) =>{
    try {
        const offreId = req.params.id;
        const { post , description } = req.body;
        const updatedOffre = await offreEmploiModel.findByIdAndUpdate(offreId , { post , description } , { new : true });
        if (!updatedOffre){
            throw new Error("Offre not found !")
        }
        res.status(200).json({ message : "Offre updated successfully", data : updatedOffre });
    }
    catch(error){
        res.status(500).json({ error: 'Error updating offre', error: error.message });
    }
}
module.exports.deleteOffre = async (req , res) =>{
    try {
        const offreId = req.params.id;
        const deletedOffre = await offreEmploiModel.findByIdAndDelete(offreId);
        if (!deletedOffre){
            throw new Error("Offre not found !");
        }
        res.status(200).json({ message : "Offre deleted successfully", data : deletedOffre });
    }
    catch(error){
        res.status(500).json({ error: 'Error deleting offre', error: error.message });
    }
}

module.exports.updateStatus = async (req , res) =>{
    try {
        const offreId = req.params.id;
        const offre = await offreEmploiModel.findById(offreId);
        
        if (!offre){
            throw new Error("Offre not found !");
        }
        
        let closedOffre; // Déclaration avant le bloc
        
        if (offre.status === 'closed'){
            closedOffre = await offreEmploiModel.findByIdAndUpdate(offreId , { status : 'open' } , { new : true });
        }
        else {
            closedOffre = await offreEmploiModel.findByIdAndUpdate(offreId , { status : 'closed' } , { new : true });
        }
        
        res.status(200).json({ message : "Offre status updated successfully", data : closedOffre });
    }
    catch(error){
        res.status(500).json({ error: 'Error updating offre status', error: error.message });
    }
}