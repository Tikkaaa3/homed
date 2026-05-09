import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { getItems, createItem, updateItem, deleteItem } from './item.controller';

const router = Router();

router.get('/', authenticateToken, getItems);
router.post('/', authenticateToken, createItem);
router.patch('/:id', authenticateToken, updateItem);
router.delete('/:id', authenticateToken, deleteItem);

export default router;
