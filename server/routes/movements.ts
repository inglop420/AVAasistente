import express from 'express';
import { getMovements, createMovement, updateMovement, deleteMovement } from '../controllers/movementController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Routes for movements within expedientes
router.get('/:expedienteId/movements', requirePermission('read', 'expedientes'), getMovements);
router.post('/:expedienteId/movements', requirePermission('create', 'expedientes'), createMovement);
router.put('/:expedienteId/movements/:movementId', requirePermission('update', 'expedientes'), updateMovement);
router.delete('/:expedienteId/movements/:movementId', requirePermission('delete', 'expedientes'), deleteMovement);

export default router;