'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import VantaBackground from '@/components/VantaBackground';

export default function ResendConfirmation() {
  const { resendConfirmation } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setIsLoading(true);
      await resendConfirmation(email);
      setSuccess('Confirmation email sent! Please check your inbox and click the verification link.');
    } catch (error: Error | unknown) {
      console.error('Resend confirmation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend confirmation email';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <VantaBackground />
      
      <div className="auth-container">
        <h1><strong>Resend Confirmation</strong></h1>
        
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
        
        <form onSubmit={handleResend}>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Resend Confirmation Email'}
          </button>
        </form>

        <p className="switch">
          Remember your password? <a href="/auth/signin-email">Sign in</a>
        </p>
      </div>
    </>
  );
}