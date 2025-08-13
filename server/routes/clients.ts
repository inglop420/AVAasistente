import express from 'express';
import { getClients, createClient, updateClient, deleteClient } from '../controllers/clientController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requirePermission('read', 'clients'), getClients);
router.post('/', requirePermission('create', 'clients'), createClient);
router.put('/:id', requirePermission('update', 'clients'), updateClient);
router.delete('/:id', requirePermission('delete', 'clients'), deleteClient);

export default router;