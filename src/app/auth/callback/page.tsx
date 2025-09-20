'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import VantaBackground from '@/components/VantaBackground';
import supabase from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      console.log('=== CALLBACK DEBUG ===');
      console.log('Current URL:', window.location.href);
      console.log('Hash:', window.location.hash);
      console.log('Search params:', window.location.search);

      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        console.log('URL params:', Object.fromEntries(urlParams));
        console.log('Hash params:', Object.fromEntries(hashParams));

        // Check for access token in hash (email verification)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (accessToken && refreshToken) {
          console.log('Found tokens in hash, setting session...');
          
          // Set the session manually
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting session:', error);
            setError('Email verification failed: ' + error.message);
            setTimeout(() => router.push('/auth/signin'), 2000);
          } else if (data.session) {
            console.log('Session set successfully:', data.session.user.email);
            router.replace('/dashboard');
          } else {
            console.log('No session created');
            setError('Email verification failed. Please try again.');
            setTimeout(() => router.push('/auth/signin'), 2000);
          }
          return;
        }

        // Handle other callback types (OAuth, etc.)
        const code = urlParams.get('code');
        if (code) {
          console.log('Found OAuth code, exchanging...');
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('OAuth error:', error);
            setError('Authentication failed: ' + error.message);
            setTimeout(() => router.push('/auth/signin'), 2000);
          } else {
            console.log('OAuth successful');
            router.replace('/dashboard');
          }
          return;
        }

        // Fallback: wait for auth state to update
        console.log('No direct tokens found, waiting for auth state...');
        setTimeout(() => {
          console.log('After timeout - User:', !!user, 'IsLoading:', isLoading);
          if (!isLoading) {
            if (user) {
              console.log('User authenticated via auth state, redirecting');
              router.replace('/dashboard');
            } else {
              console.log('No user found after waiting');
              setError('Authentication failed. Please try again.');
              setTimeout(() => router.push('/auth/signin'), 2000);
            }
          }
        }, 2000);

      } catch (err) {
        console.error('Callback error:', err);
        setError('Authentication process failed');
        setTimeout(() => router.push('/auth/signin'), 2000);
      }
    };

    handleCallback();
  }, [router]); // Removed user and isLoading dependencies to prevent re-runs

  // Show loading while processing
  if (isLoading || (!error && !user)) {
    return (
      <>
        <VantaBackground />
        <div className="auth-container">
          <h1><strong>Authentication</strong></h1>
          <div>
            <p style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'white' }}>
              Processing authentication...
            </p>
            <div style={{
              width: '32px',
              height: '32px',
              border: '2px solid transparent',
              borderTop: '2px solid #38bdf8',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  // Show error if authentication failed
  return (
    <>
      <VantaBackground />
      <div className="auth-container">
        <h1><strong>Authentication</strong></h1>
        {error && (
          <div style={{
            marginBottom: '15px',
            padding: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '0.9rem'
          }}>
            {error}
            <p style={{ marginTop: '8px', fontSize: '0.8rem' }}>Redirecting to sign-in page...</p>
          </div>
        )}
      </div>
    </>
  );
}