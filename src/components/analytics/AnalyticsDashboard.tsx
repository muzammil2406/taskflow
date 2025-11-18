'use client';

import { useTasks } from '@/hooks/useTasks';
import { calculateTeamVelocity } from '@/lib/analytics';
import { useMemo } from 'react';
import TeamVelocityChart from './TeamVelocityChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import DashboardAnalytics from '../dashboard/DashboardAnalytics';

export default function AnalyticsDashboard() {
  const { tasks, users, loading } = useTasks();

  const velocityData = useMemo(() => {
    if (!tasks || !users) return [];
    return calculateTeamVelocity(tasks, users);
  }, [tasks, users]);

  if (loading) {
      return (
        <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Loader2 className="animate-spin h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-4 w-3/4 mt-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-4 w-3/4 mt-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[350px] w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </CardContent>
                </Card>
            </div>
        </div>
      )
  }

  return (
    <div className="flex flex-col gap-4">
        <DashboardAnalytics />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <TeamVelocityChart data={velocityData} users={users} />
        </div>
    </div>
  );
}
