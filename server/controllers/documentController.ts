import { Response } from 'express';
import Document from '../models/Document';
import { AuthRequest } from '../middleware/auth';

export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const documents = await Document.find({ tenantId: req.user!.tenantId }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Error al obtener documentos' });
  }
};

export const createDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, url, size } = req.body;

    const document = new Document({
      name,
      type,
      url,
      size,
      tenantId: req.user!.tenantId
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ message: 'Error al crear documento' });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const document = await Document.findOneAndDelete({
      _id: id,
      tenantId: req.user!.tenantId
    });

    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    res.json({ message: 'Documento eliminado exitosamente' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Error al eliminar documento' });
  }
};