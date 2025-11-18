'use client';

import { useUser } from '@/hooks/useUser';
import LoginPage from '@/components/auth/LoginPage';
import { Loader2 } from 'lucide-react';
import { MainContent } from '@/components/MainContent';
import Dashboard from '@/components/dashboard/Dashboard';

export default function Home() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return (
      <MainContent>
        <Dashboard />
      </MainContent>
    );
  }

  return <LoginPage />;
}
