const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/authMiddleware');
const Utilisateur = require('../models/utilisateur.model');
const { getAuthUrl, oauth2Client } = require('../utils/googleCalendar');

function isAllowedRedirectPath(pathname) {
    if (!pathname || typeof pathname !== 'string') return false;
    return pathname.startsWith('/dashboard');
}

function buildFrontendRedirect(baseUrl, redirectPath, googleStatus) {
    const safePath = isAllowedRedirectPath(redirectPath)
        ? redirectPath
        : '/dashboard/settings?tab=integrations';

    const targetUrl = new URL(safePath, baseUrl);
    targetUrl.searchParams.set('google', googleStatus);
    return targetUrl.toString();
}

function decodeStatePayload(stateRaw) {
    try {
        const decoded = Buffer.from(String(stateRaw), 'base64url').toString('utf8');
        const parsed = JSON.parse(decoded);
        if (parsed && parsed.userId) {
            return {
                userId: String(parsed.userId),
                redirectPath: parsed.redirectPath
            };
        }
    } catch (_) {
        // backward compatibility for old state format below
    }

    return {
        userId: String(stateRaw),
        redirectPath: '/dashboard/settings?tab=integrations'
    };
}

router.get('/auth/google', requireAuth, (req, res) => {
    if (!req.utilisateurId) {
        return res.status(401).json({ message: 'Unauthorized: missing user id' });
    }

    const requestedRedirect = req.query.redirect || '/dashboard/settings?tab=integrations';
    const statePayload = Buffer.from(
        JSON.stringify({
            userId: String(req.utilisateurId),
            redirectPath: requestedRedirect
        })
    ).toString('base64url');

    const authUrl = new URL(getAuthUrl(statePayload));
    authUrl.searchParams.set('prompt', 'consent');
    return res.redirect(authUrl.toString());
});

router.get('/auth/google/callback', async (req, res) => {
    try {
        const { code, state } = req.query;
        const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        if (!code || !state) {
            return res.status(400).json({ message: 'Missing code or state in callback' });
        }

        const { userId, redirectPath } = decodeStatePayload(state);
        const { tokens } = await oauth2Client.getToken(code);

        const utilisateur = await Utilisateur.findByIdAndUpdate(userId, { googleTokens: tokens }, { new: true });
        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur not found' });
        }

        return res.redirect(buildFrontendRedirect(frontendBaseUrl, redirectPath, 'connected'));
    } catch (error) {
        console.error('Google OAuth callback error:', error);
        return res.status(500).json({ message: 'Failed to connect Google account' });
    }
});

module.exports = router;