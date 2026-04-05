const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar';

const isVisioEntretien = (entretien) => {
    const type = entretien?.typeEntretien || entretien?.type_entretien;
    return typeof type === 'string' && type.trim().toLowerCase() === 'visio';
};

const getAuthUrl = (oauthState) => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [CALENDAR_SCOPE],
        state: String(oauthState)
    });
};

const buildOAuthClient = (tokens) => {
    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
    auth.setCredentials(tokens);

    auth.on('tokens', (newTokens) => {
        if (newTokens.refresh_token) {
            tokens.refresh_token = newTokens.refresh_token;
        }
        if (newTokens.access_token) {
            tokens.access_token = newTokens.access_token;
        }
    });

    return auth;
};

const buildEventPayload = (entretien) => {
    const startDateTime = entretien.dateEntretien || entretien.date_entretien;
    const dureeMinutes = entretien.duree || 60;
    const endDateTime = new Date(new Date(startDateTime).getTime() + dureeMinutes * 60000);
    const candidatEmail = entretien.candidatEmail || entretien.candidat_email;

    const payload = {
        summary: `Entretien - ${entretien.poste || 'Poste non precise'}`,
        description: `Entretien avec ${entretien.candidatNom || entretien.candidat_nom || ''}`,
        start: { dateTime: new Date(startDateTime).toISOString(), timeZone: 'Africa/Tunis' },
        end: { dateTime: endDateTime.toISOString(), timeZone: 'Africa/Tunis' },
        attendees: candidatEmail ? [{ email: candidatEmail }] : [],
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 60 },
                { method: 'popup', minutes: 15 }
            ]
        }
    };

    if (isVisioEntretien(entretien)) {
        payload.conferenceData = {
            createRequest: {
                requestId: `entretien-${entretien._id}-${Date.now()}`,
                conferenceSolutionKey: { type: 'hangoutsMeet' }
            }
        };
    }

    return payload;
};

const createCalendarEvent = async ({ tokens, entretien }) => {
    const auth = buildOAuthClient(tokens);

    const calendar = google.calendar({ version: 'v3', auth });
    const event = buildEventPayload(entretien);

    const insertPayload = {
        calendarId: 'primary',
        resource: event,
        sendUpdates: 'all'
    };

    if (event.conferenceData) {
        insertPayload.conferenceDataVersion = 1;
    }

    const response = await calendar.events.insert(insertPayload);

    return {
        eventId: response.data.id,
        meetLink: response.data.hangoutLink
    };
};

const updateCalendarEvent = async ({ tokens, eventId, entretien }) => {
    const auth = buildOAuthClient(tokens);
    const calendar = google.calendar({ version: 'v3', auth });
    const event = buildEventPayload(entretien);

    const patchPayload = {
        calendarId: 'primary',
        eventId,
        resource: event,
        sendUpdates: 'all'
    };

    if (event.conferenceData) {
        patchPayload.conferenceDataVersion = 1;
    }

    const response = await calendar.events.patch(patchPayload);

    return {
        eventId: response.data.id,
        meetLink: response.data.hangoutLink
    };
};

const deleteCalendarEvent = async ({ tokens, eventId }) => {
    const auth = buildOAuthClient(tokens);

    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all'
    });
};

module.exports = {
    oauth2Client,
    getAuthUrl,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent
};