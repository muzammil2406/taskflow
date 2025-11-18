'use client';
import type { Task, TaskPriority } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarIcon, AlertTriangle, CheckSquare, Folder, GitBranch } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { format, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { Progress } from '../ui/progress';

interface TaskCardProps {
  task: Task;
  isDragging: boolean;
}

const priorityStyles: Record<TaskPriority, string> = {
  low: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
  high: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
};

export default function TaskCard({ task, isDragging }: TaskCardProps) {
  const { users, tasks } = useTasks();

  const assignee = useMemo(() => users.find(u => u.uid === task.assignedTo), [users, task.assignedTo]);

  const childTasks = useMemo(() => tasks.filter(t => t.parentTaskId === task.id), [tasks, task.id]);
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const isOverdue = task.dueDate && isPast(task.dueDate.toDate());
  
  const subtaskProgress = useMemo(() => {
    if (!task.subtasks || task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter(st => st.completed).length;
    const total = task.subtasks.length;
    return {
        completed,
        total,
        percentage: (completed / total) * 100,
    }
  }, [task.subtasks]);

  return (
    <TooltipProvider delayDuration={300}>
      <Card
        className={cn(
          'cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-card/60 dark:bg-card/40 backdrop-blur-sm border',
          isDragging ? 'shadow-2xl scale-105 rotate-3' : 'shadow-md',
          isOverdue && 'border-red-500/50',
          childTasks.length > 0 && 'border-primary/50'
        )}
      >
        <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
                <Badge className={cn('capitalize', priorityStyles[task.priority])}>
                    {task.priority}
                </Badge>
                {isOverdue && (
                     <Tooltip>
                        <TooltipTrigger>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>This task is overdue.</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
          <CardTitle className="text-base font-semibold pt-2">{task.title}</CardTitle>
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            {task.category && (
                <div className="flex items-center gap-1.5">
                    <Folder className="h-3 w-3" />
                    <span>{task.category}</span>
                </div>
            )}
            {childTasks.length > 0 && (
                <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1.5">
                        <GitBranch className="h-3 w-3 text-primary" />
                        <span>{childTasks.length} {childTasks.length > 1 ? 'Dependencies' : 'Dependency'}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>This task is blocking {childTasks.length} other task(s).</p>
                    </TooltipContent>
                </Tooltip>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
           {subtaskProgress && (
            <div className="mb-2">
                <Tooltip>
                    <TooltipTrigger className="w-full">
                         <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckSquare className="h-4 w-4" />
                            <span>{subtaskProgress.completed} / {subtaskProgress.total}</span>
                            <Progress value={subtaskProgress.percentage} className="h-1 flex-1"/>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{subtaskProgress.completed} of {subtaskProgress.total} subtasks completed.</p>
                    </TooltipContent>
                </Tooltip>
            </div>
           )}
          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              {task.dueDate && (
                <>
                  <CalendarIcon className="h-4 w-4" />
                  <span>{format(task.dueDate.toDate(), 'MMM d')}</span>
                </>
              )}
            </div>
            {assignee && (
              <Tooltip>
                <TooltipTrigger>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={assignee.photoURL || ''} alt={assignee.name || ''} />
                    <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Assigned to {assignee.name}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
