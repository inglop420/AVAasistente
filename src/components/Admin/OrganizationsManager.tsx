import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building } from 'lucide-react';
import { Organization } from '../../types';
import { adminAPI } from '../../services/api';
import OrganizationModal from './OrganizationModal';

const OrganizationsManager: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await adminAPI.getOrganizations();
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async (orgData: Omit<Organization, 'id' | 'createdAt'>) => {
    try {
      const response = await adminAPI.createOrganization(orgData);
      setOrganizations([response.data, ...organizations]);
      setShowModal(false);
    } catch (error) {
      console.error('Error creating organization:', error);
      alert('Error al crear organización');
    }
  };

  const handleUpdateOrganization = async (orgData: Omit<Organization, 'id' | 'createdAt'>) => {
    if (!selectedOrganization) return;
    
    try {
      const response = await adminAPI.updateOrganization(selectedOrganization.id, orgData);
      setOrganizations(organizations.map(org => 
        org.id === selectedOrganization.id ? response.data : org
      ));
      setShowModal(false);
      setSelectedOrganization(null);
    } catch (error) {
      console.error('Error updating organization:', error);
      alert('Error al actualizar organización');
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta organización?')) {
      try {
        await adminAPI.deleteOrganization(orgId);
        setOrganizations(organizations.filter(org => org.id !== orgId));
      } catch (error) {
        console.error('Error deleting organization:', error);
        alert('Error al eliminar organización');
      }
    }
  };

  const handleEditOrganization = (organization: Organization) => {
    setSelectedOrganization(organization);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando organizaciones...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Organizaciones</h2>
          <p className="text-gray-600 mt-1">Gestiona las organizaciones del sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Organización
        </button>
      </div>

      {organizations.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organización
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Creación
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {organizations.map((organization) => (
                  <tr key={organization.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{organization.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(organization.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEditOrganization(organization)}
                          className="text-gray-600 hover:text-gray-700 p-1 rounded transition-colors duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteOrganization(organization.id)}
                          className="text-red-600 hover:text-red-700 p-1 rounded transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay organizaciones registradas aún.</p>
        </div>
      )}

      {/* Organization Modal */}
      {showModal && (
        <OrganizationModal
          organization={selectedOrganization}
          onSave={selectedOrganization ? handleUpdateOrganization : handleCreateOrganization}
          onClose={() => {
            setShowModal(false);
            setSelectedOrganization(null);
          }}
        />
      )}
    </div>
  );
};

export default OrganizationsManager;