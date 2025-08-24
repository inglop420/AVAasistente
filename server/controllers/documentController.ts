import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Document from '../models/Document';
import Expediente from '../models/Expediente';
import { AuthRequest } from '../middleware/auth';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const { category, expedienteId } = req.query;
    
    let query: any = { tenantId: req.user!.tenantId };
    
    if (category) {
      query.category = category;
    }
    
    if (expedienteId) {
      query.expedienteId = expedienteId;
    }
    
    const documents = await Document.find(query).sort({ createdAt: -1 });
    
    // Transform documents to match frontend interface
    const documentsResponse = documents.map(doc => ({
      _id: doc._id.toString(),
      id: doc._id.toString(),
      name: doc.originalName,
      originalName: doc.originalName,
      type: doc.type,
      category: doc.category,
      url: doc.url,
      size: doc.size,
      expedienteId: doc.expedienteId,
      expedienteTitle: doc.expedienteTitle,
      uploadedBy: doc.uploadedBy,
      uploadedAt: doc.uploadedAt,
      createdAt: doc.createdAt
    }));
    
    res.json(documentsResponse);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Error al obtener documentos' });
  }
};

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }

    const { category = 'document', expedienteId } = req.body;
    
    // Validate permissions for templates
    if (category === 'template' && req.user!.role !== 'superadmin') {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: 'Solo el superadmin puede subir plantillas' });
    }
    
    let expedienteTitle;
    
    // If document is associated with expediente, get expediente details
    if (expedienteId && category === 'document') {
      const expediente = await Expediente.findOne({
        _id: expedienteId,
        tenantId: req.user!.tenantId
      });
      
      if (!expediente) {
        // Delete uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Expediente no encontrado' });
      }
      
      expedienteTitle = expediente.title;
    }

    const document = new Document({
      name: req.file.filename,
      originalName: req.file.originalname,
      type: req.file.mimetype.split('/')[1]?.toUpperCase() || 'FILE',
      category,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      expedienteId: category === 'document' ? expedienteId : undefined,
      expedienteTitle,
      tenantId: req.user!.tenantId,
      uploadedBy: req.user!.id
    });

    await document.save();
    
    // Return document with proper format
    const documentResponse = {
      _id: document._id.toString(),
      id: document._id.toString(),
      name: document.originalName,
      originalName: document.originalName,
      type: document.type,
      category: document.category,
      url: document.url,
      size: document.size,
      expedienteId: document.expedienteId,
      expedienteTitle: document.expedienteTitle,
      uploadedBy: document.uploadedBy,
      uploadedAt: document.uploadedAt,
      createdAt: document.createdAt
    };

    res.status(201).json(documentResponse);
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Error al subir documento' });
  }
};

export const downloadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const document = await Document.findOne({
      _id: id,
      tenantId: req.user!.tenantId
    });

    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    const filePath = path.join(process.cwd(), 'uploads', document.name);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Archivo no encontrado en el servidor' });
    }

    res.download(filePath, document.originalName);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ message: 'Error al descargar documento' });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const document = await Document.findOne({
      _id: id,
      tenantId: req.user!.tenantId
    });

    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }
    
    // Check permissions for templates
    if (document.category === 'template' && req.user!.role !== 'superadmin') {
      return res.status(403).json({ message: 'Solo el superadmin puede eliminar plantillas' });
    }

    // Delete file from filesystem
    const filePath = path.join(process.cwd(), 'uploads', document.name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete document from database
    await Document.findByIdAndDelete(id);

    res.json({ message: 'Documento eliminado exitosamente' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Error al eliminar documento' });
  }
};

export const getDocumentsByExpediente = async (req: AuthRequest, res: Response) => {
  try {
    const { expedienteId } = req.params;
    
    // Verify expediente exists and belongs to tenant
    const expediente = await Expediente.findOne({
      _id: expedienteId,
      tenantId: req.user!.tenantId
    });

    if (!expediente) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    const documents = await Document.find({
      expedienteId,
      tenantId: req.user!.tenantId,
      category: 'document'
    }).sort({ createdAt: -1 });
    
    // Transform documents to match frontend interface
    const documentsResponse = documents.map(doc => ({
      _id: doc._id.toString(),
      id: doc._id.toString(),
      name: doc.originalName,
      originalName: doc.originalName,
      type: doc.type,
      category: doc.category,
      url: doc.url,
      size: doc.size,
      expedienteId: doc.expedienteId,
      expedienteTitle: doc.expedienteTitle,
      uploadedBy: doc.uploadedBy,
      uploadedAt: doc.uploadedAt,
      createdAt: doc.createdAt
    }));

    res.json(documentsResponse);
  } catch (error) {
    console.error('Get documents by expediente error:', error);
    res.status(500).json({ message: 'Error al obtener documentos del expediente' });
  }
};