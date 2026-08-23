'use client';

import React from 'react';
import { Play, Lock, Globe, EyeOff, MoreVertical } from 'lucide-react';

export default function PlaylistCard({ playlist }) {
  const getPrivacyIcon = (privacy) => {
    switch (privacy) {
      case 'Private':
        return <Lock style={{ width: '12px', height: '12px', color: '#FFB800' }} />;
      case 'Unlisted':
        return <EyeOff style={{ width: '12px', height: '12px', color: '#888888' }} />;
      default:
        return <Globe style={{ width: '12px', height: '12px', color: '#00E676' }} />;
    }
  };

  return (
    <div className="glass-card" style={styles.card}>
      {/* Thumbnail Container */}
      <div style={styles.thumbnailWrapper}>
        <img
          src={playlist.thumbnail}
          alt={playlist.title}
          style={styles.thumbnailImg}
        />
        {/* Overlay Count Badge */}
        <div style={styles.countBadge}>
          <Play style={{ width: '12px', height: '12px', fill: '#FFF' }} />
          <span>{playlist.videoCount} videos</span>
        </div>
      </div>

      {/* Playlist Content */}
      <div style={styles.cardBody}>
        <div style={styles.headerRow}>
          <span style={styles.privacyBadge}>
            {getPrivacyIcon(playlist.privacy)}
            <span style={{ fontSize: '0.72rem', color: '#CCC' }}>{playlist.privacy}</span>
          </span>
          <span style={styles.updatedText}>{playlist.updatedAt}</span>
        </div>

        <h3 style={styles.title}>{playlist.title}</h3>
        <p style={styles.description}>{playlist.description}</p>

        {/* Tags */}
        <div style={styles.tagRow}>
          {playlist.tags && playlist.tags.map((tag, idx) => (
            <span key={idx} style={styles.tag}>
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <button style={styles.actionBtn}>
          <Play style={{ width: '14px', height: '14px', fill: '#FFF' }} />
          <span>View Playlist</span>
        </button>
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
  },
  thumbnailWrapper: {
    position: 'relative',
    width: '100%',
    height: '160px',
    backgroundColor: '#151515',
    overflow: 'hidden',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '2px 8px',
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
    marginBottom: '6px',
    lineHeight: '1.3',
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
  actionBtn: {
    marginTop: 'auto',
    width: '100%',
    backgroundColor: '#FF0000',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    padding: '8px 14px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background 0.2s ease',
  }
};
