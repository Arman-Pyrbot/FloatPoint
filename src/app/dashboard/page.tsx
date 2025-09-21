'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import PredictionForm from '@/components/PredictionForm';
import NLPQueryForm from '@/components/NLPQueryForm';
import QueryHistory from '@/components/QueryHistory';

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
      <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">FloatPoint Dashboard</h1>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>


      {/* NLP Query Section */}
      <div className="mb-8">
        <NLPQueryForm />
      </div>

      {/* BGC Prediction Section */}
      <div className="mb-8">
        <PredictionForm />
      </div>

      {/* Query History Section */}
      <div className="mb-8">
        <QueryHistory />
      </div>

      </div>
    </div>
  );
}