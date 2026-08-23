'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Youtube, Search, Bell, User as UserIcon } from 'lucide-react';

export default function Header() {
  const { user, loginWithGoogle } = useAuth();

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

      {/* User Info Section (Displays Name and Email ID of signed-in user or Sign in button) */}
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
          <button
            onClick={loginWithGoogle}
            style={styles.googleHeaderBtn}
            title="Sign in with Google Account"
          >
            <svg style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign in with Google</span>
          </button>
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
  },
  googleHeaderBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FFFFFF',
    color: '#1F1F1F',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(255, 255, 255, 0.15)',
    transition: 'all 0.2s ease',
  }
};
