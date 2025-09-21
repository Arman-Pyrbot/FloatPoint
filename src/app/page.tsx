'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import VantaBackground from '@/components/VantaBackground';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // No automatic redirect - users always see homepage

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  const handleDashboard = () => {
    router.push('/dashboard');
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

  // Show different buttons based on authentication status

  return (
    <>
      <VantaBackground />
      
      {/* Animated Project Name */}
      <div className="project-name">
        <Image src="/logo.png" alt="Float Point Logo" className="logo" width={144} height={144} priority />
        <h1 className="homepage-title">Float Point</h1>
      </div>

      {/* Bottom Buttons */}
      <div className="index-buttons">
        {user ? (
          <>
            <button className="index-btn" onClick={handleDashboard}>Go to Dashboard</button>
            <button className="index-btn" onClick={handleSignIn}>Switch Account</button>
          </>
        ) : (
          <>
            <button className="index-btn" onClick={handleSignIn}>Sign in</button>
            <button className="index-btn" onClick={handleSignUp}>Sign up</button>
          </>
        )}
      </div>
    </>
  );
}
