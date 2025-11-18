'use client';

import { useFirebase } from '@/firebase/provider';

/**
 * Hook specifically for accessing the authenticated user's state from Firebase.
 * This provides the raw Firebase User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = () => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};
