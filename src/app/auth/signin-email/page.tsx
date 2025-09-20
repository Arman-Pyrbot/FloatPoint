'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import VantaBackground from '@/components/VantaBackground';

export default function SignInEmail() {
  const router = useRouter();
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      await signInWithEmail(email, password);
      router.push('/dashboard');
    } catch (error: Error | unknown) {
      console.error('Email sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with email';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <VantaBackground />
      
      <div className="auth-container">
        <h1><strong>Sign in with Email</strong></h1>
        
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
        
        <form onSubmit={handleEmailSignIn}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="switch">
          Don&apos;t have an account? <a href="/auth/signup-email">Sign up</a>
        </p>
      </div>
    </>
  );
}