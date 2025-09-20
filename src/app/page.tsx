'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import VantaBackground from '@/components/VantaBackground';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  // Show loading or redirect if user is authenticated
  if (isLoading) {
    return (
      <>
        <VantaBackground />
        <div className="auth-container">
          <p style={{ color: 'white' }}>Loading...</p>
        </div>
      </>
    );
  }

  // If user is authenticated, don't show the homepage (will redirect)
  if (user) {
    return null;
  }

  return (
    <>
      <VantaBackground />
      
      {/* Animated Project Name */}
      <div className="project-name">
        <h1>Float Point</h1>
      </div>

      {/* Bottom Buttons */}
      <div className="index-buttons">
        <button className="index-btn" onClick={handleSignIn}>Sign in</button>
        <button className="index-btn" onClick={handleSignUp}>Sign up</button>
      </div>
    </>
  );
}
