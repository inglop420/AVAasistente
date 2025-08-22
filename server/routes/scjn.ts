import express from 'express';
import { 
  searchDocuments, 
  getDocumentDetail, 
  downloadResults 
} from '../controllers/scjnController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Búsqueda de documentos jurídicos
router.get('/search', requirePermission('read', 'library'), searchDocuments);

// Obtener detalle de documento por ID
router.get('/document/:type/:id', requirePermission('read', 'library'), getDocumentDetail);

// Obtener conteo de documentos
//router.get('/count', requirePermission('read', 'library'), getDocumentCount);

// Descargar resultados en CSV
router.post('/download', requirePermission('read', 'library'), downloadResults);

export default router;