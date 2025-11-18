'use client';
import SupportPage from '@/components/support/SupportPage';
import withAuth from '@/components/auth/withAuth';
import { MainContent } from '@/components/MainContent';


function Support() {
  return (
    <MainContent>
        <SupportPage />
    </MainContent>
  );
}

export default withAuth(Support);
