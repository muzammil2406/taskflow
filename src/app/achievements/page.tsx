'use client';
import AchievementsPage from '@/components/gamification/AchievementsPage';
import withAuth from '@/components/auth/withAuth';
import { MainContent } from '@/components/MainContent';

function Achievements() {
  return (
    <MainContent>
        <AchievementsPage />
    </MainContent>
  );
}

export default withAuth(Achievements);
