'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import NLPQueryForm from '@/components/NLPQueryForm';
import supabase from '@/lib/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const [history, setHistory] = useState<string[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');

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

  // Load history from Supabase when user is available
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('history')
        .select('query')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) {
        console.error('Failed to load history:', error);
        return;
      }
      setHistory((data ?? []).map((r: { query: string }) => r.query));
    };
    load();
  }, [user]);

  const addToHistory = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    // Insert new row; every run is a new row
    const { error } = await supabase.from('history').insert({ user_id: user!.id, query: trimmed });
    if (error) {
      console.error('Failed to insert history:', error);
    }
    // Optimistically update UI and trim to 5
    setHistory(prev => [trimmed, ...prev].slice(0, 5));
  };

  const handleHistoryClick = (q: string) => {
    setCurrentQuery(q);
    // NLPQueryForm will auto-submit via autoSubmitOnValueChange
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
            <Image src="/logo.png" alt="FloatPoint Logo" width={140} height={140} />
          </div>
          <div className="history">
            <h2>History</h2>
            <ul>
              {history.length === 0 && (
                <li style={{opacity:0.8, cursor:'default'}}>No searches yet</li>
              )}
              {history.map((item, idx) => (
                <li key={idx} onClick={() => handleHistoryClick(item)} title={item}>
                  {item.length > 28 ? item.slice(0, 28) + '…' : item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel animate-once">
          <div className="content-wrapper">
            <h1 className="welcome-text">Welcome!</h1>
            <NLPQueryForm
              compact
              value={currentQuery}
              onChange={setCurrentQuery}
              autoSubmitOnValueChange
              onSubmitted={(q) => {
                addToHistory(q);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}