'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Youtube, Search, Bell, User as UserIcon } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();

  return (
    <header style={styles.header}>
      {/* Brand / Logo */}
      <div style={styles.logoSection}>
        <div style={styles.logoBadge}>
          <Youtube style={{ width: '22px', height: '22px', color: '#FF0000', fill: '#FF0000' }} />
        </div>
        <div style={styles.brandTitleContainer}>
          <span style={styles.brandTitle}>YouTube</span>
          <span style={styles.brandSubtitle}>Playlist Manager</span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div style={styles.searchContainer}>
        <div style={styles.searchWrapper}>
          <Search style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search playlists, tags, or videos..."
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* User Info Section (Displays Name and Email ID of signed-in user) */}
      <div style={styles.userSection}>
        {user ? (
          <div style={styles.userProfileBadge}>
            <div style={styles.avatarContainer}>
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={styles.avatarImg}
                />
              ) : (
                <div style={styles.avatarFallback}>
                  <UserIcon style={{ width: '16px', height: '16px', color: '#FFF' }} />
                </div>
              )}
            </div>
            
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user.name}</span>
              <span style={styles.userEmail}>{user.email}</span>
            </div>
          </div>
        ) : (
          <div style={styles.guestBadge}>
            <span>Not Signed In</span>
          </div>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '64px',
    backgroundColor: '#181818',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    zIndex: 100,
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  logoBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    border: '1px solid rgba(255, 0, 0, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitleContainer: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '1.2',
  },
  brandTitle: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: '-0.02em',
  },
  brandSubtitle: {
    fontSize: '0.72rem',
    fontWeight: '600',
    color: '#FF0000',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  searchContainer: {
    flex: '0 1 420px',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    width: '16px',
    height: '16px',
    color: '#888888',
  },
  searchInput: {
    width: '100%',
    backgroundColor: '#0F0F0F',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '8px 16px 8px 40px',
    color: '#FFFFFF',
    fontSize: '0.85rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userProfileBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '6px 14px 6px 8px',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  avatarContainer: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid #FF0000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252525',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarFallback: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#F1F1F1',
    lineHeight: '1.2',
  },
  userEmail: {
    fontSize: '0.72rem',
    color: '#AAAAAA',
  },
  guestBadge: {
    fontSize: '0.8rem',
    color: '#AAAAAA',
  }
};
