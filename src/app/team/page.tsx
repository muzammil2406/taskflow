'use client';
import TeamPage from '@/components/team/TeamPage';
import withAuth from '@/components/auth/withAuth';
import { MainContent } from '@/components/MainContent';

function Team() {
  return (
    <MainContent>
        <TeamPage />
    </MainContent>
  );
}

export default withAuth(Team);
