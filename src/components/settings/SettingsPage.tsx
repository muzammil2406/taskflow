'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { doc } from 'firebase/firestore';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Switch } from '../ui/switch';
import { ThemeToggle } from '../ThemeToggle';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.').optional(),
  dueSoon: z.boolean().optional(),
  taskAssigned: z.boolean().optional(),
});

export default function SettingsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name || '',
      email: user?.email || '',
      dueSoon: user?.notificationPreferences?.dueSoon || false,
      taskAssigned: user?.notificationPreferences?.taskAssigned || false,
    },
  });

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    if (!user || !firestore) return;
    setLoading(true);
    const userRef = doc(firestore, 'users', user.uid);
    const dataToUpdate: any = { name: values.name };
    dataToUpdate['notificationPreferences.dueSoon'] = values.dueSoon;
    dataToUpdate['notificationPreferences.taskAssigned'] = values.taskAssigned;
    
    updateDocumentNonBlocking(userRef, dataToUpdate);
    toast({
      title: 'Profile Updated',
      description: 'Your settings have been updated successfully.',
    });
    setLoading(false);
  };
  
  if (userLoading) {
      return (
          <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <FormLabel>Theme</FormLabel>
                    <ThemeToggle />
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your account settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your notification preferences.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
                        <FormField
                            control={form.control}
                            name="dueSoon"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Due Soon Reminders</FormLabel>
                                        <FormMessage />
                                    </div>
                                    <FormControl>
                                        <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="taskAssigned"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Task Assigned</FormLabel>
                                        <FormMessage />
                                    </div>
                                    <FormControl>
                                        <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Notification Settings
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
