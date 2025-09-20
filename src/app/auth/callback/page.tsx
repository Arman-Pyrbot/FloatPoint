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
        const { searchParams } = new URL(window.location.href);
        const code = searchParams.get('code');
        const error_code = searchParams.get('error');
        const error_description = searchParams.get('error_description');

        // Handle OAuth errors
        if (error_code) {
          setError(error_description || 'Authentication failed');
          console.error('OAuth error:', error_code, error_description);
          setTimeout(() => router.push('/auth/signin'), 3000);
          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setError(error.message);
            console.error('Auth callback error:', error);
            // Clear any existing session on error
            await supabase.auth.signOut();
            setTimeout(() => router.push('/auth/signin'), 3000);
          } else {
            // Successfully authenticated, redirect to dashboard
            router.replace('/dashboard');
          }
        } else {
          // Check if already authenticated
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('Session error:', sessionError);
            // Clear invalid session
            await supabase.auth.signOut();
            setError('Session expired. Please sign in again.');
            setTimeout(() => router.push('/auth/signin'), 3000);
            return;
          }

          if (session) {
            router.replace('/dashboard');
            return;
          }

          setError('No authentication code found');
          setTimeout(() => router.push('/auth/signin'), 3000);
        }
      } catch (err) {
        console.error('Auth callback exception:', err);
        // Clear any existing session on exception
        await supabase.auth.signOut();
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