'use client';

import { useMemo, useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useTasks } from '@/hooks/useTasks';
import type { Task, TaskStatus } from '@/types';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import TaskColumn from '../tasks/TaskColumn';
import TaskDetailModal from '../tasks/TaskDetailModal';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { useUser } from '@/hooks/useUser';


const columns: TaskStatus[] = ['todo', 'in-progress', 'done'];

export default function TaskBoard() {
  const { tasks, loading } = useTasks();
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const firestore = useFirestore();
  const { user } = useUser();

  const taskColumns = useMemo(() => {
    const groupedTasks: Record<TaskStatus, Task[]> = {
      'todo': [],
      'in-progress': [],
      'done': [],
    };
    tasks.forEach(task => {
      if (groupedTasks[task.status]) {
        groupedTasks[task.status].push(task);
      }
    });
    // Sort tasks within each column by creation date for consistent order
    for (const status in groupedTasks) {
      if (groupedTasks[status as TaskStatus]) {
        // @ts-ignore
        groupedTasks[status as TaskStatus].sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
      }
    }
    return groupedTasks;
  }, [tasks]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || !user || !firestore) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const finishColumnId = destination.droppableId as TaskStatus;
    const startColumnId = source.droppableId as TaskStatus;

    const updateData: { status: TaskStatus, completedAt?: any } = { status: finishColumnId };

    // If task is moved to 'done', add completedAt timestamp
    if (finishColumnId === 'done' && startColumnId !== 'done') {
        updateData.completedAt = serverTimestamp();
    }
    
    const taskRef = doc(firestore, 'users', user.uid, 'tasks', draggableId);
    updateDocumentNonBlocking(taskRef, updateData);
      
    toast({
        title: 'Task Updated',
        description: `Task moved to "${finishColumnId.replace('-', ' ')}".`,
    });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };
  
  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(columnId => (
            <Droppable droppableId={columnId} key={columnId}>
              {(provided, snapshot) => (
                <TaskColumn
                  status={columnId}
                  tasks={taskColumns[columnId]}
                  loading={loading}
                  provided={provided}
                  isDraggingOver={snapshot.isDraggingOver}
                  onTaskClick={handleTaskClick}
                />
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      {selectedTask && <TaskDetailModal task={selectedTask} isOpen={!!selectedTask} onClose={handleCloseModal} />}
    </>
  );
}
