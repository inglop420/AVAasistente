import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Task } from '../../types';

interface TaskModalProps {
  task: Task | null;
  expedienteId: string;
  expedienteTitle: string;
  clientName: string;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'creadoPor' | 'expedienteTitle' | 'clientName'>) => void;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  task, 
  expedienteId, 
  expedienteTitle,
  clientName,
  onSave, 
  onClose 
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'importante' as Task['prioridad'],
    estado: 'pendiente' as Task['estado'],
    fechaVencimiento: '',
    horaVencimiento: ''
  });

  useEffect(() => {
    if (task) {
      const fechaVencimiento = new Date(task.fechaVencimiento);
      setFormData({
        titulo: task.titulo,
        descripcion: task.descripcion || '',
        prioridad: task.prioridad,
        estado: task.estado,
        fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
        horaVencimiento: fechaVencimiento.toTimeString().slice(0, 5)
      });
    } else {
      // Set default date to today and time to current time + 1 hour
      const now = new Date();
      const defaultDate = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
      setFormData(prev => ({
        ...prev,
        fechaVencimiento: now.toISOString().split('T')[0],
        horaVencimiento: defaultDate.toTimeString().slice(0, 5)
      }));
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date and time
    const fechaVencimiento = new Date(`${formData.fechaVencimiento}T${formData.horaVencimiento}`);
    
    const taskData = {
      ...formData,
      expedienteId,
      fechaVencimiento: fechaVencimiento.toISOString()
    };
    
    onSave(taskData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getPrioridadColor = (prioridad: string) => {
    const colors = {
      'urgente': 'text-red-600 bg-red-50 border-red-200',
      'prioritario': 'text-orange-600 bg-orange-50 border-orange-200',
      'importante': 'text-blue-600 bg-blue-50 border-blue-200',
      'recordar': 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[prioridad as keyof typeof colors] || colors.importante;
  };

  const getPrioridadIcon = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'prioritario':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'importante':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'recordar':
        return <Calendar className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {task ? 'Editar Tarea' : 'Nueva Tarea'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Expediente: {expedienteTitle} - {clientName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Tarea *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Revisar documentación, Preparar alegatos..."
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detalles adicionales sobre la tarea..."
              />
            </div>

            {/* Prioridad y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad *
                </label>
                <div className="relative">
                  <select
                    name="prioridad"
                    value={formData.prioridad}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${getPrioridadColor(formData.prioridad)}`}
                  >
                    <option value="urgente">🔴 Urgente</option>
                    <option value="prioritario">🟠 Prioritario</option>
                    <option value="importante">🔵 Importante</option>
                    <option value="recordar">⚪ Recordar</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {getPrioridadIcon(formData.prioridad)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pendiente">⏳ Pendiente</option>
                  <option value="realizado">✅ Realizado</option>
                  <option value="cancelado">❌ Cancelado</option>
                </select>
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Vencimiento *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="fechaVencimiento"
                    value={formData.fechaVencimiento}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    name="horaVencimiento"
                    value={formData.horaVencimiento}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Sincronización con Agenda</h4>
                  <p className="text-sm text-blue-700">
                    Esta tarea aparecerá automáticamente en tu agenda general para que no olvides realizarla.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {task ? 'Actualizar' : 'Crear'} Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;