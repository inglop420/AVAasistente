import express from 'express';
import { getLibraryItems, createLibraryItem } from '../controllers/libraryController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getLibraryItems);
router.post('/', createLibraryItem);

export default router;