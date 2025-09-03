import { Request, response, Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';
import { createClient } from './clientController';
import { createClientFromData } from './clientController';
import { createExpedienteFromData  } from './expedienteController';
import Client from '../models/Client';
import { createAppointmentFromData } from './appointmentController';
import Expediente from '../models/Expediente';




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

// Limpia la respuesta del asistente, ocultando todo desde "Internamente" y el bloque JSON, incluyendo texto explicativo posterior
function cleanAssistantMessage(message: string): string {
  const internStart = message.indexOf('Internamente');
  if (internStart !== -1) {
    // Busca el primer bloque JSON después de "Internamente"
    const afterIntern = message.slice(internStart);
    const jsonRegex = /{[\s\S]*?}/;
    const match = afterIntern.match(jsonRegex);
    let jsonEnd = -1;
    if (match && match.index !== undefined) {
      jsonEnd = internStart + match.index + match[0].length;
    }
    // Elimina todo desde "Internamente" en adelante
    return message.slice(0, internStart).trim();
  }
  return message;
}

// Extrae el primer bloque JSON después de "Internamente", tolerando saltos de línea y texto explicativo
function extractInternalJson(message: string): any | null {
  const internIndex = message.indexOf('Internamente');
  if (internIndex === -1) return null;

  // Busca el primer bloque JSON después de "Internamente"
  const afterIntern = message.slice(internIndex);
  const jsonRegex = /{[\s\S]*?}/;
  const match = afterIntern.match(jsonRegex);
  if (match && match[0]) {
    let jsonString = match[0];
    // Elimina saltos de línea y espacios extra
    jsonString = jsonString.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
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
        console.error('Error al parsear JSON interno (corregido):', e2, fixedJson);
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
      chatInput: message.trim(),
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
    console.log('Respuesta completa de n8n:', JSON.stringify(n8nResponse.data, null, 2));

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

// CREA USUARIOS
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
    
    // Validación de campos requeridos
  const requiredFields = [
    { key: 'name', label: 'nombre' },
    { key: 'email', label: 'correo electrónico' },
    { key: 'phone', label: 'teléfono' }
  ];
  const missing = requiredFields.filter(f => !clientData[f.key] || clientData[f.key].trim() === '');

  if (missing.length > 0) {
    // Pide el dato faltante en el chat
    return res.status(200).json({
      success: false,
      response: `Por favor, proporciona tu ${missing[0].label}.`,
      timestamp: new Date().toISOString()
    });
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

// CREA EXPEDIENTES
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
expedienteData.numeroExpediente = expedienteData.numero;
delete expedienteData.numero;

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

// AGENDAR CITA
if (internalData?.action === 'agendarCita' && internalData?.data) {
  if (!req.user || !req.user.tenantId) {
    return res.status(400).json({
      success: false,
      response: 'No se encontró información de usuario o tenantId.',
      timestamp: new Date().toISOString()
    });
  }

  const citaData = { ...internalData.data };

  // Busca el cliente por expediente o por nombre
let client: any = null;
let expedienteId: string | undefined = undefined;
let expedienteTitle: string | undefined = undefined;

if (citaData.caseId) {
  // Buscar por número de expediente
  const expediente = await Expediente.findOne({ numeroExpediente: citaData.caseId, tenantId: req.user.tenantId });
  console.log('Expediente encontrado:', expediente);
  if (!expediente) {
    return res.status(400).json({
      success: false,
      response: `No se encontró el expediente "${citaData.caseId}" en el sistema.`,
      timestamp: new Date().toISOString()
    });
  }
  expedienteId = (expediente._id as any).toString();
  expedienteTitle = expediente.title;
  client = await Client.findById(expediente.clientId);
  console.log('Cliente encontrado:', client);
  if (!client) {
    return res.status(400).json({
      success: false,
      response: `No se encontró el cliente relacionado al expediente "${citaData.caseId}".`,
      timestamp: new Date().toISOString()
    });
  }
} else if (citaData.clienteId) {
  // Buscar por nombre de cliente
  function normalize(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  const clients = await Client.find({ tenantId: req.user.tenantId });
  client = clients.find(c => normalize(c.name) === normalize(citaData.clienteId));
  if (!client) {
    return res.status(400).json({
      success: false,
      response: `No se encontró el cliente "${citaData.clienteId}" en el sistema.`,
      timestamp: new Date().toISOString()
    });
  }
}

  // Normaliza la fecha y hora
  let appointmentDate: Date | undefined = undefined;
  if (citaData.fecha && citaData.hora) {
    appointmentDate = new Date(`${citaData.fecha}T${citaData.hora}`);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        success: false,
        response: 'La fecha u hora de la cita no es válida.',
        timestamp: new Date().toISOString()
      });
    }
  } else if (citaData.date) {
    appointmentDate = new Date(citaData.date);
    console.log('Fecha para la cita:', appointmentDate);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        success: false,
        response: 'La fecha de la cita no es válida.',
        timestamp: new Date().toISOString()
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      response: 'Debes proporcionar fecha y hora para la cita.',
      timestamp: new Date().toISOString()
    });
  }

  // Normaliza el status
  const statusMap: Record<string, string> = {
    'Programada': 'programada',
    'Completada': 'completada',
    'Cancelada': 'cancelada',
    'Activo': 'programada',
    'Pendiente': 'programada'
  };
  citaData.status = statusMap[citaData.status] || 'programada';

  // Construye el objeto para crear la cita
  const appointmentPayload = {
    title: citaData.motivo || citaData.title || 'Cita',
    date: appointmentDate,
    expedienteId,
    expedienteTitle,
    clientName: client.name,
    status: citaData.status,
    tenantId: req.user.tenantId,
    
    };


    console.log('Payload para crear cita:', appointmentPayload);

  try {
    const cita = await createAppointmentFromData(appointmentPayload, req.user.tenantId);
    res.status(201).json({
      success: true,
      response: 'Cita agendada con éxito.',
      cita,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    let errorMsg = 'Error al agendar cita';
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