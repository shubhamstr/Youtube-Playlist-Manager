const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Path to persistent session file
const SESSION_FILE = path.join(__dirname, '../../.session.json');

// Load session from disk on startup
let currentSession = null;

const loadSessionFromDisk = () => {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const raw = fs.readFileSync(SESSION_FILE, 'utf8');
      currentSession = JSON.parse(raw);
      console.log(`🔑 Loaded persisted session for: ${currentSession.user?.email || 'User'}`);
    }
  } catch (err) {
    console.warn('⚠️ Could not load persisted session from disk:', err.message);
    currentSession = null;
  }
};

loadSessionFromDisk();

/**
 * Save current session state to disk and memory
 */
const saveSession = (session) => {
  currentSession = session;
  try {
    if (session) {
      fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2), 'utf8');
    } else if (fs.existsSync(SESSION_FILE)) {
      fs.unlinkSync(SESSION_FILE);
      console.log('🗑️ Deleted persisted session file upon logout.');
    }
  } catch (err) {
    console.error('❌ Failed to save session to disk:', err.message);
  }
};

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

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  // Listen for automatic token refresh events from googleapis
  oauth2Client.on('tokens', (tokens) => {
    if (currentSession) {
      console.log('🔄 Google OAuth access token refreshed automatically.');
      const updatedTokens = {
        ...currentSession.tokens,
        ...tokens
      };
      // Retain existing refresh_token if Google didn't issue a new one in this refresh event
      if (!tokens.refresh_token && currentSession.tokens?.refresh_token) {
        updatedTokens.refresh_token = currentSession.tokens.refresh_token;
      }
      saveSession({
        ...currentSession,
        tokens: updatedTokens
      });
    }
  });

  return oauth2Client;
};

/**
 * Get current authenticated user session
 */
const getCurrentSession = () => currentSession;

/**
 * Set current authenticated user session
 */
const setCurrentSession = (session) => {
  saveSession(session);
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

