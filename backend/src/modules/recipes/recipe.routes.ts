import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import {
  getRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  addIngredient,
  removeIngredient,
  suggestRecipes,
} from './recipe.controller';

const router = Router();

router.get('/', authenticateToken, getRecipes);
router.post('/', authenticateToken, createRecipe);
router.post('/suggest', authenticateToken, suggestRecipes);
router.patch('/:id', authenticateToken, updateRecipe);
router.delete('/:id', authenticateToken, deleteRecipe);
router.post('/:id/ingredients', authenticateToken, addIngredient);
router.delete('/:id/ingredients/:ingredientId', authenticateToken, removeIngredient);

export default router;
