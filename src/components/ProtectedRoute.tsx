import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(main)';

    if (!user && inAuthGroup) {
      // If NOT logged in and trying to access (main), kick to login
      router.replace('/(guest)/login');
    } else if (user && segments[0] === '(guest)') {
      // If IS logged in and trying to access (guest), move to dashboard
      router.replace('/(main)/khata');
    }
  }, [user, loading, segments]);

  return <>{children}</>;
}