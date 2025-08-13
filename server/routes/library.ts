import express from 'express';
import { getLibraryItems, createLibraryItem } from '../controllers/libraryController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requirePermission('read', 'library'), getLibraryItems);
router.post('/', requirePermission('create', 'library'), createLibraryItem);

export default router;