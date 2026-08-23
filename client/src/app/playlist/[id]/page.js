'use client';

import React, { useEffect, useState } from 'react';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  CheckSquare, 
  Square, 
  MoveRight, 
  ExternalLink, 
  RefreshCw, 
  Play, 
  Lock, 
  Globe, 
  EyeOff, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  ListVideo
} from 'lucide-react';

export default function PlaylistVideosPage({ params }) {
  // Support both Next.js 14 (direct object) and Next.js 15 (Promise/React.use)
  const playlistId = params?.id;


  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // Playlist & Videos Data
  const [playlist, setPlaylist] = useState(null);
  const [videos, setVideos] = useState([]);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selection & Search State
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Move Modal State
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [targetPlaylistId, setTargetPlaylistId] = useState('');
  const [movingLoading, setMovingLoading] = useState(false);
  const [moveError, setMoveError] = useState('');
  const [moveSuccess, setMoveSuccess] = useState('');

  // Protect route
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch single playlist details & videos & all user playlists
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch current playlist info
      const pRes = await fetch(`http://localhost:5000/api/playlists/${playlistId}`);
      if (pRes.ok) {
        const pJson = await pRes.json();
        if (pJson.success) setPlaylist(pJson.data);
      }

      // 2. Fetch playlist items/videos
      const vRes = await fetch(`http://localhost:5000/api/playlists/${playlistId}/videos`);
      if (vRes.ok) {
        const vJson = await vRes.json();
        if (vJson.success) setVideos(vJson.data || []);
      }

      // 3. Fetch all playlists for target destination dropdown
      const allRes = await fetch('http://localhost:5000/api/playlists');
      if (allRes.ok) {
        const allJson = await allRes.json();
        if (allJson.success) setAllPlaylists(allJson.data || []);
      }
    } catch (err) {
      console.error('Error fetching playlist details:', err);
      setError('Failed to load playlist contents. Make sure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && playlistId) {
      fetchData();
    }
  }, [isAuthenticated, playlistId]);

  // Search filter
  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.channelTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Checkbox handlers
  const toggleSelectVideo = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredVideos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredVideos.map(v => v.id));
    }
  };

  // Open Move Modal
  const handleOpenMoveModal = () => {
    if (selectedIds.length === 0) return;
    setMoveError('');
    setMoveSuccess('');
    // Default select first available other playlist
    const otherPlaylists = allPlaylists.filter(p => p.id !== playlistId);
    if (otherPlaylists.length > 0) {
      setTargetPlaylistId(otherPlaylists[0].id);
    } else {
      setTargetPlaylistId('');
    }
    setShowMoveModal(true);
  };

  // Perform Move Action
  const handleMoveVideos = async () => {
    if (!targetPlaylistId) {
      setMoveError('Please select a target playlist.');
      return;
    }

    setMovingLoading(true);
    setMoveError('');
    setMoveSuccess('');

    // Prepare payload
    const selectedVideos = videos.filter(v => selectedIds.includes(v.id));
    const itemsToMove = selectedVideos.map(v => ({
      playlistItemId: v.id,
      videoId: v.videoId
    }));

    try {
      const res = await fetch('http://localhost:5000/api/playlists/move-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPlaylistId,
          items: itemsToMove
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to move videos');
      }

      setMoveSuccess(`🎉 Moved ${json.movedCount} video(s) to target playlist!`);
      setSelectedIds([]);

      // Refresh playlist videos & playlists after delay
      setTimeout(() => {
        setShowMoveModal(false);
        setMoveSuccess('');
        fetchData();
      }, 1500);

    } catch (err) {
      setMoveError(err.message);
    } finally {
      setMovingLoading(false);
    }
  };

  const getPrivacyIcon = (privacy) => {
    switch (privacy) {
      case 'Private':
        return <Lock style={{ width: '12px', height: '12px', color: '#FFB800' }} />;
      case 'Unlisted':
        return <EyeOff style={{ width: '12px', height: '12px', color: '#AAAAAA' }} />;
      default:
        return <Globe style={{ width: '12px', height: '12px', color: '#00E676' }} />;
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.spinner} />
        <span style={{ color: '#888', marginTop: '16px' }}>Loading Playlist...</span>
      </div>
    );
  }

  const otherPlaylists = allPlaylists.filter(p => p.id !== playlistId);

  return (
    <div className="app-container">
      <Header />

      <div className="main-layout">
        <Sidebar />

        <main className="content-area animate-fade-in" style={{ paddingBottom: '80px' }}>
          {/* Back Button & Top Navigation */}
          <div style={styles.topNavRow}>
            <button onClick={() => router.push('/dashboard')} style={styles.backBtn}>
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              <span>Back to Dashboard</span>
            </button>

            <button onClick={fetchData} style={styles.syncBtn} title="Refresh Videos">
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Playlist Details Hero Section */}
          {playlist && (
            <div className="glass-card" style={styles.heroCard}>
              <div style={styles.heroLayout}>
                <div style={styles.heroThumbWrapper}>
                  <img
                    src={playlist.thumbnail || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80'}
                    alt={playlist.title}
                    style={styles.heroThumb}
                  />
                  <div style={styles.badgeOverlay}>
                    <Play style={{ width: '12px', height: '12px', fill: '#FFF' }} />
                    <span>{videos.length} videos</span>
                  </div>
                </div>

                <div style={styles.heroContent}>
                  <div style={styles.heroTagRow}>
                    <span style={styles.privacyChip}>
                      {getPrivacyIcon(playlist.privacy)}
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#EEE' }}>{playlist.privacy}</span>
                    </span>
                    <span style={styles.heroMetaText}>YouTube Playlist</span>
                  </div>

                  <h1 style={styles.heroTitle}>{playlist.title}</h1>
                  <p style={styles.heroDesc}>{playlist.description || 'No description provided for this playlist.'}</p>

                  <div style={styles.heroActionRow}>
                    <a
                      href={playlist.youtubeUrl || `https://www.youtube.com/playlist?list=${playlistId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.ytLinkBtn}
                    >
                      <ExternalLink style={{ width: '15px', height: '15px' }} />
                      <span>Open Playlist on YouTube</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Controls Bar: Search & Select All */}
          <div style={styles.controlsBar}>
            <div style={styles.searchWrapper}>
              <Search style={{ width: '16px', height: '16px', color: '#888', marginLeft: '12px' }} />
              <input
                type="text"
                placeholder="Search videos in this playlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                  <X style={{ width: '14px', height: '14px' }} />
                </button>
              )}
            </div>

            <div style={styles.selectionControls}>
              <button onClick={handleSelectAll} style={styles.selectAllBtn}>
                {selectedIds.length === filteredVideos.length && filteredVideos.length > 0 ? (
                  <CheckSquare style={{ width: '16px', height: '16px', color: '#FF0000' }} />
                ) : (
                  <Square style={{ width: '16px', height: '16px', color: '#888' }} />
                )}
                <span>
                  {selectedIds.length === filteredVideos.length && filteredVideos.length > 0
                    ? 'Deselect All'
                    : `Select All (${filteredVideos.length})`}
                </span>
              </button>

              {selectedIds.length > 0 && (
                <button onClick={handleOpenMoveModal} style={styles.moveTriggerBtn}>
                  <MoveRight style={{ width: '16px', height: '16px' }} />
                  <span>Move ({selectedIds.length}) to Playlist</span>
                </button>
              )}
            </div>
          </div>

          {/* Floating Action Bar when videos selected */}
          {selectedIds.length > 0 && (
            <div style={styles.floatingBar}>
              <div style={styles.floatingContent}>
                <span style={styles.selectedCountBadge}>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#00E676' }} />
                  <strong>{selectedIds.length}</strong> video(s) selected
                </span>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setSelectedIds([])} style={styles.deselectBtn}>
                    Cancel Selection
                  </button>

                  <button onClick={handleOpenMoveModal} style={styles.floatingMoveBtn}>
                    <MoveRight style={{ width: '16px', height: '16px' }} />
                    <span>Move to Other Playlist</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Video Items List */}
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner} />
              <span>Fetching videos from YouTube...</span>
            </div>
          ) : error ? (
            <div className="glass-card" style={styles.errorCard}>
              <AlertCircle style={{ width: '28px', height: '28px', color: '#FF4D4D' }} />
              <p style={{ color: '#FFF', margin: '8px 0 0 0' }}>{error}</p>
            </div>
          ) : filteredVideos.length > 0 ? (
            <div style={styles.videoGrid}>
              {filteredVideos.map((video, idx) => {
                const isSelected = selectedIds.includes(video.id);
                return (
                  <div
                    key={video.id}
                    className="glass-card"
                    onClick={() => toggleSelectVideo(video.id)}
                    style={{
                      ...styles.videoCard,
                      borderColor: isSelected ? '#FF0000' : 'rgba(255, 255, 255, 0.08)',
                      backgroundColor: isSelected ? 'rgba(255, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.03)'
                    }}
                  >
                    {/* Checkbox Icon */}
                    <div style={styles.checkboxContainer}>
                      {isSelected ? (
                        <CheckSquare style={{ width: '20px', height: '20px', color: '#FF0000' }} />
                      ) : (
                        <Square style={{ width: '20px', height: '20px', color: '#555' }} />
                      )}
                    </div>

                    {/* Video Index */}
                    <span style={styles.videoIndex}>#{idx + 1}</span>

                    {/* Video Thumbnail */}
                    <div style={styles.videoThumbWrapper}>
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        style={styles.videoThumb}
                      />
                      <div style={styles.playIconOverlay}>
                        <Play style={{ width: '14px', height: '14px', fill: '#FFF' }} />
                      </div>
                    </div>

                    {/* Video Info */}
                    <div style={styles.videoInfo}>
                      <h4 style={styles.videoTitle} title={video.title}>
                        {video.title}
                      </h4>
                      {video.channelTitle && (
                        <span style={styles.channelName}>{video.channelTitle}</span>
                      )}
                    </div>

                    {/* Open External Watch Link */}
                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={styles.watchLink}
                      title="Watch on YouTube"
                    >
                      <ExternalLink style={{ width: '16px', height: '16px' }} />
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card" style={styles.noDataCard}>
              <ListVideo style={{ width: '38px', height: '38px', color: '#888' }} />
              <h3 style={{ color: '#FFF', marginTop: '12px', fontSize: '1.1rem' }}>No Videos Found</h3>
              <p style={{ color: '#AAA', fontSize: '0.88rem' }}>
                {searchQuery ? `No videos match your search "${searchQuery}"` : 'This playlist does not contain any videos.'}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Move Videos Modal */}
      {showMoveModal && (
        <div style={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setShowMoveModal(false); }}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MoveRight style={{ width: '20px', height: '20px', color: '#FF0000' }} />
                <h3 style={{ color: '#FFF', margin: 0 }}>Move Videos to Playlist</h3>
              </div>
              <button onClick={() => setShowMoveModal(false)} style={styles.closeBtn}>
                <X style={{ width: '18px', height: '18px', color: '#AAA' }} />
              </button>
            </div>

            <p style={{ color: '#CCC', fontSize: '0.88rem', marginBottom: '16px', lineHeight: '1.4' }}>
              Select target playlist to move <strong>{selectedIds.length}</strong> selected video(s).
              The videos will be added to the target playlist and removed from <strong>{playlist?.title}</strong>.
            </p>

            {moveError && (
              <div style={styles.errorBox}>
                <AlertCircle style={{ width: '16px', height: '16px' }} />
                <span>{moveError}</span>
              </div>
            )}

            {moveSuccess && (
              <div style={styles.successBox}>
                <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                <span>{moveSuccess}</span>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={styles.label}>Destination Playlist *</label>
              {otherPlaylists.length > 0 ? (
                <select
                  value={targetPlaylistId}
                  onChange={(e) => setTargetPlaylistId(e.target.value)}
                  style={styles.selectInput}
                >
                  {otherPlaylists.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.videoCount} videos - {p.privacy})
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ padding: '12px', backgroundColor: 'rgba(255,184,0,0.1)', borderRadius: '10px', color: '#FFB800', fontSize: '0.84rem' }}>
                  ⚠️ You don't have any other playlists. Create a new playlist on the dashboard first!
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setShowMoveModal(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={movingLoading || otherPlaylists.length === 0}
                onClick={handleMoveVideos}
                style={styles.submitBtn}
              >
                {movingLoading ? 'Moving Videos...' : `Move ${selectedIds.length} Video(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  loadingScreen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F0F0F',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(255, 0, 0, 0.2)',
    borderTopColor: '#FF0000',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  topNavRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#E0E0E0',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  syncBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#AAA',
    padding: '8px 14px',
    borderRadius: '20px',
    fontSize: '0.82rem',
    cursor: 'pointer',
  },
  heroCard: {
    padding: '24px',
    borderRadius: '20px',
    marginBottom: '24px',
  },
  heroLayout: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  heroThumbWrapper: {
    position: 'relative',
    width: '200px',
    height: '120px',
    borderRadius: '14px',
    overflow: 'hidden',
    backgroundColor: '#151515',
    flexShrink: 0,
  },
  heroThumb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: '4px 8px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#FFF',
    fontSize: '0.72rem',
    fontWeight: '600',
  },
  heroContent: {
    flex: 1,
    minWidth: '260px',
  },
  heroTagRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  privacyChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: '3px 10px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  heroMetaText: {
    fontSize: '0.75rem',
    color: '#FF0000',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  heroTitle: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#FFF',
    margin: '0 0 8px 0',
    lineHeight: '1.25',
  },
  heroDesc: {
    fontSize: '0.88rem',
    color: '#AAA',
    margin: '0 0 16px 0',
    lineHeight: '1.4',
  },
  heroActionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  ytLinkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 0, 0, 0.12)',
    border: '1px solid rgba(255, 0, 0, 0.3)',
    color: '#FF4D4D',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.82rem',
    fontWeight: '600',
    textDecoration: 'none',
  },
  controlsBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    flex: '1',
    minWidth: '240px',
    maxWidth: '400px',
  },
  searchInput: {
    width: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#FFF',
    padding: '10px 12px',
    fontSize: '0.85rem',
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
  },
  selectionControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  selectAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#EEE',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  moveTriggerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FF0000',
    color: '#FFF',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '20px',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(255, 0, 0, 0.3)',
  },
  floatingBar: {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 999,
    width: '90%',
    maxWidth: '650px',
  },
  floatingContent: {
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 0, 0, 0.4)',
    borderRadius: '24px',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8)',
  },
  selectedCountBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#FFF',
    fontSize: '0.88rem',
  },
  deselectBtn: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#AAA',
    padding: '8px 14px',
    borderRadius: '16px',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  floatingMoveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FF0000',
    color: '#FFF',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '16px',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  videoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  videoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 16px',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  videoIndex: {
    fontSize: '0.8rem',
    color: '#666',
    fontWeight: '700',
    width: '28px',
  },
  videoThumbWrapper: {
    position: 'relative',
    width: '100px',
    height: '58px',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#111',
    flexShrink: 0,
  },
  videoThumb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  playIconOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfo: {
    flex: 1,
    minWidth: 0,
  },
  videoTitle: {
    color: '#FFF',
    fontSize: '0.9rem',
    fontWeight: '600',
    margin: '0 0 4px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  channelName: {
    fontSize: '0.78rem',
    color: '#888',
  },
  watchLink: {
    color: '#FF0000',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '40px 0',
    color: '#888',
  },
  errorCard: {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataCard: {
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: '#181818',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '20px',
    padding: '24px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  label: {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#CCC',
    marginBottom: '8px',
  },
  selectInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    padding: '12px',
    color: '#FFF',
    fontSize: '0.88rem',
    outline: 'none',
  },
  modalFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#AAA',
    padding: '10px 18px',
    borderRadius: '12px',
    fontSize: '0.84rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitBtn: {
    backgroundColor: '#FF0000',
    color: '#FFF',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '12px',
    fontSize: '0.84rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    border: '1px solid rgba(255, 77, 77, 0.3)',
    color: '#FF4D4D',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '0.84rem',
    marginBottom: '16px',
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    border: '1px solid rgba(0, 230, 118, 0.3)',
    color: '#00E676',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '0.84rem',
    marginBottom: '16px',
  }
};
