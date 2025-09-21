'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import PredictionForm from '@/components/PredictionForm';
import NLPQueryForm from '@/components/NLPQueryForm';
import QueryHistory from '@/components/QueryHistory';
import UserProfile from '@/components/UserProfile';

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user.email || 'User'}</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Use AI-powered models to forecast oceanographic parameters through natural language queries or direct parameter input.
          </p>
        </div>
        <UserProfile />
      </div>

      {/* NLP Query Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">🗣️ Natural Language Queries</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Ask questions about ocean conditions in natural language and get AI-powered responses.
        </p>
        <NLPQueryForm />
      </div>

      {/* BGC Prediction Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">🌊 BGC Parameter Prediction</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Predict next-step oceanographic and biogeochemical parameters using direct parameter input.
        </p>
        <PredictionForm />
      </div>

      {/* Query History Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">📚 Query History</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          View and manage your recent queries and predictions.
        </p>
        <QueryHistory />
      </div>

      </div>
    </div>
  );
}