import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, User } from 'lucide-react';
import { Task } from '../../types';
import { tasksAPI } from '../../services/api';
import TaskModal from './TaskModal';
import { usePermissions } from '../../hooks/usePermissions';

interface TasksViewProps {
  expedienteId: string;
  expedienteTitle: string;
  clientName: string;
  onBack: () => void;
}

const TasksView: React.FC<TasksViewProps> = ({ 
  expedienteId, 
  expedienteTitle,
  clientName,
  onBack 
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterEstado, setFilterEstado] = useState('all');
  const [filterPrioridad, setFilterPrioridad] = useState('all');
  const [loading, setLoading] = useState(true);
  const permissions = usePermissions();

  useEffect(() => {
    fetchTasks();
  }, [expedienteId]);

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getAll(expedienteId);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesEstado = filterEstado === 'all' || task.estado === filterEstado;
    const matchesPrioridad = filterPrioridad === 'all' || task.prioridad === filterPrioridad;
    return matchesEstado && matchesPrioridad;
  });

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'creadoPor' | 'expedienteTitle' | 'clientName'>) => {
    try {
      const response = await tasksAPI.create(expedienteId, taskData);
      setTasks([response.data, ...tasks]);
      setShowModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error al crear tarea');
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleUpdateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'creadoPor' | 'expedienteTitle' | 'clientName'>) => {
    if (!selectedTask) return;
    
    try {
      const response = await tasksAPI.update(expedienteId, selectedTask.id, taskData);
      setTasks(tasks.map(task => 
        task.id === selectedTask.id ? response.data : task
      ));
      setShowModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error al actualizar tarea');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      try {
        await tasksAPI.delete(expedienteId, taskId);
        setTasks(tasks.filter(task => task.id !== taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error al eliminar tarea');
      }
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    const colors = {
      'urgente': 'bg-red-100 text-red-800 border-red-200',
      'prioritario': 'bg-orange-100 text-orange-800 border-orange-200',
      'importante': 'bg-blue-100 text-blue-800 border-blue-200',
      'recordar': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[prioridad as keyof typeof colors] || colors.importante;
  };

  const getEstadoColor = (estado: string) => {
    const colors = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'realizado': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colors[estado as keyof typeof colors] || colors.pendiente;
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'realizado':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelado':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getPrioridadIcon = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente':
      case 'prioritario':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
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

  const isOverdue = (fechaVencimiento: Date | string) => {
    return new Date(fechaVencimiento) < new Date() && tasks.find(t => t.fechaVencimiento === fechaVencimiento)?.estado === 'pendiente';
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tareas...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Tareas</h1>
              <p className="text-gray-600 mt-1">
                Expediente: {expedienteTitle} - {clientName}
              </p>
            </div>
          </div>
          
          {permissions.expedientes.create && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva Tarea
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="realizado">Realizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          
          <select
            value={filterPrioridad}
            onChange={(e) => setFilterPrioridad(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas las prioridades</option>
            <option value="urgente">🔴 Urgente</option>
            <option value="prioritario">🟠 Prioritario</option>
            <option value="importante">🔵 Importante</option>
            <option value="recordar">⚪ Recordar</option>
          </select>
        </div>

        {/* Tasks List */}
        {filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow duration-200 ${
                  isOverdue(task.fechaVencimiento) ? 'border-red-200 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPrioridadColor(task.prioridad)}`}>
                        {getPrioridadIcon(task.prioridad)}
                        <span className="ml-1 capitalize">{task.prioridad}</span>
                      </span>
                      
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(task.estado)}`}>
                        {getEstadoIcon(task.estado)}
                        <span className="ml-1 capitalize">{task.estado}</span>
                      </span>

                      {isOverdue(task.fechaVencimiento) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Vencida
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {task.titulo}
                    </h3>
                    
                    {task.descripcion && (
                      <p className="text-gray-600 mb-4">
                        {task.descripcion}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(task.fechaVencimiento)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(task.fechaVencimiento)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Creada por usuario</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {permissions.expedientes.update && (
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-gray-600 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        title="Editar tarea"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {permissions.expedientes.delete && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-100 transition-colors duration-200"
                        title="Eliminar tarea"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas registradas</h3>
            <p className="text-gray-500 mb-6">
              {filterEstado !== 'all' || filterPrioridad !== 'all'
                ? 'No se encontraron tareas que coincidan con los filtros seleccionados.'
                : 'Comienza agregando la primera tarea a este expediente.'
              }
            </p>
            {permissions.expedientes.create && (filterEstado === 'all' && filterPrioridad === 'all') && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Agregar Tarea
              </button>
            )}
          </div>
        )}

        {/* Task Modal */}
        {showModal && (
          <TaskModal
            task={selectedTask}
            expedienteId={expedienteId}
            expedienteTitle={expedienteTitle}
            clientName={clientName}
            onSave={selectedTask ? handleUpdateTask : handleAddTask}
            onClose={() => {
              setShowModal(false);
              setSelectedTask(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TasksView;