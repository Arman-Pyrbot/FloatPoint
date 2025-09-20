'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import VantaBackground from '@/components/VantaBackground';

export default function AuthCallback() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Let Supabase handle the callback automatically through the auth provider
    const handleCallback = async () => {
      // Wait a moment for auth state to update
      setTimeout(() => {
        if (!isLoading) {
          if (user) {
            // User is authenticated, redirect to dashboard
            router.replace('/dashboard');
          } else {
            // No user found after callback processing
            setError('Authentication failed. Please try again.');
            setTimeout(() => router.push('/auth/signin'), 2000);
          }
        }
      }, 2000);
    };

    handleCallback();
  }, [user, isLoading, router]);

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