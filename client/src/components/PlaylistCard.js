'use client';

import React, { useState } from 'react';
import { Play, Lock, Globe, EyeOff, ExternalLink, Tv, Eye, Edit3 } from 'lucide-react';

export default function PlaylistCard({ playlist, onView, onEdit }) {
  const [imgError, setImgError] = useState(false);

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

  const handleOpenPlaylist = (e) => {
    e.stopPropagation();
    const url = playlist.youtubeUrl || `https://www.youtube.com/playlist?list=${playlist.id}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="glass-card" style={styles.card}>
      {/* Thumbnail Container */}
      <div style={styles.thumbnailWrapper} onClick={() => onView && onView(playlist)}>
        {!imgError && playlist.thumbnail ? (
          <img
            src={playlist.thumbnail}
            alt={playlist.title}
            onError={() => setImgError(true)}
            style={styles.thumbnailImg}
          />
        ) : (
          <div style={styles.fallbackThumb}>
            <Tv style={{ width: '36px', height: '36px', color: '#FF0000' }} />
          </div>
        )}

        {/* Overlay Count Badge */}
        <div style={styles.countBadge}>
          <Play style={{ width: '12px', height: '12px', fill: '#FFF' }} />
          <span>{playlist.videoCount} {playlist.videoCount === 1 ? 'video' : 'videos'}</span>
        </div>
      </div>

      {/* Playlist Content */}
      <div style={styles.cardBody}>
        <div style={styles.headerRow}>
          <span style={styles.privacyBadge}>
            {getPrivacyIcon(playlist.privacy)}
            <span style={{ fontSize: '0.72rem', color: '#CCC', fontWeight: '600' }}>{playlist.privacy}</span>
          </span>
          <span style={styles.updatedText}>{playlist.updatedAt}</span>
        </div>

        <h3 style={styles.title} title={playlist.title} onClick={() => onView && onView(playlist)}>
          {playlist.title}
        </h3>
        
        {playlist.channelTitle && (
          <span style={styles.channelText}>by {playlist.channelTitle}</span>
        )}

        <p style={styles.description}>{playlist.description || 'No description available for this playlist.'}</p>

        {/* Tags */}
        <div style={styles.tagRow}>
          {playlist.tags && playlist.tags.map((tag, idx) => (
            <span key={idx} style={styles.tag}>
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Button Row */}
        <div style={styles.actionRow}>
          <button onClick={() => onView && onView(playlist)} style={styles.viewBtn} title="View Playlist Details">
            <Eye style={{ width: '14px', height: '14px' }} />
            <span>View</span>
          </button>
          
          <button onClick={() => onEdit && onEdit(playlist)} style={styles.editBtn} title="Edit Playlist Name & Details">
            <Edit3 style={{ width: '14px', height: '14px' }} />
            <span>Edit</span>
          </button>

          <button onClick={handleOpenPlaylist} style={styles.ytBtn} title="Open on YouTube">
            <ExternalLink style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  thumbnailWrapper: {
    position: 'relative',
    width: '100%',
    height: '160px',
    backgroundColor: '#151515',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  fallbackThumb: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
  },
  countBadge: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(4px)',
    padding: '4px 10px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#FFFFFF',
    fontSize: '0.75rem',
    fontWeight: '600',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  cardBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  privacyBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  updatedText: {
    fontSize: '0.72rem',
    color: '#888888',
  },
  title: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '2px',
    lineHeight: '1.3',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  channelText: {
    fontSize: '0.75rem',
    color: '#E50914',
    fontWeight: '600',
    marginBottom: '8px',
  },
  description: {
    fontSize: '0.82rem',
    color: '#AAAAAA',
    lineHeight: '1.4',
    marginBottom: '12px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  tagRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  tag: {
    fontSize: '0.7rem',
    fontWeight: '500',
    color: '#FF4D4D',
    backgroundColor: 'rgba(255, 0, 0, 0.08)',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  actionRow: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  viewBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#FFFFFF',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'background 0.2s ease',
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#FF0000',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'background 0.2s ease',
  },
  ytBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#AAA',
    borderRadius: '10px',
    padding: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};
