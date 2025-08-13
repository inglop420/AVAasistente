import React, { useState } from 'react';
import { Users, Building, Shield, UserPlus, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import OrganizationsManager from './OrganizationsManager';
import UsersManager from './UsersManager';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  // Only show admin panel to admin and superadmin users
  if (!user || !['admin', 'superadmin'].includes(user.role)) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder al panel de administración.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { 
      id: 'users', 
      label: 'Usuarios', 
      icon: Users,
      description: 'Gestionar usuarios del sistema'
    },
    ...(user.role === 'superadmin' ? [{
      id: 'organizations',
      label: 'Organizaciones',
      icon: Building,
      description: 'Gestionar organizaciones'
    }] : [])
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
          <p className="text-gray-600">Gestiona usuarios y organizaciones del sistema</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'users' && <UsersManager />}
            {activeTab === 'organizations' && user.role === 'superadmin' && <OrganizationsManager />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;