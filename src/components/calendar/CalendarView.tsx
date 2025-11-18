'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useTasks } from '@/hooks/useTasks';
import { useMemo, useState } from 'react';
import { EventClickArg, EventDropArg } from '@fullcalendar/core';
import TaskDetailModal from '../tasks/TaskDetailModal';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc, Timestamp } from 'firebase/firestore';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export default function CalendarView() {
  const { tasks, loading } = useTasks();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const calendarEvents = useMemo(() => {
    return tasks
        .filter(task => task.dueDate)
        .map(task => ({
            id: task.id,
            title: task.title,
            start: task.dueDate!.toDate(),
            allDay: true, // Assuming all-day tasks for simplicity
            borderColor: task.status === 'done' ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
            backgroundColor: task.status === 'done' ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--accent) / 0.2)',
            textColor: 'hsl(var(--foreground))',
        }));
  }, [tasks]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedTask(clickInfo.event.id);
  };

  const handleEventDrop = (dropInfo: EventDropArg) => {
    if (!user || !firestore) return;

    const { event } = dropInfo;
    const taskRef = doc(firestore, 'users', user.uid, 'tasks', event.id);
    const newDueDate = event.start ? Timestamp.fromDate(event.start) : null;
    
    updateDocumentNonBlocking(taskRef, { dueDate: newDueDate });

    toast({
      title: 'Task Rescheduled',
      description: `"${event.title}" has been moved to a new date.`,
    });
  };

  const openTask = useMemo(() => tasks.find(t => t.id === selectedTask), [tasks, selectedTask]);

  if (loading) {
      return (
          <Card>
              <CardHeader>
                  <Skeleton className="h-6 w-1/4" />
              </CardHeader>
              <CardContent>
                  <Skeleton className="h-[600px] w-full" />
              </CardContent>
          </Card>
      )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Task Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            initialView="dayGridMonth"
            weekends={true}
            events={calendarEvents}
            editable={true}
            droppable={true}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            height="auto"
            contentHeight="600px"
          />
        </CardContent>
      </Card>
      {openTask && (
        <TaskDetailModal 
            isOpen={!!openTask} 
            onClose={() => setSelectedTask(null)}
            task={openTask}
        />
      )}
    </>
  );
}
