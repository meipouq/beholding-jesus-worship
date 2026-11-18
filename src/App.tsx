import React from 'react';
import { WorshipProvider, useWorship } from './context/WorshipContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { YouTubePlayerModal } from './components/common/YouTubePlayerModal';
import { ChordsTransposerModal } from './components/common/ChordsTransposerModal';
import { AuthModal } from './components/auth/AuthModal';
import { AuthGatewayView } from './components/auth/AuthGatewayView';

import { DashboardView } from './components/dashboard/DashboardView';
import { SongLibraryView } from './components/songs/SongLibraryView';
import { VocalistsView } from './components/vocalists/VocalistsView';
import { LineupsListView } from './components/lineups/LineupsListView';
import { RehearsalsView } from './components/rehearsals/RehearsalsView';
import { TasksView } from './components/tasks/TasksView';
import { AnnouncementsView } from './components/announcements/AnnouncementsView';
import { ResourcesView } from './components/resources/ResourcesView';

const MainLayout: React.FC = () => {
  const { activeModule } = useWorship();

  const renderModuleView = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardView />;
      case 'songs':
        return <SongLibraryView />;
      case 'vocalists':
        return <VocalistsView />;
      case 'lineups':
        return <LineupsListView />;
      case 'rehearsals':
        return <RehearsalsView />;
      case 'tasks':
        return <TasksView />;
      case 'announcements':
        return <AnnouncementsView />;
      case 'resources':
        return <ResourcesView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#1F1E1D] flex flex-col md:flex-row antialiased selection:bg-[#E8DFD1]">
      {/* Desktop Fixed Left Sidebar */}
      <div className="hidden md:block w-64 shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />

        <main className="flex-1 px-3 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 pb-24 md:pb-6 overflow-x-hidden">
          {renderModuleView()}
        </main>

        {/* Mobile Fixed Bottom Navigation */}
        <MobileBottomNav />
      </div>

      {/* Global Modals */}
      <YouTubePlayerModal />
      <ChordsTransposerModal />
      <AuthModal />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useWorship();

  if (!isAuthenticated) {
    return <AuthGatewayView />;
  }

  return <MainLayout />;
};

export const App: React.FC = () => {
  return (
    <WorshipProvider>
      <AppContent />
    </WorshipProvider>
  );
};

export default App;
