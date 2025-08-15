import { Request, response, Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';

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

    console.log('Valor enviado al frontend:', assistantResponse);

    // Devolver la respuesta al frontend
    res.json({
      success: true,
      response: assistantResponse,
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