import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationItem } from './types';
import LoginForm from './components/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard';
import ClientsTable from './components/Clients/ClientsTable';
import KanbanBoard from './components/Expedientes/KanbanBoard';
import CalendarView from './components/Agenda/CalendarView';
import DocumentGallery from './components/Documents/DocumentGallery';
import LibraryView from './components/Library/LibraryView';
import SettingsView from './components/Settings/SettingsView';
import FloatingAssistant from './components/FloatingAssistant';

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<NavigationItem>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'clientes':
        return <ClientsTable />;
      case 'expedientes':
        return <KanbanBoard />;
      case 'agenda':
        return <CalendarView />;
      case 'documentos':
        return <DocumentGallery />;
      case 'biblioteca':
        return <LibraryView />;
      case 'configuracion':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Solo mostrar si no estamos en dashboard */}
      {currentView !== 'dashboard' && (
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          isCollapsed={isSidebarCollapsed}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Solo mostrar si no estamos en dashboard */}
        {currentView !== 'dashboard' && (
          <Header onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        )}
        
        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${currentView === 'dashboard' ? 'h-screen' : ''}`}>
          {renderCurrentView()}
        </main>
      </div>

      {/* Floating Assistant - Solo mostrar si no estamos en dashboard */}
      {currentView !== 'dashboard' && <FloatingAssistant />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;