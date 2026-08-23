'use client';

import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import PlaylistCard from '../../components/PlaylistCard';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { ListVideo, PlayCircle, Lock, RefreshCw, Plus, Layers } from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [backendStatus, setBackendStatus] = useState('Checking API...');

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
        setBackendStatus('Express API Connected');
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      console.warn('Backend server unreachable, using initial offline mock data:', err);
      setBackendStatus('Using Standalone Mode (Backend starting...)');
      // Fallback initial data in case Express backend hasn't been started yet
      setPlaylists([
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

  if (authLoading || !isAuthenticated) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.spinner} />
        <span style={{ color: '#888', marginTop: '16px' }}>Loading Dashboard...</span>
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

  const totalVideos = playlists.reduce((acc, p) => acc + p.videoCount, 0);

  return (
    <div className="app-container">
      {/* Header with User Name & Email */}
      <Header />

      <div className="main-layout">
        {/* Sidebar with Dashboard link & Logout button */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="content-area animate-fade-in">
          {/* Top Welcome Banner */}
          <div style={styles.welcomeRow}>
            <div>
              <h1 style={styles.heading}>YouTube Playlists</h1>
              <p style={styles.subheading}>
                Manage your YouTube channel's curated playlists, stats, and privacy settings.
              </p>
            </div>

            <div style={styles.headerActions}>
              <div style={styles.statusChip}>
                <div style={styles.statusDot} />
                <span>{backendStatus}</span>
              </div>
              <button
                onClick={fetchPlaylists}
                style={styles.refreshBtn}
                title="Sync with Express Backend"
              >
                <RefreshCw style={{ width: '16px', height: '16px' }} />
                <span>Sync</span>
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
                <span style={styles.statLabel}>Total Playlists</span>
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
                <span style={styles.statVal}>
                  {playlists.filter(p => p.privacy === 'Private').length}
                </span>
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
              <span>Fetching playlists from Express server...</span>
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
                Try selecting a different filter above.
              </p>
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
    marginBottom: '4px',
  },
  subheading: {
    fontSize: '0.88rem',
    color: '#AAAAAA',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statusChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '0.78rem',
    color: '#CCC',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#00E676',
    boxShadow: '0 0 8px #00E676',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(255, 0, 0, 0.12)',
    border: '1px solid rgba(255, 0, 0, 0.3)',
    color: '#FF0000',
    padding: '8px 14px',
    borderRadius: '16px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
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
  }
};
