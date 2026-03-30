const formatDateFr = (value) => {
    if (!value) return null;

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return {
        date: `${day}/${month}/${year}`,
        heure: `${hour}:${minute}`
    };
};

const labelTypeEntretien = (typeEntretien) => {
    if (typeEntretien === 'presentiel') return 'présentiel';
    if (typeEntretien === 'visio') return 'visio';
    if (typeEntretien === 'telephone') return 'téléphone';
    return typeEntretien || 'visio';
};

const resolveNotificationTypeByEtape = (etapeCible) => {
    if (etapeCible === 'entretien_planifie') return 'entretien_planifie';
    if (etapeCible === 'offre') return 'offre_acceptee';
    if (etapeCible === 'refuse') return 'refus';
    if (etapeCible === 'suppression') return 'suppression';
    return 'etape_avancement';
};

const buildNotificationMessage = ({ type, poste, etapeCible, dateEntretien, typeEntretien }) => {
    const posteFinal = poste || 'ce poste';

    if (type === 'entretien_planifie') {
        const detailsDate = formatDateFr(dateEntretien);
        const typeLibelle = labelTypeEntretien(typeEntretien);
        if (detailsDate) {
            return `Votre entretien pour le poste ${posteFinal} est planifié le ${detailsDate.date} à ${detailsDate.heure}. Type : ${typeLibelle}.`;
        }
        return `Votre entretien pour le poste ${posteFinal} est planifié. Type : ${typeLibelle}.`;
    }

    if (type === 'refus') {
        return `Nous avons bien étudié votre candidature pour le poste ${posteFinal}. Après réflexion, nous ne donnons pas suite. Merci pour votre intérêt.`;
    }

    if (type === 'suppression') {
        return `Votre candidature pour le poste ${posteFinal} a été retirée du processus.`;
    }

    if (type === 'offre_acceptee') {
        return `Excellente nouvelle ! Une offre d'emploi vous est proposée pour le poste ${posteFinal}.`;
    }

    if (type === 'etape_avancement' && etapeCible === 'preselectionne') {
        return `Bonne nouvelle ! Votre candidature pour le poste ${posteFinal} a été présélectionnée. Le RH pourrait vous contacter pour un court entretien téléphonique.`;
    }

    if (type === 'etape_avancement' && etapeCible === 'test_technique') {
        return `Félicitations ! Vous passez à l'étape Test technique pour le poste ${posteFinal}.`;
    }

    if (type === 'etape_avancement' && etapeCible === 'offre') {
        return `Excellente nouvelle ! Une offre d'emploi vous est proposée pour le poste ${posteFinal}.`;
    }

    return `Votre candidature pour le poste ${posteFinal} a évolué vers l'étape ${etapeCible || 'suivante'}.`;
};

module.exports = {
    buildNotificationMessage,
    resolveNotificationTypeByEtape
};
