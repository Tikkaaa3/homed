import { Request, Response } from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';

export const signup = async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;

  try {
    const passwordHash = await argon2.hash(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, displayName },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    const { passwordHash: _, ...userDto } = user;

    res.status(201).json({ user: userDto, token });
  } catch {
    res.status(400).json({ message: 'Signup failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    const { passwordHash: _, ...userDto } = user;

    res.json({ user: userDto, token });
  } catch {
    res.status(500).json({ message: 'Login failed' });
  }
};

export const me = async (req: Request, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { passwordHash: _, ...userDto } = user;
    res.json(userDto);
  } catch {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};
