'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import VantaBackground from '@/components/VantaBackground';
import supabase from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      console.log('=== AUTH CALLBACK ===');
      console.log('URL:', window.location.href);
      console.log('Hash:', window.location.hash);
      
      try {
        // Check for success/error in URL hash (from Supabase server redirect)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const hashError = hashParams.get('error');
        const hashErrorCode = hashParams.get('error_code');
        const hashErrorDescription = hashParams.get('error_description');

        console.log('Hash params:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          error: hashError, 
          errorCode: hashErrorCode 
        });

        // Handle successful verification (tokens in hash)
        if (accessToken && refreshToken) {
          console.log('Found tokens in hash, setting session...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting session:', error);
            setError('Failed to complete sign in: ' + error.message);
            setProcessing(false);
            setTimeout(() => router.push('/auth/signin'), 3000);
          } else if (data.session) {
            console.log('Session set successfully, redirecting to dashboard');
            router.replace('/dashboard');
          } else {
            console.log('No session created from tokens');
            setError('Sign in incomplete. Please try again.');
            setProcessing(false);
            setTimeout(() => router.push('/auth/signin'), 3000);
          }
          return;
        }

        // Handle errors from Supabase server
        if (hashError) {
          console.error('Supabase server error:', hashError, hashErrorCode, hashErrorDescription);
          
          if (hashErrorCode === 'otp_expired') {
            setError('Email verification link has expired. Please sign up again to get a new link.');
          } else {
            setError(hashErrorDescription || 'Email verification failed');
          }
          
          setProcessing(false);
          setTimeout(() => router.push('/auth/signin'), 3000);
          return;
        }

        // Check URL parameters for direct token (old format)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const type = urlParams.get('type');
        
        console.log('URL params:', { token: !!token, type });

        if (token && type) {
          console.log('Found old format token, attempting verification...');
          
          const { data, error } = await supabase.auth.verifyOtp({
            token,
            type: type as 'signup' | 'recovery' | 'invite' | 'email_change'
          });

          if (error) {
            console.error('Token verification error:', error);
            setError('Email verification failed: ' + error.message);
            setProcessing(false);
            setTimeout(() => router.push('/auth/signin'), 3000);
          } else if (data.session) {
            console.log('Token verification successful, redirecting to dashboard');
            router.replace('/dashboard');
          } else {
            console.log('Token verified but no session created');
            setError('Email verified but sign in failed. Please try signing in manually.');
            setProcessing(false);
            setTimeout(() => router.push('/auth/signin'), 3000);
          }
          return;
        }

        // No tokens or parameters found, wait for auth state
        console.log('No direct tokens found, waiting for auth state...');
        setTimeout(() => {
          if (!isLoading) {
            if (user) {
              console.log('User found via auth state, redirecting to dashboard');
              router.replace('/dashboard');
            } else {
              console.log('No user found after waiting');
              setError('Email verification incomplete. Please try signing in manually.');
              setProcessing(false);
              setTimeout(() => router.push('/auth/signin'), 3000);
            }
          }
        }, 2000);

      } catch (err) {
        console.error('Callback error:', err);
        setError('Authentication process failed');
        setProcessing(false);
        setTimeout(() => router.push('/auth/signin'), 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <>
      <VantaBackground />
      <div className="auth-container">
        <h1><strong>Email Verification</strong></h1>
        
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
        ) : processing ? (
          <div>
            <p style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'white' }}>
              Processing your email confirmation...
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