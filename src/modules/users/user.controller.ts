import { Request, Response } from 'express';
import { UserRepository } from './user.repository';

const userRepo = new UserRepository();

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await userRepo.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userRepo.findMany();
    res.json({ success: true, data: users });
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
