'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut } from 'lucide-react';

export default function Sidebar() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside style={styles.sidebar}>
      <nav style={styles.navGroup}>
        {/* Dashboard Link */}
        <div style={styles.activeNavItem}>
          <div style={styles.activeIndicator} />
          <LayoutDashboard style={styles.navIconActive} />
          <span style={styles.navTextActive}>Dashboard</span>
        </div>
      </nav>

      {/* Footer Section: Logout Button */}
      <div style={styles.footerSection}>
        <button
          onClick={handleLogout}
          style={styles.logoutBtn}
          title="Sign out of your account"
        >
          <LogOut style={{ width: '18px', height: '18px', color: '#FF4D4D' }} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    top: '64px',
    left: 0,
    bottom: 0,
    width: '240px',
    backgroundColor: '#181818',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px 12px',
    zIndex: 90,
  },
  navGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  activeNavItem: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 0, 0, 0.12)',
    border: '1px solid rgba(255, 0, 0, 0.25)',
    color: '#FFFFFF',
    fontWeight: '600',
    cursor: 'pointer',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '20%',
    bottom: '20%',
    width: '4px',
    backgroundColor: '#FF0000',
    borderRadius: '0 4px 4px 0',
  },
  navIconActive: {
    width: '20px',
    height: '20px',
    color: '#FF0000',
  },
  navTextActive: {
    fontSize: '0.92rem',
    color: '#FFFFFF',
  },
  footerSection: {
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
  logoutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 77, 77, 0.08)',
    border: '1px solid rgba(255, 77, 77, 0.2)',
    color: '#FF4D4D',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }
};
