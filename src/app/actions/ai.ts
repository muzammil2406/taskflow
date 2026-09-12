'use server';

import { run } from '@genkit-ai/core';
import { suggestAssignee } from '@/ai/ai-smart-assignee-suggestions';
import type { UserProfile } from '@/types';
import { autoPrioritizeTask } from '@/ai/flows/autoPrioritizeTask';
import { breakdownTask } from '@/ai/flows/breakdownTask';
import { suggestCategory } from '@/ai/flows/suggestCategory';
import { createTaskFromVoice } from '@/ai/flows/createTaskFromVoice';

const CATEGORIES = [
    "General",
    "Frontend",
    "Backend",
    "Database",
    "Design",
    "Marketing",
    "Content",
    "Bug",
    "Feature",
    "Meeting",
];

export async function suggestAssigneeAction(taskDescription: string, users: UserProfile[]) {
    const teamMembers = users.map(u => u.name || 'Unnamed User');
    const userSkills = users.reduce((acc, user) => {
        if (user.name) {
            // In a real app, skills would be stored on the user profile.
            // For now, we'll assign some placeholder skills based on name.
            if (user.name.toLowerCase().includes('a')) {
                acc[user.name] = ['frontend', 'design'];
            } else if (user.name.toLowerCase().includes('e')) {
                acc[user.name] = ['backend', 'database'];
            } else {
                acc[user.name] = ['testing', 'copywriting'];
            }
        }
        return acc;
    }, {} as Record<string, string[]>);


  try {
    const result = await suggestAssignee({ taskDescription, teamMembers, userSkills });
    const suggestedUser = users.find(u => u.name === result.suggestedAssignee);
    return {
      userId: suggestedUser?.uid,
      userName: result.suggestedAssignee,
    };
  } catch(e) {
    console.error(e);
    return { userId: null, userName: null };
  }
}

export async function autoPrioritizeTaskAction(taskTitle: string, taskDescription: string, dueDate: Date | null | undefined) {
    try {
        const result = await autoPrioritizeTask({ taskTitle, taskDescription, dueDate: dueDate?.toISOString() });
        return result;
    } catch (e) {
        console.error(e);
        return { suggestedPriority: null, reasoning: 'Could not generate priority.' };
    }
}

export async function breakdownTaskAction(taskTitle: string, taskDescription: string) {
    try {
        const result = await breakdownTask({ taskTitle, taskDescription });
        return result.subtasks;
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function suggestCategoryAction(taskTitle: string, taskDescription: string) {
    try {
        const result = await suggestCategory({ taskTitle, taskDescription, existingCategories: CATEGORIES });
        return result;
    } catch (e) {
        console.error(e);
        return { suggestedCategory: null, confidence: 0 };
    }
}

export async function createTaskFromVoiceAction(audioDataUri: string, users: UserProfile[]) {
    try {
        const teamMembers = users.map(u => u.name || 'Unnamed');
        const result = await createTaskFromVoice({ 
            audioDataUri, 
            teamMembers,
            currentDate: new Date().toISOString() 
        });

        const assignedUser = users.find(u => u.name === result.assignedTo);

        return {
            ...result,
            assignedTo: assignedUser?.uid,
        };

    } catch(e) {
        console.error("Error in createTaskFromVoiceAction:", e);
        return null;
    }
}
