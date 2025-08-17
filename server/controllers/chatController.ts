import { Request, response, Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';
import { createClient } from './clientController';
import { createClientFromData } from './clientController';
import { createExpedienteFromData  } from './expedienteController';
import Client from '../models/Client';

// Agrega la función aquí, antes de export const sendChatMessage...
function extractDeepestValue(obj: any): string {
  if (typeof obj === 'string') return obj;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const val = extractDeepestValue(item);
      if (val) return val;
    }
    return '';
  }
  if (typeof obj === 'object' && obj !== null) {
    const keys = Object.keys(obj);
    for (const key of keys) {
      const val = extractDeepestValue(obj[key]);
      if (val) return val;
    }
    return '';
  }
  return '';
}
// Limpiar la respuesta del asistente
function cleanAssistantMessage(message: string): string {
  const internStart = message.indexOf('(Internamente)');
  if (internStart !== -1) {
    // Busca el final del bloque JSON (después de "}")
    const jsonEnd = message.indexOf('}', internStart);
    if (jsonEnd !== -1) {
      // Mantén solo el texto antes de "(Internamente)" y después del bloque JSON
      const before = message.slice(0, internStart).trim();
      const after = message.slice(jsonEnd + 1).trim();
      // Si hay texto después del JSON, lo conservamos
      return [before, after].filter(Boolean).join(' ').trim();
    }
    // Si no encuentra el cierre, elimina desde "(Internamente)" en adelante
    return message.slice(0, internStart).trim();
  }
  return message;
}
// Extraer el JSON interno
function extractInternalJson(message: string): any | null {
  const regex = /\(Internamente\)[\s\n]*({[\s\S]*?})/;
  const match = message.match(regex);
  let jsonString = match && match[1] ? match[1].trim() : null;

  if (jsonString) {
    // Elimina saltos de línea innecesarios
    jsonString = jsonString.replace(/\n/g, ' ').replace(/\s+/g, ' ');

    // Intenta parsear el JSON
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      // Si falla, intenta agregar llaves de cierre
      let fixedJson = jsonString;
      let openBraces = (fixedJson.match(/{/g) || []).length;
      let closeBraces = (fixedJson.match(/}/g) || []).length;
      while (closeBraces < openBraces) {
        fixedJson += '}';
        closeBraces++;
      }
      try {
        return JSON.parse(fixedJson);
      } catch (e2) {
        console.error('Error al parsear JSON interno (corregido):', e2);
        return null;
      }
    }
  }
  return null;
}

// Busca el clientId por nombre y tenantId, ignorando acentos y mayúsculas
async function getClientIdByName(name: string, tenantId: string) {
  // Normaliza el nombre recibido
  function normalize(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  const clients = await Client.find({ tenantId });
  const client = clients.find(c => normalize(c.name) === normalize(name));
  return client ? client._id : null;
}

// Controlador para manejar el chat con n8n
export const sendChatMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    const user = req.user;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Mensaje requerido' 
      });
    }

    // URL del webhook de n8n (configurable via variable de entorno)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv948176.hstgr.cloud/webhook/a3780d03-5344-431d-b445-499a25a781e1';

    // Preparar datos para enviar a n8n
    const payload = {
      message: message.trim(),
      user: {
        id: user?.id,
       // name: user?.name,
        role: user?.role,
        organizationId: user?.organizationId,
        tenantId: user?.tenantId
      },
      timestamp: new Date().toISOString()
    };

    // Enviar mensaje al webhook de n8n
    const n8nResponse = await axios.post(n8nWebhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000 // 30 segundos de timeout
    });

    // Log para depuración
    console.log('Respuesta completa de n8n:', n8nResponse.data);

    // Extraer la respuesta de n8n
    //const assistantResponse = n8nResponse.data?.output || 'Lo siento, no pude procesar tu consulta en este momento.';

  const assistantResponse =
  n8nResponse.data?.output ||
  extractDeepestValue(n8nResponse.data) ||
  n8nResponse.data?.message ||
  'Lo siento, no pude procesar tu consulta en este momento.';

  // Extrae el JSON interno
const internalData = extractInternalJson(assistantResponse);
console.log('internalData:', internalData);

if (internalData?.action === 'createClient' && internalData?.data) {
    if (!req.user || !req.user.tenantId) {
    return res.status(400).json({
      success: false,
      response: 'No se encontró información de usuario o tenantId.',
      timestamp: new Date().toISOString()
    });
  }
  try {
     // Normaliza el campo 'mail' a 'email'
    const clientData = { ...internalData.data };
    if (clientData.mail) {
      clientData.email = clientData.mail;
      delete clientData.mail;
    }
    console.log('Datos recibidos para crear cliente:', clientData, req.user.tenantId);
    const client = await createClientFromData(clientData, req.user.tenantId);
    res.status(201).json({
      success: true,
      response: 'Cliente creado con éxito.',
      client,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
  let errorMsg = 'Error al crear cliente';
  if (error instanceof Error) {
    errorMsg = error.message;
  }
  res.status(400).json({
    success: false,
    response: errorMsg,
    timestamp: new Date().toISOString()
  });
  }
  return;
}
  
if (internalData?.action === 'createExpediente' && internalData?.data) {
  if (!req.user || !req.user.tenantId) {
    return res.status(400).json({
      success: false,
      response: 'No se encontró información de usuario o tenantId.',
      timestamp: new Date().toISOString()
    });
  }
  // Normaliza los datos si es necesario
  const expedienteData = { ...internalData.data };
  // Aquí puedes agregar validaciones o normalizaciones de campos
// Normaliza los nombres de los campos
expedienteData.clientName = expedienteData.cliente;
delete expedienteData.cliente;

expedienteData.title = expedienteData.titulo;
delete expedienteData.titulo;

expedienteData.status = expedienteData.estado;
delete expedienteData.estado;

expedienteData.dueDate = expedienteData.fechaLimite;
delete expedienteData.fechaLimite;

// Normaliza el status
const statusMap: Record<string, string> = {
  'Abierto': 'Activo',
  'En Trámite': 'Pendiente',
  'Cerrado': 'Cerrado'
};

// Busca el cliente por nombre y tenantId, ignorando acentos y mayúsculas
function normalize(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

const clients = await Client.find({ tenantId: req.user.tenantId });
const client = clients.find(c => normalize(c.name) === normalize(expedienteData.clientName));

if (!client) {
  return res.status(400).json({
    success: false,
    response: `No se encontró el cliente "${expedienteData.clientName}" en el sistema.`,
    timestamp: new Date().toISOString()
  });
}
expedienteData.clientId = client._id;
expedienteData.clientName = client.name; // Usa el valor real de la base de datos

// Corrige el valor de origen si es necesario
expedienteData.origen = 'Juzgados'; // Usa el valor válido según tu enum

console.log('Datos para crear expediente:', expedienteData);
console.log('Cliente encontrado:', client);  

try {
    const expediente = await createExpedienteFromData(expedienteData, req.user.tenantId);
    console.log('Expediente creado:', expediente);
    res.status(201).json({
      success: true,
      response: 'Expediente creado con éxito.',
      expediente,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al crear expediente:', error);
    let errorMsg = 'Error al crear expediente';
    if (error instanceof Error) {
      errorMsg = error.message;
    }
    res.status(400).json({
      success: false,
      response: errorMsg,
      timestamp: new Date().toISOString()
    });
  }
  return;
}

  // Limpia el mensaje antes de enviarlo al frontend
  const filteredResponse = cleanAssistantMessage(assistantResponse);

    console.log('Valor enviado al frontend:', filteredResponse);

    // Devolver la respuesta al frontend
    res.json({
      success: true,
      response: filteredResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en chat con n8n:', error);
    
    // Respuesta de fallback en caso de error
    const fallbackResponse = 'Lo siento, estoy experimentando dificultades técnicas. Por favor, intenta nuevamente en unos momentos.';
    
    res.status(500).json({
      success: false,
      response: fallbackResponse,
      error: 'Error interno del servidor'
    });
  }
};