const express = require('express');
const router = express.Router();

// Mock Google OAuth Auth URL generator (ready for real Google OAuth Client ID)
router.get('/google/url', (req, res) => {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback';
  const clientId = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(
    'https://www.googleapis.com/auth/youtube.readonly profile email'
  )}&access_type=offline&prompt=consent`;

  res.json({ url: authUrl });
});

// User session status route
router.get('/me', (req, res) => {
  // Mock response for preview / initial state
  res.json({
    authenticated: true,
    user: {
      name: 'Alex Johnson',
      email: 'alex.johnson@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    }
  });
});

module.exports = router;
