const express = require('express');
const router = express.Router();

// Initial Mock / Pre-loaded YouTube Playlists Data
const initialPlaylists = [
  {
    id: 'pl-001',
    title: 'Web Dev Mastery 2026',
    description: 'Complete roadmap covering Next.js, React, Node.js, and Modern Web Architecture.',
    videoCount: 42,
    privacy: 'Public',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2 hours ago',
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
    tags: ['Design', 'UI', 'Creative']
  },
  {
    id: 'pl-005',
    title: 'System Design & Distributed Systems',
    description: 'High-scale architecture breakdowns, microservices, databases, and caching.',
    videoCount: 27,
    privacy: 'Public',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    updatedAt: '1 week ago',
    tags: ['Backend', 'Architecture']
  },
  {
    id: 'pl-006',
    title: 'Tech Podcasts & Interviews',
    description: 'Inspiring engineering leadership talks and tech industry discussions.',
    videoCount: 56,
    privacy: 'Public',
    thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2 weeks ago',
    tags: ['Podcast', 'Talks']
  }
];

// GET /api/playlists - List all playlists
router.get('/', (req, res) => {
  res.json({
    success: true,
    total: initialPlaylists.length,
    data: initialPlaylists
  });
});

// GET /api/playlists/:id - Get single playlist details
router.get('/:id', (req, res) => {
  const playlist = initialPlaylists.find(p => p.id === req.params.id);
  if (!playlist) {
    return res.status(404).json({ success: false, message: 'Playlist not found' });
  }
  res.json({ success: true, data: playlist });
});

module.exports = router;
