'use client';

import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import PlaylistCard from '../../components/PlaylistCard';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { ListVideo, PlayCircle, Lock, RefreshCw, Plus, Layers, Youtube, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
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
        setPlaylists(json.data || []);
        setDataSource(json.source || 'express_api');

        if (json.source === 'youtube_api') {
          setStatusMessage(`Live YouTube Playlists (${json.total})`);
        } else if (json.source === 'fallback_error') {
          setStatusMessage('YouTube API Error (Showing Demo)');
        } else {
          setStatusMessage('Demo Mode (Sign in with Google)');
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      console.warn('Backend server unreachable, using standalone mock data:', err);
      setDataSource('offline');
      setStatusMessage('Backend Server Offline');
      setPlaylists([
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
      ]);
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
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <Layers style={{ width: '48px', height: '48px', color: '#666' }} />
              <h3 style={{ color: '#FFF', marginTop: '12px' }}>No playlists found</h3>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>
                Try selecting a different privacy filter or create a new playlist.
              </p>
            </div>
          )}

          {/* Create Playlist Modal */}
          {showModal && (
            <div style={styles.modalOverlay}>
              <div className="glass-card" style={styles.modalContent}>
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
        </main>
      </div>
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
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: '#141414',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '20px',
    padding: '24px',
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
  }
};
