import React, { useState } from 'react';
import { Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatAssistantProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ 
  isMinimized = false, 
  onToggleMinimize 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '¡Hola! Soy AVA, tu asistente jurídico virtual. ¿En qué puedo ayudarte hoy?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const simulateResponse = (userMessage: string): string => {
    const responses = {
      agenda: 'He revisado tu agenda y tienes 2 citas programadas para esta semana: Consulta divorcio con Pedro Martínez el viernes a las 10:00 AM y Revisión herencia con Lucía Fernández el sábado a las 3:30 PM.',
      expediente: 'Basándome en los datos del expediente, te sugiero revisar el artículo 85 del Código Civil para el caso de divorcio. ¿Necesitas que genere un borrador de la demanda?',
      cliente: 'Encontré 3 clientes en la base de datos: Pedro Martínez (2 expedientes), Lucía Fernández (1 expediente) y Roberto Silva (3 expedientes). ¿Sobre cuál necesitas información?',
      default: 'Entiendo tu consulta. Como asistente jurídico, puedo ayudarte con búsquedas de jurisprudencia, generar borradores de documentos, revisar tu agenda y consultar información de expedientes. ¿Qué necesitas específicamente?'
    };

    const message = userMessage.toLowerCase();
    if (message.includes('agenda') || message.includes('cita')) return responses.agenda;
    if (message.includes('expediente') || message.includes('caso')) return responses.expediente;
    if (message.includes('cliente')) return responses.cliente;
    return responses.default;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: simulateResponse(inputValue),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 1500);
  };

  if (isMinimized) {
    return (
      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors duration-200">
        <Bot className="w-6 h-6 text-white" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-80 h-96 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-white" />
          <span className="font-medium text-white">AVA Asistente</span>
        </div>
        {onToggleMinimize && (
          <button
            onClick={onToggleMinimize}
            className="text-white hover:bg-blue-700 p-1 rounded transition-colors duration-200"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            {!message.isUser && (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
            )}
            <div
              className={`max-w-xs px-3 py-2 rounded-lg ${
                message.isUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
            {message.isUser && (
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="bg-gray-100 px-3 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Escribe tu consulta..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;