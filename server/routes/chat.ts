import express from 'express';
import { sendChatMessage } from '../controllers/chatController';
import { authenticateToken } from '../middleware/auth';
import { getConversations, createConversation, updateConversation, deleteConversation } from '../controllers/conversationController';

const router = express.Router();

// Ruta para enviar mensajes al chat de AVA
// POST /api/chat/message
router.post('/message', authenticateToken, sendChatMessage);

// Conversations CRUD
// GET /api/chat/conversations
router.get('/conversations', authenticateToken, getConversations);
// POST /api/chat/conversations
router.post('/conversations', authenticateToken, createConversation);
// PUT /api/chat/conversations/:id
router.put('/conversations/:id', authenticateToken, updateConversation);
// DELETE /api/chat/conversations/:id
router.delete('/conversations/:id', authenticateToken, deleteConversation);

export default router;