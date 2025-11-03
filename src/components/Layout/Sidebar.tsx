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
} from 'lucide-react';
import Logo from '../../../Logo.png';
import { NavigationItem } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentView: NavigationItem;
  onViewChange: (view: NavigationItem) => void;
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isCollapsed }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard' as NavigationItem, label: 'Inicio', icon: Home },
    { id: 'clientes' as NavigationItem, label: 'Clientes', icon: Users },
    { id: 'expedientes' as NavigationItem, label: 'Expedientes', icon: Briefcase },
    { id: 'agenda' as NavigationItem, label: 'Agenda', icon: Calendar },
    { id: 'documentos' as NavigationItem, label: 'Documentos', icon: FileText },
    { id: 'biblioteca' as NavigationItem, label: 'Biblioteca', icon: BookOpen },
    ...(user && ['admin', 'superadmin'].includes(user.role) ? [
      { id: 'admin' as NavigationItem, label: 'Administración', icon: Settings }
    ] : []),
    { id: 'configuracion' as NavigationItem, label: 'Configuración', icon: Settings },
  ];

  return (
    <div className={`bg-gray-50 border-r border-gray-100 h-screen flex flex-col transition-all duration-300 shadow-sm ${isCollapsed ? 'w-14' : 'w-52'}`}>
      {/* Header */}
      <div className={`border-b border-gray-100 ${isCollapsed ? 'p-2' : 'p-3'}`}>
        <div className="flex items-center gap-3">
          <div className={`${isCollapsed ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg flex items-center justify-center overflow-hidden`}>
            <img src={Logo} alt="AVA Logo" className={`w-full h-full object-contain`} />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-gray-900 text-sm">AVA</h2>
              <p className="text-xs text-gray-500">Asistente Jurídico</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isCollapsed ? 'p-1' : 'p-3'}`}>
        <ul className={`${isCollapsed ? 'space-y-1' : 'space-y-1'}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-lg text-left transition-all duration-200 group relative ${
                    isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'
                  } ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                  {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className={`border-t border-gray-100 ${isCollapsed ? 'p-2' : 'p-3'}`}>
        {!isCollapsed && (
          <div className="mb-2">
            <p className="text-xs font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        )}
        <button
          onClick={logout}
          title={isCollapsed ? 'Cerrar Sesión' : undefined}
          className={`flex items-center text-gray-600 hover:text-red-600 transition-colors duration-200 group relative ${
            isCollapsed ? 'justify-center p-2 w-full' : 'gap-2'
          }`}
        >
          <LogOut className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          {!isCollapsed && <span className="text-xs">Cerrar Sesión</span>}
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Cerrar Sesión
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;