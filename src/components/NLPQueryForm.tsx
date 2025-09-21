'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare } from 'lucide-react';
import supabase from '@/lib/supabaseClient';

interface NLPResponse {
  success: boolean;
  query: string;
  response: string;
  timestamp: string;
  type: string;
  error?: string;
}

export default function NLPQueryForm() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleQueries = [
    "What's the temperature at 15°N 75°E tomorrow?",
    "Show me salinity in the Arabian Sea",
    "Predict oxygen levels at 10°N 80°E",
    "What are ocean conditions in the Bay of Bengal?",
    "Show me chlorophyll levels in the Indian Ocean"
  ];

  const handleSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Get the current session token (if available)
      let authHeaders = {};
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          authHeaders = { 'Authorization': `Bearer ${session.access_token}` };
        }
      } catch {
        // Continue without auth if session fails
      }

      const apiResponse = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          query: query
        }),
      });

      const data: NLPResponse = await apiResponse.json();

      if (data.success) {
        setResponse(data.response);
      } else {
        setError(data.error || 'Query failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Query Input */}
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about ocean conditions... (e.g., What's the temperature at 15°N 75°E tomorrow?)"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] resize-none text-base"
              disabled={loading}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {sampleQueries.map((sampleQuery, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSampleQuery(sampleQuery)}
                  className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  disabled={loading}
                >
                  {sampleQuery}
                </button>
              ))}
            </div>
            
            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Ask'
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Response Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {response && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <pre className="text-sm whitespace-pre-wrap font-sans text-gray-800">
            {response}
          </pre>
        </div>
      )}

      {!response && !error && !loading && (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Ask a question to get AI-powered oceanographic insights</p>
        </div>
      )}
    </div>
  );
}