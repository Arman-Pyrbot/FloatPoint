'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import VantaBackground from '@/components/VantaBackground';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const urlHash = window.location.hash;
        
        console.log('Full URL:', window.location.href);
        console.log('Hash:', urlHash);
        console.log('Search params:', url.searchParams.toString());

        // Handle hash-based parameters (common in email verification)
        if (urlHash) {
          const hashParams = new URLSearchParams(urlHash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const type = hashParams.get('type');
          
          console.log('Hash params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });
          
          if (accessToken && type === 'signup') {
            console.log('Processing email verification from hash...');
            // The session should be automatically set by Supabase
            setTimeout(() => {
              router.replace('/dashboard');
            }, 1000);
            return;
          }
        }

        // Handle URL search parameters (OAuth and some email flows)
        const code = url.searchParams.get('code');
        const error_code = url.searchParams.get('error');
        const error_description = url.searchParams.get('error_description');

        // Handle OAuth errors
        if (error_code) {
          setError(error_description || 'Authentication failed');
          console.error('OAuth error:', error_code, error_description);
          setTimeout(() => router.push('/auth/signin'), 3000);
          return;
        }

        // Handle OAuth code exchange
        if (code) {
          console.log('Processing OAuth code...');
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setError(error.message);
            console.error('Auth callback error:', error);
            await supabase.auth.signOut();
            setTimeout(() => router.push('/auth/signin'), 3000);
          } else {
            console.log('OAuth authentication successful');
            router.replace('/dashboard');
          }
          return;
        }

        // Check current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Session error. Please try again.');
          setTimeout(() => router.push('/auth/signin'), 3000);
          return;
        }

        if (session) {
          console.log('Session found, redirecting to dashboard');
          router.replace('/dashboard');
          return;
        }

        // If we get here, no valid auth parameters were found
        console.log('No valid authentication parameters found');
        setError('Invalid authentication link. Please try signing in again.');
        setTimeout(() => router.push('/auth/signin'), 3000);

      } catch (err) {
        console.error('Auth callback exception:', err);
        setError('Authentication process failed');
        setTimeout(() => router.push('/auth/signin'), 3000);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <>
      <VantaBackground />

      <div className="auth-container">
        <h1><strong>Authentication</strong></h1>

        {error ? (
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
        ) : (
          <div>
            <p style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'white' }}>Processing authentication...</p>
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
        )}
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