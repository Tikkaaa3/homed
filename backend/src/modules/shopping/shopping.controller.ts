import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

const getUserHouseId = async (userId: string): Promise<string | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { houseId: true },
  });
  return user?.houseId || null;
};

export const getShoppingLists = async (req: Request, res: Response) => {
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

    const lists = await prisma.shoppingList.findMany({
      where: { houseId },
      include: {
        items: {
          include: { item: true },
        },
      },
    });
    res.json(lists);
  } catch {
    res.status(500).json({ message: 'Failed to fetch shopping lists' });
  }
};

export const createShoppingList = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { title } = req.body;

  try {
    const houseId = await getUserHouseId(userId);
    if (!houseId) {
      res.status(400).json({ message: 'User is not part of a house' });
      return;
    }

    const list = await prisma.shoppingList.create({
      data: { title, houseId },
      include: { items: true },
    });
    res.status(201).json(list);
  } catch {
    res.status(500).json({ message: 'Failed to create shopping list' });
  }
};

export const updateShoppingList = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const { title } = req.body;

  try {
    const houseId = await getUserHouseId(userId);
    if (!houseId) {
      res.status(400).json({ message: 'User is not part of a house' });
      return;
    }

    const existing = await prisma.shoppingList.findFirst({
      where: { id, houseId },
    });
    if (!existing) {
      res.status(404).json({ message: 'Shopping list not found' });
      return;
    }

    const list = await prisma.shoppingList.update({
      where: { id },
      data: { title },
    });
    res.json(list);
  } catch {
    res.status(500).json({ message: 'Failed to update shopping list' });
  }
};

export const deleteShoppingList = async (req: Request, res: Response) => {
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

    const result = await prisma.shoppingList.deleteMany({
      where: { id, houseId },
    });
    if (result.count === 0) {
      res.status(404).json({ message: 'Shopping list not found' });
      return;
    }

    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Failed to delete shopping list' });
  }
};

export const addShoppingListItem = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const { itemId, quantity, unitOverride, note } = req.body;

  try {
    const houseId = await getUserHouseId(userId);
    if (!houseId) {
      res.status(400).json({ message: 'User is not part of a house' });
      return;
    }

    const list = await prisma.shoppingList.findFirst({
      where: { id, houseId },
    });
    if (!list) {
      res.status(404).json({ message: 'Shopping list not found' });
      return;
    }

    const item = await prisma.item.findFirst({
      where: { id: itemId, houseId },
    });
    if (!item) {
      res.status(404).json({ message: 'Item not found or does not belong to this house' });
      return;
    }

    const listItem = await prisma.shoppingListItem.create({
      data: {
        listId: id,
        itemId,
        quantity,
        unitOverride: unitOverride || null,
        note: note || null,
      },
      include: { item: true },
    });
    res.status(201).json(listItem);
  } catch {
    res.status(500).json({ message: 'Failed to add shopping list item' });
  }
};

export const checkShoppingListItem = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id, lineId } = req.params;
  const { isChecked } = req.body;

  try {
    const houseId = await getUserHouseId(userId);
    if (!houseId) {
      res.status(400).json({ message: 'User is not part of a house' });
      return;
    }

    const listItem = await prisma.shoppingListItem.findFirst({
      where: {
        id: lineId,
        listId: id,
        list: { houseId },
      },
    });
    if (!listItem) {
      res.status(404).json({ message: 'Shopping list item not found' });
      return;
    }

    const updated = await prisma.shoppingListItem.update({
      where: { id: lineId },
      data: {
        isChecked,
        checkedById: isChecked ? userId : null,
      },
      include: { item: true },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Failed to update shopping list item' });
  }
};

export const deleteShoppingListItem = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id, lineId } = req.params;

  try {
    const houseId = await getUserHouseId(userId);
    if (!houseId) {
      res.status(400).json({ message: 'User is not part of a house' });
      return;
    }

    const listItem = await prisma.shoppingListItem.findFirst({
      where: {
        id: lineId,
        listId: id,
        list: { houseId },
      },
    });
    if (!listItem) {
      res.status(404).json({ message: 'Shopping list item not found' });
      return;
    }

    await prisma.shoppingListItem.delete({
      where: { id: lineId },
    });
    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Failed to delete shopping list item' });
  }
};
