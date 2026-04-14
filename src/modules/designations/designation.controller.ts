import { Request, Response } from 'express';
import { prisma } from '../../utils/prisma';

export const getDesignations = async (req: Request, res: Response) => {
  try {
    const designations = await prisma.designation.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: designations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createDesignation = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    const designation = await prisma.designation.create({
      data: { name }
    });
    res.status(201).json({ success: true, data: designation });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
