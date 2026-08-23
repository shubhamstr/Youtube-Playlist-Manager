'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const status = searchParams.get('status');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google Auth callback error:', error);
      router.push(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (status === 'success' && userParam) {
      try {
        const userObj = JSON.parse(decodeURIComponent(userParam));
        login(userObj);
        router.push('/dashboard');
      } catch (err) {
        console.error('Failed to parse user session data:', err);
        router.push('/login');
      }
    } else {
      // Fallback check against backend session
      fetch('http://localhost:5000/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (data.authenticated && data.user) {
            login(data.user);
            router.push('/dashboard');
          } else {
            router.push('/login');
          }
        })
        .catch(() => {
          router.push('/login');
        });
    }
  }, [searchParams, router, login]);

  return (
    <div style={styles.container}>
      <div style={styles.spinner} />
      <h2 style={styles.text}>Completing Google Authentication...</h2>
      <p style={styles.subtext}>Please wait while we log you into YouTube Playlist Manager.</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={styles.container}>
        <div style={styles.spinner} />
        <h2 style={styles.text}>Loading...</h2>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F0F0F',
    color: '#FFFFFF',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255, 0, 0, 0.2)',
    borderTopColor: '#FF0000',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginBottom: '20px'
  },
  text: {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '8px'
  },
  subtext: {
    fontSize: '0.88rem',
    color: '#888888'
  }
};
