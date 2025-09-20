'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import VantaBackground from '@/components/VantaBackground';

export default function SignIn() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(true);
      await signIn(provider);
    } catch (error) {
      console.error('OAuth sign in error:', error);
      setError('Failed to sign in with ' + provider);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <VantaBackground />
      
      <div className="auth-container">
        <h1><strong>Sign in to <span>Float Point</span></strong></h1>
        
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
          </div>
        )}
        
        <button className="auth-btn" onClick={() => handleOAuthSignIn('google')} disabled={isLoading}>
          Sign in with Google
        </button>
        <button className="auth-btn" onClick={() => handleOAuthSignIn('github')} disabled={isLoading}>
          Sign in with GitHub
        </button>
        <button className="auth-btn" onClick={() => router.push('/auth/signin-email')} disabled={isLoading}>
          Sign in with Email
        </button>

        <p className="switch">
          Don&apos;t have an account? <a href="/auth/signup">Sign up</a>
        </p>
      </div>
    </>
  );
}