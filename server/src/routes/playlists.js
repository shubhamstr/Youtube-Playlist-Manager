const express = require('express');
const { getYouTubeClient, getCurrentSession } = require('../utils/googleAuth');
const router = express.Router();

// Helper to format YouTube privacy status string (e.g. 'private' -> 'Private')
const formatPrivacy = (status) => {
  if (!status) return 'Public';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// GET /api/playlists - List all playlists (live from YouTube API if authenticated)
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
      console.error('⚠️ YouTube Data API error:', err.message);
      return res.json({
        success: true,
        source: 'youtube_api_error',
        error: err.message,
        total: 0,
        data: []
      });
    }
  }

  // Unauthenticated response - no demo data
  return res.json({
    success: true,
    source: 'fallback_unauthenticated',
    total: 0,
    data: []
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

  return res.status(404).json({ success: false, message: 'Playlist not found on YouTube.' });
});

// PUT /api/playlists/:id - Update playlist title, description, and privacy
router.put('/:id', async (req, res) => {
  const youtube = getYouTubeClient();
  const playlistId = req.params.id;
  const { title, description, privacy } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Playlist title is required.' });
  }

  if (!youtube) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in with Google to update YouTube playlists.'
    });
  }

  try {
    const privacyStatus = (privacy || 'private').toLowerCase();
    const response = await youtube.playlists.update({
      part: ['snippet', 'status'],
      requestBody: {
        id: playlistId,
        snippet: {
          title,
          description: description || ''
        },
        status: {
          privacyStatus: ['public', 'private', 'unlisted'].includes(privacyStatus) ? privacyStatus : 'private'
        }
      }
    });

    const updated = response.data;
    console.log(`✅ Updated YouTube playlist: "${updated.snippet?.title}" (${updated.id})`);

    return res.json({
      success: true,
      message: 'Playlist updated successfully on YouTube!',
      data: {
        id: updated.id,
        title: updated.snippet?.title,
        description: updated.snippet?.description,
        privacy: formatPrivacy(updated.status?.privacyStatus),
        youtubeUrl: `https://www.youtube.com/playlist?list=${updated.id}`
      }
    });
  } catch (err) {
    console.error('❌ Failed to update playlist on YouTube:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/playlists/:id/videos - List video items inside a playlist
router.get('/:id/videos', async (req, res) => {
  const youtube = getYouTubeClient();
  const playlistId = req.params.id;
  const pageToken = req.query.pageToken;
  const maxResults = parseInt(req.query.maxResults) || 50;

  if (youtube) {
    try {
      const listParams = {
        playlistId: playlistId,
        part: ['snippet', 'contentDetails'],
        maxResults: maxResults
      };
      if (pageToken) {
        listParams.pageToken = pageToken;
      }

      const response = await youtube.playlistItems.list(listParams);

      const items = (response.data.items || []).map(item => {
        const snippet = item.snippet || {};
        const thumbs = snippet.thumbnails || {};
        const bestThumb = thumbs.high?.url || thumbs.medium?.url || thumbs.default?.url;

        return {
          id: item.id,
          videoId: snippet.resourceId?.videoId,
          title: snippet.title || 'Untitled Video',
          description: snippet.description || '',
          channelTitle: snippet.videoOwnerChannelTitle || snippet.channelTitle || '',
          publishedAt: snippet.publishedAt,
          thumbnail: bestThumb || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
          youtubeUrl: `https://www.youtube.com/watch?v=${snippet.resourceId?.videoId}`
        };
      });

      return res.json({
        success: true,
        source: 'youtube_api',
        total: items.length,
        nextPageToken: response.data.nextPageToken || null,
        pageInfo: response.data.pageInfo || null,
        data: items
      });
    } catch (err) {
      console.error('⚠️ YouTube Data API error fetching playlist videos:', err.message);
    }
  }

  return res.json({
    success: true,
    source: 'youtube_api',
    total: 0,
    nextPageToken: null,
    data: []
  });
});

// POST /api/playlists/move-videos - Move selected videos from one playlist to another
router.post('/move-videos', async (req, res) => {
  const youtube = getYouTubeClient();

  if (!youtube) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in with Google to manage YouTube playlists.'
    });
  }

  const { targetPlaylistId, items } = req.body;

  if (!targetPlaylistId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Target playlist ID and non-empty items array are required.'
    });
  }

  let movedCount = 0;
  const errors = [];

  for (const item of items) {
    const { playlistItemId, videoId } = item;
    if (!videoId) continue;

    try {
      // Step 1: Insert video into target playlist
      await youtube.playlistItems.insert({
        part: ['snippet'],
        requestBody: {
          snippet: {
            playlistId: targetPlaylistId,
            resourceId: {
              kind: 'youtube#video',
              videoId: videoId
            }
          }
        }
      });

      // Step 2: Delete video from source playlist (if playlistItemId provided)
      if (playlistItemId) {
        try {
          await youtube.playlistItems.delete({
            id: playlistItemId
          });
        } catch (delErr) {
          console.warn(`⚠️ Video added to target playlist, but failed to remove item ${playlistItemId} from source playlist:`, delErr.message);
        }
      }

      movedCount++;
    } catch (err) {
      console.error(`❌ Error moving video ${videoId}:`, err.message);
      errors.push(`Failed to move video ${videoId}: ${err.message}`);
    }
  }

  return res.json({
    success: movedCount > 0,
    message: movedCount > 0 ? `Successfully moved ${movedCount} video(s) to target playlist.` : 'Failed to move selected videos.',
    movedCount,
    errors
  });
});

module.exports = router;

