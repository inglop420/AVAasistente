import express from 'express';
import { getExpedientes, createExpediente, updateExpediente, deleteExpediente } from '../controllers/expedienteController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requirePermission('read', 'expedientes'), getExpedientes);
router.post('/', requirePermission('create', 'expedientes'), createExpediente);
router.put('/:id', requirePermission('update', 'expedientes'), updateExpediente);
router.delete('/:id', requirePermission('delete', 'expedientes'), deleteExpediente);

export default router;