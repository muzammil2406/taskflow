'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithPopup, GoogleAuthProvider, UserCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from 'firebase/auth';
import { doc, serverTimestamp, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KanbanSquare } from 'lucide-react';
import type { UserProfile } from '@/types';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.'}),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function LoginPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm({
    resolver: zodResolver(isSigningUp ? signupSchema : loginSchema),
    defaultValues: { name: '', email: '', password: '' },
  });
  
  const handleAuthSuccess = async (user: User) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const newUserProfile: Omit<UserProfile, 'createdAt'> & { createdAt: any } = {
            uid: user.uid,
            id: user.uid,
            name: user.displayName || form.getValues('name') || 'New User',
            email: user.email,
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
        };
        await setDoc(userRef, newUserProfile);
    }
    setLoading(false);
  };
  
  const onSubmit = async (values: z.infer<typeof loginSchema> | z.infer<typeof signupSchema>) => {
    if (!auth) return;
    setLoading(true);
    try {
      let userCredential: UserCredential;
      if (isSigningUp) {
        const signupValues = values as z.infer<typeof signupSchema>;
        userCredential = await createUserWithEmailAndPassword(auth, signupValues.email, signupValues.password);
      } else {
        const loginValues = values as z.infer<typeof loginSchema>;
        userCredential = await signInWithEmailAndPassword(auth, loginValues.email, loginValues.password);
      }
      await handleAuthSuccess(userCredential.user);
    } catch (error: any) {
      let description = 'An error occurred. Please try again.';
      if (error.code === 'auth/user-not-found') {
        description = 'No account found with this email. Please sign up.';
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        description = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        description = 'This email is already in use. Please sign in or use a different email.';
      }
      toast({
        title: isSigningUp ? 'Sign Up Error' : 'Sign In Error',
        description,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleAuthSuccess(result.user);
    } catch (error: any) {
        let description = 'Could not sign in with Google. Please try again.';
        if (error.code === 'auth/operation-not-allowed') {
            description = 'Google Sign-In is not enabled for this project. Please contact support.';
        }
      toast({
        title: 'Google Sign-In Error',
        description: error.message || description,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-white/80 dark:bg-black/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-800/50 shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
             <KanbanSquare className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">TaskZen</h1>
          </div>
          <CardTitle className="text-2xl">{isSigningUp ? 'Create an Account' : 'Welcome Back!'}</CardTitle>
          <CardDescription>{isSigningUp ? 'Enter your details to get started.' : 'Sign in to continue to your dashboard.'}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {isSigningUp && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSigningUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
             {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                fill="currentColor"
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 1.98-4.66 1.98-3.57 0-6.47-2.9-6.47-6.47s2.9-6.47 6.47-6.47c1.97 0 3.28.79 4.1 1.62l2.56-2.56C18.49 1.89 15.82 1 12.48 1 7.18 1 3.2 4.9 3.2 9.53s3.98 8.53 9.28 8.53c5.17 0 8.92-3.57 8.92-8.82 0-.59-.06-1.18-.17-1.72z"
              ></path>
            </svg>
            Google
          </Button>
          
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSigningUp ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => {
              setIsSigningUp(!isSigningUp);
              form.reset();
            }} className="font-semibold text-primary hover:underline">
              {isSigningUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

        </CardContent>
      </Card>
    </div>
  );
}
    

    