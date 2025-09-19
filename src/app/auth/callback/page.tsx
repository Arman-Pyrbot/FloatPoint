'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { searchParams } = new URL(window.location.href);
        const code = searchParams.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setError(error.message);
            console.error('Auth callback error:', error);
            // Clear any existing session on error
            await supabase.auth.signOut();
            setTimeout(() => router.push('/auth/signin'), 2000);
          } else {
            router.push('/dashboard');
          }
        } else {
          // Check if already authenticated
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('Session error:', sessionError);
            // Clear invalid session
            await supabase.auth.signOut();
            setError('Session expired. Please sign in again.');
            setTimeout(() => router.push('/auth/signin'), 2000);
            return;
          }

          if (session) {
            router.push('/dashboard');
            return;
          }

          setError('No authentication code found');
          setTimeout(() => router.push('/auth/signin'), 2000);
        }
      } catch (err) {
        console.error('Auth callback exception:', err);
        // Clear any existing session on exception
        await supabase.auth.signOut();
        setError('Authentication process failed');
        setTimeout(() => router.push('/auth/signin'), 2000);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication</h1>

        {error ? (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <p className="mt-2 text-sm">Redirecting to sign-in page...</p>
          </div>
        ) : (
          <div>
            <p className="text-lg mb-4">Processing authentication...</p>
            <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}