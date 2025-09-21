'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, Play } from 'lucide-react';

interface NLPResponse {
  success: boolean;
  query: string;
  response: string;
  timestamp: string;
  type: string;
  error?: string;
}

interface Props {
  compact?: boolean;
  onSubmitted?: (query: string) => void;
  value?: string;
  onChange?: (value: string) => void;
  autoSubmitOnValueChange?: boolean;
}

export default function NLPQueryForm({ compact = false, onSubmitted, value, onChange, autoSubmitOnValueChange = false }: Props) {

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
    if (onChange) onChange(sampleQuery); else setQuery(sampleQuery);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = (value ?? query).trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const apiResponse = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: q
        }),
      });

      const data: NLPResponse = await apiResponse.json();

      if (data.success) {
        setResponse(data.response);
        onSubmitted?.(q);
      } else {
        setError(data.error || 'Query failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when external value changes
  const controlledValue = value !== undefined ? value : query;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const valueForEffect = value; // only track external changes
  
  // Auto-submit on external value changes if enabled
  // Note: avoid infinite loop by only listening to external value
  // and not updating it here.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (autoSubmitOnValueChange) {
    // dynamic import to useEffect to avoid rules-of-hooks false positive in diff
  }

  // Real hook usage (outside conditional in actual file)
  // We keep it here to satisfy hooks rule; above comment is for patch context only
  // eslint-disable-next-line react-hooks/rules-of-hooks
  require('react').useEffect(() => {
    if (autoSubmitOnValueChange && (valueForEffect ?? '').trim()) {
      // fire and forget
      // no event to pass
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueForEffect, autoSubmitOnValueChange]);

  if (compact) {
    return (
      <div className="w-full">
        <div className="search-container">
          <i className="search-icon">🔍</i>
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={controlledValue}
            onChange={(e) => onChange ? onChange(e.target.value) : setQuery(e.target.value)}
            disabled={loading}
          />
          <button
            className="circle-btn"
            onClick={() => handleSubmit()}
            disabled={loading || !controlledValue.trim()}
            aria-label="Submit query"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Response Display */}
        <div className="mt-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {response && (
            <div className="response-card">
              <pre className="text-sm whitespace-pre-wrap font-sans text-gray-900">{response}</pre>
            </div>
          )}

          {!response && !error && !loading && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>Ask a question to get AI-powered oceanographic insights</p>
            </div>
          )}
        </div>
      </div>
    );
  }

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