import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Expediente } from '../../types';
import { clientsAPI } from '../../services/api';

interface ExpedienteModalProps {
  expediente: Expediente | null;
  onSave: (expediente: Omit<Expediente, 'id' | 'organizationId' | 'createdAt'>) => void;
  onClose: () => void;
}

const ExpedienteModal: React.FC<ExpedienteModalProps> = ({ expediente, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    numeroExpediente: '',
    tipoProceso: '',
    origen: 'Oficinas',
    title: '',
    clientId: '',
    clientName: '',
    status: 'Activo' as Expediente['status'],
    dueDate: ''
  });

  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll();
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    if (expediente) {
      setFormData({
        numeroExpediente: expediente.numeroExpediente || '',
        tipoProceso: expediente.tipoProceso || '',
        origen: expediente.origen || 'Oficinas',
        title: expediente.title,
        clientId: expediente.clientId,
        clientName: expediente.clientName,
        status: expediente.status,
        dueDate: expediente.dueDate ? expediente.dueDate: ''
      });
    }
  }, [expediente]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const client = clients.find(c => c._id === formData.clientId);
    const expedienteData = {
      ...formData,
      clientName: client?.name || formData.clientName,
      dueDate: formData.dueDate ? formData.dueDate : undefined
    };
    
    onSave(expedienteData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    const client = clients.find(c => c._id === clientId);
    
    setFormData(prev => ({
      ...prev,
      clientId,
      clientName: client?.name || ''
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {expediente ? 'Editar Expediente' : 'Nuevo Expediente'}
          </h2>
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
              Número de expediente
            </label>
            <input
              type="text"
              name="numeroExpediente"
              value={formData.numeroExpediente}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: EXP-2024-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de proceso
            </label>
            <input
              type="text"
              name="tipoProceso"
              value={formData.tipoProceso}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Divorcio contencioso, Reclamación de cantidad"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Origen
            </label>
            <select
              name="origen"
              value={formData.origen}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Juzgados">Juzgados</option>
              <option value="Oficinas">Oficinas</option>
              <option value="Tribunales">Tribunales</option>
              <option value="Notarías">Notarías</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del expediente
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Divorcio contencioso"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente
            </label>
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleClientChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar cliente</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

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
              <option value="Activo">Activo</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha límite (opcional)
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              {expediente ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpedienteModal;