import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationItem } from './types';
import LoginForm from './components/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard';
import ClientsTable from './components/Clients/ClientsTable';
import ExpedientesTable from './components/Expedientes/KanbanBoard';
import CalendarView from './components/Agenda/CalendarView';
import DocumentGallery from './components/Documents/DocumentGallery';
import LibraryView from './components/Library/LibraryView';
import SettingsView from './components/Settings/SettingsView';
import AdminPanel from './components/Admin/AdminPanel';
import FloatingAssistant from './components/FloatingAssistant';

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<NavigationItem>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        return <ExpedientesTable />;
      case 'agenda':
        return <CalendarView />;
      case 'documentos':
        return <DocumentGallery />;
      case 'biblioteca':
        return <LibraryView />;
      case 'configuracion':
        return <SettingsView />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - oculto en móvil, drawer usado para móvil */}
      <div className="hidden md:flex">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Siempre visible */}
        <Header onToggleSidebar={() => {
          // si estamos en móvil, abrimos/cerramos el drawer móvil; si no, colapsamos el sidebar
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsMobileMenuOpen(prev => !prev);
          } else {
            setIsSidebarCollapsed(prev => !prev);
          }
        }} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 sm:px-6">
          {renderCurrentView()}
        </main>
      </div>

      
    
      {/* Mobile sidebar drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64">
            <Sidebar
              currentView={currentView}
              onViewChange={(v) => { setCurrentView(v); setIsMobileMenuOpen(false); }}
              isCollapsed={false}
            />
          </div>
        </div>
      )}

  {/* Floating Assistant - visible en todas las vistas excepto la principal (dashboard) */}
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