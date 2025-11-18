'use client';
import CalendarView from '@/components/calendar/CalendarView';
import withAuth from '@/components/auth/withAuth';
import { MainContent } from '@/components/MainContent';

function CalendarPage() {
  return (
    <MainContent>
        <CalendarView />
    </MainContent>
  );
}

export default withAuth(CalendarPage);
