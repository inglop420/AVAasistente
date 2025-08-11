import React, { useState } from 'react';
import { Plus, Calendar, User } from 'lucide-react';
import { Expediente } from '../../types';
import { mockExpedientes } from '../../data/mockData';
import ExpedienteModal from './ExpedienteModal';

const KanbanBoard: React.FC = () => {
  const [expedientes, setExpedientes] = useState<Expediente[]>(mockExpedientes);
  const [showModal, setShowModal] = useState(false);
  const [selectedExpediente, setSelectedExpediente] = useState<Expediente | null>(null);

  const statusColumns = [
    { status: 'Activo' as const, title: 'Activos', color: 'bg-green-100 text-green-800' },
    { status: 'Pendiente' as const, title: 'Pendientes', color: 'bg-yellow-100 text-yellow-800' },
    { status: 'Cerrado' as const, title: 'Cerrados', color: 'bg-gray-100 text-gray-800' }
  ];

  const handleAddExpediente = (expedienteData: Omit<Expediente, 'id' | 'organizationId' | 'createdAt'>) => {
    const newExpediente: Expediente = {
      ...expedienteData,
      id: Date.now().toString(),
      organizationId: '1',
      createdAt: new Date()
    };
    setExpedientes([...expedientes, newExpediente]);
    setShowModal(false);
    setSelectedExpediente(null);
  };

  const handleDragStart = (e: React.DragEvent, expediente: Expediente) => {
    e.dataTransfer.setData('text/plain', expediente.id);
  };

  const handleDrop = (e: React.DragEvent, newStatus: Expediente['status']) => {
    e.preventDefault();
    const expedienteId = e.dataTransfer.getData('text/plain');
    
    setExpedientes(expedientes.map(exp => 
      exp.id === expedienteId 
        ? { ...exp, status: newStatus }
        : exp
    ));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expedientes</h1>
            <p className="text-gray-600 mt-1">Gestiona el estado de tus casos</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Expediente
          </button>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {statusColumns.map((column) => (
            <div
              key={column.status}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              onDrop={(e) => handleDrop(e, column.status)}
              onDragOver={handleDragOver}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">{column.title}</h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${column.color}`}>
                  {expedientes.filter(exp => exp.status === column.status).length}
                </span>
              </div>

              <div className="space-y-3 min-h-96">
                {expedientes
                  .filter(exp => exp.status === column.status)
                  .map((expediente) => (
                    <div
                      key={expediente.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, expediente)}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-move"
                    >
                      <h3 className="font-medium text-gray-900 mb-2">{expediente.title}</h3>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <User className="w-4 h-4" />
                        <span>{expediente.clientName}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{expediente.createdAt.toLocaleDateString('es-ES')}</span>
                        </div>
                        {expediente.dueDate && (
                          <div className="text-yellow-600 font-medium">
                            Vence: {expediente.dueDate.toLocaleDateString('es-ES')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                {expedientes.filter(exp => exp.status === column.status).length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No hay expedientes en esta columna
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Expediente Modal */}
        {showModal && (
          <ExpedienteModal
            expediente={selectedExpediente}
            onSave={selectedExpediente ? () => {} : handleAddExpediente}
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

export default KanbanBoard;