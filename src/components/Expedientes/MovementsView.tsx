import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, FileText, Calendar, User, Clock } from 'lucide-react';
import { Movement } from '../../types';
import { movementsAPI } from '../../services/api';
import MovementModal from './MovementModal';
import { usePermissions } from '../../hooks/usePermissions';

interface MovementsViewProps {
  expedienteId: string;
  expedienteTitle: string;
  onBack: () => void;
}

const MovementsView: React.FC<MovementsViewProps> = ({ 
  expedienteId, 
  expedienteTitle, 
  onBack 
}) => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [loading, setLoading] = useState(true);
  const permissions = usePermissions();

  useEffect(() => {
    fetchMovements();
  }, [expedienteId]);

  const fetchMovements = async () => {
    try {
      const response = await movementsAPI.getAll(expedienteId);
      setMovements(response.data);
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovement = async (movementData: Omit<Movement, 'id' | 'createdAt' | 'creadoPor'>) => {
    try {
      const response = await movementsAPI.create(expedienteId, movementData);
      setMovements([response.data, ...movements]);
      setShowModal(false);
      setSelectedMovement(null);
    } catch (error) {
      console.error('Error creating movement:', error);
      alert('Error al crear movimiento');
    }
  };

  const handleEditMovement = (movement: Movement) => {
    setSelectedMovement(movement);
    setShowModal(true);
  };

  const handleUpdateMovement = async (movementData: Omit<Movement, 'id' | 'createdAt' | 'creadoPor'>) => {
    if (!selectedMovement) return;
    
    try {
      const response = await movementsAPI.update(expedienteId, selectedMovement.id, movementData);
      setMovements(movements.map(mov => 
        mov.id === selectedMovement.id ? response.data : mov
      ));
      setShowModal(false);
      setSelectedMovement(null);
    } catch (error) {
      console.error('Error updating movement:', error);
      alert('Error al actualizar movimiento');
    }
  };

  const handleDeleteMovement = async (movementId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este movimiento?')) {
      try {
        await movementsAPI.delete(expedienteId, movementId);
        setMovements(movements.filter(mov => mov.id !== movementId));
      } catch (error) {
        console.error('Error deleting movement:', error);
        alert('Error al eliminar movimiento');
      }
    }
  };

  const getMovementTypeColor = (tipo: string) => {
    const colors = {
      'Actuacion': 'bg-blue-100 text-blue-800',
      'Escrito': 'bg-green-100 text-green-800',
      'Documento': 'bg-yellow-100 text-yellow-800',
      'Audiencia': 'bg-purple-100 text-purple-800',
      'Resolucion': 'bg-red-100 text-red-800',
      'Otro': 'bg-gray-100 text-gray-800'
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando movimientos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver a Expedientes
            </button>
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-3xl font-bold text-gray-900">Movimientos</h1>
              <p className="text-gray-600 mt-1">Expediente: {expedienteTitle}</p>
            </div>
          </div>
          
          {permissions.expedientes.create && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Movimiento
            </button>
          )}
        </div>

        {/* Movements Timeline */}
        {movements.length > 0 ? (
          <div className="space-y-6">
            {movements.map((movement, index) => (
              <div key={movement.id} className="relative">
                {/* Timeline line */}
                {index < movements.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-full bg-gray-200"></div>
                )}
                
                {/* Movement Card */}
                <div className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMovementTypeColor(movement.tipoMovimiento)}`}>
                            {movement.tipoMovimiento}
                          </span>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(movement.fecha)}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {movement.descripcion}
                        </h3>
                        
                        {movement.contenido && (
                          <div className="prose prose-sm max-w-none mb-4">
                            <div 
                              dangerouslySetInnerHTML={{ __html: movement.contenido }}
                              className="text-gray-700"
                            />
                          </div>
                        )}
                        
                        {movement.archivos && movement.archivos.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Archivos adjuntos:</h4>
                            <div className="flex flex-wrap gap-2">
                              {movement.archivos.map((archivo, fileIndex) => (
                                <a
                                  key={fileIndex}
                                  href={archivo.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-700 transition-colors duration-200"
                                >
                                  <FileText className="w-4 h-4" />
                                  <span>{archivo.nombre}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>Creado por usuario</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(movement.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {permissions.expedientes.update && (
                          <button
                            onClick={() => handleEditMovement(movement)}
                            className="text-gray-600 hover:text-gray-700 p-1 rounded transition-colors duration-200"
                            title="Editar movimiento"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {permissions.expedientes.delete && (
                          <button
                            onClick={() => handleDeleteMovement(movement.id)}
                            className="text-red-600 hover:text-red-700 p-1 rounded transition-colors duration-200"
                            title="Eliminar movimiento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay movimientos registrados</h3>
            <p className="text-gray-500 mb-6">
              Comienza agregando el primer movimiento a este expediente.
            </p>
            {permissions.expedientes.create && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Agregar Movimiento
              </button>
            )}
          </div>
        )}

        {/* Movement Modal */}
        {showModal && (
          <MovementModal
            movement={selectedMovement}
            expedienteId={expedienteId}
            onSave={selectedMovement ? handleUpdateMovement : handleAddMovement}
            onClose={() => {
              setShowModal(false);
              setSelectedMovement(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MovementsView;