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
        // Handle OAuth code (for social logins)
        const { searchParams } = new URL(window.location.href);
        const code = searchParams.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setError(error.message);
            console.error('Auth callback error:', error);
            setTimeout(() => router.push('/auth/signin'), 2000);
          } else {
            router.push('/dashboard');
          }
          return;
        }

        // Handle email verification result (comes in URL hash)
        const hashFragment = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hashFragment);
        
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        // Handle successful email verification
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            setError('Failed to set session: ' + error.message);
            setTimeout(() => router.push('/auth/signin'), 2000);
          } else {
            router.push('/dashboard');
          }
          return;
        }

        // Handle email verification errors
        if (errorParam) {
          setError(errorDescription || 'Email verification failed');
          setTimeout(() => router.push('/auth/signin'), 2000);
          return;
        }

        // Fallback: check if already authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push('/dashboard');
          return;
        }

        // No valid parameters found
        setError('No authentication data found');
        setTimeout(() => router.push('/auth/signin'), 2000);

      } catch (err) {
        console.error('Auth callback exception:', err);
        setError('Authentication process failed');
        setTimeout(() => router.push('/auth/signin'), 2000);
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