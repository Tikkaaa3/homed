import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import {
  getShoppingLists,
  createShoppingList,
  updateShoppingList,
  deleteShoppingList,
  addShoppingListItem,
  checkShoppingListItem,
  deleteShoppingListItem,
} from './shopping.controller';

const router = Router();

router.get('/', authenticateToken, getShoppingLists);
router.post('/', authenticateToken, createShoppingList);
router.patch('/:id', authenticateToken, updateShoppingList);
router.delete('/:id', authenticateToken, deleteShoppingList);
router.post('/:id/items', authenticateToken, addShoppingListItem);
router.patch('/:id/items/:lineId/check', authenticateToken, checkShoppingListItem);
router.delete('/:id/items/:lineId', authenticateToken, deleteShoppingListItem);

export default router;
