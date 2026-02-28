const cvModel = require('../models/cv.model');
module.exports.getAllCVs = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }
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
        if (req.user.role == "admin" || req.user.role =="rh" )
        {
            res.status(200).json(cv);
        }
        else if (req.user._id.toString() === cv.user.toString()){
            res.status(200).json(cv);
        }
        else {
            res.status(403).json({ message: "Access denied" });
        }
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
}
module.exports.uploadCV = async (req, res) => {
    try {

        const userId = req.user._id;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const newCV = new cvModel({
            cv_url: req.file.filename,
            user: userId
        });

        await newCV.save();

        res.status(201).json({
            message: "CV uploaded successfully",
            data: newCV
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.deleteCV = async (req , res) =>{
    try {
        const cvId = req.params.id;
        const cv = await cvModel.findById(cvId);
        if (!cv) {
            return res.status(404).json({ message: "CV not found" });
        }
        if (req.user._id.toString() !== cv.user.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }
        const deletedCV = await cvModel.findByIdAndDelete(cvId);
        if (!deletedCV){
            throw new Error("CV not found !");
        }
        res.status(200).json(deletedCV);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
