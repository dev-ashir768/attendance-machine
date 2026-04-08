import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from './user.repository';
import { env } from '../../config/env';

const userRepo = new UserRepository();

export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;

    // Hash password if provided
    if (userData.password) {
      const saltRounds = 10;
      userData.password = await bcrypt.hash(userData.password, saltRounds);
    }

    const user = await userRepo.create(userData);
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.status(201).json({ success: true, data: userWithoutPassword });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await userRepo.findByUsername(username);
    if (!user || !user.password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        iat: Math.floor(Date.now() / 1000)
      },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'Login successful'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Login failed' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userRepo.findMany();
    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json({ success: true, data: usersWithoutPasswords });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Check if user exists
    const user = await userRepo.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Hash password if provided
    if (updateData.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    const updatedUser = await userRepo.update(userId, updateData);
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const assignDevice = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { deviceId } = req.body; // System device ID, not physical ZK ID
    const assignment = await userRepo.assignDevice(userId, deviceId);
    res.json({ success: true, data: assignment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
