import React, { useState } from 'react';
import { useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, FileText, Calendar, User, Building, FolderPlus } from 'lucide-react';
import { Expediente } from '../../types';
import { expedientesAPI } from '../../services/api';
import ExpedienteModal from './ExpedienteModal';
import MovementsView from './MovementsView';
import { usePermissions } from '../../hooks/usePermissions';

const ExpedientesTable: React.FC = () => {
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedExpediente, setSelectedExpediente] = useState<Expediente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showMovements, setShowMovements] = useState(false);
  const [selectedExpedienteForMovements, setSelectedExpedienteForMovements] = useState<Expediente | null>(null);
  const permissions = usePermissions();

  useEffect(() => {
    fetchExpedientes();
  }, []);

  const fetchExpedientes = async () => {
    try {
      const response = await expedientesAPI.getAll();
      setExpedientes(response.data);
    } catch (error) {
      console.error('Error fetching expedientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpedientes = expedientes.filter(expediente => {
    const matchesSearch = expediente.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expediente.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (expediente.numeroExpediente && expediente.numeroExpediente.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || expediente.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddExpediente = async (expedienteData: Omit<Expediente, 'id' | 'organizationId' | 'createdAt'>) => {
    try {
      const response = await expedientesAPI.create(expedienteData);
      setExpedientes([response.data, ...expedientes]);
      setShowModal(false);
      setSelectedExpediente(null);
    } catch (error) {
      console.error('Error creating expediente:', error);
      alert('Error al crear expediente');
    }
  };

  const handleEditExpediente = (expediente: Expediente) => {
    setSelectedExpediente(expediente);
    setShowModal(true);
  };

  const handleUpdateExpediente = async (expedienteData: Omit<Expediente, 'id' | 'organizationId' | 'createdAt'>) => {
    if (!selectedExpediente) return;
    
    try {
      const response = await expedientesAPI.update(selectedExpediente.id, expedienteData);
      setExpedientes(expedientes.map(exp => 
        exp.id === selectedExpediente.id ? response.data : exp
      ));
      setShowModal(false);
      setSelectedExpediente(null);
    } catch (error) {
      console.error('Error updating expediente:', error);
      alert('Error al actualizar expediente');
    }
  };

  const handleDeleteExpediente = async (expedienteId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este expediente?')) {
      try {
        await expedientesAPI.delete(expedienteId);
        setExpedientes(expedientes.filter(exp => exp.id !== expedienteId));
      } catch (error) {
        console.error('Error deleting expediente:', error);
        alert('Error al eliminar expediente');
      }
    }
  };

  const handleShowMovements = (expediente: Expediente) => {
    setSelectedExpedienteForMovements(expediente);
    setShowMovements(true);
  };

  const handleBackFromMovements = () => {
    setShowMovements(false);
    setSelectedExpedienteForMovements(null);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Activo': 'bg-green-100 text-green-800',
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'Cerrado': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const getOrigenIcon = (origen: string) => {
    switch (origen) {
      case 'Juzgados':
        return <Building className="w-4 h-4" />;
      case 'Oficinas':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Show movements view if selected
  if (showMovements && selectedExpedienteForMovements) {
    return (
      <MovementsView
        expedienteId={selectedExpedienteForMovements.id}
        expedienteTitle={selectedExpedienteForMovements.title}
        onBack={handleBackFromMovements}
      />
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando expedientes...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Expedientes</h1>
            <p className="text-gray-600 mt-1">Gestiona tus casos y expedientes</p>
          </div>
          {permissions.expedientes.create && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Expediente
            </button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar expedientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Cerrado">Cerrado</option>
          </select>
        </div>

        {/* Expedientes Table */}
        {filteredExpedientes.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo de Proceso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Origen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Creación
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpedientes.map((expediente) => (
                    <tr key={expediente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {expediente.numeroExpediente || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {expediente.tipoProceso || expediente.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getOrigenIcon(expediente.origen || 'Oficinas')}
                          <span className="text-sm text-gray-900">
                            {expediente.origen || 'Oficinas'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{expediente.clientName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(expediente.status)}`}>
                          {expediente.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(expediente.createdAt).toLocaleDateString('es-ES')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="text-gray-600 hover:text-blue-600 p-1 rounded transition-colors duration-200"
                            title="Ver expediente"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {permissions.expedientes.update && (
                            <button
                              onClick={() => handleEditExpediente(expediente)}
                              className="text-gray-600 hover:text-gray-700 p-1 rounded transition-colors duration-200"
                              title="Editar expediente"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            className="text-gray-600 hover:text-green-600 p-1 rounded transition-colors duration-200"
                            onClick={() => handleShowMovements(expediente)}
                            title="Ver/Agregar movimientos"
                          >
                            <FolderPlus className="w-4 h-4" />
                          </button>
                          {permissions.expedientes.delete && (
                            <button
                              onClick={() => handleDeleteExpediente(expediente.id)}
                              className="text-red-600 hover:text-red-700 p-1 rounded transition-colors duration-200"
                              title="Eliminar expediente"
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
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all'
                ? 'No se encontraron expedientes que coincidan con los filtros.'
                : 'No hay expedientes registrados aún.'
              }
            </p>
          </div>
        )}

        {/* Expediente Modal */}
        {showModal && (
          <ExpedienteModal
            expediente={selectedExpediente}
            onSave={selectedExpediente ? handleUpdateExpediente : handleAddExpediente}
            onClose={() => {
              setShowModal(false);
              setSelectedExpediente(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ExpedientesTable;