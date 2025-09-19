'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Add a small delay to ensure auth state is properly loaded
    const redirectTimeout = setTimeout(() => {
      if (!isLoading) {
        if (user) {
          router.push('/dashboard');
        } else {
          router.push('/auth/signin');
        }
      }
    }, 500);
    
    return () => clearTimeout(redirectTimeout);
  }, [user, isLoading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">FloatPoint</h1>
      <p className="mb-8 text-center max-w-md">An AI-Powered Conversational Interface for Argo Ocean Data</p>
      <div className="animate-pulse">Redirecting...</div>
    </div>
  );
}
