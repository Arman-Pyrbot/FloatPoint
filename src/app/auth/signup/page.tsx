'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import VantaBackground from '@/components/VantaBackground';

export default function SignUp() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuthSignUp = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(true);
      await signIn(provider);
    } catch (error) {
      console.error('OAuth sign up error:', error);
      setError('Failed to sign up with ' + provider);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <VantaBackground />
      
      <div className="auth-container">
        <h1><strong>Create your <span>Float Point</span> account</strong></h1>
        
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
        
        <button className="auth-btn" onClick={() => handleOAuthSignUp('google')} disabled={isLoading}>
          Sign up with Google
        </button>
        <button className="auth-btn" onClick={() => handleOAuthSignUp('github')} disabled={isLoading}>
          Sign up with GitHub
        </button>
        <button className="auth-btn" onClick={() => router.push('/auth/signup-email')} disabled={isLoading}>
          Sign up with Email
        </button>

        <p className="switch">
          Already have an account? <a href="/auth/signin">Sign in</a>
        </p>
      </div>
    </>
  );
}