const cvModel = require('../models/cv.model');
module.exports.getAllCVs = async (req, res) => {
    try { 
        const cvs = await cvModel.find();
        res.status(200).json(cvs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports.getCVById = async (req, res) =>{
    try{
        const cvId=req.params.id;
        const cv = await cvModel.findById(cvId);
        if (!cv){
            throw new Error("CV not found !");
        }
        res.status(200).json(cv);
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
}
module.exports.createCV = async (req , res) =>{
    try {
        const profil = req.body;
        const newCV = new cvModel(profil);
        await newCV.save();
        res.status(201).json(newCV);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
module.exports.updateCV = async (req , res) =>{
    try {
        const cvId = req.params.id;
        const updatedData = req.body;
        const updatedCV = await cvModel.findByIdAndUpdate(cvId , updatedData , { new : true });
        if (!updatedCV){
            throw new Error("CV not found !");
        }
        res.status(200).json(updatedCV);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
module.exports.deleteCV = async (req , res) =>{
    try {
        const cvId = req.params.id;
        const deletedCV = await cvModel.findByIdAndDelete(cvId);
        if (!deletedCV){
            throw new Error("CV not found !");
        }
        res.status(200).json(deletedCV);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
