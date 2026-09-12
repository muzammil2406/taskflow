'use client';

import { useEffect, useMemo } from 'react';
import { useDoc, useFirestore, useUser as useFirebaseUser, useMemoFirebase } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { UserProfile } from '@/types';

export const useUser = () => {
  const { user: firebaseUser, isUserLoading } = useFirebaseUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !firebaseUser) return null;
    return doc(firestore, 'users', firebaseUser.uid);
  }, [firestore, firebaseUser]);

  // Ensure a signed-in user always has a profile document, so login
  // reliably transitions to the dashboard even when the profile write on
  // first login was missed (e.g. a denied/transient Firestore write).
  useEffect(() => {
    if (!firestore || !firebaseUser || !userDocRef) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(userDocRef);
        if (cancelled) return;
        if (!snap.exists()) {
          const profile: Omit<UserProfile, 'createdAt'> & { createdAt: unknown } = {
            uid: firebaseUser.uid,
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'New User',
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            createdAt: serverTimestamp(),
          };
          await setDoc(userDocRef, profile);
        }
      } catch (e) {
        console.warn('Could not ensure the user profile exists.', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [firestore, firebaseUser, userDocRef]);

  const { data: userProfile, isLoading: isProfileLoading, error } = useDoc<UserProfile>(userDocRef);

  return { user: userProfile, loading: isUserLoading || isProfileLoading, error, firebaseUser };
};