'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Youtube, ShieldCheck, ListVideo, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = () => {
    login({
      name: 'Alex Johnson',
      email: 'alex.johnson@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      googleId: '109823749281'
    });
    router.push('/dashboard');
  };

  return (
    <div style={styles.container}>
      {/* Background Glow Overlay */}
      <div style={styles.glowBg} />

      <div style={styles.loginCard} className="glass-panel animate-fade-in">
        {/* Header Branding */}
        <div style={styles.header}>
          <div style={styles.logoIcon}>
            <Youtube style={{ width: '36px', height: '36px', color: '#FF0000', fill: '#FF0000' }} />
          </div>
          <h1 style={styles.title}>YouTube Playlist Manager</h1>
          <p style={styles.subtitle}>
            Organize, curate, and optimize your YouTube playlists with ease.
          </p>
        </div>

        {/* Feature Badges */}
        <div style={styles.featureGrid}>
          <div style={styles.featureItem}>
            <ListVideo style={styles.featureIcon} />
            <span>Manage All Playlists</span>
          </div>
          <div style={styles.featureItem}>
            <Sparkles style={styles.featureIcon} />
            <span>Smart Tags & Filters</span>
          </div>
          <div style={styles.featureItem}>
            <ShieldCheck style={styles.featureIcon} />
            <span>Secure Google OAuth</span>
          </div>
        </div>

        {/* Google Login Section */}
        <div style={styles.actionContainer}>
          <button
            onClick={handleGoogleLogin}
            style={styles.googleBtn}
          >
            {/* Google SVG Logo */}
            <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
            <ArrowRight style={{ width: '16px', height: '16px', marginLeft: 'auto', opacity: 0.6 }} />
          </button>

          <p style={styles.footerNote}>
            By signing in, you grant access to manage your YouTube Playlists via official Google OAuth2.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F0F0F',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  glowBg: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(255,0,0,0.18) 0%, rgba(15,15,15,0) 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  loginCard: {
    width: '100%',
    maxWidth: '440px',
    borderRadius: '24px',
    padding: '40px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
  },
  header: {
    marginBottom: '28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '18px',
    backgroundColor: 'rgba(255, 0, 0, 0.12)',
    border: '1px solid rgba(255, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    boxShadow: '0 8px 20px rgba(255, 0, 0, 0.2)',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: '8px',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '0.88rem',
    color: '#AAAAAA',
    lineHeight: '1.5',
  },
  featureGrid: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '32px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: '16px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.84rem',
    color: '#DDDDDD',
    fontWeight: '500',
  },
  featureIcon: {
    width: '16px',
    height: '16px',
    color: '#FF0000',
  },
  actionContainer: {
    width: '100%',
  },
  googleBtn: {
    width: '100%',
    height: '48px',
    backgroundColor: '#FFFFFF',
    color: '#1F1F1F',
    border: 'none',
    borderRadius: '14px',
    padding: '0 20px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(255, 255, 255, 0.1)',
  },
  footerNote: {
    fontSize: '0.74rem',
    color: '#777777',
    marginTop: '16px',
    lineHeight: '1.4',
  }
};
