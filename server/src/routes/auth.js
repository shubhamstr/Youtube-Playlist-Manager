const express = require('express');
const { google } = require('googleapis');
const { getOAuth2Client, getCurrentSession, setCurrentSession } = require('../utils/googleAuth');
const router = express.Router();

// Scopes required for profile, email, and YouTube playlists full access (reading & modifying)
const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/youtube'
];

// GET /api/auth/google/url - Generate and return Google OAuth authorization URL
router.get('/google/url', (req, res) => {
  try {
    const oauth2Client = getOAuth2Client();
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });
    res.json({ success: true, url: authUrl });
  } catch (error) {
    console.error('Failed to generate Google auth URL:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/auth/google - Direct redirect to Google OAuth login page
router.get('/google', (req, res) => {
  try {
    const oauth2Client = getOAuth2Client();
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });
    res.redirect(authUrl);
  } catch (error) {
    console.error('Failed to redirect to Google auth URL:', error);
    res.status(500).send('Error initiating Google login: ' + error.message);
  }
});

// GET /api/auth/google/callback - Google OAuth callback handler
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  if (error) {
    console.error('❌ Google OAuth authorization error:', error);
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    console.error('❌ Google OAuth callback received without code parameter.');
    return res.redirect(`${clientUrl}/login?error=missing_code`);
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch authenticated user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userinfo = await oauth2.userinfo.get();

    const session = {
      user: {
        id: userinfo.data.id,
        email: userinfo.data.email,
        name: userinfo.data.name,
        avatar: userinfo.data.picture,
        givenName: userinfo.data.given_name,
        familyName: userinfo.data.family_name
      },
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date
      },
      authenticatedAt: new Date().toISOString()
    };

    setCurrentSession(session);

    console.log(`✅ Google OAuth login successful for: ${userinfo.data.email} (${userinfo.data.name})`);

    // Redirect user back to Next.js frontend callback page
    const userPayload = encodeURIComponent(JSON.stringify(session.user));
    res.redirect(`${clientUrl}/auth/callback?status=success&user=${userPayload}`);
  } catch (err) {
    console.error('❌ Error exchanging Google OAuth authorization code:', err.message);
    res.redirect(`${clientUrl}/login?error=${encodeURIComponent(err.message)}`);
  }
});

// GET /api/auth/me - Retrieve current session and user profile
router.get('/me', (req, res) => {
  const session = getCurrentSession();
  if (session && session.user) {
    return res.json({
      authenticated: true,
      user: session.user
    });
  }

  res.json({
    authenticated: false,
    user: null
  });
});

// POST /api/auth/logout - Clear user session
router.post('/logout', (req, res) => {
  setCurrentSession(null);
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;

