import express from 'express';
import { getDocuments, createDocument, deleteDocument } from '../controllers/documentController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requirePermission('read', 'documents'), getDocuments);
router.post('/', requirePermission('create', 'documents'), createDocument);
router.delete('/:id', requirePermission('delete', 'documents'), deleteDocument);

export default router;