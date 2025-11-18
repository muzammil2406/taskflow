'use client';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import withAuth from '@/components/auth/withAuth';
import { MainContent } from '@/components/MainContent';

function Analytics() {
  return (
    <MainContent>
      <AnalyticsDashboard />
    </MainContent>
  );
}

export default withAuth(Analytics);
