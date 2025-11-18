'use client';

import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { useEffect, type ComponentType } from 'react';
import { Loader2 } from 'lucide-react';
import LoginPage from './LoginPage';

export default function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithAuthComponent = (props: P) => {
    const { user, loading } = useUser();

    if (loading) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }

    if (!user) {
        // Render the LoginPage directly to prevent a redirect flash.
        return <LoginPage />;
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
}
