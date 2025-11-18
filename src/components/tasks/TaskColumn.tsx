'use client';
import { Draggable, DroppableProvided } from '@hello-pangea/dnd';
import type { Task, TaskStatus } from '@/types';
import TaskCard from './TaskCard';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  loading: boolean;
  provided: DroppableProvided;
  isDraggingOver: boolean;
  onTaskClick: (task: Task) => void;
}

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

const statusColors: Record<TaskStatus, string> = {
    todo: 'bg-blue-500',
    'in-progress': 'bg-yellow-500',
    done: 'bg-green-500',
}

export default function TaskColumn({
  status,
  tasks,
  loading,
  provided,
  isDraggingOver,
  onTaskClick,
}: TaskColumnProps) {
  return (
    <div
      {...provided.droppableProps}
      ref={provided.innerRef}
      className={cn(
        'flex flex-col rounded-lg bg-gray-100/50 dark:bg-gray-900/50 transition-colors duration-200',
        isDraggingOver && 'bg-primary/10'
      )}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-t-lg z-10">
        <div className="flex items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full', statusColors[status])}></span>
            <h2 className="text-lg font-semibold">{statusLabels[status]}</h2>
            <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {tasks.length}
            </span>
        </div>
      </div>
      <div className="flex-grow p-4 min-h-[200px] space-y-4">
        {loading ? (
            [...Array(3)].map((_, i) => (
                <div key={i} className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex items-center justify-between mt-4">
                        <Skeleton className="h-3 w-1/4" />
                        <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                </div>
            ))
        ) : tasks.length > 0 ? (
          tasks.map((task, index) => (
            <Draggable key={task.id} draggableId={task.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  onClick={() => onTaskClick(task)}
                >
                  <TaskCard task={task} isDragging={snapshot.isDragging} />
                </div>
              )}
            </Draggable>
          ))
        ) : (
          !isDraggingOver && (
            <div className="text-center text-sm text-muted-foreground py-10">
              No tasks here.
            </div>
          )
        )}
        {provided.placeholder}
      </div>
    </div>
  );
}
