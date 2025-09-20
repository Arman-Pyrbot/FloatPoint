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

      // Parse URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      console.log('URL params:', Object.fromEntries(urlParams));
      console.log('Hash params:', Object.fromEntries(hashParams));

      // Check for error in hash (from Supabase redirect)
      const hashError = hashParams.get('error');
      const hashErrorCode = hashParams.get('error_code');
      const hashErrorDescription = hashParams.get('error_description');

      if (hashError) {
        console.log('Hash error detected:', hashError, hashErrorCode, hashErrorDescription);
        
        // The token is expired on Supabase's side, which means there's a configuration issue
        if (hashErrorCode === 'otp_expired') {
          setError('Email verification failed. This might be a configuration issue. Please try signing up again or contact support.');
        } else {
          setError(hashErrorDescription || 'Email verification failed');
        }
        
        setTimeout(() => router.push('/auth/signin'), 3000);
        return;
      }

      // Check for successful verification parameters
      const tokenHash = urlParams.get('token_hash');
      const type = urlParams.get('type');
      
      if (tokenHash && type) {
        console.log('Found token_hash and type, attempting verification...');
        
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as 'signup' | 'recovery' | 'invite' | 'email_change'
          });

          if (error) {
            console.error('OTP verification error:', error);
            setError('Email verification failed: ' + error.message);
            setTimeout(() => router.push('/auth/signin'), 2000);
          } else if (data.session) {
            console.log('Email verification successful!');
            router.replace('/dashboard');
          } else {
            console.log('Verification succeeded but no session created');
            setError('Email verified but login failed. Please try signing in.');
            setTimeout(() => router.push('/auth/signin'), 2000);
          }
        } catch (err) {
          console.error('Verification error:', err);
          setError('Email verification failed');
          setTimeout(() => router.push('/auth/signin'), 2000);
        }
        return;
      }

      // Fallback: check current session
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setError('Authentication failed: ' + error.message);
          setTimeout(() => router.push('/auth/signin'), 2000);
          return;
        }

        if (data.session) {
          console.log('Session found, redirecting to dashboard');
          router.replace('/dashboard');
          return;
        }

        // No session and no verification parameters
        console.log('No session or verification parameters found');
        setError('Authentication failed. Please try again.');
        setTimeout(() => router.push('/auth/signin'), 2000);

      } catch (err) {
        console.error('Callback error:', err);
        setError('Authentication process failed');
        setTimeout(() => router.push('/auth/signin'), 2000);
      }
    };

    handleCallback();
  }, [router]);

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