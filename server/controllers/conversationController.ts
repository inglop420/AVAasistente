import { Request, Response } from 'express';
import Conversation from '../models/Conversation';
import { AuthRequest } from '../middleware/auth';

// GET /api/chat/conversations
export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const convs = await Conversation.find({ tenantId: user.tenantId, userId: user.id }).sort({ updatedAt: 1 });
    return res.json({ success: true, conversations: convs });
  } catch (error) {
    console.error('Error getting conversations:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// POST /api/chat/conversations
export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { title, messages } = req.body;
    const conv = await Conversation.create({ userId: user.id, tenantId: user.tenantId, title: title || 'Conversación', messages: messages || [] });
    return res.status(201).json({ success: true, conversation: conv });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// PUT /api/chat/conversations/:id
export const updateConversation = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const { title, messages } = req.body;
    const conv = await Conversation.findOne({ _id: id, userId: user.id, tenantId: user.tenantId });
    if (!conv) return res.status(404).json({ success: false, error: 'Not found' });
    if (title !== undefined) conv.title = title;
    if (messages !== undefined) conv.messages = messages;
    await conv.save();
    return res.json({ success: true, conversation: conv });
  } catch (error) {
    console.error('Error updating conversation:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// DELETE /api/chat/conversations/:id
export const deleteConversation = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const conv = await Conversation.findOneAndDelete({ _id: id, userId: user.id, tenantId: user.tenantId });
    if (!conv) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
