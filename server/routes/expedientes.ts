import express from 'express';
import { getExpedientes, createExpediente, updateExpediente, deleteExpediente } from '../controllers/expedienteController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getExpedientes);
router.post('/', createExpediente);
router.put('/:id', updateExpediente);
router.delete('/:id', deleteExpediente);

export default router;