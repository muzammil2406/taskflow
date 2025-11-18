'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTasks } from '@/hooks/useTasks';
import { doc, serverTimestamp, Timestamp, collection } from 'firebase/firestore';
import type { Task, Subtask } from '@/types';
import { CalendarIcon, Loader2, Sparkles, Trash, Bot, ListTodo, Check, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState, useId, useMemo } from 'react';
import { suggestAssigneeAction, autoPrioritizeTaskAction, breakdownTaskAction, suggestCategoryAction } from '@/app/actions/ai';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { useUser } from '@/hooks/useUser';
import { Checkbox } from '../ui/checkbox';
import { nanoid } from 'nanoid';


const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  parentTaskId: z.string().optional().nullable(),
});

interface TaskFormProps {
  task?: Task | null;
  onSave: () => void;
}

export default function TaskForm({ task, onSave }: TaskFormProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const { users, tasks } = useTasks();
  const firestore = useFirestore();
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [prioritizing, setPrioritizing] = useState(false);
  const [breakingDown, setBreakingDown] = useState(false);
  const [categorizing, setCategorizing] = useState(false);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'todo',
      priority: task?.priority || 'medium',
      dueDate: task?.dueDate?.toDate() || null,
      assignedTo: task?.assignedTo || 'unassigned',
      category: task?.category || '',
      parentTaskId: task?.parentTaskId || 'none',
    },
  });

  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || []);

  const availableParentTasks = useMemo(() => {
    return tasks.filter(t => t.id !== task?.id);
  }, [tasks, task]);


  const onSubmit = async (values: z.infer<typeof taskSchema>) => {
    if (!user || !firestore) return toast({ title: 'You must be logged in.', variant: 'destructive' });
    setLoading(true);

    const taskPayload: any = {
        ...values,
        assignedTo: values.assignedTo === 'unassigned' ? null : values.assignedTo,
        parentTaskId: values.parentTaskId === 'none' ? null : values.parentTaskId,
        dueDate: values.dueDate ? Timestamp.fromDate(values.dueDate) : null,
        subtasks,
    };

    // If moving task to done, set completedAt
    if (task?.status !== 'done' && values.status === 'done') {
        taskPayload.completedAt = serverTimestamp();
    }

    try {
      if (task) {
        const taskRef = doc(firestore, 'users', user.uid, 'tasks', task.id);
        const taskData = {
          ...taskPayload,
          updatedAt: serverTimestamp(),
        };
        updateDocumentNonBlocking(taskRef, taskData);
        toast({ title: 'Task Updated', description: 'Your changes have been saved.' });
      } else {
        const tasksCollectionRef = collection(firestore, 'users', user.uid, 'tasks');
        const newTaskData = {
          ...taskPayload,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        addDocumentNonBlocking(tasksCollectionRef, newTaskData);
        toast({ title: 'Task Created', description: 'A new task has been added to your board.' });
      }
      onSave();
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error saving task', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!task || !user || !firestore) return;
    setIsDeleting(true);
    try {
        const taskRef = doc(firestore, 'users', user.uid, 'tasks', task.id);
        deleteDocumentNonBlocking(taskRef);
        toast({ title: 'Task Deleted' });
        onSave();
    } catch (error: any) {
        toast({ title: 'Error deleting task', description: error.message, variant: 'destructive' });
    } finally {
        setIsDeleting(false);
    }
  }

  const handleSuggestAssignee = async () => {
    setSuggesting(true);
    const description = form.getValues('description');
    if (!description || description.length < 10) {
      toast({ title: 'Please provide a more detailed description for a better suggestion.', variant: 'destructive' });
      setSuggesting(false);
      return;
    }
    
    try {
      const result = await suggestAssigneeAction(description, users);
      if (result.userId) {
        form.setValue('assignedTo', result.userId);
        toast({ title: 'Suggestion applied!', description: `${result.userName} seems like a good fit.` });
      } else {
        toast({ title: 'Could not determine a suitable assignee.', variant: 'destructive' });
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'AI Suggestion Failed', description: 'An error occurred while getting suggestions.', variant: 'destructive' });
    } finally {
      setSuggesting(false);
    }
  };

  const handleAutoPrioritize = async () => {
    setPrioritizing(true);
    const { title, description, dueDate } = form.getValues();
     if (!title) {
      toast({ title: 'Please provide a title for a better suggestion.', variant: 'destructive' });
      setPrioritizing(false);
      return;
    }

    try {
        const result = await autoPrioritizeTaskAction(title, description || '', dueDate);
        if (result.suggestedPriority) {
            form.setValue('priority', result.suggestedPriority);
            toast({ title: 'AI Priority Suggested!', description: result.reasoning });
        } else {
            toast({ title: 'Could not determine a priority.', variant: 'destructive' });
        }
    } catch (error) {
         console.error(error);
      toast({ title: 'AI Prioritization Failed', description: 'An error occurred while getting suggestions.', variant: 'destructive' });
    } finally {
        setPrioritizing(false);
    }
  }

  const handleBreakdownTask = async () => {
    setBreakingDown(true);
     const { title, description } = form.getValues();
     if (!title) {
      toast({ title: 'Please provide a title to break down the task.', variant: 'destructive' });
      setBreakingDown(false);
      return;
    }

    try {
      const result = await breakdownTaskAction(title, description || '');
      if (result.length > 0) {
        const newSubtasks = result.map(st => ({ id: nanoid(), title: st, completed: false }));
        setSubtasks(prev => [...prev, ...newSubtasks]);
        toast({ title: 'Task broken down!', description: `${result.length} subtasks have been added.` });
      } else {
        toast({ title: 'Could not break down the task.', variant: 'destructive' });
      }
    } catch(error) {
        console.error(error);
        toast({ title: 'AI Breakdown Failed', description: 'An error occurred while breaking down the task.', variant: 'destructive' });
    } finally {
        setBreakingDown(false);
    }
  }

  const handleSuggestCategory = async () => {
    setCategorizing(true);
    const { title, description } = form.getValues();
    if (!title) {
        toast({ title: 'Please provide a title for a better suggestion.', variant: 'destructive' });
        setCategorizing(false);
        return;
    }
    try {
        const result = await suggestCategoryAction(title, description || '');
        if (result.suggestedCategory) {
            form.setValue('category', result.suggestedCategory);
            toast({ title: 'Category Suggested!', description: `AI suggests "${result.suggestedCategory}" with ${Math.round(result.confidence * 100)}% confidence.` });
        } else {
            toast({ title: 'Could not suggest a category.', variant: 'destructive' });
        }
    } catch (error) {
        console.error(error);
        toast({ title: 'AI Categorization Failed', description: 'An error occurred while getting suggestions.', variant: 'destructive' });
    } finally {
        setCategorizing(false);
    }
  }

  const handleSubtaskChange = (subtaskId: string, completed: boolean) => {
    setSubtasks(subtasks.map(st => st.id === subtaskId ? { ...st, completed } : st));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Design new login page" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Add more details about the task..." className="min-h-[120px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="e.g., Frontend, Design" {...field} value={field.value ?? ''} />
                </FormControl>
                <Button variant="ghost" size="icon" onClick={handleSuggestCategory} disabled={categorizing} type="button" aria-label="Suggest Category">
                    {categorizing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4 text-primary" />}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <div className="flex gap-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                    </Select>
                     <Button variant="ghost" size="icon" onClick={handleAutoPrioritize} disabled={prioritizing} type="button" aria-label="Auto-prioritize Task">
                        {prioritizing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Bot className="h-4 w-4 text-primary" />}
                    </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
           <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="mb-1">Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                      >
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign To</FormLabel>
                <div className="flex gap-2">
                <Select onValueChange={field.onChange} value={field.value || 'unassigned'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team member" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map(u => (
                      <SelectItem key={u.uid} value={u.uid}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={handleSuggestAssignee} disabled={suggesting} type="button" aria-label="Suggest Assignee">
                    {suggesting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4 text-primary" />}
                </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
            control={form.control}
            name="parentTaskId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task Dependency</FormLabel>
                <div className='flex items-center gap-2'>
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  <Select onValueChange={field.onChange} value={field.value || 'none'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent task" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableParentTasks.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

        {task && (
            <div>
                 <div className="flex items-center gap-2 mb-4">
                    <FormLabel>Sub-tasks</FormLabel>
                    <Button variant="outline" size="sm" onClick={handleBreakdownTask} disabled={breakingDown} type="button" className="gap-2">
                        {breakingDown ? <Loader2 className="h-4 w-4 animate-spin"/> : <ListTodo className="h-4 w-4 text-primary" />}
                        Break down with AI
                    </Button>
                 </div>
                 <div className="space-y-2">
                     {subtasks.map((subtask) => (
                         <div key={subtask.id} className="flex items-center gap-2">
                             <Checkbox 
                                id={`subtask-${subtask.id}`}
                                checked={subtask.completed}
                                onCheckedChange={(checked) => handleSubtaskChange(subtask.id, !!checked)}
                             />
                             <label htmlFor={`subtask-${subtask.id}`} className={cn("text-sm flex-1", subtask.completed && 'line-through text-muted-foreground')}>{subtask.title}</label>
                         </div>
                     ))}
                 </div>
            </div>
        )}

        <div className="flex justify-between items-center pt-4">
          <div>
            {task && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" type="button" disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash className="mr-2 h-4 w-4"/>}
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the task and all its data.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onSave}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {task ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
