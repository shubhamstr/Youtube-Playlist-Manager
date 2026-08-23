const express = require('express');
const { getYouTubeClient, getCurrentSession } = require('../utils/googleAuth');
const router = express.Router();

// Fallback initial playlists data when unauthenticated or offline
const initialPlaylists = [
  {
    id: 'pl-001',
    title: 'Web Dev Mastery 2026',
    description: 'Complete roadmap covering Next.js, React, Node.js, and Modern Web Architecture.',
    videoCount: 42,
    privacy: 'Public',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2 hours ago',
    youtubeUrl: 'https://www.youtube.com',
    tags: ['Coding', 'Web', 'Tutorial']
  },
  {
    id: 'pl-002',
    title: 'Chillhop & Lofi Beats',
    description: 'Relaxing ambient and lofi music for deep focus and coding sessions.',
    videoCount: 128,
    privacy: 'Public',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    updatedAt: '1 day ago',
    youtubeUrl: 'https://www.youtube.com',
    tags: ['Music', 'Focus', 'Lofi']
  },
  {
    id: 'pl-003',
    title: 'AI & Machine Learning Insights',
    description: 'Keynotes, paper breakdowns, and hands-on LLM engineering guides.',
    videoCount: 19,
    privacy: 'Unlisted',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80',
    updatedAt: '3 days ago',
    youtubeUrl: 'https://www.youtube.com',
    tags: ['AI', 'Tech', 'Research']
  },
  {
    id: 'pl-004',
    title: 'UI/UX Design Trends',
    description: 'Glassmorphic designs, CSS animations, typography and design systems.',
    videoCount: 34,
    privacy: 'Private',
    thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80',
    updatedAt: '5 days ago',
    youtubeUrl: 'https://www.youtube.com',
    tags: ['Design', 'UI', 'Creative']
  }
];

// Helper to format YouTube privacy status string (e.g. 'private' -> 'Private')
const formatPrivacy = (status) => {
  if (!status) return 'Public';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// GET /api/playlists - List all playlists (live from YouTube API if authenticated, else fallback)
router.get('/', async (req, res) => {
  const youtube = getYouTubeClient();
  const session = getCurrentSession();

  if (youtube && session) {
    try {
      console.log('📡 Querying YouTube Data API v3 for channel playlists...');
      const response = await youtube.playlists.list({
        mine: true,
        part: ['snippet', 'contentDetails', 'status'],
        maxResults: 50
      });

      const items = response.data.items || [];
      console.log(`✅ Retrieved ${items.length} playlists from YouTube account.`);

      const livePlaylists = items.map(item => {
        const snippet = item.snippet || {};
        const contentDetails = item.contentDetails || {};
        const status = item.status || {};

        const privacyFormatted = formatPrivacy(status.privacyStatus);
        const thumbs = snippet.thumbnails || {};
        const bestThumb = thumbs.maxres?.url || thumbs.standard?.url || thumbs.high?.url || thumbs.medium?.url || thumbs.default?.url || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80';

        return {
          id: item.id,
          title: snippet.title || 'Untitled Playlist',
          description: snippet.description || 'No description provided.',
          videoCount: contentDetails.itemCount || 0,
          privacy: privacyFormatted,
          thumbnail: bestThumb,
          channelTitle: snippet.channelTitle || '',
          publishedAt: snippet.publishedAt,
          updatedAt: snippet.publishedAt ? new Date(snippet.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
          youtubeUrl: `https://www.youtube.com/playlist?list=${item.id}`,
          tags: snippet.tags ? snippet.tags.slice(0, 3) : ['YouTube', privacyFormatted]
        };
      });

      return res.json({
        success: true,
        source: 'youtube_api',
        total: livePlaylists.length,
        user: session.user ? session.user.name : null,
        data: livePlaylists
      });
    } catch (err) {
      console.error('⚠️ YouTube Data API error, serving fallback demo playlists:', err.message);
      return res.json({
        success: true,
        source: 'fallback_error',
        error: err.message,
        total: initialPlaylists.length,
        data: initialPlaylists
      });
    }
  }

  // Unauthenticated fallback response
  return res.json({
    success: true,
    source: 'fallback_unauthenticated',
    total: initialPlaylists.length,
    data: initialPlaylists
  });
});

// POST /api/playlists - Create new playlist in user's YouTube account
router.post('/', async (req, res) => {
  const youtube = getYouTubeClient();

  if (!youtube) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required to create YouTube playlists. Please log in with Google.'
    });
  }

  const { title, description, privacy } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Playlist title is required.' });
  }

  try {
    const privacyStatus = (privacy || 'private').toLowerCase();
    const response = await youtube.playlists.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title,
          description: description || ''
        },
        status: {
          privacyStatus: ['public', 'private', 'unlisted'].includes(privacyStatus) ? privacyStatus : 'private'
        }
      }
    });

    const newPlaylist = response.data;
    console.log(`✅ Created YouTube playlist: "${newPlaylist.snippet?.title}" (${newPlaylist.id})`);

    return res.json({
      success: true,
      message: 'Playlist created successfully on YouTube!',
      data: {
        id: newPlaylist.id,
        title: newPlaylist.snippet?.title,
        description: newPlaylist.snippet?.description,
        privacy: formatPrivacy(newPlaylist.status?.privacyStatus),
        youtubeUrl: `https://www.youtube.com/playlist?list=${newPlaylist.id}`
      }
    });
  } catch (err) {
    console.error('❌ Failed to create playlist on YouTube:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/playlists/:id - Get single playlist details
router.get('/:id', async (req, res) => {
  const youtube = getYouTubeClient();
  const playlistId = req.params.id;

  if (youtube) {
    try {
      const response = await youtube.playlists.list({
        id: [playlistId],
        part: ['snippet', 'contentDetails', 'status']
      });

      if (response.data.items && response.data.items.length > 0) {
        const item = response.data.items[0];
        return res.json({
          success: true,
          source: 'youtube_api',
          data: {
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            videoCount: item.contentDetails.itemCount,
            privacy: formatPrivacy(item.status.privacyStatus),
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
            youtubeUrl: `https://www.youtube.com/playlist?list=${item.id}`
          }
        });
      }
    } catch (err) {
      console.error('Error fetching single playlist:', err.message);
    }
  }

  const playlist = initialPlaylists.find(p => p.id === playlistId);
  if (!playlist) {
    return res.status(404).json({ success: false, message: 'Playlist not found' });
  }
  res.json({ success: true, source: 'fallback', data: playlist });
});

module.exports = router;
