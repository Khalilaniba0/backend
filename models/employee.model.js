const mongose = require('mongoose');
const employeeSchema = new mongose.Schema(
    {
        user: { type: mongose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        matricule: { type: String, unique: true },
        poste: String,
        departement: String,
        typeContrat: { type: String, enum: ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance'] },
        dateEmbauche: { type: Date, default: Date.now },
        dateFinContrat: Date,
        salaire: Number,
        cv_url: String,
        manager: { type: mongose.Schema.Types.ObjectId, ref: 'Employee', default: null },
        statut: {
            type: String,
            enum: ['actif', 'en_periode_essai', 'suspendu', 'demissionnaire', 'licencie', 'fin_contrat'],
            default: 'en_periode_essai'
        },
        offre: { type: mongose.Schema.Types.ObjectId, ref: 'OffreEmploi' },
        candidature: { type: mongose.Schema.Types.ObjectId, ref: 'Condidature' }
    }, { timestamps: true });

employeeSchema.pre('save', async function (next) {
    if (this.isNew && !this.matricule) {
        const year = new Date().getFullYear();
        const count = await mongose.model('Employee').countDocuments();
        const num = String(count + 1).padStart(3, '0');
        this.matricule = `EMP-${year}-${num}`;
    }
    next();
});

const Employee = mongose.model('Employee', employeeSchema);
module.exports = Employee;
