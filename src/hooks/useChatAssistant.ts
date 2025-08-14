import { useState } from 'react';
import { chatAPI } from '../services/api';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const useChatAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const currentInput = inputValue;
    
    // Agregar mensaje del usuario al chat
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
      const apiResponse = await chatAPI.sendMessage(currentInput);
      
      const chatMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: apiResponse.data.response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, chatMessage]);
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

  return {
    messages,
    isLoading,
    inputValue,
    setInputValue,
    handleSendMessage
  };
};