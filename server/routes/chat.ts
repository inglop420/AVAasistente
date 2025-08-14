import express from 'express';
import { sendChatMessage } from '../controllers/chatController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Ruta para enviar mensajes al chat de AVA
// POST /api/chat/message
router.post('/message', authenticateToken, sendChatMessage);

export default router;