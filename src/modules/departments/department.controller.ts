import { Request, Response } from 'express';
import { DepartmentRepository } from './department.repository';

const deptRepo = new DepartmentRepository();

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await deptRepo.findMany();
    res.json({ success: true, data: departments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    const department = await deptRepo.create(name);
    res.status(201).json({ success: true, data: department });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
