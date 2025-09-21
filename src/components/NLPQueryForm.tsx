'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageSquare, Lightbulb } from 'lucide-react';
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            Natural Language Query
          </CardTitle>
          <CardDescription>
            Ask questions about ocean conditions in natural language
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nlp-query" className="block text-sm font-medium mb-2">
                Your Question
              </label>
              <textarea
                id="nlp-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., What's the temperature at 15°N 75°E tomorrow?"
                className="w-full p-3 border rounded-md focus:ring focus:ring-blue-300 min-h-[100px] resize-none"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Lightbulb className="h-4 w-4" />
                Sample Questions
              </div>
              <div className="grid grid-cols-1 gap-2">
                {sampleQueries.map((sampleQuery, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSampleQuery(sampleQuery)}
                    className="text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                    disabled={loading}
                  >
                    &ldquo;{sampleQuery}&rdquo;
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={loading || !query.trim()} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Query...
                </>
              ) : (
                'Ask Question'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Response Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-500" />
            AI Response
          </CardTitle>
          <CardDescription>
            Natural language response from the AI model
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {response && (
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <pre className="text-sm text-blue-800 whitespace-pre-wrap font-sans">
                  {response}
                </pre>
              </div>
              
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-600 text-xs">
                  Response generated using FloatPoint NLP system with spatial-temporal LSTM model.
                  Powered by natural language processing for oceanographic queries.
                </p>
              </div>
            </div>
          )}

          {!response && !error && !loading && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ask a question to get AI-powered oceanographic insights</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}