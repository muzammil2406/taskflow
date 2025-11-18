import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  id: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
  achievements?: string[]; // For Gamification
  notificationPreferences?: {
    dueSoon: boolean;
    taskAssigned: boolean;
  };
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Timestamp | null;
  assignedTo: string | null; // User ID
  createdBy: string; // User ID
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  attachments?: { name: string; url: string }[];
  subtasks?: Subtask[];
  category?: string;
  parentTaskId?: string | null; // For Dependencies
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  text: string;
  createdAt: Timestamp;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{className?: string}>;
}
