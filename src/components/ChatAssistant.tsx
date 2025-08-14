import React, { useState } from 'react';
import { Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { chatAPI } from '../services/api';

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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const currentInput = inputValue;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: currentInput,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Enviar mensaje al backend que se conecta con n8n
      const response = await chatAPI.sendMessage(currentInput);
      
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.data.response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Mensaje de error para el usuario
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, estoy experimentando dificultades técnicas. Por favor, intenta nuevamente en unos momentos.',
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
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