'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import VantaBackground from '@/components/VantaBackground';

export default function AuthCallback() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Simple approach: just wait for Supabase to automatically handle the callback
    // and update the auth state, then redirect accordingly
    
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (user) {
          router.replace('/dashboard');
        } else {
          router.replace('/auth/signin');
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, isLoading, router]);

  return (
    <>
      <VantaBackground />
      <div className="auth-container">
        <h1><strong>Processing...</strong></h1>
        <div>
          <p style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'white' }}>
            Completing your sign in...
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