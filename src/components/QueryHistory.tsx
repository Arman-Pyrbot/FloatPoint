'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Trash2, MessageSquare, MapPin, Clock } from 'lucide-react';
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

  const getQueryTypeIcon = (params: QueryParams) => {
    if (params?.type === 'nlp_query') {
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    } else if (params?.type === 'spatial_temporal') {
      return <MapPin className="h-4 w-4 text-green-500" />;
    }
    return <MessageSquare className="h-4 w-4 text-gray-500" />;
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-purple-500" />
          Query History
        </CardTitle>
        <CardDescription>
          Your recent oceanographic queries and predictions ({queries.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {queries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No queries yet. Start by asking a question or making a prediction!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {queries.map((query) => (
              <div
                key={query.id}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getQueryTypeIcon(query.params)}
                      <span className="text-sm font-medium text-gray-700">
                        {getQueryTypeLabel(query.params)}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(query.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mb-2 line-clamp-2">
                      {query.query_text}
                    </p>
                    {query.params?.response && (
                      <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                        <strong>Response:</strong> {query.params.response.substring(0, 100)}
                        {query.params.response.length > 100 && '...'}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {onQuerySelect && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onQuerySelect(query.query_text)}
                      >
                        Use Again
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteQuery(query.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
