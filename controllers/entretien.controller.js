const entretienModel = require('../models/entretien.model');
module.exports.getAllEntretiens = async (req, res) => {
    try { 
        const entretiens = await entretienModel.find();
        res.status(200).json(entretiens);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports.getEntretienById = async (req, res) =>{
    try{
        const entretienId=req.params.id;
        const entretien = await entretienModel.findById(entretienId);
        if (!entretien){
            throw new Error("Entretien not found !");
        }
        res.status(200).json(entretien);
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
}
module.exports.createEntretien = async (req, res) => {
    try {
        const { date_entretien, condidature } = req.body;
        const responsableId = req.user._id;
        const parsedDate = new Date(date_entretien);

        if (isNaN(parsedDate)) {
            return res.status(400).json({ message: "Format de date invalide" });
        }

        if (!condidature) {
            return res.status(400).json({ message: "condidature is required" });
        }

        const newEntretien = new entretienModel({
            date_entretien: parsedDate,
            condidature,
            responsable: responsableId
        });

        await newEntretien.save();

        res.status(201).json(newEntretien);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.updateEntretien = async (req , res) =>{
    try {
        const entretienId = req.params.id;
        const updatedData = req.body;
        const updatedEntretien = await entretienModel.findByIdAndUpdate(entretienId , updatedData , { new : true });
        if (!updatedEntretien){
            throw new Error("Entretien not found !");
        }
        res.status(200).json(updatedEntretien);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
module.exports.deleteEntretien = async (req , res) =>{
    try {
        const entretienId = req.params.id;
        const deletedEntretien = await entretienModel.findByIdAndDelete(entretienId);
        if (!deletedEntretien){
            throw new Error("Entretien not found !");
        }
        res.status(200).json(deletedEntretien);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
