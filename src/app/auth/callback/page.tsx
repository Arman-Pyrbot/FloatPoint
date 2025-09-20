'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import VantaBackground from '@/components/VantaBackground';

export default function AuthCallback() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // According to Supabase docs, the client automatically handles the callback
    // We just need to wait for the auth state to update and redirect accordingly
    
    if (!isLoading) {
      if (user) {
        // User is authenticated, redirect to dashboard
        router.replace('/dashboard');
      } else {
        // No user after callback processing, redirect to signin
        router.replace('/auth/signin');
      }
    }
  }, [user, isLoading, router]);

  // Show loading while Supabase processes the callback
  return (
    <>
      <VantaBackground />
      <div className="auth-container">
        <h1><strong>Confirming...</strong></h1>
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