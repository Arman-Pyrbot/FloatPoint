'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';
import supabase from '@/lib/supabaseClient';

interface QueryParams {
  type: string;
  response?: string;
  latitude?: number;
  longitude?: number;
  datetime?: string;
  prediction?: Record<string, unknown>;
  timestamp?: string;
}

interface Query {
  id: string;
  query_text: string;
  params: QueryParams;
  created_at: string;
}

interface QueryHistoryProps {
  onQuerySelect?: (query: string) => void;
}

export default function QueryHistory({ onQuerySelect }: QueryHistoryProps) {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/queries', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setQueries(data.queries);
      } else {
        setError(data.error || 'Failed to fetch queries');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteQuery = async (queryId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`/api/queries?id=${queryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Remove the deleted query from the list
        setQueries(queries.filter(q => q.id !== queryId));
      } else {
        setError(data.error || 'Failed to delete query');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete query');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };


  const getQueryTypeLabel = (params: QueryParams) => {
    if (params?.type === 'nlp_query') {
      return 'Natural Language Query';
    } else if (params?.type === 'spatial_temporal') {
      return 'Spatial-Temporal Prediction';
    }
    return 'Query';
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-purple-500" />
            Query History
          </CardTitle>
          <CardDescription>
            Your recent oceanographic queries and predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading query history...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-purple-500" />
            Query History
          </CardTitle>
          <CardDescription>
            Your recent oceanographic queries and predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
            <Button 
              onClick={fetchQueries} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">Recent Queries ({queries.length})</h3>
      </div>
      <div>
        {queries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No queries yet. Start by asking a question!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {queries.map((query) => (
              <div
                key={query.id}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 mb-1">
                      {query.query_text}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{getQueryTypeLabel(query.params)}</span>
                      <span>•</span>
                      <span>{formatDate(query.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {onQuerySelect && (
                      <button
                        onClick={() => onQuerySelect(query.query_text)}
                        className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                      >
                        Use
                      </button>
                    )}
                    <button
                      onClick={() => deleteQuery(query.id)}
                      className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
