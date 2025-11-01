import React, { useEffect, useState } from 'react';
import { Send, Bot, User, Minimize2, List, Plus } from 'lucide-react';
import { ChatMessage } from '../types';
import { chatAPI } from '../services/api';

interface ChatAssistantProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

type Conversation = {
  id: string; // local id
  serverId?: string; // optional server _id when synced
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
};

const STORAGE_KEY = 'ava_chat_conversations_v1';

const ChatAssistant: React.FC<ChatAssistantProps> = ({
  isMinimized = false,
  onToggleMinimize
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const defaultInitialMessage: ChatMessage = {
    id: '1',
    text: '¡Hola! Soy AVA, tu asistente jurídico virtual. ¿En qué puedo ayudarte hoy?',
    isUser: false,
    timestamp: new Date()
  };

  const [messages, setMessages] = useState<ChatMessage[]>([defaultInitialMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

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

  // Persist conversations whenever messages change — prefer server, fallback to localStorage
  useEffect(() => {
    if (!currentConversationId) return;

    const sync = async () => {
      const now = new Date().toISOString();
      setConversations(prev => {
        const idx = prev.findIndex(c => c.id === currentConversationId);
        const updated: Conversation[] = [...prev];
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], messages: messages, updatedAt: now, title: deriveTitle(messages, updated[idx].title) };
        } else {
          updated.push({ id: currentConversationId, title: deriveTitle(messages), messages, updatedAt: now });
        }
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (e) {}
        return updated;
      });

      // Try to sync with server if available (axios will include token if present)
      try {
        const conv = conversations.find(c => c.id === currentConversationId);
        const payload = { title: deriveTitle(messages), messages };
        if (conv?.serverId) {
          await chatAPI.updateConversation(conv.serverId, payload);
        } else {
          const res = await chatAPI.createConversation(payload);
          const serverConv = res.data?.conversation;
          if (serverConv && serverConv._id) {
            // attach serverId to local conversation
            setConversations(prev => prev.map(c => c.id === currentConversationId ? { ...c, serverId: serverConv._id } : c));
          }
        }
      } catch (e) {
        // ignore server errors — localStorage preserves history
        // console.debug('Chat sync failed, using local fallback', e);
      }
    };

    sync();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, currentConversationId]);

  // Load conversations from server (if auth) or localStorage on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      // try server first
      try {
        const res = await chatAPI.getConversations();
        const serverConvs = res.data?.conversations || [];
        if (mounted && serverConvs.length > 0) {
          const mapped: Conversation[] = serverConvs.map((c: any) => ({ id: c._id, serverId: c._id, title: c.title, messages: c.messages || [], updatedAt: c.updatedAt || new Date().toISOString() }));
          setConversations(mapped);
          const last = mapped[mapped.length - 1];
          setCurrentConversationId(last.id);
          setMessages(last.messages.length ? last.messages : [defaultInitialMessage]);
          return;
        }
      } catch (e) {
        // server unavailable or not authenticated — fallback to localStorage
      }

      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: Conversation[] = JSON.parse(raw);
          if (mounted) {
            setConversations(parsed);
            if (parsed.length > 0) {
              const last = parsed[parsed.length - 1];
              setCurrentConversationId(last.id);
              setMessages(last.messages.length ? last.messages : [defaultInitialMessage]);
              return;
            }
          }
        }
      } catch (e) {
        // ignore parse errors
      }

      // No stored conversations -> create default one
      if (mounted) {
        const id = Date.now().toString();
        setCurrentConversationId(id);
        setConversations([{ id, title: 'Conversación nueva', messages: [defaultInitialMessage], updatedAt: new Date().toISOString() }]);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  function deriveTitle(msgs: ChatMessage[], fallback = 'Conversación') {
    const firstUser = msgs.find(m => m.isUser);
    if (firstUser) {
      const t = firstUser.text.trim();
      return t.length > 40 ? t.slice(0, 37) + '...' : t;
    }
    return fallback;
  }

  const startNewConversation = () => {
    const id = Date.now().toString();
    const initial = [defaultInitialMessage];
    const conv: Conversation = { id, title: 'Conversación nueva', messages: initial, updatedAt: new Date().toISOString() };
    setConversations(prev => [...prev, conv]);
    setCurrentConversationId(id);
    setMessages(initial);
    setShowHistory(false);
  };

  const selectConversation = (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      setCurrentConversationId(id);
      setMessages(conv.messages.length ? conv.messages : [defaultInitialMessage]);
      setShowHistory(false);
    }
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    if (currentConversationId === id) {
      // switch to last or create new
      const remaining = conversations.filter(c => c.id !== id);
      if (remaining.length > 0) {
        const last = remaining[remaining.length - 1];
        setCurrentConversationId(last.id);
        setMessages(last.messages.length ? last.messages : [defaultInitialMessage]);
      } else {
        startNewConversation();
      }
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(prev => !prev)}
              className="text-white hover:bg-blue-700 p-1 rounded transition-colors duration-200"
              title="Historial"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={startNewConversation}
              className="text-white hover:bg-blue-700 p-1 rounded transition-colors duration-200"
              title="Nueva conversación"
            >
              <Plus className="w-4 h-4" />
            </button>
            {onToggleMinimize && (
              <button
                onClick={onToggleMinimize}
                className="text-white hover:bg-blue-700 p-1 rounded transition-colors duration-200"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}
          </div>
      </div>

        {/* History panel */}
        {showHistory && (
          <div className="border-b border-gray-200 p-2 bg-white">
            <div className="max-h-40 overflow-y-auto">
              {conversations.length === 0 && <div className="text-sm text-gray-500 p-2">No hay conversaciones.</div>}
              {conversations.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <button className="text-left text-sm text-gray-800 truncate" onClick={() => selectConversation(c.id)}>{c.title}</button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{new Date(c.updatedAt).toLocaleString()}</span>
                    <button onClick={() => deleteConversation(c.id)} className="text-red-500 text-xs p-1">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
              <p className="text-sm" style={{ whiteSpace: 'pre-line' }}>{message.text}</p>
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