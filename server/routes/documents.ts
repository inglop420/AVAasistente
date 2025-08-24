import express from 'express';
import { 
  getDocuments, 
  uploadDocument, 
  downloadDocument, 
  deleteDocument, 
  getDocumentsByExpediente,
  upload 
} from '../controllers/documentController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Get all documents with optional filters
router.get('/', requirePermission('read', 'documents'), getDocuments);

// Upload document
router.post('/upload', requirePermission('create', 'documents'), upload.single('file'), uploadDocument);

// Download document
router.get('/download/:id', requirePermission('read', 'documents'), downloadDocument);

// Delete document
router.delete('/:id', requirePermission('delete', 'documents'), deleteDocument);

// Get documents by expediente
router.get('/expediente/:expedienteId', requirePermission('read', 'documents'), getDocumentsByExpediente);

export default router;