import express from 'express';
import { 
  getOrganizations, 
  createOrganization, 
  updateOrganization, 
  deleteOrganization,
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// All admin routes require authentication
router.use(authenticateToken);

// Organization routes (superadmin only)
router.get('/organizations', requireRole(['superadmin']), getOrganizations);
router.post('/organizations', requireRole(['superadmin']), createOrganization);
router.put('/organizations/:id', requireRole(['superadmin']), updateOrganization);
router.delete('/organizations/:id', requireRole(['superadmin']), deleteOrganization);

// User routes (superadmin and admin)
router.get('/users', requireRole(['superadmin', 'admin']), getUsers);
router.post('/users', requireRole(['superadmin', 'admin']), createUser);
router.put('/users/:id', requireRole(['superadmin', 'admin']), updateUser);
router.delete('/users/:id', requireRole(['superadmin', 'admin']), deleteUser);

export default router;