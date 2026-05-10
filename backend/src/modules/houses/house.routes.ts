import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { createHouse, joinHouse, leaveHouse, getMembers, getCurrentHouse } from './house.controller';

const router = Router();

router.post('/', authenticateToken, createHouse);
router.post('/join', authenticateToken, joinHouse);
router.post('/leave', authenticateToken, leaveHouse);
router.get('/members', authenticateToken, getMembers);
router.get('/current', authenticateToken, getCurrentHouse);

export default router;
