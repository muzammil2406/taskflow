'use client';
import type { Task, Achievement } from "@/types";
import { Award, CheckCircle, Clock, Rocket, Zap } from "lucide-react";

export const ALL_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first-task',
        name: 'First Task Created',
        description: 'You created your very first task!',
        icon: Rocket,
    },
    {
        id: 'first-done',
        name: 'Task Complete!',
        description: 'You completed your first task.',
        icon: CheckCircle,
    },
    {
        id: 'ten-done',
        name: 'Productivity Pro',
        description: 'You completed 10 tasks. Keep it up!',
        icon: Zap,
    },
    {
        id: 'overdue-crusher',
        name: 'Deadline Master',
        description: 'You completed a task that was overdue.',
        icon: Clock,
    },
     {
        id: 'fifty-done',
        name: 'Task Master',
        description: 'You completed 50 tasks. Incredible!',
        icon: Award,
    },
];

export const checkAndAwardAchievements = (tasks: Task[], currentAchievements: string[]): string[] => {
    const newAchievements: string[] = [];
    const completedTasks = tasks.filter(t => t.status === 'done');

    // First Task Created
    if (tasks.length >= 1 && !currentAchievements.includes('first-task')) {
        newAchievements.push('first-task');
    }

    // First Task Completed
    if (completedTasks.length >= 1 && !currentAchievements.includes('first-done')) {
        newAchievements.push('first-done');
    }

    // 10 Tasks Completed
    if (completedTasks.length >= 10 && !currentAchievements.includes('ten-done')) {
        newAchievements.push('ten-done');
    }

    // 50 Tasks Completed
    if (completedTasks.length >= 50 && !currentAchievements.includes('fifty-done')) {
        newAchievements.push('fifty-done');
    }

    // Completed an overdue task
    const overdueCompleted = completedTasks.some(t => t.dueDate && t.completedAt && t.completedAt.toMillis() > t.dueDate.toMillis());
    if (overdueCompleted && !currentAchievements.includes('overdue-crusher')) {
        newAchievements.push('overdue-crusher');
    }

    return newAchievements;
}
