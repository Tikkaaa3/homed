import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

const getUserHouseId = async (userId: string): Promise<string | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { houseId: true },
  });
  return user?.houseId || null;
};

export const getItems = async (req: Request, res: Response) => {
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

    const items = await prisma.item.findMany({ where: { houseId } });
    res.json(items);
  } catch {
    res.status(500).json({ message: 'Failed to fetch items' });
  }
};

export const createItem = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { name, category, unit } = req.body;

  try {
    const houseId = await getUserHouseId(userId);
    if (!houseId) {
      res.status(400).json({ message: 'User is not part of a house' });
      return;
    }

    const item = await prisma.item.create({
      data: { name, category, unit, houseId },
    });
    res.status(201).json(item);
  } catch {
    res.status(500).json({ message: 'Failed to create item' });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const { name, category, unit } = req.body;

  try {
    const houseId = await getUserHouseId(userId);
    if (!houseId) {
      res.status(400).json({ message: 'User is not part of a house' });
      return;
    }

    const existing = await prisma.item.findFirst({ where: { id, houseId } });
    if (!existing) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    const item = await prisma.item.update({
      where: { id },
      data: { name, category, unit },
    });
    res.json(item);
  } catch {
    res.status(500).json({ message: 'Failed to update item' });
  }
};

export const deleteItem = async (req: Request, res: Response) => {
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

    const result = await prisma.item.deleteMany({ where: { id, houseId } });
    if (result.count === 0) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Failed to delete item' });
  }
};
