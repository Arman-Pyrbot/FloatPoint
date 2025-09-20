'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import VantaBackground from '@/components/VantaBackground';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const finalizeSignup = async () => {
      try {
        console.log('Processing email verification callback...');

        // Handle email verification callback - modern Supabase approach
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error.message);
          setError(error.message);
          setIsProcessing(false);
          setTimeout(() => router.push('/auth/signin'), 3000);
        } else if (data.session) {
          console.log('User session found, redirecting to dashboard:', data.session.user.email);
          router.push('/dashboard');
        } else {
          // No session found - this is normal for email verification callbacks
          // The auth state change listener in the auth provider will handle the session update
          console.log('No session found yet, waiting for auth state update...');

          // Wait a bit for the auth state to update
          setTimeout(async () => {
            const { data: retrySession } = await supabase.auth.getSession();
            if (retrySession.session) {
              console.log('Session found on retry, redirecting to dashboard');
              router.push('/dashboard');
            } else {
              console.log('Still no session after retry, redirecting to signin');
              setError('Email verification may have failed. Please try signing in.');
              setIsProcessing(false);
              setTimeout(() => router.push('/auth/signin'), 2000);
            }
          }, 2000);
        }
      } catch (err) {
        console.error('Callback processing error:', err);
        setError('Authentication process failed');
        setIsProcessing(false);
        setTimeout(() => router.push('/auth/signin'), 3000);
      }
    };

    finalizeSignup();
  }, [router]);

  return (
    <>
      <VantaBackground />

      <div className="auth-container">
        <h1><strong>Verifying Account</strong></h1>

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
        ) : isProcessing ? (
          <div>
            <p style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'white' }}>
              Verifying your account...
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
        ) : null}
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