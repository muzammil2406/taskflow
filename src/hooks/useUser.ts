'use client';

import { useMemo } from 'react';
import { useDoc, useFirestore, useUser as useFirebaseUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/types';

export const useUser = () => {
  const { user: firebaseUser, isUserLoading } = useFirebaseUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !firebaseUser) return null;
    return doc(firestore, 'users', firebaseUser.uid);
  }, [firestore, firebaseUser]);

  const { data: userProfile, isLoading: isProfileLoading, error } = useDoc<UserProfile>(userDocRef);

  return { user: userProfile, loading: isUserLoading || isProfileLoading, error, firebaseUser };
};
