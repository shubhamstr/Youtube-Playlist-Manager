const { google } = require('googleapis');

// Active session state (in-memory store for active user & OAuth credentials)
let currentSession = null;

/**
 * Helper to construct Google OAuth2 client with environment credentials
 */
const getOAuth2Client = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

  if (!clientId || !clientSecret) {
    console.warn('⚠️ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in environment variables.');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

/**
 * Get current authenticated user session
 */
const getCurrentSession = () => currentSession;

/**
 * Set current authenticated user session
 */
const setCurrentSession = (session) => {
  currentSession = session;
};

/**
 * Get configured YouTube API v3 client with active user credentials if available
 */
const getYouTubeClient = () => {
  const oauth2Client = getOAuth2Client();
  
  if (currentSession && currentSession.tokens && currentSession.tokens.access_token) {
    oauth2Client.setCredentials(currentSession.tokens);
    return google.youtube({ version: 'v3', auth: oauth2Client });
  }

  return null;
};

module.exports = {
  getOAuth2Client,
  getCurrentSession,
  setCurrentSession,
  getYouTubeClient
};
