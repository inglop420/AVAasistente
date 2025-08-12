import { Response } from 'express';
import LibraryItem from '../models/LibraryItem';
import { AuthRequest } from '../middleware/auth';

export const getLibraryItems = async (req: AuthRequest, res: Response) => {
  try {
    const items = await LibraryItem.find({ tenantId: req.user!.tenantId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Get library items error:', error);
    res.status(500).json({ message: 'Error al obtener elementos de biblioteca' });
  }
};

export const createLibraryItem = async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, content } = req.body;

    const item = new LibraryItem({
      title,
      category,
      content,
      tenantId: req.user!.tenantId
    });

    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error('Create library item error:', error);
    res.status(500).json({ message: 'Error al crear elemento de biblioteca' });
  }
};