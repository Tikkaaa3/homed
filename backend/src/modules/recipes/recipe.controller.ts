import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

const getUserHouseId = async (userId: string): Promise<string | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { houseId: true },
  });
  return user?.houseId || null;
};

export const getRecipes = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const houseId = await getUserHouseId(userId);
    if (!houseId) {
      res.status(400).json({ message: 'User is not part of a house' });
      return;
    }

    const recipes = await prisma.recipe.findMany({
      where: { houseId },
      include: { ingredients: { include: { item: true } } },
    });
    res.json(recipes);
  } catch {
    res.status(500).json({ message: 'Failed to fetch recipes' });
  }
};

export const createRecipe = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { title, type } = req.body;

  try {
    const houseId = await getUserHouseId(userId);
    if (!houseId) {
      res.status(400).json({ message: 'User is not part of a house' });
      return;
    }

    const recipe = await prisma.recipe.create({
      data: { title, type, houseId },
    });
    res.status(201).json(recipe);
  } catch {
    res.status(500).json({ message: 'Failed to create recipe' });
  }
};

export const updateRecipe = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const { title, notes, text, tags } = req.body;

  try {
    const houseId = await getUserHouseId(userId);
    if (!houseId) {
      res.status(400).json({ message: 'User is not part of a house' });
      return;
    }

    const existing = await prisma.recipe.findFirst({ where: { id, houseId } });
    if (!existing) {
      res.status(404).json({ message: 'Recipe not found' });
      return;
    }

    const recipe = await prisma.recipe.update({
      where: { id },
      data: { title, notes, text, tags },
    });
    res.json(recipe);
  } catch {
    res.status(500).json({ message: 'Failed to update recipe' });
  }
};

export const deleteRecipe = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;

  try {
    const houseId = await getUserHouseId(userId);
    if (!houseId) {
      res.status(400).json({ message: 'User is not part of a house' });
      return;
    }

    const result = await prisma.recipe.deleteMany({ where: { id, houseId } });
    if (result.count === 0) {
      res.status(404).json({ message: 'Recipe not found' });
      return;
    }

    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Failed to delete recipe' });
  }
};

export const addIngredient = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const { itemId, quantity, unitOverride } = req.body;

  try {
    const houseId = await getUserHouseId(userId);
    if (!houseId) {
      res.status(400).json({ message: 'User is not part of a house' });
      return;
    }

    const recipe = await prisma.recipe.findFirst({ where: { id, houseId } });
    if (!recipe) {
      res.status(404).json({ message: 'Recipe not found' });
      return;
    }

    const item = await prisma.item.findFirst({ where: { id: itemId, houseId } });
    if (!item) {
      res.status(404).json({ message: 'Item not found or does not belong to this house' });
      return;
    }

    const ingredient = await prisma.recipeIngredient.create({
      data: { recipeId: id, itemId, quantity, unitOverride },
      include: { item: true },
    });
    res.status(201).json(ingredient);
  } catch {
    res.status(500).json({ message: 'Failed to add ingredient' });
  }
};

export const removeIngredient = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id, ingredientId } = req.params;

  try {
    const houseId = await getUserHouseId(userId);
    if (!houseId) {
      res.status(400).json({ message: 'User is not part of a house' });
      return;
    }

    const ingredient = await prisma.recipeIngredient.findFirst({
      where: { id: ingredientId, recipeId: id, recipe: { houseId } },
    });
    if (!ingredient) {
      res.status(404).json({ message: 'Ingredient not found' });
      return;
    }

    await prisma.recipeIngredient.delete({ where: { id: ingredientId } });
    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Failed to remove ingredient' });
  }
};

export const suggestRecipes = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { itemIds } = req.body;

  try {
    const houseId = await getUserHouseId(userId);
    if (!houseId) {
      res.status(400).json({ message: 'User is not part of a house' });
      return;
    }

    const recipes = await prisma.recipe.findMany({
      where: {
        houseId,
        ingredients: {
          every: { itemId: { in: itemIds } },
        },
      },
      include: { ingredients: { include: { item: true } } },
    });
    res.json(recipes);
  } catch {
    res.status(500).json({ message: 'Failed to suggest recipes' });
  }
};
