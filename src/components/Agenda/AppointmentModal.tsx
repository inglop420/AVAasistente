import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Appointment } from '../../types';
import { expedientesAPI } from '../../services/api';

interface AppointmentModalProps {
  onSave: (appointment: Omit<Appointment, 'id' | 'organizationId'>) => void;
  onClose: () => void;
  defaultDate?: Date | null;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ onSave, onClose, defaultDate }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    expedienteId: '',
    expedienteTitle: '',
    clientName: '',
    status: 'programada' as Appointment['status']
  });

  const [expedientes, setExpedientes] = useState<any[]>([]);

  useEffect(() => {
    fetchExpedientes();
  }, []);

  const fetchExpedientes = async () => {
    try {
      const response = await expedientesAPI.getAll();
      console.log('Expedientes recibidos:', response.data);
      setExpedientes(response.data);
    } catch (error) {
      console.error('Error fetching expedientes:', error);
    }
  };

  useEffect(() => {
    if (defaultDate) {
      setFormData(prev => ({
        ...prev,
        date: defaultDate.toISOString().split('T')[0]
      }));
    }
  }, [defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const appointmentDateTime = new Date(`${formData.date}T${formData.time}`);
    const expediente = expedientes.find(e => e._id === formData.expedienteId);
    
    const appointmentData: Omit<Appointment, 'id' | 'organizationId'> = {
      title: formData.title,
      date: appointmentDateTime.toISOString(),
      expedienteId: formData.expedienteId,
      expedienteTitle: expediente?.title,
      clientId: expediente?.clientId || '',
      clientName: expediente?.clientName || formData.clientName,
      status: formData.status
    };
    
    onSave(appointmentData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExpedienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const expedienteId = e.target.value;
    const expediente = expedientes.find(exp => exp.id === expedienteId);
    
    setFormData(prev => ({
      ...prev,
      expedienteId,
      expedienteTitle: expediente?.title || '',
      clientName: expediente?.clientName || '',
      title: expediente ? `Consulta - ${expediente.title}` : ''
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Agendar Cita</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título de la cita
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Consulta inicial"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expediente (opcional)
            </label>
            <select
              name="expedienteId"
              value={formData.expedienteId}
              onChange={handleExpedienteChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar expediente</option>
              {expedientes.map(expediente => (
                <option key={expediente.id} value={expediente.id}>
                  {expediente.title} - {expediente.clientName}
                </option>
              ))}
            </select>
          </div>

          {!formData.expedienteId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre del cliente"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="programada">Programada</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Agendar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;