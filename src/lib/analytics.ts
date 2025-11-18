'use client';
import { Task } from '@/types';
import { subWeeks, getISOWeek, startOfWeek, endOfWeek } from 'date-fns';

export interface WeeklyVelocity {
  week: number;
  [key: string]: number; // User tasks completed + week number
}

export const calculateTeamVelocity = (tasks: Task[], users: { uid: string, name: string | null }[]): WeeklyVelocity[] => {
  const twelveWeeksAgo = subWeeks(new Date(), 11);
  const relevantTasks = tasks.filter(t => t.completedAt && t.completedAt.toDate() >= startOfWeek(twelveWeeksAgo, { weekStartsOn: 1 }));

  const weeklyData: Record<number, WeeklyVelocity> = {};

  for (let i = 0; i < 12; i++) {
    const weekDate = subWeeks(new Date(), i);
    const weekNumber = getISOWeek(weekDate);
    if (!weeklyData[weekNumber]) {
      weeklyData[weekNumber] = { week: weekNumber };
       users.forEach(u => {
        if(u.name) weeklyData[weekNumber][u.name] = 0;
      });
    }
  }
  
  relevantTasks.forEach(task => {
    if (task.completedAt) {
      const weekNumber = getISOWeek(task.completedAt.toDate());
      const assignee = users.find(u => u.uid === task.assignedTo);
      if (weeklyData[weekNumber] && assignee && assignee.name) {
         if(!weeklyData[weekNumber][assignee.name]) {
            weeklyData[weekNumber][assignee.name] = 0;
         }
        weeklyData[weekNumber][assignee.name]++;
      }
    }
  });

  return Object.values(weeklyData).sort((a, b) => a.week - b.week);
};
