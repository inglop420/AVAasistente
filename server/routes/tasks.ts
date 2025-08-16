import express from 'express';
import { getTasks, getAllTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Routes for tasks within expedientes
router.get('/:expedienteId/tasks', requirePermission('read', 'expedientes'), getTasks);
router.post('/:expedienteId/tasks', requirePermission('create', 'expedientes'), createTask);
router.put('/:expedienteId/tasks/:taskId', requirePermission('update', 'expedientes'), updateTask);
router.delete('/:expedienteId/tasks/:taskId', requirePermission('delete', 'expedientes'), deleteTask);

// Route for all tasks (for agenda view)
router.get('/tasks/all', requirePermission('read', 'expedientes'), getAllTasks);

export default router;