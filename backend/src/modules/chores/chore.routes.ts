import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import {
  getChores,
  createChore,
  reassignChore,
  completeChore,
  deleteChore,
} from './chore.controller';

const router = Router();

router.get('/', authenticateToken, getChores);
router.post('/', authenticateToken, createChore);
router.patch('/:id/reassign', authenticateToken, reassignChore);
router.post('/:id/completions', authenticateToken, completeChore);
router.delete('/:id', authenticateToken, deleteChore);

export default router;
