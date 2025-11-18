'use client';
import SettingsPage from '@/components/settings/SettingsPage';
import withAuth from '@/components/auth/withAuth';
import { MainContent } from '@/components/MainContent';

function Settings() {
  return (
    <MainContent>
        <SettingsPage />
    </MainContent>
  );
}

export default withAuth(Settings);
