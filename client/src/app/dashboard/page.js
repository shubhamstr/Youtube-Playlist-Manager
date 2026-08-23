'use client';

import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import PlaylistCard from '../../components/PlaylistCard';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { ListVideo, PlayCircle, Lock, RefreshCw, Plus, Layers, Youtube, CheckCircle2, AlertCircle, X, Eye, Edit3, ExternalLink } from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [dataSource, setDataSource] = useState('checking');
  const [statusMessage, setStatusMessage] = useState('Connecting...');

  // Modal State for Creating a Playlist
  const [showModal, setShowModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    privacy: 'private'
  });

  // Modal State for Viewing a Playlist
  const [selectedPlaylistForView, setSelectedPlaylistForView] = useState(null);
  const [viewVideos, setViewVideos] = useState([]);
  const [loadingViewVideos, setLoadingViewVideos] = useState(false);

  // Modal State for Editing a Playlist
  const [selectedPlaylistForEdit, setSelectedPlaylistForEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', description: '', privacy: 'private' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Protect Dashboard Route
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch Playlists from Node.js Express Backend
  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/playlists');
      if (res.ok) {
        const json = await res.json();
        const data = json.data || [];
        setPlaylists(data);
        setDataSource(json.source || 'express_api');

        if (json.source === 'youtube_api') {
          setStatusMessage(data.length > 0 ? `Live YouTube Playlists (${json.total})` : 'Connected to Google (0 Playlists)');
        } else if (json.source === 'youtube_api_error') {
          setStatusMessage('YouTube API Error');
        } else {
          setStatusMessage('Not Signed In');
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      console.warn('Backend server unreachable:', err);
      setDataSource('offline');
      setStatusMessage('Backend Server Offline');
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlaylists();
    }
  }, [isAuthenticated]);

  // Handle Creating a New Playlist
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess('');

    try {
      const res = await fetch('http://localhost:5000/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to create playlist on YouTube');
      }

      setCreateSuccess(`🎉 Created playlist "${formData.title}" on YouTube!`);
      setFormData({ title: '', description: '', privacy: 'private' });
      
      // Refresh playlists list
      setTimeout(() => {
        setShowModal(false);
        setCreateSuccess('');
        fetchPlaylists();
      }, 1500);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  // Open View Playlist Screen in a New Tab
  const handleOpenView = (playlist) => {
    window.open(`/playlist/${playlist.id}`, '_blank');
  };


  // Open Edit Playlist Modal
  const handleOpenEdit = (playlist) => {
    setSelectedPlaylistForEdit(playlist);
    setEditFormData({
      title: playlist.title || '',
      description: playlist.description || '',
      privacy: (playlist.privacy || 'private').toLowerCase()
    });
    setEditError('');
    setEditSuccess('');
  };

  // Submit Edit Playlist Form
  const handleUpdatePlaylist = async (e) => {
    e.preventDefault();
    if (!selectedPlaylistForEdit) return;

    setEditLoading(true);
    setEditError('');
    setEditSuccess('');

    try {
      const res = await fetch(`http://localhost:5000/api/playlists/${selectedPlaylistForEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update playlist');
      }

      setEditSuccess(`🎉 Playlist updated successfully!`);

      setTimeout(() => {
        setSelectedPlaylistForEdit(null);
        setEditSuccess('');
        fetchPlaylists();
      }, 1200);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.spinner} />
        <span style={{ color: '#888', marginTop: '16px' }}>Loading YouTube Dashboard...</span>
      </div>
    );
  }

  // Filtered Playlists
  const filteredPlaylists = playlists.filter(p => {
    if (filter === 'Public') return p.privacy === 'Public';
    if (filter === 'Private') return p.privacy === 'Private';
    if (filter === 'Unlisted') return p.privacy === 'Unlisted';
    return true;
  });

  const totalVideos = playlists.reduce((acc, p) => acc + (p.videoCount || 0), 0);
  const privateCount = playlists.filter(p => p.privacy === 'Private').length;
  const publicCount = playlists.filter(p => p.privacy === 'Public').length;

  return (
    <div className="app-container">
      {/* Header with User Profile */}
      <Header />

      <div className="main-layout">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="content-area animate-fade-in">
          {/* Top Welcome & Actions Row */}
          <div style={styles.welcomeRow}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Youtube style={{ width: '28px', height: '28px', color: '#FF0000' }} />
                <h1 style={styles.heading}>YouTube Account Playlists</h1>
              </div>
              <p style={styles.subheading}>
                Manage your YouTube channel playlists, privacy settings, and video statistics.
              </p>
            </div>

            <div style={styles.headerActions}>
              <div style={{
                ...styles.statusChip,
                borderColor: dataSource === 'youtube_api' ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 184, 0, 0.3)'
              }}>
                <div style={{
                  ...styles.statusDot,
                  backgroundColor: dataSource === 'youtube_api' ? '#00E676' : '#FFB800',
                  boxShadow: dataSource === 'youtube_api' ? '0 0 8px #00E676' : '0 0 8px #FFB800'
                }} />
                <span>{statusMessage}</span>
              </div>

              <button
                onClick={fetchPlaylists}
                style={styles.refreshBtn}
                title="Sync Live Playlists"
              >
                <RefreshCw style={{ width: '15px', height: '15px' }} />
                <span>Sync</span>
              </button>

              <button
                onClick={() => setShowModal(true)}
                style={styles.createBtn}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                <span>New Playlist</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={styles.statsGrid}>
            <div className="glass-card" style={styles.statCard}>
              <div style={styles.statIconBadge}>
                <ListVideo style={{ width: '20px', height: '20px', color: '#FF0000' }} />
              </div>
              <div>
                <span style={styles.statVal}>{playlists.length}</span>
                <span style={styles.statLabel}>Playlists Created</span>
              </div>
            </div>

            <div className="glass-card" style={styles.statCard}>
              <div style={{ ...styles.statIconBadge, backgroundColor: 'rgba(0, 230, 118, 0.1)' }}>
                <PlayCircle style={{ width: '20px', height: '20px', color: '#00E676' }} />
              </div>
              <div>
                <span style={styles.statVal}>{totalVideos}</span>
                <span style={styles.statLabel}>Total Videos</span>
              </div>
            </div>

            <div className="glass-card" style={styles.statCard}>
              <div style={{ ...styles.statIconBadge, backgroundColor: 'rgba(255, 184, 0, 0.1)' }}>
                <Lock style={{ width: '20px', height: '20px', color: '#FFB800' }} />
              </div>
              <div>
                <span style={styles.statVal}>{privateCount}</span>
                <span style={styles.statLabel}>Private Playlists</span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div style={styles.filterBar}>
            <div style={styles.filterPills}>
              {['All', 'Public', 'Private', 'Unlisted'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    ...styles.filterPill,
                    ...(filter === f ? styles.filterPillActive : {})
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <span style={styles.countText}>
              Showing {filteredPlaylists.length} of {playlists.length} playlists
            </span>
          </div>

          {/* Playlists Grid */}
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner} />
              <span>Fetching YouTube account playlists...</span>
            </div>
          ) : filteredPlaylists.length > 0 ? (
            <div style={styles.grid}>
              {filteredPlaylists.map(playlist => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onView={handleOpenView}
                  onEdit={handleOpenEdit}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card" style={styles.noDataCard}>
              <div style={styles.noDataIconContainer}>
                <Youtube style={{ width: '38px', height: '38px', color: '#FF0000' }} />
              </div>
              <h3 style={styles.noDataTitle}>
                {dataSource === 'youtube_api' ? 'No Playlists Found' : 'No Data Available'}
              </h3>
              <p style={styles.noDataSubtitle}>
                {dataSource === 'youtube_api'
                  ? 'Your YouTube account currently has no playlists created. You can create a new playlist using the button above or connect a different Google account.'
                  : 'You are currently not showing live data. Sign in with your Google account to access, sync, and manage your YouTube channel playlists.'}
              </p>
              <div style={styles.noDataActions}>
                <button
                  onClick={loginWithGoogle}
                  style={styles.googleSignInBtn}
                >
                  <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign in to Google Account</span>
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Create Playlist Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Youtube style={{ width: '20px', height: '20px', color: '#FF0000' }} />
                <h3 style={{ color: '#FFF', margin: 0 }}>Create YouTube Playlist</h3>
              </div>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>
                <X style={{ width: '18px', height: '18px', color: '#AAA' }} />
              </button>
            </div>

            {createError && (
              <div style={styles.errorBox}>
                <AlertCircle style={{ width: '16px', height: '16px' }} />
                <span>{createError}</span>
              </div>
            )}

            {createSuccess && (
              <div style={styles.successBox}>
                <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                <span>{createSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreatePlaylist} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Playlist Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Favorite Tutorials 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe what this playlist is about..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ ...styles.input, resize: 'vertical' }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Privacy Setting</label>
                <select
                  value={formData.privacy}
                  onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                  style={styles.input}
                >
                  <option value="private">Private (Only you can see)</option>
                  <option value="unlisted">Unlisted (Anyone with link can see)</option>
                  <option value="public">Public (Everyone can search & view)</option>
                </select>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  style={styles.submitBtn}
                >
                  {createLoading ? 'Creating...' : 'Create Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Playlist Details & Videos Modal */}
      {selectedPlaylistForView && (
        <div style={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setSelectedPlaylistForView(null); }}>
          <div style={{ ...styles.modalContent, maxWidth: '600px' }}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye style={{ width: '20px', height: '20px', color: '#FF0000' }} />
                <h3 style={{ color: '#FFF', margin: 0 }}>View Playlist Details</h3>
              </div>
              <button onClick={() => setSelectedPlaylistForView(null)} style={styles.closeBtn}>
                <X style={{ width: '18px', height: '18px', color: '#AAA' }} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <img
                src={selectedPlaylistForView.thumbnail}
                alt={selectedPlaylistForView.title}
                style={{ width: '140px', height: '90px', objectFit: 'cover', borderRadius: '12px' }}
              />
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h2 style={{ fontSize: '1.15rem', color: '#FFF', margin: '0 0 6px 0', fontWeight: '700' }}>
                  {selectedPlaylistForView.title}
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#AAA', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                  {selectedPlaylistForView.description || 'No description provided.'}
                </p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={styles.privacyBadge}>
                    <span style={{ fontSize: '0.72rem', color: '#CCC', fontWeight: '600' }}>{selectedPlaylistForView.privacy}</span>
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>
                    {selectedPlaylistForView.videoCount} {selectedPlaylistForView.videoCount === 1 ? 'video' : 'videos'}
                  </span>
                  <a
                    href={selectedPlaylistForView.youtubeUrl || `https://www.youtube.com/playlist?list=${selectedPlaylistForView.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FF0000', fontSize: '0.8rem', textDecoration: 'none', fontWeight: '600', marginLeft: 'auto' }}
                  >
                    <ExternalLink style={{ width: '14px', height: '14px' }} />
                    Open on YouTube
                  </a>
                </div>
              </div>
            </div>

            <h4 style={{ color: '#DDD', fontSize: '0.88rem', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
              Videos in Playlist ({viewVideos.length})
            </h4>

            <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
              {loadingViewVideos ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px', color: '#888', gap: '8px' }}>
                  <div style={styles.spinner} />
                  <span>Loading playlist videos...</span>
                </div>
              ) : viewVideos.length > 0 ? (
                viewVideos.map(video => (
                  <div key={video.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      style={{ width: '80px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h5 style={{ color: '#FFF', fontSize: '0.84rem', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {video.title}
                      </h5>
                      {video.channelTitle && (
                        <span style={{ color: '#888', fontSize: '0.74rem' }}>{video.channelTitle}</span>
                      )}
                    </div>
                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#FF0000', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Watch Video"
                    >
                      <ExternalLink style={{ width: '15px', height: '15px' }} />
                    </a>
                  </div>
                ))
              ) : (
                <span style={{ color: '#888', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>No videos found in this playlist.</span>
              )}
            </div>

            <div style={{ ...styles.modalFooter, marginTop: '20px' }}>
              <button onClick={() => setSelectedPlaylistForView(null)} style={styles.cancelBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Playlist Modal */}
      {selectedPlaylistForEdit && (
        <div style={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setSelectedPlaylistForEdit(null); }}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 style={{ width: '20px', height: '20px', color: '#FF0000' }} />
                <h3 style={{ color: '#FFF', margin: 0 }}>Edit Playlist</h3>
              </div>
              <button onClick={() => setSelectedPlaylistForEdit(null)} style={styles.closeBtn}>
                <X style={{ width: '18px', height: '18px', color: '#AAA' }} />
              </button>
            </div>

            {editError && (
              <div style={styles.errorBox}>
                <AlertCircle style={{ width: '16px', height: '16px' }} />
                <span>{editError}</span>
              </div>
            )}

            {editSuccess && (
              <div style={styles.successBox}>
                <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                <span>{editSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePlaylist} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Playlist Name / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter new playlist name..."
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Update playlist description..."
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  style={{ ...styles.input, resize: 'vertical' }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Privacy Setting</label>
                <select
                  value={editFormData.privacy}
                  onChange={(e) => setEditFormData({ ...editFormData, privacy: e.target.value })}
                  style={styles.input}
                >
                  <option value="private">Private (Only you can see)</option>
                  <option value="unlisted">Unlisted (Anyone with link can see)</option>
                  <option value="public">Public (Everyone can search & view)</option>
                </select>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setSelectedPlaylistForEdit(null)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  style={styles.submitBtn}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
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
  welcomeRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  heading: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: '-0.02em',
    margin: 0,
  },
  subheading: {
    fontSize: '0.88rem',
    color: '#AAAAAA',
    marginTop: '4px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  statusChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.78rem',
    color: '#CCC',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#E0E0E0',
    padding: '8px 14px',
    borderRadius: '20px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  createBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#FF0000',
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(255, 0, 0, 0.3)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '28px',
  },
  statCard: {
    padding: '16px 20px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIconBadge: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: {
    display: 'block',
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: '1.1',
  },
  statLabel: {
    fontSize: '0.78rem',
    color: '#AAAAAA',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  filterPills: {
    display: 'flex',
    gap: '8px',
  },
  filterPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#AAAAAA',
    padding: '6px 14px',
    borderRadius: '16px',
    fontSize: '0.82rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filterPillActive: {
    backgroundColor: '#FF0000',
    color: '#FFFFFF',
    borderColor: '#FF0000',
    fontWeight: '600',
  },
  countText: {
    fontSize: '0.8rem',
    color: '#777777',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
    gap: '20px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0',
    gap: '12px',
    color: '#888888',
    fontSize: '0.9rem',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '16px',
    border: '1px dashed rgba(255, 255, 255, 0.1)',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999,
    padding: '20px',
    overflowY: 'auto',
  },
  modalContent: {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: '#141414',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 0, 0, 0.15)',
    position: 'relative',
    margin: 'auto',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 0, 0, 0.12)',
    border: '1px solid rgba(255, 0, 0, 0.3)',
    color: '#FF4D4D',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '0.82rem',
    marginBottom: '16px',
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    border: '1px solid rgba(0, 230, 118, 0.3)',
    color: '#00E676',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '0.82rem',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#CCC',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: '#FFFFFF',
    fontSize: '0.88rem',
    outline: 'none',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '12px',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#CCC',
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '0.82rem',
    cursor: 'pointer',
  },
  submitBtn: {
    backgroundColor: '#FF0000',
    border: 'none',
    color: '#FFF',
    padding: '8px 18px',
    borderRadius: '10px',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  noDataCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 32px',
    textAlign: 'center',
    borderRadius: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px dashed rgba(255, 255, 255, 0.12)',
    margin: '10px 0',
  },
  noDataIconContainer: {
    width: '72px',
    height: '72px',
    borderRadius: '20px',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    border: '1px solid rgba(255, 0, 0, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '18px',
    boxShadow: '0 8px 24px rgba(255, 0, 0, 0.15)',
  },
  noDataTitle: {
    fontSize: '1.35rem',
    fontWeight: '800',
    color: '#FFFFFF',
    margin: '0 0 8px 0',
    letterSpacing: '-0.01em',
  },
  noDataSubtitle: {
    fontSize: '0.88rem',
    color: '#AAAAAA',
    maxWidth: '480px',
    margin: '0 0 24px 0',
    lineHeight: '1.5',
  },
  noDataActions: {
    display: 'flex',
    justifyContent: 'center',
  },
  googleSignInBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#FFFFFF',
    color: '#1F1F1F',
    border: 'none',
    borderRadius: '14px',
    padding: '12px 24px',
    fontSize: '0.92rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(255, 255, 255, 0.15)',
    transition: 'all 0.2s ease',
  }
};
