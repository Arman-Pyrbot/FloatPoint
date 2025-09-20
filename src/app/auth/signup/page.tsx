'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import VantaBackground from '@/components/VantaBackground';

export default function SignUp() {
  const router = useRouter();
  const { signIn, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    if (!firstName || !lastName) {
      setError('Please enter your first and last name');
      return;
    }
    
    try {
      setIsLoading(true);
      await signUpWithEmail(email, password);
      setSuccess('Sign-up successful! Please check your email for verification.');
    } catch (error: Error | unknown) {
      console.error('Email sign up error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up with email';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <VantaBackground />
      
      <div className="auth-container">
        {isEmailMode ? (
          <>
            <h1><strong>Create your account</strong></h1>
            
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
            
            {success && (
              <div style={{ 
                marginBottom: '15px', 
                padding: '10px', 
                background: 'rgba(34, 197, 94, 0.1)', 
                border: '1px solid rgba(34, 197, 94, 0.3)', 
                borderRadius: '8px', 
                color: '#86efac',
                fontSize: '0.9rem'
              }}>
                {success}
              </div>
            )}
            
            <form onSubmit={handleEmailSignUp}>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isLoading}
                required
              />
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
                {isLoading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>

            <p className="switch">
              Already have an account? <a href="/auth/signin">Sign in</a>
            </p>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </>
  );
}