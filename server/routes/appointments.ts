import express from 'express';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '../controllers/appointmentController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requirePermission('read', 'appointments'), getAppointments);
router.post('/', requirePermission('create', 'appointments'), createAppointment);
router.put('/:id', requirePermission('update', 'appointments'), updateAppointment);
router.delete('/:id', requirePermission('delete', 'appointments'), deleteAppointment);

export default router;