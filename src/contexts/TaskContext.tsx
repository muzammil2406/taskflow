'use client';

import { createContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { collection, query, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import type { Task, UserProfile } from '@/types';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';
import { ALL_ACHIEVEMENTS, checkAndAwardAchievements } from '@/lib/gamification';

interface TaskContextType {
  tasks: Task[];
  users: UserProfile[];
  loading: boolean;
  filters: { search: string; };
  setFilters: React.Dispatch<React.SetStateAction<{ search: string; }>>;
}

export const TaskContext = createContext<TaskContextType>({
  tasks: [],
  users: [],
  loading: true,
  filters: { search: '' },
  setFilters: () => {},
});

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [filters, setFilters] = useState({ search: '' });
  const firestore = useFirestore();
  const { toast } = useToast();

  const tasksQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'tasks'));
  }, [user, firestore]);

  const usersQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'users'));
  }, [firestore]);

  const { data: tasksData, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);
  const { data: usersData, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const loading = tasksLoading || usersLoading;

  const filteredTasks = useMemo(() => {
    if (!tasksData) return [];
    const searchTerm = filters.search.toLowerCase();
    
    // Filter out tasks that are blocked by an incomplete parent task
    const visibleTasks = tasksData.filter(task => {
        if (!task.parentTaskId) return true; // always show tasks with no parent
        const parentTask = tasksData.find(t => t.id === task.parentTaskId);
        if (!parentTask) return true; // show if parent not found (should not happen)
        return parentTask.status === 'done'; // only show if parent is done
    });

    if (!searchTerm) return visibleTasks;

    return visibleTasks.filter(task => {
      const titleMatch = task.title.toLowerCase().includes(searchTerm);
      const descriptionMatch = task.description && task.description.toLowerCase().includes(searchTerm);
      
      const assignee = usersData?.find(u => u.uid === task.assignedTo);
      const assigneeMatch = assignee && assignee.name?.toLowerCase().includes(searchTerm);

      return titleMatch || descriptionMatch || assigneeMatch;
    })
  }, [tasksData, usersData, filters.search]);

  // Gamification: Check for achievements when tasks change
  useEffect(() => {
    if (user && tasksData && firestore) {
      const currentAchievements = user.achievements || [];
      const newAchievements = checkAndAwardAchievements(tasksData, currentAchievements);
      
      // Only update if there are new achievements not already in the user's profile
      if (newAchievements.length > 0) {
        const userRef = doc(firestore, 'users', user.uid);
        const updatedAchievements = [...currentAchievements, ...newAchievements];
        updateDocumentNonBlocking(userRef, { achievements: updatedAchievements });
        
        newAchievements.forEach(achievementId => {
            const achievement = ALL_ACHIEVEMENTS.find(a => a.id === achievementId);
            if(achievement) {
                toast({
                    title: 'Achievement Unlocked! 🎉',
                    description: `You've earned the "${achievement.name}" badge!`,
                });
            }
        });
      }
    }
  }, [tasksData, user, firestore, toast]);


  return (
    <TaskContext.Provider value={{ tasks: filteredTasks, users: usersData || [], loading, filters, setFilters }}>
      {children}
    </TaskContext.Provider>
  );
}
