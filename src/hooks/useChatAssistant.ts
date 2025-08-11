import { useState } from 'react';

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

  const simulateResponse = (userMessage: string): string => {
    const responses = {
      agenda: 'He revisado tu agenda y tienes 2 citas programadas para esta semana: Consulta divorcio con Pedro Martínez el viernes a las 10:00 AM y Revisión herencia con Lucía Fernández el sábado a las 3:30 PM.',
      expediente: 'Basándome en los datos del expediente, te sugiero revisar el artículo 85 del Código Civil para el caso de divorcio. ¿Necesitas que genere un borrador de la demanda?',
      cliente: 'Encontré 3 clientes en la base de datos: Pedro Martínez (2 expedientes), Lucía Fernández (1 expediente) y Roberto Silva (3 expedientes). ¿Sobre cuál necesitas información?',
      default: 'Como asistente jurídico, puedo ayudarte con búsquedas de jurisprudencia, generar borradores de documentos, revisar tu agenda y consultar información de expedientes. ¿Qué necesitas específicamente?'
    };

    const message = userMessage.toLowerCase();
    if (message.includes('agenda') || message.includes('cita')) return responses.agenda;
    if (message.includes('expediente') || message.includes('caso')) return responses.expediente;
    if (message.includes('cliente')) return responses.cliente;
    return responses.default;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    // Simular respuesta de AVA
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: simulateResponse(currentInput),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 1500);
  };

  return {
    messages,
    isLoading,
    inputValue,
    setInputValue,
    handleSendMessage
  };
};