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
    const handleCallback = async () => {
      try {
        console.log('Processing email verification callback...');
        console.log('Current URL:', window.location.href);
        
        // Check for tokens in URL hash (email verification result)
        const hashFragment = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hashFragment);
        
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        
        console.log('Hash params:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          error: errorParam 
        });

        // Handle verification errors
        if (errorParam) {
          console.error('Email verification error:', errorParam, errorDescription);
          setError(errorDescription || 'Email verification failed');
          setIsProcessing(false);
          setTimeout(() => router.push('/auth/signin'), 3000);
          return;
        }

        // Handle successful verification with tokens
        if (accessToken && refreshToken) {
          console.log('Setting session from verification tokens...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting session:', error);
            setError('Failed to complete verification: ' + error.message);
            setIsProcessing(false);
            setTimeout(() => router.push('/auth/signin'), 3000);
          } else if (data.session) {
            console.log('Email verification successful! User:', data.session.user.email);
            router.push('/dashboard');
          } else {
            console.log('Session set but no session data returned');
            setError('Verification incomplete. Please try signing in.');
            setIsProcessing(false);
            setTimeout(() => router.push('/auth/signin'), 3000);
          }
          return;
        }

        // Handle OAuth code (for social logins)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          console.log('Processing OAuth code...');
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('OAuth error:', error);
            setError('OAuth authentication failed: ' + error.message);
            setIsProcessing(false);
            setTimeout(() => router.push('/auth/signin'), 3000);
          } else {
            console.log('OAuth successful');
            router.push('/dashboard');
          }
          return;
        }

        // Check if user is already authenticated
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          console.log('User already authenticated, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }

        // No valid authentication data found
        console.log('No authentication data found in callback');
        setError('No verification data found. Please try signing up again.');
        setIsProcessing(false);
        setTimeout(() => router.push('/auth/signin'), 3000);

      } catch (err) {
        console.error('Callback processing error:', err);
        setError('Authentication process failed');
        setIsProcessing(false);
        setTimeout(() => router.push('/auth/signin'), 3000);
      }
    };

    handleCallback();
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