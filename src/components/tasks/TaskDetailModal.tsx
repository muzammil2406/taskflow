'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Task, Subtask } from '@/types';
import TaskForm from './TaskForm';
import CommentSection from './CommentSection';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import { Progress } from '../ui/progress';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { doc } from 'firebase/firestore';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { useUser } from '@/hooks/useUser';

interface TaskDetailModalProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskDetailModal({ task, isOpen, onClose }: TaskDetailModalProps) {

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl">{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update the details of your task below.' : 'Fill in the details to create a new task.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-x-8 flex-1 min-h-0">
            <ScrollArea className="md:col-span-1 px-6 pb-6">
                <TaskForm task={task} onSave={onClose} />
            </ScrollArea>
            <ScrollArea className="md:col-span-1 px-6 pb-6 bg-muted/50 dark:bg-muted/20 border-l">
                {task ? <CommentSection taskId={task.id} /> : 
                <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Save the task to add comments.</p>
                </div>
                }
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
