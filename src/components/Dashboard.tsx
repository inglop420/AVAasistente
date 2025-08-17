import React, { useState } from 'react';
import { Plus, Mic, Users, Briefcase, Calendar, Send } from 'lucide-react';
import { NavigationItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ClientModal from './Clients/ClientModal';
import ExpedienteModal from './Expedientes/ExpedienteModal';
import AppointmentModal from './Agenda/AppointmentModal';
import { clientsAPI, expedientesAPI, appointmentsAPI } from '../services/api';

interface DashboardProps {
  onNavigate?: (view: NavigationItem) => void;
}
import { useChatAssistant } from '../hooks/useChatAssistant';

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [showTools, setShowTools] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showExpedienteModal, setShowExpedienteModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const { messages, isLoading, inputValue, setInputValue, handleSendMessage } = useChatAssistant();

  const navigationOptions = [
    { id: 'cliente', label: 'Cliente', icon: Users, description: 'Crear nuevo cliente', action: () => setShowClientModal(true) },
    { id: 'expediente', label: 'Expediente', icon: Briefcase, description: 'Crear nuevo expediente', action: () => setShowExpedienteModal(true) },
    { id: 'cita', label: 'Cita', icon: Calendar, description: 'Agendar nueva cita', action: () => setShowAppointmentModal(true) }
  ];

  const handleToolsClick = () => {
    setShowTools(!showTools);
  };

  const handleOptionClick = (option: any) => {
    option.action();
    setShowTools(false);
  };

  const handleCreateClient = async (clientData: any) => {
    try {
      await clientsAPI.create(clientData);
      setShowClientModal(false);
      // Opcionalmente navegar a la página de clientes
      if (onNavigate) {
        onNavigate('clientes');
      }
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Error al crear cliente');
    }
  };

  const handleCreateExpediente = async (expedienteData: any) => {
    try {
      await expedientesAPI.create(expedienteData);
      setShowExpedienteModal(false);
      // Opcionalmente navegar a la página de expedientes
      if (onNavigate) {
        onNavigate('expedientes');
      }
    } catch (error) {
      console.error('Error creating expediente:', error);
      alert('Error al crear expediente');
    }
  };

  const handleCreateAppointment = async (appointmentData: any) => {
    try {
      await appointmentsAPI.create(appointmentData);
      setShowAppointmentModal(false);
      // Opcionalmente navegar a la página de agenda
      if (onNavigate) {
        onNavigate('agenda');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error al crear cita');
    }
  };
  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Contenedor principal con transición */}
      <div className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${
        hasMessages ? 'justify-start' : 'justify-center'
      }`}>
        
        {/* Título principal - Se oculta cuando hay mensajes */}
        <div className={`text-center transition-all duration-500 ease-in-out ${
          hasMessages 
            ? 'opacity-0 transform -translate-y-4 h-0 overflow-hidden mb-0' 
            : 'opacity-100 transform translate-y-0 mb-12'
        }`}>
          <h1 className="text-4xl font-normal text-gray-800">
            Hola {user?.name}, soy AVA tu asistente Jurídico
          </h1>
          <h2 className="text-2xl font-normal text-gray-700">
            ¿En qué te puedo ayudar?
          </h2>
        </div>

        {/* Área de mensajes - Solo visible cuando hay mensajes */}
        {hasMessages && (
          <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6 overflow-y-auto pb-24">
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-3xl ${message.isUser ? 'ml-12' : 'mr-12'}`}>
                    {!message.isUser && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">A</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">AVA</span>
                      </div>
                    )}
                    {message.isUser && (
                      <div className="flex items-center gap-2 mb-2 justify-end">
                        <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {user?.name?.charAt(0)}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className={`p-4 rounded-lg ${
                      message.isUser 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-3xl mr-12">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">AVA</span>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contenedor de la barra de búsqueda - Fijo en la parte inferior cuando hay mensajes */}
        <div className={`w-full max-w-4xl mx-auto px-6 ${hasMessages ? 'fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-gray-50 pb-6 pt-4 z-40' : ''}`}>
          {/* Barra de búsqueda principal */}
          <div className="relative">
            <form onSubmit={handleSendMessage} className="relative">
              <div className="bg-white rounded-full shadow-lg border border-gray-200 p-4 flex items-center gap-4">
                {/* Botón de agregar */}
                <button
                  type="button"
                  onClick={handleToolsClick}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <Plus className="w-5 h-5" />
                </button>

                {/* Input principal */}
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ingresa la tarea que deseas realizar"
                  className="flex-1 text-lg text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none"
                />

                {/* Botones de la derecha */}
                <div className="flex items-center gap-3">
                  {inputValue.trim() ? (
                    <button
                      type="submit"
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

            </form>

            {/* Menú desplegable de herramientas - Solo visible cuando no hay mensajes */}
            {showTools && !hasMessages && (
              <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-in slide-in-from-bottom-2 duration-200">
                {/* Flecha apuntando al botón + */}
                <div className="absolute -bottom-1 left-4 w-2 h-2 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
                
                <div className="p-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-2 px-1">Agregar</h3>
                  <div className="space-y-1">
                    {navigationOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleOptionClick(option)}
                          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 text-left group"
                          title={option.description}
                        >
                          <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                            <Icon className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors duration-200">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Texto de advertencia - Solo visible cuando hay mensajes */}
      {hasMessages && (
        <div className="text-center py-3 text-xs text-gray-500 border-t border-gray-200">
          AVA puede cometer errores. Considera verificar la información importante.
        </div>
      )}

      {/* Modales */}
      {showClientModal && (
        <ClientModal
          client={null}
          onSave={handleCreateClient}
          onClose={() => setShowClientModal(false)}
        />
      )}

      {showExpedienteModal && (
        <ExpedienteModal
          expediente={null}
          onSave={handleCreateExpediente}
          onClose={() => setShowExpedienteModal(false)}
        />
      )}

      {showAppointmentModal && (
        <AppointmentModal
          onSave={handleCreateAppointment}
          onClose={() => setShowAppointmentModal(false)}
          defaultDate={null}
        />
      )}
    </div>
  );
};

export default Dashboard;