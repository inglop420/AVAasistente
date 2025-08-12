import express from 'express';
import { getDocuments, createDocument, deleteDocument } from '../controllers/documentController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getDocuments);
router.post('/', createDocument);
router.delete('/:id', deleteDocument);

export default router;