import React from 'react';
import { 
  Home, 
  Users, 
  Briefcase, 
  Calendar, 
  FileText, 
  BookOpen, 
  Settings,
  LogOut,
  Building
} from 'lucide-react';
import { NavigationItem } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentView: NavigationItem;
  onViewChange: (view: NavigationItem) => void;
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isCollapsed }) => {
  const { user, organization, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard' as NavigationItem, label: 'Inicio', icon: Home },
    { id: 'clientes' as NavigationItem, label: 'Clientes', icon: Users },
    { id: 'expedientes' as NavigationItem, label: 'Expedientes', icon: Briefcase },
    { id: 'agenda' as NavigationItem, label: 'Agenda', icon: Calendar },
    { id: 'documentos' as NavigationItem, label: 'Documentos', icon: FileText },
    { id: 'biblioteca' as NavigationItem, label: 'Biblioteca', icon: BookOpen },
    { id: 'configuracion' as NavigationItem, label: 'Configuración', icon: Settings },
  ];

  return (
    <div className={`bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-gray-900">AVA Legal</h2>
              <p className="text-xs text-gray-500">{organization?.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 text-gray-600 hover:text-red-600 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="text-sm">Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;