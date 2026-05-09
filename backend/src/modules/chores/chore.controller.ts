import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

const getUserHouseId = async (userId: string): Promise<string | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { houseId: true },
  });
  return user?.houseId || null;
};

export const getChores = async (req: Request, res: Response) => {
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

    const chores = await prisma.chore.findMany({
      where: { houseId },
      include: {
        assignedTo: true,
        completions: {
          orderBy: { completedAt: 'desc' },
          include: { completedBy: true },
        },
      },
    });

    const strippedChores = chores.map((chore) => {
      const { assignedTo, completions, ...rest } = chore;
      return {
        ...rest,
        assignedTo: assignedTo
          ? (({ passwordHash, ...u }) => u)(assignedTo)
          : null,
        completions: completions.map((c) => {
          const { completedBy, ...cr } = c;
          return {
            ...cr,
            completedBy: completedBy
              ? (({ passwordHash, ...u }) => u)(completedBy)
              : null,
          };
        }),
      };
    });

    res.json(strippedChores);
  } catch {
    res.status(500).json({ message: 'Failed to fetch chores' });
  }
};

export const createChore = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { title, frequency, assignedToId } = req.body;

  try {
    const houseId = await getUserHouseId(userId);
    if (!houseId) {
      res.status(400).json({ message: 'User is not part of a house' });
      return;
    }

    if (assignedToId) {
      const assignee = await prisma.user.findFirst({
        where: { id: assignedToId, houseId },
      });
      if (!assignee) {
        res.status(400).json({ message: 'Assigned user not found in this house' });
        return;
      }
    }

    const chore = await prisma.chore.create({
      data: {
        title,
        frequency,
        houseId,
        assignedToId: assignedToId || null,
      },
      include: { assignedTo: true },
    });

    const { assignedTo, ...rest } = chore;
    res.status(201).json({
      ...rest,
      assignedTo: assignedTo
        ? (({ passwordHash, ...u }) => u)(assignedTo)
        : null,
    });
  } catch {
    res.status(500).json({ message: 'Failed to create chore' });
  }
};

export const reassignChore = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const { assignedToId } = req.body;

  try {
    const houseId = await getUserHouseId(userId);
    if (!houseId) {
      res.status(400).json({ message: 'User is not part of a house' });
      return;
    }

    const existing = await prisma.chore.findFirst({
      where: { id, houseId },
    });
    if (!existing) {
      res.status(404).json({ message: 'Chore not found' });
      return;
    }

    if (assignedToId) {
      const assignee = await prisma.user.findFirst({
        where: { id: assignedToId, houseId },
      });
      if (!assignee) {
        res.status(400).json({ message: 'Assigned user not found in this house' });
        return;
      }
    }

    const chore = await prisma.chore.update({
      where: { id },
      data: { assignedToId: assignedToId || null },
      include: { assignedTo: true },
    });

    const { assignedTo, ...rest } = chore;
    res.json({
      ...rest,
      assignedTo: assignedTo
        ? (({ passwordHash, ...u }) => u)(assignedTo)
        : null,
    });
  } catch {
    res.status(500).json({ message: 'Failed to reassign chore' });
  }
};

export const completeChore = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const { note } = req.body;

  try {
    const houseId = await getUserHouseId(userId);
    if (!houseId) {
      res.status(400).json({ message: 'User is not part of a house' });
      return;
    }

    const chore = await prisma.chore.findFirst({
      where: { id, houseId },
    });
    if (!chore) {
      res.status(404).json({ message: 'Chore not found' });
      return;
    }

    const completion = await prisma.choreCompletion.create({
      data: {
        choreId: id,
        completedById: userId,
        note: note || null,
      },
      include: { completedBy: true },
    });

    const { completedBy, ...rest } = completion;
    res.status(201).json({
      ...rest,
      completedBy: completedBy
        ? (({ passwordHash, ...u }) => u)(completedBy)
        : null,
    });
  } catch {
    res.status(500).json({ message: 'Failed to complete chore' });
  }
};

export const deleteChore = async (req: Request, res: Response) => {
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

    const result = await prisma.chore.deleteMany({
      where: { id, houseId },
    });
    if (result.count === 0) {
      res.status(404).json({ message: 'Chore not found' });
      return;
    }

    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Failed to delete chore' });
  }
};
