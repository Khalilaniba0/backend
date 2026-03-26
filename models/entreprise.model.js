const mongoose = require('mongoose');

const entrepriseSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    adresse: String,
    secteur: String,
    logo: String,
    siteWeb: String,
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Entreprise = mongoose.model('Entreprise', entrepriseSchema);
module.exports = Entreprise;
