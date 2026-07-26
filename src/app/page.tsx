'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // If logged in, redirect to dashboard
      router.push('/dashboard');
    } else {
      // If not logged in, redirect to login
      router.push('/login');
    }
  }, [user, router]);

  // Show nothing while redirecting
  return null;
}
