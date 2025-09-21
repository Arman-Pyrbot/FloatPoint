'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import supabase from '@/lib/supabaseClient';
import PredictionForm from '@/components/PredictionForm';

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: number; region: string; temperature: number; salinity: number; depth: number }> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  // Handle mock query submission
  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setResults(null);
    
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    try {
      setIsSubmitting(true);

      // Mock query - in a real app, this would be a more complex query based on user input
      // For this demo, we'll just insert the query into the queries table and return mock results
      
      // First, check if the user profile exists and create it if it doesn't
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user?.id)
        .single();

      if (!userProfile) {
        // Create user profile if it doesn't exist
        const { error: createProfileError } = await supabase
          .from('user_profiles')
          .insert([
            { 
              id: user?.id,
              name: user?.email?.split('@')[0] || 'User',
              created_at: new Date().toISOString()
            }
          ]);

        if (createProfileError) throw createProfileError;
      }
      
      // Now insert the query into the database
      const { data: insertData, error: insertError } = await supabase
        .from('queries')
        .insert([
          { 
            user_id: user?.id,
            query_text: query,
            params: { source: 'dashboard', timestamp: new Date().toISOString() }
          }
        ])
        .select();

      if (insertError) throw insertError;

      // Mock results - in a real app, this would be actual data from the database
      const mockResults = [
        { id: 1, region: 'North Atlantic', temperature: 18.5, salinity: 35.2, depth: 100 },
        { id: 2, region: 'South Pacific', temperature: 22.3, salinity: 34.8, depth: 150 },
        { id: 3, region: 'Indian Ocean', temperature: 24.1, salinity: 35.0, depth: 200 },
      ];

      // Update the cache with the mock results
      const { error: cacheError } = await supabase
        .from('datasets_cache')
        .insert([
          {
            query_id: insertData[0].id,
            source: 'mock_data',
            region: query.toLowerCase().includes('atlantic') ? 'North Atlantic' : 
                   query.toLowerCase().includes('pacific') ? 'South Pacific' : 'Indian Ocean',
            variable: 'temperature,salinity,depth',
            data: { results: mockResults }
          }
        ]);

      if (cacheError) throw cacheError;

      setResults(mockResults);
      setSuccess('Query executed successfully!');
    } catch (err: Error | unknown) {
      console.error('Query error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute query';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
          Use the AI-powered prediction model to forecast oceanographic parameters or query historical data.
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

      <div className="bg-white rounded-lg shadow-md p-6 mb-8 dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">📊 Historical Data Query</h2>
        
        <form onSubmit={handleSubmitQuery} className="space-y-4">
          <div>
            <label htmlFor="query" className="block text-sm font-medium mb-1">
              Enter your query in natural language
            </label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Show me temperature and salinity data from the North Atlantic"
              className="w-full p-3 border rounded-md focus:ring focus:ring-blue-300 min-h-[100px]"
              disabled={isSubmitting}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Run Query'}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
      </div>

      {results && (
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Query Results</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="py-2 px-4 text-left">Region</th>
                  <th className="py-2 px-4 text-left">Temperature (°C)</th>
                  <th className="py-2 px-4 text-left">Salinity (PSU)</th>
                  <th className="py-2 px-4 text-left">Depth (m)</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id} className="border-t">
                    <td className="py-2 px-4">{result.region}</td>
                    <td className="py-2 px-4">{result.temperature}</td>
                    <td className="py-2 px-4">{result.salinity}</td>
                    <td className="py-2 px-4">{result.depth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setResults(null)}>
              Clear Results
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}