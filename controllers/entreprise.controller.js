const entrepriseModel = require('../models/entreprise.model');
const userModel = require('../models/user.model');
const offreEmploiModel = require('../models/offreEmploi.model');
const condidatureModel = require('../models/condidature.model');
const entretienModel = require('../models/entretien.model');

module.exports.registerEntreprise = async (req, res) => {
  try {
    const {
      nom,
      email,
      adresse,
      secteur,
      logo,
      siteWeb,
      plan,
      adminName,
      adminEmail,
      adminPassword,
      adminTel,
      adminPhoto,
      adminAdresse,
      admin
    } = req.body;

    const resolvedAdminName = adminName || (admin && admin.name);
    const resolvedAdminEmail = adminEmail || (admin && admin.email);
    const resolvedAdminPassword = adminPassword || (admin && admin.password);
    const resolvedAdminTel = adminTel || (admin && admin.tel);
    const resolvedAdminPhoto = adminPhoto || (admin && admin.photo);
    const resolvedAdminAdresse = adminAdresse || (admin && admin.adresse);

    if (!nom || !email || !resolvedAdminName || !resolvedAdminEmail || !resolvedAdminPassword) {
      return res.status(400).json({
        message: 'nom, email, adminName, adminEmail and adminPassword are required'
      });
    }

    const entreprise = await entrepriseModel.create({
      nom,
      email,
      adresse,
      secteur,
      logo,
      siteWeb,
      plan
    });

    try {
      const adminUser = await userModel.create({
        name: resolvedAdminName,
        email: resolvedAdminEmail,
        password: resolvedAdminPassword,
        role: 'admin',
        tel: resolvedAdminTel,
        photo: resolvedAdminPhoto,
        adresse: resolvedAdminAdresse,
        entreprise: entreprise._id
      });

      const { password: _, ...adminWithoutPassword } = adminUser.toObject();

      return res.status(201).json({
        message: 'Entreprise registered successfully',
        data: {
          entreprise,
          admin: adminWithoutPassword
        }
      });
    } catch (adminError) {
      await entrepriseModel.findByIdAndDelete(entreprise._id);
      throw adminError;
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error registering entreprise', detail: error.message });
  }
};

module.exports.getMyEntreprise = async (req, res) => {
  try {
    const entreprise = await entrepriseModel.findById(req.entrepriseId);
    if (!entreprise) {
      return res.status(404).json({ message: 'Entreprise not found' });
    }
    return res.status(200).json({ message: 'Entreprise retrieved successfully', data: entreprise });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving entreprise', detail: error.message });
  }
};

module.exports.updateEntreprise = async (req, res) => {
  try {
    const { nom, email, adresse, secteur, logo, siteWeb, plan, isActive } = req.body;
    const updateData = {};
    if (nom !== undefined) updateData.nom = nom;
    if (email !== undefined) updateData.email = email;
    if (adresse !== undefined) updateData.adresse = adresse;
    if (secteur !== undefined) updateData.secteur = secteur;
    if (logo !== undefined) updateData.logo = logo;
    if (siteWeb !== undefined) updateData.siteWeb = siteWeb;
    if (plan !== undefined) updateData.plan = plan;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedEntreprise = await entrepriseModel.findByIdAndUpdate(req.entrepriseId, updateData, { new: true });
    if (!updatedEntreprise) {
      return res.status(404).json({ message: 'Entreprise not found' });
    }
    return res.status(200).json({ message: 'Entreprise updated successfully', data: updatedEntreprise });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating entreprise', detail: error.message });
  }
};

module.exports.deleteEntreprise = async (req, res) => {
  try {
    const entrepriseId = req.entrepriseId;

    const deletedEntreprise = await entrepriseModel.findByIdAndDelete(entrepriseId);
    if (!deletedEntreprise) {
      return res.status(404).json({ message: 'Entreprise not found' });
    }

    await Promise.all([
      userModel.deleteMany({ entreprise: entrepriseId }),
      offreEmploiModel.deleteMany({ entreprise: entrepriseId }),
      condidatureModel.deleteMany({ entreprise: entrepriseId }),
      entretienModel.deleteMany({ entreprise: entrepriseId })
    ]);

    return res.status(200).json({ message: 'Entreprise deleted successfully', data: deletedEntreprise });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting entreprise', detail: error.message });
  }
};
