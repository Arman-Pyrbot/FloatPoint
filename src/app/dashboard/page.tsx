'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import PredictionForm from '@/components/PredictionForm';

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

      <div className="bg-white rounded-lg shadow-md p-6 mb-8 dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user.email || 'User'}</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Use the AI-powered prediction model to forecast oceanographic and biogeochemical parameters.
        </p>
      </div>

      {/* BGC Prediction Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">🌊 BGC Parameter Prediction</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Predict next-step oceanographic and biogeochemical parameters using our LSTM model trained on Indian Ocean data.
        </p>
        <PredictionForm />
      </div>


      </div>
    </div>
  );
}