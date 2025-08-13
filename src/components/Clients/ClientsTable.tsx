import React, { useState } from 'react';
import { useEffect } from 'react';
import { Plus, Mail, Phone, Eye, Edit, Trash2 } from 'lucide-react';
import { Client } from '../../types';
import { clientsAPI } from '../../services/api';
import ClientModal from './ClientModal';
import { usePermissions } from '../../hooks/usePermissions';

const ClientsTable: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const permissions = usePermissions();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll();
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = async (clientData: Omit<Client, 'id' | 'organizationId' | 'createdAt'>) => {
      try {
        const response = await clientsAPI.create(clientData);
        setClients([response.data, ...clients]);
        setShowModal(false);
        setSelectedClient(null);
      } catch (error) {
        console.error('Error creating client:', error);
        alert('Error al crear cliente');
      }
    };
  

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowModal(true);
  };

  const handleUpdateClient = async (clientData: Omit<Client, 'id' | 'organizationId' | 'createdAt'>) => {
    if (!selectedClient) return;
    
    try {
      const response = await clientsAPI.update(selectedClient.id, clientData);
      setClients(clients.map(c => 
        c.id === selectedClient.id ? response.data : c
      ));
      setShowModal(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Error al actualizar cliente');
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await clientsAPI.delete(clientId);
        setClients(clients.filter(c => c.id !== clientId));
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error al eliminar cliente');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando clientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600 mt-1">Gestiona la información de tus clientes</p>
          </div>
          {permissions.clients.create && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Cliente
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar clientes por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expedientes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Registro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {client.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {client.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {permissions.clients.update && (
                          <button 
                            onClick={() => handleEditClient(client)}
                            className="text-gray-600 hover:text-gray-700 p-1 rounded transition-colors duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {permissions.clients.delete && (
                          <button 
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-red-600 hover:text-red-700 p-1 rounded transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {permissions.clients.update && (
                          <button 
                            onClick={() => handleEditClient(client)}
                            className="text-gray-600 hover:text-gray-700 p-1 rounded transition-colors duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {permissions.clients.delete && (
                          <button 
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-red-600 hover:text-red-700 p-1 rounded transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm ? 'No se encontraron clientes que coincidan con tu búsqueda.' : 'No hay clientes registrados aún.'}
            </div>
          </div>
        )}

        {/* Client Modal */}
        {showModal && (
          <ClientModal
            client={selectedClient}
            onSave={selectedClient ? handleUpdateClient : handleAddClient}
            onClose={() => {
              setShowModal(false);
              setSelectedClient(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ClientsTable;