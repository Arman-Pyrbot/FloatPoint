'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import NLPQueryForm from '@/components/NLPQueryForm';

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, isLoading, router]);

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/signin');
  };

  // If still loading or not authenticated, show loading state
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header actions (sign out) */}
      <div className="absolute top-4 right-4 z-10">
        <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
      </div>

      <div className="container">
        {/* Left Panel */}
        <div className="left-panel">
          <div className="logo">
            <img src="/logo.png" alt="FloatPoint Logo" />
          </div>
          <div className="history">
            <h2>History</h2>
            <ul>
              <li>Search 1</li>
              <li>Search 2</li>
              <li>Search 3</li>
              <li>Search 4</li>
            </ul>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel animate-once">
          <div className="content-wrapper">
            <h1 className="welcome-text">Welcome!</h1>
            <NLPQueryForm compact onSubmitted={() => { /* TODO: add to history */ }} />
          </div>
        </div>
      </div>
    </div>
  );
}