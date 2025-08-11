import React, { useState } from 'react';
import { Plus, Mic, BarChart3, Users, Briefcase, Calendar, FileText, BookOpen, Send } from 'lucide-react';
import { NavigationItem } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  onNavigate?: (view: NavigationItem) => void;
}
import { useChatAssistant } from '../hooks/useChatAssistant';

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [showTools, setShowTools] = useState(false);
  const { messages, isLoading, inputValue, setInputValue, handleSendMessage } = useChatAssistant();

  const navigationOptions = [
    { id: 'clientes' as NavigationItem, label: 'Clientes', icon: Users, description: 'Gestionar información de clientes' },
    { id: 'expedientes' as NavigationItem, label: 'Expedientes', icon: Briefcase, description: 'Administrar casos y expedientes' },
    { id: 'agenda' as NavigationItem, label: 'Agenda', icon: Calendar, description: 'Programar y ver citas' },
    { id: 'documentos' as NavigationItem, label: 'Documentos', icon: FileText, description: 'Gestionar archivos y documentos' },
    { id: 'biblioteca' as NavigationItem, label: 'Biblioteca', icon: BookOpen, description: 'Consultar recursos jurídicos' }
  ];

  const handleToolsClick = () => {
    setShowTools(!showTools);
  };

  const handleNavigationClick = (view: NavigationItem) => {
    if (onNavigate) {
      onNavigate(view);
    }
    setShowTools(false);
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
            Hola {user?.name}, soy AVA tu asistente Jurídico, ¿en qué te puedo ayudar el día de hoy?
          </h1>
        </div>

        {/* Área de mensajes - Solo visible cuando hay mensajes */}
        {hasMessages && (
          <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6 overflow-y-auto">
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
        <div className={`w-full max-w-4xl mx-auto px-6 ${hasMessages ? 'pb-6' : ''}`}>
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
            {showTools && (
              <div className="absolute top-full right-0 mt-2 w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Selecciona una herramienta</h3>
                  <div className="space-y-2">
                    {navigationOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleNavigationClick(option.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
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
    </div>
  );
};

export default Dashboard;