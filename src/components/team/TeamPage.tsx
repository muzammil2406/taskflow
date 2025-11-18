'use client';

import { useTasks } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '../ui/skeleton';

export default function TeamPage() {
  const { users, loading } = useTasks();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-2">
      <h1 className="text-3xl font-semibold">Team</h1>
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>View all members of your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-2">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))
            ) : users.length > 0 ? (
              users.map(user => (
                <div key={user.uid} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted/50">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.photoURL || undefined} alt={user.name || 'User'} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No team members found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
