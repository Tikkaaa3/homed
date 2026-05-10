import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

const generateJoinCode = async (): Promise<string> => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code: string;
  let exists = true;

  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const house = await prisma.house.findUnique({ where: { joinCode: code } });
    exists = house !== null;
  } while (exists);

  return code;
};

export const createHouse = async (req: Request, res: Response) => {
  const { name } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const joinCode = await generateJoinCode();
    const house = await prisma.house.create({ data: { name, joinCode } });

    await prisma.user.update({
      where: { id: userId },
      data: { houseId: house.id },
    });

    res.status(201).json(house);
  } catch {
    res.status(500).json({ message: 'Failed to create house' });
  }
};

export const joinHouse = async (req: Request, res: Response) => {
  const { joinCode } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const house = await prisma.house.findUnique({ where: { joinCode } });
    if (!house) {
      res.status(404).json({ message: 'House not found' });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { houseId: house.id },
    });

    res.json(house);
  } catch {
    res.status(500).json({ message: 'Failed to join house' });
  }
};

export const leaveHouse = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { houseId: null },
    });

    res.json({ message: 'Left house successfully' });
  } catch {
    res.status(500).json({ message: 'Failed to leave house' });
  }
};

export const getMembers = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { houseId: true },
    });

    if (!user?.houseId) {
      res.json([]);
      return;
    }

    const members = await prisma.user.findMany({
      where: { houseId: user.houseId },
    });

    const membersWithoutPassword = members.map(({ passwordHash, ...rest }) => rest);
    res.json(membersWithoutPassword);
  } catch {
    res.status(500).json({ message: 'Failed to fetch members' });
  }
};

export const getCurrentHouse = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { houseId: true },
    });

    if (!user?.houseId) {
      res.status(400).json({ message: 'User is not part of a house' });
      return;
    }

    const house = await prisma.house.findUnique({
      where: { id: user.houseId },
    });

    if (!house) {
      res.status(404).json({ message: 'House not found' });
      return;
    }

    res.json(house);
  } catch {
    res.status(500).json({ message: 'Failed to fetch house' });
  }
};
