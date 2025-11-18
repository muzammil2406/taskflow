'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTasks } from '@/hooks/useTasks';
import { isAfter } from 'date-fns';
import { ClipboardList, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useMemo } from 'react';

export default function DashboardAnalytics() {
  const { tasks, loading } = useTasks();

  const analytics = useMemo(() => {
    if (!tasks.length) {
      return { total: 0, completed: 0, overdue: 0, completionRate: 0 };
    }
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const overdue = tasks.filter(t => t.status !== 'done' && t.dueDate && isAfter(new Date(), t.dueDate.toDate())).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, overdue, completionRate };
  }, [tasks]);

  if (loading) {
    return <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
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
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.total}</div>
          <p className="text-xs text-muted-foreground">All tasks in the project</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.completed}</div>
          <p className="text-xs text-muted-foreground">Tasks marked as done</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <div className="h-4 w-4 text-muted-foreground">{analytics.completionRate}%</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.completionRate}%</div>
          <p className="text-xs text-muted-foreground">Percentage of tasks completed</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.overdue}</div>
          <p className="text-xs text-muted-foreground">Tasks past their due date</p>
        </CardContent>
      </Card>
    </div>
  );
}
